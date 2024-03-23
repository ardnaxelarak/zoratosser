<template>
  <RouterView />
</template>

<script>
import { defineComponent } from "vue";
import { RouterLink, RouterView } from 'vue-router'

export default {
  components: {
    RouterView,
  },
}
</script>

<style>
.no-pointer-events {
  pointer-events: none;
}

.fit-content {
  width: fit-content;
}
</style>
