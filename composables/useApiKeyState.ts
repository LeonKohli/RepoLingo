export const useApiKeyState = () => {
  const cookie = useCookie('apiKey', {
    maxAge: 60 * 60 * 24 * 7, // 1 week
    secure: true,
    sameSite: 'strict'
  })

  const encode = (value: string) => btoa(value)
  const decode = (value: string) => atob(value)

  const state = useState<string>('apiKey', () => cookie.value ? decode(cookie.value) : '')

  const updateApiKey = (newValue: string) => {
    state.value = newValue
    if (newValue) {
      cookie.value = encode(newValue)
    } else {
      cookie.value = null
    }
  }

  return {
    apiKey: readonly(state),
    updateApiKey
  }
}