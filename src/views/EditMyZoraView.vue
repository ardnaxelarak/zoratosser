<template>
  <ImagePicker id="imagePickerModal" @image-selected="image_selected" @picker-closed="picker_closed" />
  <div class="card sets-card m-4">
    <div class="card-body">
      <h5 class="card-title">Sets</h5>
      <div class="vstack mx-auto">
        <button type="button" class="btn btn-primary" v-for="set in sets">{{ set.name }}</button>
      </div>
    </div>
  </div>
  <div class="card items-card m-4">
    <div class="card-body">
      <h5 class="card-title">Items</h5>
      <table class="table weight-table mb-0">
        <tr>
          <th scope="col" class="icon-col text-center align-bottom">Icon</th>
          <th scope="col" class="name-col align-bottom">Name</th>
          <th scope="col" class="wbr-col text-center align-bottom">
            <TooltipWrapper :title="wbrTooltip">
              Weigh by<br>Remainder
            </TooltipWrapper>
          </th>
          <th scope="col" class="text-end align-bottom">Set:</th>
          <th scope="col" class="weight-col text-center align-bottom" v-for="set in sets">{{ set.name }}</th>
          <th scope="col"></th>
        </tr>
        <template v-for="item in itemsSorted">
          <template v-if="item.editing">
            <tr>
              <td rowspan="2" class="text-center">
                <ImageIcon class="item-icon editable-icon" :image="item.edit.image" :data-item="item.id" @click="pick_image" />
              </td>
              <td rowspan="2" class="item-name">
                <input type="text" class="form-control form-control-sm" v-model="item.edit.name" />
              </td>
              <td rowspan="2" class="text-center"><input class="form-check-input" type="checkbox" v-model="item.edit.weigh_by_remainder"></td>
              <td class="text-end">
                <TooltipWrapper :title="weightTooltip">
                  Weight
                </TooltipWrapper>
              </td>
              <td class="text-center align-bottom" v-for="set in sets">
                <input type="number" class="weight-input form-control form-control-sm" min="0" step="any" v-model="item.edit.sets[set.id].weight" />
              </td>
              <td rowspan="2" class="row-management">
                <button type="button" class="btn btn-success" :data-item="item.id" @click="save_item">
                  <i class="bi bi-floppy-fill"></i>
                </button>
                <button type="button" class="btn btn-danger ms-1" :data-item="item.id" @click="cancel_item">
                  <i class="bi bi-x-square-fill"></i>
                </button>
              </td>
            </tr>
            <tr>
              <td class="text-end no-top-border">
                <TooltipWrapper :title="maxTooltip">
                  Max:
                </TooltipWrapper>
              </td>
              <td class="text-center align-bottom no-top-border" v-for="set in sets">
                <input type="number" class="max-input form-control form-control-sm" min="0" v-model="item.edit.sets[set.id].max_quantity" />
              </td>
            </tr>
            <tr v-if="item.edit.error">
              <td :colspan="tableCols" class="text-error text-center no-top-border">{{ item.edit.error }}</td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td rowspan="2" class="text-center">
                <ImageIcon class="item-icon" :image="item.image" />
              </td>
              <td rowspan="2" class="item-name">{{ item.name }}</td>
              <td rowspan="2" class="text-center"><input class="form-check-input" type="checkbox" v-model="item.weigh_by_remainder" disabled></td>
              <td class="text-end">
                <TooltipWrapper :title="weightTooltip">
                  Weight:
                </TooltipWrapper>
              </td>
              <td class="text-center align-bottom" v-for="set in sets">
                {{ item.sets[set.id]?.weight || 0 }}
              </td>
              <td rowspan="2" class="row-management">
                <button type="button" class="btn btn-primary" :data-item="item.id" @click="edit_item">
                  <i class="bi bi-pencil-fill" :data-id="item.name"></i>
                </button>
                <button type="button" class="btn btn-danger ms-1" :data-item="item.id" @click="delete_item">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </td>
            </tr>
            <tr>
              <td class="text-end no-top-border">
                <TooltipWrapper :title="maxTooltip">
                  Max:
                </TooltipWrapper>
              </td>
              <td class="text-center align-bottom no-top-border" v-for="set in sets">
                {{ item.sets[set.id]?.max_quantity || 0 }}
              </td>
            </tr>
          </template>
        </template>
        <template v-if="newItem">
          <tr>
            <template v-if="newItem.image.url">
              <td rowspan="2" class="text-center editable-icon"><img class="item-icon" :src="newItem.image.url" @click="pick_new_image"></td>
            </template>
            <template v-else>
              <td rowspan="2" class="text-center editable-icon"><img class="item-icon" src="/unknown.png" @click="pick_new_image"></td>
            </template>
            <td rowspan="2" class="item-name">
              <input type="text" class="form-control form-control-sm" v-model="newItem.name" />
            </td>
            <td rowspan="2" class="text-center"><input class="form-check-input" type="checkbox" v-model="newItem.weigh_by_remainder"></td>
            <td class="text-end">
              <TooltipWrapper :title="weightTooltip">
                Weight:
              </TooltipWrapper>
            </td>
            <td class="text-center align-bottom" v-for="set in sets">
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
            <td class="text-end no-top-border">
              <TooltipWrapper :title="maxTooltip">
                Max:
              </TooltipWrapper>
            </td>
            <td class="text-center align-bottom no-top-border" v-for="set in sets">
              <input type="number" class="max-input form-control form-control-sm" min="0" v-model="newItem.sets[set.id].max_quantity" />
            </td>
          </tr>
          <tr v-if="newItem.error">
            <td :colspan="tableCols" class="text-error text-center no-top-border">{{ newItem.error }}</td>
          </tr>
        </template>
        <tr v-else>
          <td :colspan="tableCols - 1"></td>
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

