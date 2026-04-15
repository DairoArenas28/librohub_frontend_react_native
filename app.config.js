module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    package: 'com.librohub.app',
  },
  extra: {
    apiUrl: process.env.API_URL ?? 'https://librohub-backend-express-1.onrender.com/api/v1',
    eas: {
      projectId: 'a7471866-d866-4a25-baa4-1aead6d89952',
    },
  },
});
