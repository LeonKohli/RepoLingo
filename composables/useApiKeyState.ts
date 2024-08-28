export const useApiKeyState = () => {
  const cookie = useCookie('apiKey', {
    maxAge: 60 * 60 * 24 * 7, // 1 week
    secure: true,
    sameSite: 'strict'
  })
    
  const encode = (value: string) => {
    return btoa(value)
  }

  const decode = (value: string) => {
    return atob(value)
  }

  const state = useState<string>('apiKey', () => {
    if (cookie.value) {
      return decode(cookie.value)
    }
    return ''
  })

  watch(state, (newValue) => {
    if (newValue) {
      cookie.value = encode(newValue)
    } else {
      cookie.value = null
    }
  })

  return state
}