<template>
  <div class="modal fade" :id="id" data-bs-background="static" data-bs-keyboard="false" @hidden.bs.modal="hidden">
    <div class="modal-dialog image-picker">
      <div class="modal-header">
        <h5 class="modal-title">Choose an Image</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <template v-for="image in imagesSorted">
          <div class="card image-card" :data-image-id="image.id" @click="icon_clicked">
            <img class="card-img-top image-icon" :src="image.url">
            <div class="card-footer text-body-secondary image-name text-center">{{ image.name }}</div>
          </div>
        </template>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-primary">Upload</button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import axios from "axios";
import sort from "immutable-sort";
import { Modal } from "bootstrap";

export default defineComponent({
  props: ['id'],
  data() {
    return {
      images: [],
    };
  },
  computed: {
    imageMap() {
      return this.images.reduce((map, obj) => {
        map[obj.id] = obj;
        return map;
      }, {});
    },
    imagesSorted() {
      return sort(this.images, (a, b) => {
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
    axios.get("/api/images").then(response => this.images = response.data);
  },
  methods: {
    icon_clicked(event) {
      const imageId = event.target.dataset.imageId;
      const image = this.imageMap[imageId];
      const modal = Modal.getOrCreateInstance(`#${this.id}`);
      this.$emit("imageSelected", {id: image.id, url: image.url});
      modal.hide();
    },
    hidden() {
      this.$emit("pickerClosed");
    },
  },
});
</script>

<style>
.image-picker {
  background-color: var(--bs-modal-bg);
  border-width: var(--bs-modal-border-width);
  border-color: var(--bs-modal-border-color);
  border-radius: var(--bs-modal-border-radius);
  pointer-events: all;
}

.image-picker .modal-body {
  display: flex;
}

.image-card {
  width: 7rem;
  margin: 0.2rem;
  cursor: pointer;
}

.image-card:hover {
  filter: brightness(75%);
}

.image-icon {
  pointer-events: none;
  width: 6rem;
  height: 6rem;
  object-fit: contain;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
  margin: 0.2rem auto;
}

.image-name {
  pointer-events: none;
  font-size: small;
  padding: 0.3rem;
}
</style>
