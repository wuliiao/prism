export const env = {
  jamendoClientId: import.meta.env.VITE_JAMENDO_CLIENT_ID ?? '',
}

export const isJamendoConfigured = (): boolean => env.jamendoClientId.length > 0
