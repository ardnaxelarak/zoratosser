const crypto = require("crypto");
const express = require("express");
const multer = require("multer");
const op = require("sequelize").Op;
const os = require("os");
const path = require("path");
const router = express.Router();
const s3 = require("@aws-sdk/client-s3");

const models = require("./models");

const upload = multer({ dest: os.tempdir });
const s3client = new s3.S3Client({ region: process.env.S3_REGION });

function requireFields(...fields) {
  return (req, res, next) => {
    for (const field of fields) {
      if (!req.body[field]) {
        res.status(400);
        return res.send({error: {code: "missing_field", field: field}});
      }
    }
    return next();
  }
}

router.use((req, res, next) => {
  if (!req.session.passport?.user) {
    return res.sendStatus(401);
  }
  return next();
});

router.route("/info")
  .get(async (req, res) => {
    const user = req.session.passport.user;

    return res.send({
      overlay: `${process.env.HOSTNAME}/overlay/${user.twitch_display_name}`,
      items: `${process.env.HOSTNAME}/myitems/${user.twitch_display_name}`,
    });
  });

router.route("/image_sets")
  .get(async (req, res) => {
    const user = req.session.passport.user;

    const imageSetList = await models.image_set.findAll({include: "images"});

    res.send(imageSetList.map(m => m.sanitize()));
  })

