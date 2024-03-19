<template>
  <div class="card items-card ms-4 mt-4 me-4">
    <div class="card-body">
      <table class="table item-table mb-0">
        <template v-for="item in itemsSorted">
          <tr>
            <td class="text-end obtained-items-quantity-col">{{ item.quantity }}</td>
            <td class="text-center"><img class="item-icon" :src="item.image_url"></td>
            <td class="obtained-items-name-col">{{ item.name }}</td>
          </tr>
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
      items: [],
    };
  },
  computed: {
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
    axios.get(`/api/obtained_items/${this.$route.params.channel}`).then(response => this.items = response.data);
  },
  methods: {
  },
});
</script>

<style>
.item-table {
  width: fit-content;
}

.item-table td, .item-table th {
  padding: 0 0.5rem;
  border-top: 1px solid #CCC;
}

.item-icon {
  width: 3rem;
  height: 3rem;
  object-fit: contain;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
}

.obtained-items-quantity-col, .obtained-items-name-col {
  font-size: 2rem;
}
</style>
