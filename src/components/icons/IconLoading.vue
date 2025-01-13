<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IconLoading',
})
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 36 36"
    aria-hidden="true"
    class="h-5 w-5 animate-spin fill-white group-active:fill-white/80 md:h-7 md:w-7"
  >
    <circle
      cx="18"
      cy="18"
      r="15"
      stroke="currentColor"
      stroke-width="3"
      fill="none"
      stroke-linecap="round"
      class="stroke-gray-300"
    ></circle>
    <path
      d="M33 18c0 8.25-6.75 15-15 15S3 26.25 3 18"
      stroke="currentColor"
      stroke-width="3"
      fill="none"
      stroke-linecap="round"
      class="stroke-blue-500"
    ></path>
  </svg>
</template>

<style scoped></style>
