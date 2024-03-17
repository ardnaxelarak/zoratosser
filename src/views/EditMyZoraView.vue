<template>
  <ImagePicker id="imagePickerModal" @image-selected="image_selected" @picker-closed="picker_closed" />
  <div class="card sets-card ms-4 mt-4">
    <div class="card-body">
      <h5 class="card-title">Sets</h5>
      <div class="vstack mx-auto">
        <button type="button" class="btn btn-primary" v-for="set in sets">{{ set.name }}</button>
      </div>
    </div>
  </div>
  <div class="card items-card ms-4 mt-4">
    <div class="card-body">
      <h5 class="card-title">Items</h5>
      <table class="table weight-table mb-0">
        <tr>
          <th scope="col" class="icon-col text-center align-bottom">Icon</th>
          <th scope="col" class="name-col align-bottom">Name</th>
          <th scope="col" class="wbr-col text-center align-bottom">Weigh by<br>Remainder</th>
          <th scope="col" class="text-end align-bottom">Set:</th>
          <th scope="col" class="weight-col text-center align-bottom" v-for="set in sets">{{ set.name }}</th>
          <th scope="col"></th>
        </tr>
        <template v-for="item in itemsSorted">
          <template v-if="item.editing">
            <tr>
              <td rowspan="2" class="text-center">
                <img class="item-icon editable-icon" :src="item.edit.image_url" :data-item="item.name" @click="pick_image">
              </td>
              <td rowspan="2" class="item-name">
                <input type="text" class="form-control form-control-sm" v-model="item.edit.name" />
              </td>
              <td rowspan="2" class="text-center"><input class="form-check-input" type="checkbox" v-model="item.edit.weigh_by_remainder"></td>
              <td class="text-end no-bottom-border">Weight:</td>
              <td class="text-center align-bottom no-bottom-border" v-for="set in sets">
                <input type="number" class="weight-input form-control form-control-sm" min="0" step="any" v-model="item.edit.sets[set.id].weight" />
              </td>
              <td rowspan="2" class="row-management">
                <button type="button" class="btn btn-success" :data-item="item.name" @click="save_item">
                  <i class="bi bi-floppy-fill"></i>
                </button>
                <button type="button" class="btn btn-danger ms-1" :data-item="item.name" @click="cancel_item">
                  <i class="bi bi-x-square-fill"></i>
                </button>
              </td>
            </tr>
            <tr>
              <td class="text-end">Max:</td>
              <td class="text-center align-bottom" v-for="set in sets">
                <input type="number" class="max-input form-control form-control-sm" min="0" v-model="item.edit.sets[set.id].max_quantity" />
              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td rowspan="2" class="text-center"><img class="item-icon" :src="item.image_url"></td>
              <td rowspan="2" class="item-name">{{ item.name }}</td>
              <td rowspan="2" class="text-center"><input class="form-check-input" type="checkbox" v-model="item.weigh_by_remainder" disabled></td>
              <td class="text-end no-bottom-border">Weight:</td>
              <td class="text-center align-bottom no-bottom-border" v-for="set in sets">
                {{ item.sets[set.id]?.weight || 0 }}
              </td>
              <td rowspan="2" class="row-management">
                <button type="button" class="btn btn-primary" :data-item="item.name" @click="edit_item">
                  <i class="bi bi-pencil-fill" :data-item="item.name"></i>
                </button>
              </td>
            </tr>
            <tr>
              <td class="text-end">Max:</td>
              <td class="text-center align-bottom" v-for="set in sets">
                {{ item.sets[set.id]?.max_quantity || 0 }}
              </td>
            </tr>
          </template>
        </template>
        <template v-if="newItem">
          <tr>
            <template v-if="newItem.image_url">
              <td rowspan="2" class="text-center editable-icon"><img class="item-icon" :src="newItem.image_url" @click="pick_new_image"></td>
            </template>
            <template v-else>
              <td rowspan="2" class="text-center editable-icon"><img class="item-icon" src="/unknown.png" @click="pick_new_image"></td>
            </template>
            <td rowspan="2" class="item-name">
              <input type="text" class="form-control form-control-sm" v-model="newItem.name" />
            </td>
            <td rowspan="2" class="text-center"><input class="form-check-input" type="checkbox" v-model="newItem.weigh_by_remainder"></td>
            <td class="text-end no-bottom-border">Weight:</td>
            <td class="text-center align-bottom no-bottom-border" v-for="set in sets">
              <input type="number" class="weight-input form-control form-control-sm" min="0" step="any" v-model="newItem.sets[set.id].weight" />
            </td>
            <td rowspan="2" class="row-management">
              <button type="button" class="btn btn-success" @click="save_create_item">
                <i class="bi bi-floppy-fill"></i>
              </button>
              <button type="button" class="btn btn-danger ms-1" @click="cancel_create_item">
                <i class="bi bi-x-square-fill"></i>
              </button>
            </td>
          </tr>
          <tr>
            <td class="text-end">Max:</td>
            <td class="text-center align-bottom" v-for="set in sets">
              <input type="number" class="max-input form-control form-control-sm" min="0" v-model="newItem.sets[set.id].max_quantity" />
            </td>
          </tr>
        </template>
        <tr v-else>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td class="row-management">
            <button type="button" class="btn btn-primary" @click="create_item">
              <i class="bi bi-plus"></i>
            </button>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import axios from "axios";
