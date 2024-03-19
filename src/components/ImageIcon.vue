<template>
  <img :class="styles" :src="image.url"></img>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: ['image'],
  computed: {
    styles() {
      return ["image-icon", {pixelated: this.image.pixelated}];
    }
  },
});
</script>

<style>
.image-icon {
  object-fit: contain;
}

.pixelated {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
}
</style>
