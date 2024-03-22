<template>
  <div class="card image-card" :data-image-id="image.id" @click="icon_clicked">
    <ImageIcon class="card-img-top picker-image-icon" :image="image" />
    <div class="card-body no-pointer-events p-0 pb-1" v-if="image.in_use != undefined">
      <div ref="tooltip" class="delete-button-container" data-bs-toggle="tooltip" data-bs-placement="bottom" :data-bs-title="tooltipText">
        <button type="button" class="btn btn-outline-danger delete-image-button" :disabled="image.in_use" @click="delete_clicked">
          <i class="bi bi-trash3-fill"></i>
        </button>
      </div>
    </div>
    <div class="card-footer text-body-secondary image-name no-pointer-events text-center">{{ image.name }}</div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { Tooltip } from "bootstrap";

import ImageIcon from '../components/ImageIcon.vue'

export default defineComponent({
  props: ['image'],
  components: {
    ImageIcon,
  },
  watch: {
    image(oldImage, newImage) {
      if (!this.$refs.tooltip) {
        return;
      }

      const tooltip = Tooltip.getOrCreateInstance(this.$refs.tooltip);

      if (newImage.in_use) {
        tooltip.enable();
      } else {
        tooltip.disable();
      }
    },
  },
  computed: {
    tooltipText() {
      return "This image is currently assigned to at least one item. In order to delete it, you must first remove it from all items.";
    },
  },
  methods: {
    icon_clicked() {
      this.$emit("icon-click", {image: this.image});
    },
    delete_clicked(event) {
      event.stopPropagation();
      this.$emit("delete", {id: this.image.id});
    },
  },
});
</script>

<style>
.image-card {
  width: 7rem;
  margin: 0.2rem;
  cursor: pointer;
  background-color: #ddd;
}

.image-card:hover {
  filter: brightness(75%);
}

.picker-image-icon {
  pointer-events: none;
  width: 6rem;
  height: 6rem;
  margin: 0.2rem auto;
}

.no-pointer-events {
  pointer-events: none;
}

.image-name {
  font-size: small;
  padding: 0.3rem;
  height: fill;
}

.delete-button-container {
  width: fit-content;
  margin: auto;
  pointer-events: all;
}

.delete-image-button {
  border-radius: 100%;
  font-size: small;
  width: 2rem;
  height: 2rem;
  padding: 0;
}
</style>
