export const getAccessToken = (): string => {
  const token = localStorage.getItem('token')
  return token || ''
}

export const autoLogout = async () => {
  if (typeof window !== 'undefined') {
    // await logout()
    window.location.href = '/login'
    localStorage.clear()
  }
}
