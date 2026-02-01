export const googleConfig = {
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  redirectUri: `${window.location.origin}/auth/google/callback`,
  scope: 'profile email openid',
  responseType: 'code',
  accessType: 'offline',
  prompt: 'consent',
};

export const appleConfig = {
  clientId: process.env.REACT_APP_APPLE_CLIENT_ID,
  redirectURI: `${window.location.origin}/auth/apple/callback`,
  scope: 'name email',
  state: 'apple',
  usePopup: true,
};