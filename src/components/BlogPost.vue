<script lang="ts">
import { computed, defineComponent, onMounted, ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'

import { marked } from 'marked'

import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark-dimmed.css'

import PlayButton from '@/components/buttons/PlayButton.vue'
import SimpleSelect from '@/components/select/SimpleSelect.vue'

import { title, timestamp, headerItems } from '@/fixtures/index.ts'

import usePlayerStore, { ONE } from '@/stores/player.ts'

export default defineComponent({
  name: 'BlogPost',
  components: { SimpleSelect, PlayButton },
  setup() {
    const pitches = ref<number[]>([])
    const renderedHTML = ref('')
    const selectedVoice = ref('')
    const selectedPitch = ref(ONE)
    const voices = ref<string[]>([])
    const blockSpeechOptions = ref(true)
    const renderer = new marked.Renderer()

    renderer.code = ({ lang, text }) => {
      const highlighted = lang ? hljs.highlight(text, { language: lang }).value : text
      return `<pre><code class="hljs ${lang}">${highlighted}</code></pre>`
    }

    marked.setOptions({
      renderer: renderer,
    })

    const playerStore = usePlayerStore()
    const {
      pitchRange,
      selectedVoice: storeSelectedVoice,
      selectedPitch: storeSelectedPitch,
      voicesPerLang,
      blockUtteranceUpdates
    } = storeToRefs(playerStore)

    onMounted(async () => {
      const markdownModule = await import('../assets/blog.md?raw')
      const htmlContent = await marked(markdownModule.default)

      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')
      const links = doc.querySelectorAll('a')
      links.forEach((link) => {
        link.setAttribute('target', '_blank')
      })

      renderedHTML.value = doc.body.innerHTML
      playerStore.runAction('setText', renderedHTML.value.replace(/<[^>]*>/g, ''))
    })

    watchEffect(() => {
      voices.value = [...voicesPerLang.value]
      selectedVoice.value = storeSelectedVoice.value?.name || ''
      pitches.value = [...pitchRange.value]
      selectedPitch.value = storeSelectedPitch.value
      blockSpeechOptions.value = blockUtteranceUpdates.value
    })

    const selectOptions = computed(() => [
      {
        label: 'Voice',
        disabled: blockUtteranceUpdates.value,
        options: voices.value,
        selected: selectedVoice.value,
        onSelect: (value: string) => {
          playerStore.runAction('setVoice', value)
        }
      },
      {
        label: 'Pitch',
        disabled: blockUtteranceUpdates.value,
        options: pitches.value,
        selected: selectedPitch.value,
        onSelect: (value: string) => {
          playerStore.runAction('setPitch', value)
        }
      },
    ])

    return {
      headerItems,
      renderedHTML,
      selectOptions,
      timestamp,
      title,
    }
  },
})
</script>

<template>
  <div class="blog-post-container">
    <header class="blog-post-header">
      <div class="blog-post-header-block">
        <PlayButton />
        <div class="flex flex-col">
          <h1 class="blog-post-header-title">{{ title }}</h1>
          <time :datetime="timestamp" class="blog-post-header-timestamp">
            {{ new Date(timestamp).toDateString() }}
          </time>
        </div>
      </div>
    </header>
    <div class="flex justify-center items-center my-6 gap-4">
      <SimpleSelect
        v-for="(option, index) in selectOptions"
        v-bind="option"
        :key="index"
        @onSelect="(value) => option.onSelect(value)"
      />
    </div>
    <span class="text-center" v-for="(item, index) in headerItems" :key="index">{{ item }}</span>

    <hr class="my-8 border-gray-200" />
    <div>
      <article class="blog-post-content" v-html="renderedHTML"></article>
    </div>
  </div>
</template>

<style scoped lang="scss">
.blog-post {
  &-container {
    @apply md:mx-32 md:mt-16 md:mb-48 flex flex-col m-8;
  }

  &-header {
    @apply flex flex-col items-center;

    &-block {
      @apply flex items-center gap-6;
    }

    &-title {
      @apply mt-2 text-2xl font-bold text-slate-900;
    }
    &-timestamp {
      @apply order-first font-mono text-sm leading-7 text-slate-500;
    }
    &-subtitle {
      @apply mt-3 text-sm font-medium leading-8 text-slate-700 italic;
    }
  }

  &-content {
    @apply lg:max-w-4xl mx-auto;
  }
}
</style>
<style lang="scss">
.blog-post-content {
  h1 {
    @apply text-4xl font-bold text-gray-800 leading-tight;
  }
  h2 {
    @apply text-3xl font-semibold text-gray-700 leading-snug;
  }

  h3 {
    @apply text-2xl font-medium text-gray-700 leading-relaxed;
  }

  h4 {
    @apply text-xl font-medium text-gray-600 leading-relaxed;
  }

  h5 {
    @apply text-lg font-semibold text-gray-600 leading-relaxed;
  }
  ol {
    @apply list-decimal pl-6 text-gray-800;

    li {
      @apply text-base mb-2;
    }
  }

  ul {
    @apply list-inside pl-5 text-gray-800;

    li {
      @apply text-base mb-2;
    }
  }

  a {
    @apply text-blue-600 hover:text-blue-800 underline;
  }

  p {
    @apply py-2;
  }
  pre {
    code {
      @apply rounded-2xl my-4;
    }
  }
}
</style>
