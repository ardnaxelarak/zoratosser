<template>
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
              <td rowspan="2" class="text-center"><img class="item-icon" :src="item.image_url"></td>
              <td rowspan="2" class="item-name">
                <input type="text" class="form-control form-control-sm" :value="item.edit.name" />
              </td>
              <td rowspan="2" class="text-center"><input class="form-check-input" type="checkbox" :value="item.edit.weigh_by_remainder"></td>
              <td class="text-end no-bottom-border">Weight:</td>
              <td class="text-center align-bottom no-bottom-border" v-for="set in sets">
                <input type="number" class="weight-input form-control form-control-sm" min="0" step="any" value="1" />
              </td>
              <td rowspan="2" class="row-management">
                <button type="button" class="btn btn-success" :data-item="item.name" @click="save_item">
                  <i class="bi bi-floppy-fill" :data-item="item.name"></i>
                </button>
                <button type="button" class="btn btn-danger ms-1" :data-item="item.name" @click="cancel_item">
                  <i class="bi bi-x-square-fill" :data-item="item.name"></i>
                </button>
              </td>
            </tr>
            <tr>
              <td class="text-end">Max:</td>
              <td class="text-center align-bottom" v-for="set in sets">
                <input type="number" class="max-input form-control form-control-sm" min="0" value="0" />
              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td rowspan="2" class="text-center"><img class="item-icon" :src="item.image_url"></td>
              <td rowspan="2" class="item-name">{{ item.name }}</td>
              <td rowspan="2" class="text-center"><input class="form-check-input" type="checkbox" :value="item.weigh_by_remainder" disabled></td>
              <td class="text-end no-bottom-border">Weight:</td>
              <td class="text-center align-bottom no-bottom-border" v-for="set in sets">
                {{ item.sets[set.name]?.weight || 0 }}
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
                {{ item.sets[set.name]?.max_quantity || 0 }}
              </td>
            </tr>
          </template>
        </template>
      </table>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import axios from "axios";
import sort from "immutable-sort";

export default defineComponent({
  data() {
    return {
      sets: [],
      items: [],
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
    console.log(process.env.NODE_ENV);
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
      item.editing = true;
    },
    save_item(event) {
      const item = this.itemMap[event.target.dataset.item];
      if (!item) {
        return;
      }

      // TODO: actually call the API

      item.edit = null;
      item.editing = false;
    },
    cancel_item(event) {
      const item = this.itemMap[event.target.dataset.item];
      if (!item) {
        return;
      }

      item.edit = null;
      item.editing = false;
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
  width: 2.5rem;
  font-size: 0.7rem;
  padding: 0.1rem 0.2rem !important;
  margin: 0.1rem auto;
}

.row-management .btn {
  color: var(--bs-btn-bg);
}

.row-management .btn:hover {
  color: var(--bs-btn-hover-color);
}
</style>
