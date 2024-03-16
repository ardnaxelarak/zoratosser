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
        </tr>
        <template v-for="item in items">
          <tr>
            <td rowspan="2" class="text-center"><img class="item-icon" :src="item.image_url"></td>
            <td rowspan="2" class="item-name">{{ item.name }}</td>
            <td rowspan="2" class="text-center"><input class="form-check-input" type="checkbox" :value="item.weigh_by_remainder"></td>
            <td class="text-end no-bottom-border">Weight:</td>
            <td class="text-center align-bottom no-bottom-border" v-for="set in sets">
              <input type="number" class="weight-input form-control form-control-sm" min="0.01" step="any" value="1" />
            </td>
          </tr>
          <tr>
            <td class="text-end">Max:</td>
            <td class="text-center align-bottom" v-for="set in sets">
              <input type="number" class="max-input form-control form-control-sm" min="0" value="0" />
            </td>
          </tr>
        </template>
      </table>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import axios from "axios";

export default defineComponent({
  data() {
    return {
      sets: [],
      items: [],
    };
  },
  async created() {
    axios.get("/api/sets").then(response => this.sets = response.data);
    axios.get("/api/items").then(response => this.items = response.data);
  },
  methods: {
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
</style>
