module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    package: 'com.dairoarenas28.librohubapp',
  },
  extra: {
    apiUrl: process.env.API_URL,
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
