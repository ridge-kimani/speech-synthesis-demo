<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BaseButton',
})
</script>

<template>
  <button v-bind="$attrs" class="base-button">
    <slot></slot>
  </button>
</template>

<style scoped lang="scss"></style>
