const { google } = require('googleapis');
const config = require('../config/config');

class GmailService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      config.gmail.clientId,
      config.gmail.clientSecret,
      config.gmail.redirectUri
    );
  }

  getAuthUrl() {
    const scopes = ['https://www.googleapis.com/auth/gmail.modify'];
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  }

  async getToken(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  async getAndProcessEmails(auth, openaiService) {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.list({ userId: 'me', maxResults: 10 });
    const emails = [];
  
    for (const message of res.data.messages) {
      const emailData = await gmail.users.messages.get({ userId: 'me', id: message.id });
      const subject = emailData.data.payload.headers.find(header => header.name === 'Subject')?.value || 'No Subject';
      const from = emailData.data.payload.headers.find(header => header.name === 'From')?.value || 'Unknown Sender';
      const content = this.getEmailContent(emailData.data);
  
      const category = await openaiService.categorizeEmail(content);
      const reply = await openaiService.generateReply(content, category);
  
      emails.push({
        id: message.id,
        subject,
        from,
        content,
        category,
        reply
      });
  
      await this.sendReply(auth, message.id, reply);
    }
  
    return emails;
  }
  

  getEmailContent(message) {
    if (message.payload) {
      if (message.payload.parts && message.payload.parts.length > 0) {
        const textPart = message.payload.parts.find(part => part.mimeType === 'text/plain');
        if (textPart && textPart.body && textPart.body.data) {
          return Buffer.from(textPart.body.data, 'base64').toString();
        }
      }
      if (message.payload.body && message.payload.body.data) {
        return Buffer.from(message.payload.body.data, 'base64').toString();
      }
    }
    return 'No content available';
  }
  
  async sendReply(auth, messageId, replyContent) {
    const gmail = google.gmail({ version: 'v1', auth });
    const originalMessage = await gmail.users.messages.get({ userId: 'me', id: messageId });
    const subject = originalMessage.data.payload.headers.find(header => header.name === 'Subject').value;
    const to = originalMessage.data.payload.headers.find(header => header.name === 'From').value;

    const message = [
      `To: ${to}`,
      `Subject: Re: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      replyContent
    ].join('\n');

    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
        threadId: originalMessage.data.threadId
      }
    });
  }
  async listEmails(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.list({ userId: 'me', maxResults: 10 });
    return res.data.messages || [];
  }
  
}

module.exports = new GmailService();
