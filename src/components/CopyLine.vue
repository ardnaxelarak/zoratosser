<template>
  <div class="input-group m-4">
    <span class="input-group-text" v-if="label">{{ label }}</span>
    <input type="text" class="form-control value-text" :value="value" disabled="true" />
    <button class="btn btn-outline-secondary" type="button" @click="copied">
      <i class="bi bi-clipboard-fill no-pointer-events"></i>
    </button>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { Popover } from "bootstrap";

export default defineComponent({
  props: {
    label: {},
    value: {},
  },
  methods: {
    copied(event) {
      navigator.clipboard.writeText(this.value);
      const popover = new Popover(event.target, {title: "Copied!"});
      popover.show();
      setTimeout(() => popover.dispose(), 1000);
    },
  },
});
</script>

<style>
.value-text {
  font-family: monospace;
}
</style>
