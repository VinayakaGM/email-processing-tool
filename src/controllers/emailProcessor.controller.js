const EmailTask = require('../models/emailTask.model');
const gmailService = require('../services/gmail.service');
const openaiService = require('../services/openai.service');

async function processEmails(auth, processingProgress) {
    let pageToken = null;
    do {
      const emails = await gmailService.listEmails(auth, 100, pageToken);
      processingProgress.totalEmails += emails.length;
  
      for (const email of emails) {
        try {
          const content = await gmailService.getEmailContent(auth, email.id);
          
          if (!content || content.trim() === '') {
            console.log(`Skipping email ${email.id} due to empty content`);
            continue;
          }

          const category = await openaiService.categorizeEmail(content);
          const reply = await openaiService.generateReply(content, category);
  
          await EmailTask.create({
            emailId: email.id,
            emailContent: content,
            category: category,
            reply: reply,
            status: 'completed'
          });
  
          processingProgress.processedEmails++;
          console.log(`Processed email ${email.id}`);
        } catch (error) {
          console.error(`Error processing email ${email.id}:`, error);
        }
      }
  
      pageToken = emails.nextPageToken;
    } while (pageToken);
  }
  
module.exports = { processEmails };
