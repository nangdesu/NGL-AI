require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { OpenAI } = require("openai");
const app = express();
const PORT = 3000;

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Predefined roles and guidance
const roles = {
    math: "You are a math tutor. Help the user with math-related queries.",
    science: "You are a science tutor. Focus on topics like biology, physics, and chemistry.",
    english: "You are an English tutor. Assist with grammar, writing, and language usage."
};

const chatHistory = {}; // To maintain chat history for each role

// Endpoint to fetch chat history
app.get('/api/history', (req, res) => {
    const { role } = req.query;
    res.json(chatHistory[role] || []);
});

// Endpoint to handle OpenAI API calls
app.post('/api/chat', async (req, res) => {
    const { message, role } = req.body;

    if (!message || !role) {
        return res.status(400).json({ error: 'Message and role are required.' });
    }

    if (!chatHistory[role]) {
        chatHistory[role] = []; // Initialize history for the role
    }

    const messages = chatHistory[role].map(entry => ({
        role: entry.role.toLowerCase(),
        content: entry.content
    })).concat([{ role: 'user', content: message }]);

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: messages,
            max_tokens: 150,
            temperature: 0.7
        });

        const assistantMessage = response.choices[0]?.message.content.trim() || 'I am unable to answer that.';
        chatHistory[role].push({ role: 'User', content: message });
        chatHistory[role].push({ role: 'Assistant', content: assistantMessage });

        res.json({ response: assistantMessage });
    } catch (error) {
        console.error('OpenAI API Error:', error);
        res.status(500).json({ error: 'Failed to process request.' });
    }
});

// Clear chat history for a role
app.post('/api/clear', (req, res) => {
    const { role } = req.body;
    if (role && chatHistory[role]) {
        chatHistory[role] = [];
    }
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