router.route("/images")
  .get(async (req, res) => {
    const user = req.session.passport.user;

    const imageList = await models.image.findAll({where: {channel_twitch_id: user.twitch_id}, include: "items"});

    res.send(imageList.map(m => m.sanitize()));
  })
  .post(upload.single("image"), requireFields("name"), async (req, res) => {
    if (!req.file) {
      res.status(400);
      return res.send({error: {code: "missing_field", field: "file"}});
    }

    const shasum = crypto.createHash("sha1");
    shasum.update(req.file.buffer);
    const hash = shasum.digest("hex");

    const ext = path.extname(req.body.name);

    const s3params = {
      Body: req.file.buffer,
      Bucket: process.env.S3_BUCKET_NAME,
      Key: hash + ext,
    };

    const command = new s3.PutObjectCommand(s3params);
    const response = await s3client.send(command);

    const url = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${s3params.Key}`;
    const channelId = req.session.passport.user.twitch_id;
    const image = await models.image.create({channel_twitch_id: channelId, name: req.body.name, url: url});

    res.send(image.sanitize());
  })

router.route("/images/:id")
  .delete(async (req, res) => {
    const user = req.session.passport.user;

    const image = await models.image.findOne({where: {id: req.params.id, channel_twitch_id: user.twitch_id}, include: "items"});

    if (!image) {
      return res.sendStatus(404);
    }

    if (image.items.length > 0) {
      return res.sendStatus(409);
    }

    await image.destroy();

    res.sendStatus(204);
  })

router.route("/sets")
  .get(async (req, res) => {
    const user = req.session.passport.user;

    const setList = await models.set.findAll({where: {channel_twitch_id: user.twitch_id}});

    res.send(setList.map(m => m.sanitize()));
  })
  .post(requireFields("name"), async (req, res) => {
    const channelId = req.session.passport.user.twitch_id;
    const set = await models.set.create({channel_twitch_id: channelId, name: req.body.name, redeem_name: red.body.redeem_name});

    res.send(set.sanitize());
  })

router.route("/items")
  .get(async (req, res) => {
    const user = req.session.passport.user;

    const itemList = await models.item.findAll({where: {channel_twitch_id: user.twitch_id}, include: ["image", "sets"]});

    res.send(itemList.map(m => m.sanitize()));
  })
  .post(requireFields("name", "image_id"), async (req, res) => {
    const channelId = req.session.passport.user.twitch_id;
    const image = await models.image.findOne({where: {id: req.body.image_id}});

    if (!image || (image.channel_twitch_id && image.channel_twitch_id != channelId)) {
      res.status(400);
      return res.send({error: {code: "foreign_key_not_found", field: "image_id"}});
    }

    if (req.body.single_id) {
      const single = await models.item.findOne({where: {id: req.body.single_id}});
      if (!single || single.channel_twitch_id != channelId) {
        return res.send({error: {code: "foreign_key_not_found", field: "single_id"}});
      }
      if (!req.body.single_quantity) {
        return res.send({error: {code: "missing_field", field: "single_quantity"}});
      }
      if (!(req.body.single_quantity > 0)) {
        return res.send({error: {code: "invalid_value", field: "single_quantity"}});
      }
    }

    const item = await models.item.build({
      channel_twitch_id: channelId,
      name: req.body.name,
      image_id: req.body.image_id,
      single_id: req.body.single_id,
      single_quantity: req.body.single_quantity,
      weigh_by_remainder: req.body.weigh_by_remainder,
    });

    item.weights = [];

    return await updateItemWeights(res, item, req.body.sets);
  })

router.route("/items/:id")
  .put(requireFields("image_id", "name"), async (req, res) => {
    const channelId = req.session.passport.user.twitch_id;

    const item = await models.item.findOne({where: {channel_twitch_id: channelId, id: req.params.id}, include: ["image", "weights"]});
    if (!item) {
      return res.sendStatus(404);
    }

    const image = await models.image.findOne({where: {id: req.body.image_id}});

    if (!image || (image.channel_twitch_id && image.channel_twitch_id != channelId)) {
      res.status(400);
      return res.send({error: "image_id not found"});
    }

    if (req.body.single_id) {
      const single = await models.item.findOne({where: {id: req.body.single_id}});
      if (!single || single.channel_twitch_id != channelId) {
        return res.send({error: {code: "foreign_key_not_found", field: "single_id"}});
      }
      if (!req.body.single_quantity) {
        return res.send({error: {code: "missing_field", field: "single_quantity"}});
      }
      if (!(req.body.single_quantity > 0)) {
        return res.send({error: {code: "invalid_value", field: "single_quantity"}});
      }
    }

    item.set({
      name: req.body.name,
      image_id: req.body.image_id,
      single_id: req.body.single_id,
      single_quantity: req.body.single_quantity,
      weigh_by_remainder: req.body.weigh_by_remainder,
    });

    return await updateItemWeights(res, item, req.body.sets);
  })
  .get(async (req, res) => {
    const user = req.session.passport.user;

    const item = await models.item.findOne({where: {id: req.params.id, channel_twitch_id: user.twitch_id}, include: ["user_items"]});

    if (!item) {
      return res.sendStatus(404);
    }

    return res.send(item.sanitize());
  })
  .delete(async (req, res) => {
    const user = req.session.passport.user;

    const item = await models.item.findOne({where: {id: req.params.id, channel_twitch_id: user.twitch_id}, include: ["weights", "user_items"]});

    if (!item) {
      return res.sendStatus(404);
    }

    const t = await models.sequelize.transaction();

    try {
      for (const weight of item.weights) {
        await weight.destroy({tarnsaction: t});
      }
      for (const user_item of item.user_items) {
        await user_item.destroy({tarnsaction: t});
      }
      await item.destroy({transaction: t});

      await t.commit();

      return res.sendStatus(204);
    } catch (err) {
      console.log(err);
      await t.rollback();
      return res.sendStatus(500);
    }
  })

async function updateItemWeights(res, item, bodySets) {
  const channelId = item.channel_twitch_id;
  const setList = await models.set.findAll({where: {channel_twitch_id: channelId}});
  const setMap = setList.reduce((map, obj) => {
    map[obj.id] = obj;
    return map;
  }, {});

  const newWeights = {};
  if (bodySets) {
    for (const setId of Object.keys(bodySets)) {
      const setWeight = bodySets[setId];
      const set = setMap[setId];

      if (!set) {
        res.status(400);
        return res.send({error: {code: "foreign_key_not_found", field: "set"}});
      }
      if (!(setWeight.weight >= 0)) {
        res.status(400);
        return res.send({error: {code: "invalid_value", field: "set.weight"}});
      }
      if (!(setWeight.max_quantity >= 0) || !Number.isInteger(setWeight.max_quantity)) {
        res.status(400);
        return res.send({error: {code: "invalid_value", field: "set.max_quantity"}});
      }
    }
  }

  const t = await models.sequelize.transaction();

  try {
    await item.save({transaction: t});

    if (bodySets) {
      for (const setId of Object.keys(bodySets)) {
        const setWeight = bodySets[setId];

        const [itemWeight, created] = await models.item_weight.findOrCreate({
          where: {
            set_id: setId,
            item_id: item.id,
          },
          defaults: {
            weight: 0,
            max_quantity: 0,
          },
          transaction: t,
        });

        itemWeight.set({
          weight: setWeight.weight || 0,
          max_quantity: setWeight.max_quantity || 0,
        });

        newWeights[setId] = itemWeight;
      }
    }

    for (const oldWeight of item.weights) {
      if (!newWeights[oldWeight.set_id]) {
        await oldWeight.update({
          weight: 0,
          max_quantity: 0,
        }, {transaction: t});
      }
    }

    for (const newWeight of Object.values(newWeights)) {
      await newWeight.save({transaction: t});
    }

    await t.commit();
  } catch (err) {
    console.log(err);
    await t.rollback();
    return res.sendStatus(500);
  }

  await item.reload({include: ["image", "sets"]});
  return res.send(item.sanitize());
}

router.route("/obtained_items/:channel_name")
  .get(async (req, res) => {
    const userId = req.session.passport.user.id;
    const user = await models.user.findByPk(userId);
    const channel = await models.user.findOne({where: {twitch_lower_name: req.params.channel_name.toLowerCase()}});

    if (!user || !channel) {
      return res.sendStatus(404);
    }

    const obtainedItems = await models.user_item.findAll({
      where: {
        channel_id: channel.id, 
        user_id: user.id
      },
      include: [
        {
          model: models.item,
          as: "item",
          include: "image",
        }
      ]});

    const response = obtainedItems.map(item => ({
      id: item.item_id,
      name: item.item.name,
      image: item.item.image.sanitize(),
      quantity: item.quantity,
    }));

    res.send(response);
  })

router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500);
  res.send({error: "Internal server error"});
});

module.exports = router;
