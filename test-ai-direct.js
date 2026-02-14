const fs = require('fs');

function getApiKey() {
    try {
        const content = fs.readFileSync('.env.local', 'utf8');
        const match = content.match(/GOOGLE_GEMINI_API_KEY\s*=\s*([^ \n\r]+)/);
        return match ? match[1].trim().replace(/^["']|["']$/g, '') : null;
    } catch (e) {
        return null;
    }
}

async function testKey() {
    const key = getApiKey();
    if (!key) {
        console.log('Error: GOOGLE_GEMINI_API_KEY not found in .env.local');
        return;
    }

    console.log('--- Direct API Test ---');
    console.log('Key length:', key.length);
    console.log('Key starts with:', key.substring(0, 5));

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            console.log('Success! API key is valid.');
            console.log('Available models count:', data.models ? data.models.length : 0);
        } else {
            console.log('API Error:', data.error ? data.error.message : 'Unknown error');
            console.log('Status Code:', response.status);
            console.log('Full Error:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Fetch Error:', error.message);
    }
}

testKey();
