<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

import { ChevronDownIcon } from '@heroicons/vue/16/solid'

export default defineComponent({
  name: 'SimpleSelect',
  components: {
    ChevronDownIcon,
  },
  props: {
    label: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      default: () => [],
    },
    selected: {
      required: false,
    },
  },
  setup(props, { emit}) {
    const selectOptions = ref(props.options)
    const selectedOption = ref(props.selected)

    function selectOption() {
      return emit('onSelect', selectedOption.value)
    }

    watch(props, () => {
      selectOptions.value = props.options
      selectedOption.value = props.selected
    })

    return {
      ...props,
      selectedOption,
      selectOption,
      selectOptions,
    }
  },
})
</script>

<template>
  <div class="simple-select-container">
    <label for="location" class="simple-select-label">{{ label }}</label>
    <div class="simple-select-grid">
      <select class="simple-select" v-bind="$attrs" v-model="selectedOption" @change="selectOption">
        <option
          v-for="(option, index) in selectOptions"
          :key="index"
        >
          {{ option }}
        </option>
      </select>
      <ChevronDownIcon class="simple-select-icon" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.simple-select {
  @apply col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8
  text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300
  focus:outline-indigo-600 sm:text-sm/6;

  &-grid {
    @apply grid grid-cols-1 min-w-32;
  }

  &-container {
    @apply flex gap-4 items-center;
  }

  &-label {
    @apply block text-sm/6 font-medium text-gray-900;
  }

  :focus {
    @apply outline outline-2 -outline-offset-2;
  }

  &-icon {
    @apply pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center
    justify-self-end text-gray-500 sm:size-4;
  }
}
</style>
