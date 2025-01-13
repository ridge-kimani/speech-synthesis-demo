import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { defineStore } from 'pinia'

type FilterParams = {
  lang?: string
  prefix?: string
}

type ActionName =
  | 'cancel'
  | 'pause'
  | 'resume'
  | 'setText'
  | 'setVoice'
  | 'setPitch'
  | 'toggleSpeak'

type Actions = Record<
  ActionName,
  | (() => void) // For actions with no parameter
  | ((param: string) => void) // For actions with a string
>
interface PlayerState {
  isPlaying: boolean
  isLoading: boolean
  text: string
}

export const ONE = 1
export const MAX_RETRIES = 50
export const RETRY_INTERVAL = 5000

export const usePlayerStore = defineStore('player', () => {
  const playerState = reactive<PlayerState>({
    isPlaying: false,
    isLoading: false,
    text: '',
  })

  /*
   * Synthesis options
   */
  const availableVoices = ref<SpeechSynthesisVoice[]>([])
  const blockUtteranceUpdates = ref(false)
  const currentWordIndex = ref(0)
  const hasError = ref(false)
  const initComplete = ref(false)
  const pitchRange = ref<number[]>([])
  const selectedLangPrefix = ref('en')
  const selectedPitch = ref(ONE)
  const selectedRate = ref(ONE)
  const selectedVoice = ref<SpeechSynthesisVoice | null>(null)
  const selectedVolume = ref(ONE)
  const synthLoaded = ref(false)
  const utterance = ref<SpeechSynthesisUtterance | null>(null)

  const synth = window.speechSynthesis

  onMounted(async () => {
    if ('onvoiceschanged' in synth) {
      synth.onvoiceschanged = initializeSynth
    } else {
      speechSynthesis.addEventListener('voiceschanged', initializeSynth)
    }
    await initializeSynth()
  })

  async function initializeSynth() {
    checkSupport()
    if (hasVoices.value && initComplete.value) return

    setVoices(await loadVoices())
    generatePitchRange()
    initComplete.value = true
  }

  function checkSupport() {
    if ('speechSynthesis' in window && synth) {
      synth.cancel()
      return (synthLoaded.value = true)
    }
    throw new Error('Speech Synthesis not supported')
  }

  function loadVoices(
    retryInterval = RETRY_INTERVAL,
    maxRetries = MAX_RETRIES,
  ): Promise<SpeechSynthesisVoice[] | []> {
    return new Promise((resolve, reject) => {
      const tryLoadVoices = (retriesLeft: number) => {
        const voices = synth.getVoices()

        if (voices.length) {
          return resolve(voices)
        }

        if (retriesLeft <= 0) {
          return reject(new Error('Failed to load voices.'))
        }
        setTimeout(() => tryLoadVoices(retriesLeft - 1), retryInterval)
      }
      tryLoadVoices(maxRetries)
    })
  }

  function setVoices(voices: SpeechSynthesisVoice[]) {
    if (availableVoices.value.length) return

    availableVoices.value = voices || []
    const lang = window.navigator?.language || ''
    if (lang) selectedLangPrefix.value = lang.split('-')[0]

    const filteredVoices = filterVoicesByLang({ lang, prefix: selectedLangPrefix.value })
    const defaultSelect = filteredVoices.find((voice) => voice.default)
    if (defaultSelect) return (selectedVoice.value = defaultSelect)
    return (selectedVoice.value = filteredVoices[0])
  }

  function setVoice(name: string) {
    selectedVoice.value =
      availableVoices.value.find((voice) => voice.name === name) || availableVoices.value[0]
  }

  function setPitch(pitch: number) {
    selectedPitch.value = pitch
  }

  const filterVoicesByLang = ({ lang, prefix }: FilterParams) => {
    if (!hasVoices.value || (!lang && !prefix)) return []

    if (lang) return availableVoices.value.filter((voice) => voice.lang === lang)

    return availableVoices.value.filter((voice) => voice.lang.startsWith(prefix!))
  }

  function generatePitchRange() {
    if (pitchRange.value.length) return

    const range = []
    for (let i = 1; i <= 20; i++) {
      range.push(parseFloat((i * 0.1).toFixed(1)))
    }
    pitchRange.value = [...range]
  }

  const createUtterance = () =>
    new Promise((resolve, reject) => {
      try {
        if (utterance.value) {
          utterance.value = null
          synth.cancel()
        }

        let { text } = playerState
        if (currentWordIndex.value) text = text.substring(currentWordIndex.value)
        utterance.value = new SpeechSynthesisUtterance(text)
        if (selectedVoice.value) {
          utterance.value.voice = selectedVoice.value
          utterance.value.lang = selectedVoice.value.lang
        }

        utterance.value.text = text
        utterance.value.pitch = selectedPitch.value
        utterance.value.rate = selectedRate.value
        utterance.value.volume = selectedVolume.value
        resolve(utterance.value)
      } catch (error: unknown) {
        console.log(error)
        reject(error)
      }
    })

  function pause() {
    synth.pause()
    updatePlayerState('isPlaying', false)
  }

  function resume() {
    synth.resume()
    updatePlayerState('isPlaying', true)
  }

  function cancel() {
    synth.cancel()
    updatePlayerState('isPlaying', false)
    updatePlayerState('isLoading', false)
    updatePlayerState('text', '')
  }

  function resetState() {
    synth.cancel()
    utterance.value = null
    synthLoaded.value = false
    initComplete.value = false
  }

  async function toggleSpeak() {
    updatePlayerState('isLoading', true)
    const _utterance = await createUtterance()
    synth.speak(_utterance as SpeechSynthesisUtterance)
    hasError.value = false
    blockUtteranceUpdates.value = true
  }

  function hasValue(param: boolean | string | number): boolean {
    return param !== undefined && param !== null
  }

  function updatePlayerState<K extends keyof PlayerState>(key: K, value: PlayerState[K]) {
    if (hasValue(value)) playerState[key] = value
  }

  function setText(text: string) {
    return updatePlayerState('text', text)
  }

  const actions: Actions = {
    cancel,
    pause,
    resume,
    setPitch: (pitch: string) => setPitch(Number(pitch)),
    setText: (text: string) => setText(text),
    setVoice: (name: string) => setVoice(name),
    toggleSpeak,
  }

  async function runAction(action: ActionName, param?: string) {
    if (!initComplete.value) await initializeSynth()
    try {
      return actions[action](param as string)
    } catch (error: unknown) {
      if (error instanceof Error) throw new Error(error.message)
      throw new Error('Function not found')
    }
  }

  const hasVoices = computed(() => availableVoices.value.length)
  const voicesPerLang = computed(() =>
    filterVoicesByLang({ prefix: selectedLangPrefix.value }).map((voice) => voice.name),
  )

  const words = computed(() => playerState.text.split(' '))

  watch(hasError, async (value) => {
    if (value) {
      resetState()
      await initializeSynth()
      return toggleSpeak()
    }
  })

  watch(utterance, (context) => {
    if (!context) return

    context.onstart = () => {
      updatePlayerState('isPlaying', true)
      updatePlayerState('isLoading', false)
      hasError.value = false
    }

    context.onpause = () => {
      updatePlayerState('isPlaying', false)
    }

    context.onresume = () => {
      updatePlayerState('isPlaying', true)
    }

    context.onerror = (event) => {
      hasError.value = true
    }

    context.onboundary = (event) => {
      if (hasValue(event.charIndex)) {
        const spokenText = playerState.text.substring(0, event.charIndex)
        currentWordIndex.value = spokenText.split(/\s+/).length - 1
      }
    }
  })

  onUnmounted(() => resetState())

  return {
    availableVoices,
    blockUtteranceUpdates,
    currentWordIndex,
    pitchRange,
    playerState,
    runAction,
    selectedPitch,
    selectedVoice,
    voicesPerLang,
    words,
  }
})

export default usePlayerStore
