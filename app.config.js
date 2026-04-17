module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    package: 'com.dairoarenas28.librohubapp',
  },
  extra: {
    apiUrl: process.env.API_URL,
    eas: {
      projectId: 'a7471866-d866-4a25-baa4-1aead6d89952',
    },
  },
});
