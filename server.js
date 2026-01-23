/**
 * Mocamaker v1.0 - Server
 * Simple Express server that serves static files and proxies Claude API requests
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

/**
 * Proxy endpoint for Claude API
 * This avoids CORS issues when calling Anthropic API from browser
 */
app.post('/api/generate', async (req, res) => {
    const { apiKey, messages, system } = req.body;

    if (!apiKey) {
        return res.status(400).json({ error: 'API key is required' });
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 2048,
                system: system,
                messages: messages
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return res.status(response.status).json({
                error: `API error: ${response.status}`,
                details: errorData
            });
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({
            error: 'Failed to connect to Claude API',
            details: error.message
        });
    }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', version: '1.0.0' });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ███╗   ███╗ ██████╗  ██████╗ █████╗ ███╗   ███╗ █████╗  ║
║   ████╗ ████║██╔═══██╗██╔════╝██╔══██╗████╗ ████║██╔══██╗ ║
║   ██╔████╔██║██║   ██║██║     ███████║██╔████╔██║███████║ ║
║   ██║╚██╔╝██║██║   ██║██║     ██╔══██║██║╚██╔╝██║██╔══██║ ║
║   ██║ ╚═╝ ██║╚██████╔╝╚██████╗██║  ██║██║ ╚═╝ ██║██║  ██║ ║
║   ╚═╝     ╚═╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝ ║
║                                                           ║
║   Mockups conversacionales en 30 segundos                 ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║   Server running at: http://localhost:${PORT}                ║
║                                                           ║
║   Open your browser and navigate to the URL above         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
