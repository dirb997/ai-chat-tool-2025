import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import express from 'express';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions'; 

// Serve static files from the 'src' folder for JS and CSS
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Request body:', req.body);
    next();
});

// Serve the index.html file when the root route is accessed
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        console.log('Sending request to DeepSeek API...');
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        const responseText = await response.text();
        console.log('Raw API Response:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Error parsing response:', parseError);
            console.error('Response text:', responseText);
            
            if (responseText.includes('Authentication failed')) {
                return res.status(401).json({ 
                    error: "Authentication failed. Please check your API key." 
                });
            }
            
            return res.status(500).json({ 
                error: "Invalid response from DeepSeek API" 
            });
        }

        if (!response.ok) {
            console.error('API Error:', data);
            return res.status(response.status).json({ 
                error: data.error?.message || 'API request failed' 
            });
        }

        res.json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error('Error in /chat route:', error);
        res.status(500).json({ 
            error: error.message || "Internal Server Error"
        });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
