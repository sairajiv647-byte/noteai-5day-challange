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

async function listModels() {
    const key = getApiKey();
    if (!key) {
        console.log('Error: API key not found');
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            const names = data.models.map(m => m.name).join('\n');
            fs.writeFileSync('models.txt', names);
            console.log('Saved model names to models.txt');
        }
        else {
            console.log('No models found or error:', data);
        }
    } catch (e) {
        console.error(e);
    }
}

listModels();
