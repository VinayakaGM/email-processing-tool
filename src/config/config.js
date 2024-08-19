require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  mongodb_uri: process.env.MONGODB_URI,
  gmail: {
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    redirectUri: process.env.GMAIL_REDIRECT_URI,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
};
