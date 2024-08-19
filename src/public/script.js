let accessToken = '';

document.getElementById('authButton').addEventListener('click', () => {
    console.log("hello");
    
    window.location.href = '/auth/gmail';
});

document.getElementById('processEmailsButton').addEventListener('click', processEmails);

// Check if we have an access token in the URL (after OAuth redirect)
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
console.log(token);

if (token) {
    accessToken = token;
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('emailSection').style.display = 'block';
    processEmails(); // Automatically process emails after authentication
}

async function processEmails() {
    try {
        const response = await fetch('/process-emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accessToken }),
        });

        if (!response.ok) {
            throw new Error('Failed to process emails');
        }

        const result = await response.json();
        console.log(result);

        // Fetch the email results
        const emailsResponse = await fetch('/email-results');
        if (!emailsResponse.ok) {
            throw new Error('Failed to fetch email results');
        }

        const emails = await emailsResponse.json();
        displayEmails(emails);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing emails');
    }
}

function displayEmails(emails) {
    const emailList = document.getElementById('emailList');
    emailList.innerHTML = '';

    if (emails.length === 0) {
        emailList.innerHTML = '<p>No emails found.</p>';
        return;
    }

    emails.forEach(email => {
        const emailItem = document.createElement('div');
        emailItem.className = 'email-item';
        emailItem.innerHTML = `
            <h3>${email.subject}</h3>
            <p class="email-from">${email.from}</p>
            <span class="email-category category-${email.category.toLowerCase().replace(' ', '-')}">${email.category}</span>
            <div class="email-content">${email.content}</div>
            <div class="email-reply"><strong>Reply:</strong> ${email.reply}</div>
        `;
        emailList.appendChild(emailItem);
    });
}


