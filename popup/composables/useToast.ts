import { ref } from 'vue'

const message = ref<string | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null

export function useToast() {
  function toast(msg: string, durationMs = 2200) {
    message.value = msg
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      message.value = null
      timer = null
    }, durationMs)
  }

  return { message, toast }
}
