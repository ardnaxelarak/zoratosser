const crypto = require("crypto");
const express = require("express");
const multer = require("multer");
const op = require("sequelize").Op;
const os = require("os");
const router = express.Router();
const s3 = require("@aws-sdk/client-s3");

const models = require("./models");

const upload = multer({ dest: os.tempdir });
const s3client = new s3.S3Client({ region: process.env.S3_REGION });

function channelMatchesOrNull(channel_id) {
  return {
    where: {
      [op.or]: [
        {channel_twitch_id: {[op.is]: null}},
        {channel_twitch_id: channel_id},
      ]
    }
  };
}

function requireFields(...fields) {
  return (req, res, next) => {
    for (const field of fields) {
      if (!req.body[field]) {
        res.status(400);
        return res.send({error: `Missing ${field}`});
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

router.route("/images")
  .get(async (req, res) => {
    const user = req.session.passport.user;

    const imageList = await models.image.findAll(channelMatchesOrNull(user.twitch_id));

    res.send(imageList.map(m => m.sanitize()));
  })
  .post(upload.single("image"), requireFields("name"), async (req, res) => {
    if (!req.file) {
      res.status(400);
      return res.send({error: "Missing file"});
    }

    const shasum = crypto.createHash("sha1");
    shasum.update(req.file.buffer);
    const hash = shasum.digest("hex");

    const s3params = {
      Body: req.file.buffer,
      Bucket: process.env.S3_BUCKET_NAME,
      Key: hash + ".png",
    };

    const command = new s3.PutObjectCommand(s3params);
    const response = await s3client.send(command);

    const url = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${s3params.Key}`;
    const channelId = req.session.passport.user.twitch_id;
    const image = await models.image.create({channel_twitch_id: channelId, name: req.body.name, url: url});

    res.send(image.sanitize());
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

router.route("/sets/:set_id/items/:item_id")
  .patch(async (req, res) => {
    const user = req.session.passport.user;
    const set = await models.set.findOne({where: {channel_twitch_id: user.twitch_id, id: req.params.set_id}});
    const item = await models.item.findOne({where: {channel_twitch_id: user.twitch_id, id: req.params.item_id}});
    if (!set) {
      res.status(404);
      return res.send({error: "set not found"});
    }
    if (!item) {
      res.status(404);
      return res.send({error: "item not found"});
    }

    const [item_weight, created] = await models.item_weight.findOrCreate({
      where: {
        channel_twitch_id: user.twitch_id,
        set_id: set.id,
        item_id: item.id,
      },
      defaults: {
        weight: 0,
        max_quantity: 0,
      },
      include: [
        "item",
        "set",
      ],
    });

    if (req.body.weight) {
      item_weight.weight = req.body.weight;
    }
    if (req.body.max_quantity) {
      item_weight.max_quantity = req.body.max_quantity;
    }

    item_weight.save();

    res.send(item_weight.sanitize());
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
      return res.send({error: "image_id not found"});
    }

    if (req.body.single_id) {
      const single = await models.item.findOne({where: {id: req.body.single_id}});
      if (!single || single.channel_twitch_id != channelId) {
        return res.send({error: "single_id not found"});
      }
      if (!req.body.single_quantity) {
        return res.send({error: "single_quantity must be present if single_id is present"});
      }
      if (!(req.body.single_quantity > 0)) {
        return res.send({error: "single_quantity must be positive"});
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
        return res.send({error: "single_id not found"});
      }
      if (!req.body.single_quantity) {
        return res.send({error: "single_quantity must be present if single_id is present"});
      }
      if (!(req.body.single_quantity > 0)) {
        return res.send({error: "single_quantity must be positive"});
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
        return res.send({error: `set ${setId} not found`});
      }
      if (!(setWeight.weight >= 0)) {
        res.status(400);
        return res.send({error: "set.weight must be nonnegative"});
      }
      if (!(setWeight.max_quantity >= 0) || !Number.isInteger(setWeight.max_quantity)) {
        res.status(400);
        return res.send({error: "set.max_quantity must be a nonnegative integer"});
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

router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500);
  res.send({error: "Internal server error"});
});

module.exports = router;