import ImageIcon from '../components/ImageIcon.vue'
import ImagePicker from '../components/ImagePicker.vue'
import TooltipWrapper from '../components/TooltipWrapper.vue'

export default defineComponent({
  components: {
    ImageIcon,
    ImagePicker,
    TooltipWrapper,
  },
  data() {
    return {
      sets: [],
      items: [],
      newItem: null,
      imagePickerItem: null,
      wbrTooltip: "When selected, the actual weight of the item appearing is multiplied by the remaining number of that item the user has before reaching the maximum. Thus, a user with fewer of the item will be more likely to receive the item than one with more of the item. This has no effect if there is no maximum.",
      weightTooltip: "This is the relative probability of this item being selected out of the sum of all the item weights. Items which a user has already obtained the maximum of will not be included in this total.",
      maxTooltip: "The maximum number of this item that a single user can receive. If set to 0, there is no maximum.",
    };
  },
  computed: {
    itemMap() {
      return this.items.reduce((map, obj) => {
        map[obj.id] = obj;
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
    tableCols() {
      return 5 + this.sets.length;
    },
  },
  async created() {
    axios.get("/api/sets").then(response => this.sets = response.data);
    axios.get("/api/items").then(response => this.items = response.data);
  },
  methods: {
    parseError(response, item) {
      if (response.status == 502) {
        item.error = "Server is down. Probably karafruit's fault.";
        return;
      }
      switch (response.data?.error?.code) {
        case "missing_field":
          item.error = `${response.data.error.field} is required`;
          return;
        case "invalid_value":
          item.error = `${response.data.error.field} has an invalid value`;
          return;
        default:
          item.error = response.data;
          return;
      }
    },
    async delete_item(event) {
      const id = event.target.dataset.item;

      const response = await axios.get(`/api/items/${id}`);

      if (response.data.user_count > 0) {
        if (!confirm(`There are ${response.data.user_count} users who have this item.\nDeleting it will remove the item from those users.\nIf you just want to stop new users from getting this item, consider setting the weight to 0 instead.\nDelete anyway?`)) {
          return;
        }
      } else {
        if (!confirm("Are you sure you want to delete this item?")) {
          return;
        }
      }

      try {
        await axios.delete(`/api/items/${id}`);

        const index = this.items.findIndex(item => item.id == id);
        if (index >= 0) {
          this.items.splice(index, 1);
        }
      } catch (err) {
        console.log(err);
      }
    },
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

      this.imagePickerItem.image.id = data.id;
      this.imagePickerItem.image.url = data.url;
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
        image_id: item.edit.image.id,
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
        if (err.response) {
          this.parseError(err.response, item.edit);
        }
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
      this.newItem = {weigh_by_remainder: false, sets: {}, image: {}};
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

      if (!this.newItem.image.id) {
        this.newItem.error = "image is required";
        return;
      }

      this.newItem.image_id = this.newItem.image.id;

      try {
        const response = await axios.post("/api/items", this.newItem);

        const newItem = response.data;
        this.items.push(newItem);
        this.newItem = null;
      } catch (err) {
        if (err.response) {
          this.parseError(err.response, this.newItem);
        }
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

.weight-table td, .weight-table th {
  padding: 0 0.5rem;
}

.weight-table td {
  border-top: 1px solid #CCC;
}

.weight-table td.no-top-border {
  border-top-width: 0px;
}

.item-icon {
  width: 3rem;
  height: 3rem;
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

.text-error {
  color: red;
}
</style>
