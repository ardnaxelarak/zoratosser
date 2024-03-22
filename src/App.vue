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
  mounted() {
    const tooltipTriggers = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggers].map(el => new bootstrap.Tooltip(el));
  },
}
</script>