import { Modal } from "bootstrap";
import sort from "immutable-sort";

import ImagePicker from '../components/ImagePicker.vue'

export default defineComponent({
  components: {
    ImagePicker,
  },
  data() {
    return {
      sets: [],
      items: [],
      newItem: null,
      imagePickerItem: null,
    };
  },
  computed: {
    itemMap() {
      return this.items.reduce((map, obj) => {
        map[obj.name] = obj;
        return map;
      }, {});
    },
    itemsSorted() {
      return sort(this.items, (a, b) => {
        const aKey = a.name.toLowerCase();
        const bKey = b.name.toLowerCase();
        if (aKey < bKey) {
          return -1;
        } else if (aKey > bKey) {
          return 1;
        } else {
          return 0;
        }
      });
    },
  },
  async created() {
    axios.get("/api/sets").then(response => this.sets = response.data);
    axios.get("/api/items").then(response => this.items = response.data);
  },
  methods: {
    edit_item(event) {
      const item = this.itemMap[event.target.dataset.item];
      if (!item) {
        return;
      }

      item.edit = JSON.parse(JSON.stringify(item));
      for (const set of this.sets) {
        if (!item.edit.sets[set.id]) {
          item.edit.sets[set.id] = { weight: 0, max_quantity: 0 };
        }
      }

      item.editing = true;
    },
    picker_closed() {
      this.imagePickerItem = null;
    },
    image_selected(data) {
      if (!this.imagePickerItem) {
        return;
      }

      this.imagePickerItem.image_id = data.id;
      this.imagePickerItem.image_url = data.url;
    },
    pick_image(event) {
      const item = this.itemMap[event.target.dataset.item];
      if (!item) {
        return;
      }

      this.imagePickerItem = item.edit;
      const modal = Modal.getOrCreateInstance("#imagePickerModal");
      modal.show();
    },
    async save_item(event) {
      const item = this.itemMap[event.target.dataset.item];
      if (!item) {
        return;
      }

      const requestItem = {
        image_id: item.edit.image_id,
        name: item.edit.name,
        single_id: item.edit.single_id,
        single_quantity: item.edit.single_quantity,
        weigh_by_remainder: item.edit.weigh_by_remainder,
        sets: item.edit.sets,
      };

      try {
        const response = await axios.put(`/api/items/${item.id}`, requestItem);

        const newItem = response.data;
        for (const key of Object.keys(newItem)) {
          item[key] = JSON.parse(JSON.stringify(newItem[key]));
        }

        item.edit = null;
        item.editing = false;
      } catch (err) {
        console.log(err);
      }
    },
    cancel_item(event) {
      const item = this.itemMap[event.target.dataset.item];
      if (!item) {
        return;
      }

      item.edit = null;
      item.editing = false;
    },
    create_item() {
      this.newItem = {sets: {}};
      for (const set of this.sets) {
        this.newItem.sets[set.id] = { weight: 0, max_quantity: 0 };
      }
    },
    pick_new_image() {
      this.imagePickerItem = this.newItem;
      const modal = Modal.getOrCreateInstance("#imagePickerModal");
      modal.show();
    },
    async save_create_item() {
      if (!this.newItem) {
        return;
      }

      if (!this.newItem.image_id) {
        return;
      }

      try {
        const response = await axios.post("/api/items", this.newItem);

        const newItem = response.data;
        this.items.push(newItem);
        this.newItem = null;
      } catch (err) {
        console.log(err);
      }
    },
    cancel_create_item() {
      this.newItem = null;
    },
  },
});
</script>

<style>
.sets-card {
  min-width: 30rem;
  width: fit-content;
}

.items-card {
  width: fit-content;
}

.weight-table {
  width: fit-content;
}

.weight-table th, .weight-table td {
  padding: 0 0.5rem;
  border-bottom: 1px solid #CCC;
}

.weight-table td.no-bottom-border {
  border-bottom-width: 0px;
}

.item-icon {
  width: 3rem;
  height: 3rem;
  object-fit: contain;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
}

.item-name {
  font-size: 2rem;
}

.icon-col {
  width: fit-content;
}

.wbr-col {
  width: fit-content;
}

.weight-input, .max-input {
  width: 3rem;
  font-size: 0.7rem;
  padding: 0.1rem 0.2rem !important;
  margin: 0.1rem auto;
}

.row-management .btn {
  color: var(--bs-btn-bg);
  margin: 0.3rem 0;
}

.row-management .btn i {
  pointer-events: none;
}

.row-management .btn:hover {
  color: var(--bs-btn-hover-color);
}

.editable-icon {
  cursor: pointer;
}
</style>
