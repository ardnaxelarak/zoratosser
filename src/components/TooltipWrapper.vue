<template>
  <div ref="tooltip" :data-bs-placement="placement" :data-bs-title="title">
    <slot></slot>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { Tooltip } from "bootstrap";

export default defineComponent({
  data() {
    return {
      tooltip: null,
    };
  },
  props: {
    title: {
      required: true,
    },
    enabled: {
      default: true,
    },
    placement: {
      default: "top",
    },
  },
  mounted() {
    this.tooltip = Tooltip.getOrCreateInstance(this.$refs.tooltip);
    this.updateStatus();
  },
  watch: {
    enabled(oldEnabled, newEnabled) {
      if (this.tooltip) {
        this.updateStatus();
      }
    },
  },
  methods: {
    updateStatus() {
      if (this.enabled) {
        this.tooltip.enable();
      } else {
        this.tooltip.disable();
      }
    },
  }
});
</script>
