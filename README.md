# Email Processing and Auto-Reply Tool

## Overview

This project is a Node.js application that automates the process of fetching, categorizing, and replying to emails using the Gmail API and OpenAI's GPT-3.5. The application integrates with Gmail via OAuth 2.0, processes emails asynchronously, and stores the results in MongoDB.

## Features

- **Gmail Integration**: Authenticate with Gmail and fetch emails via the Gmail API.
- **AI-Powered Categorization**: Automatically categorize emails based on their content using OpenAI's GPT-3.5.
- **Automated Replies**: Generate and send context-aware replies to categorized emails.
- **Task Management**: Store and manage email processing tasks in MongoDB.
- **Progress Tracking**: Track the progress of email processing and view results via a simple frontend interface.

## Tech Stack

- **Backend**: Node.js with Express.js.
- **Frontend**: HTML, CSS, JavaScript.
- **Database**: MongoDB.
- **APIs**: Gmail API, OpenAI GPT-3.5.
- **Authentication**: OAuth 2.0.

## Prerequisites

- **Node.js** (version 14 or later)
- **MongoDB** (running locally or on a cloud service)
- **Gmail API** credentials (Client ID, Client Secret, Redirect URI)
- **OpenAI API Key**

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Daniyal1229/email-processing-tool.git
   cd email-processing-tool
