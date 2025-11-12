require('dotenv').config();

module.exports = {
  ngrok: {
    authToken: process.env.NGROK_AUTH_TOKEN,
    domain: process.env.NGROK_DOMAIN,
    port: parseInt(process.env.NGROK_PORT || '8081'),
  },
  expo: {
    port: parseInt(process.env.EXPO_PORT || '8081'),
  },
  security: {
    basicAuth: {
      enabled: process.env.BASIC_AUTH_ENABLED === 'true',
      username: process.env.BASIC_AUTH_USERNAME || '',
      password: process.env.BASIC_AUTH_PASSWORD || '',
    },
  },
};

