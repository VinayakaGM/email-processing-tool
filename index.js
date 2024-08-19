const express = require('express');
const mongoose = require('mongoose');
const { google } = require('googleapis');
const path = require('path');
const openaiService = require('./src/services/openai.service');
const gmailService = require('./src/services/gmail.service');
const emailProcessorController = require('./src/controllers/emailProcessor.controller');
const EmailTask = require('./src/models/emailTask.model');
const config = require('./src/config/config');

const app = express();

mongoose.connect(config.mongodb_uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

app.use(express.json());
app.use(express.static(path.join(__dirname,"src",'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,"src", 'public', 'index.html'));
});

let processingProgress = {
    totalEmails: 0,
    processedEmails: 0
};

app.get('/auth/gmail', (req, res) => {
console.log("hello");

  const authUrl = gmailService.getAuthUrl();
  res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const tokens = await gmailService.getToken(code);
    res.redirect(`/?token=${tokens.access_token}`);
  } catch (error) {
    console.error('Error during Gmail authentication:', error);
    res.status(500).send('Error during Gmail authentication');
  }
});

app.post('/process-emails', async (req, res) => {
  const { accessToken } = req.body;
  
  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  const auth = new google.auth.OAuth2(
    config.gmail.clientId,
    config.gmail.clientSecret,
    config.gmail.redirectUri
  );
  auth.setCredentials({ access_token: accessToken });

  try {
    processingProgress = {
      totalEmails: 0,
      processedEmails: 0
    };

    emailProcessorController.processEmails(auth, processingProgress);
    
    res.json({ message: 'Email processing started' });
  } catch (error) {
    console.error('Error processing emails:', error);
    res.status(500).json({ error: 'Error processing emails', details: error.message });
  }
});

app.get('/processing-progress', (req, res) => {
  const progress = processingProgress.totalEmails > 0
    ? Math.round((processingProgress.processedEmails / processingProgress.totalEmails) * 100)
    : 0;
  
  res.json({
    totalEmails: processingProgress.totalEmails,
    processedEmails: processingProgress.processedEmails,
    progress: progress
  });
});

app.get('/email-results', async (req, res) => {
  try {
    const results = await EmailTask.find({ status: 'completed' }).sort('-createdAt').limit(10);
    const formattedResults = results.map(task => ({
      subject: task.emailContent.split('\n')[0],
      category: task.category,
      reply: task.reply
    }));
    res.json(formattedResults);
  } catch (error) {
    console.error('Error fetching email results:', error);
    res.status(500).json({ error: 'Error fetching email results' });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
