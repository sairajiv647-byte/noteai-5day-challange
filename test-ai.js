const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testKey() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    console.log('Testing API Key:', apiKey ? 'Present' : 'Missing');
    if (!apiKey) return;

    console.log('Length:', apiKey.length);
    console.log('Starts with:', apiKey.substring(0, 5));

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Hi');
        const response = await result.response;
        console.log('Success! Response:', response.text());
    } catch (error) {
        console.error('Error during test:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Details:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testKey();
