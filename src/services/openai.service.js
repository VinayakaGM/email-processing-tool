const axios = require('axios');
const config = require('../config/config');

class OpenAIService {
  async categorizeEmail(emailContent) {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [
          {role: "system", content: "You are a helpful assistant that categorizes emails."},
          {role: "user", content: `Categorize the following email content as "Interested", "Not Interested", or "More Information":\n\n${emailContent}`}
        ],
        max_tokens: 50
      }, {
        headers: {
          'Authorization': `Bearer ${config.openai.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error categorizing email:', error);
      return 'Uncategorized';
    }
  }

  async generateReply(emailContent, category) {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [
          {role: "system", content: "You are a helpful assistant that generates email replies."},
          {role: "user", content: `Generate a brief reply for the following email content, considering it's categorized as "${category}":\n\n${emailContent}`}
        ],
        max_tokens: 150
      }, {
        headers: {
          'Authorization': `Bearer ${config.openai.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      if (error.response) {
        console.error('OpenAI API error:', error.response.status, error.response.data);
      } else {
        console.error('Error calling OpenAI API:', error.message);
      }
      return 'Uncategorized';
    }
  }
}

module.exports = new OpenAIService();
