const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// === BOT TOKEN ===
const TOKEN = process.env.BOT_TOKEN;  // Get from environment variable (important for Railway)

// === Create bot instance ===
const bot = new TelegramBot(TOKEN, { polling: false });

// === Setup express server ===
const app = express();
app.use(bodyParser.json());

// === Handle incoming updates ===
app.post('/bot', async (req, res) => {
    const update = req.body;

    if (update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const text = update.message.text;

        if (text.startsWith("/ask ")) {
            const userQuestion = text.replace("/ask", "").trim();

            if (userQuestion.length > 0) {
                // Show typing
                await bot.sendChatAction(chatId, 'typing');
                await bot.sendMessage(chatId, "✍️ Thinking... Please wait...");

                try {
                    const response = await axios.post("https://api.aimlapi.com/api/v1/chat/completions", {
                        model: "gpt-3.5-turbo",
                        messages: [{ role: "user", content: userQuestion }],
                        temperature: 0.7,
                        response_format: "text"
                    }, {
                        headers: {
                            Authorization: "Bearer a1380587a746ce302cb74e0d",
                            "Content-Type": "application/json"
                        }
                    });

                    if (response.data && response.data.choices) {
                        const aiReply = response.data.choices[0].message.content.trim() || "⚠️ AI returned no response.";
                        await bot.sendMessage(chatId, "🧠 " + aiReply);
                    } else {
                        await bot.sendMessage(chatId, "❌ Error: Unexpected AI response format.");
                    }
                } catch (error) {
                    console.error(error);
                    await bot.sendMessage(chatId, "❌ Request Error: " + error.message);
                }
            } else {
                await bot.sendMessage(chatId, "❌ Please ask a valid question after /ask.");
            }
        }
    }

    res.sendStatus(200);
});

// === Start server ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    
    // Set webhook automatically
    const WEBHOOK_URL = `${process.env.WEBHOOK_URL}/bot`; // Example: https://your-railway-app.up.railway.app/bot
    await bot.setWebHook(WEBHOOK_URL);
    console.log("Webhook set to:", WEBHOOK_URL);
});

