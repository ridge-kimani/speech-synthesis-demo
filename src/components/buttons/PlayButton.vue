<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue'

import BaseButton from '@/components/buttons/BaseButton.vue'
import IconLoading from '@/components/icons/IconLoading.vue'
import IconPlay from '@/components/icons/IconPlay.vue'
import IconPause from '@/components/icons/IconPause.vue'

import usePlayerStore from '@/stores/player.ts'

export default defineComponent({
  name: 'PlayButton',
  components: { BaseButton, IconLoading, IconPause, IconPlay },
  setup() {
    const isPlaying = ref(false)
    const isLoading = ref(false)
    const isPaused = ref(false)

    const playerStore = usePlayerStore()
    const { playerState } = playerStore

    function toggleSpeak() {
      if (isPlaying.value) {
        playerStore.runAction('pause')
        isPlaying.value = false
        return(isPaused.value = true)
      }

      if (isPaused.value) {
        isPaused.value = false
        return playerStore.runAction('resume')
      }

      if (!isPlaying.value) return playerStore.runAction('toggleSpeak')
    }

    watchEffect(() => {
      isPlaying.value = playerState.isPlaying
      isLoading.value = playerState.isLoading
    })

    return {
      toggleSpeak,
      isLoading,
      isPlaying,
    }
  },
})
</script>

<template>
  <BaseButton class="play-button" @click="toggleSpeak" v-bind="$attrs">
    <IconLoading v-if="isLoading" />
    <IconPause v-else-if="isPlaying" />
    <IconPlay v-else></IconPlay>
  </BaseButton>
</template>

<style scoped lang="scss">
.play-button {
  @apply relative flex h-10 w-10 flex-shrink-0 items-center justify-center
    rounded-full bg-slate-700 md:h-14 md:w-14;
}
</style>
