<template>
  <div class="card toplevel">
    <div class="card-body">
      <h5 class="card-title">Sets</h5>
      <div class="vstack mx-auto">
        <button type="button" class="btn btn-primary" v-for="set in sets">{{ set.name }}</button>
      </div>
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
    const setResponse = await axios.get("/api/sets");
    this.sets = setResponse.data;
  },
  methods: {
  },
});
</script>

<style>
.toplevel {
  width: 30em;
  margin: auto;
}
</style>
