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

