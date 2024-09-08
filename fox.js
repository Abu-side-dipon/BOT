const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Your bot token
const token = '7359515412:AAGuhVhhg_OesMYJezUgE9TROj0wqF8f8FE';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Base URL for saving user data and user JSON files
const baseUrl = 'https://csftasin.co/Fox/save_user_data.php';
const userJsonUrl = 'https://csftasin.co/Fox/Users/';

// Helper function to generate a 12-character random unique ID
const generateUniqueId = () => {
    return Math.random().toString(36).substr(2, 12);
};

// Helper function to save user data to the server
const saveUserData = async (userId, data) => {
    try {
        await axios.post(baseUrl, data);
        console.log(`User data for ${userId} saved successfully.`);
    } catch (error) {
        console.error(`Error saving user data for ${userId}:`, error.response ? error.response.data : error.message);
    }
};

// Function to check if a user has already joined the bot
const hasUserJoinedBefore = async (userId) => {
    try {
        const response = await axios.get(`${userJsonUrl}${userId}.json`);
        return !!response.data; // Returns true if user data exists
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return false; // User has not joined before
        } else {
            console.error(`Error checking if user ${userId} has joined before:`, error.response ? error.response.data : error.message);
            throw error;
        }
    }
};

// Function to handle new user start
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const firstName = msg.from.first_name;

    let uniqueId;
    let userData;

    try {
        // Check if the user JSON file exists
        const alreadyJoined = await hasUserJoinedBefore(userId);
        if (alreadyJoined) {
            const response = await axios.get(`${userJsonUrl}${userId}.json`);
            userData = response.data;
            uniqueId = userData.unique_id;
        } else {
            // User data not found; create new unique ID and save user data
            console.log(`User data not found for ${userId}. Creating new unique ID.`);
            uniqueId = generateUniqueId();
            userData = {
                userId: userId,
                unique_id: uniqueId,
            };
            await saveUserData(userId, userData);
        }
    } catch (error) {
        console.error(`Error retrieving user data for ${userId}:`, error.response ? error.response.data : error.message);
        return;
    }

    // Form the web app URL without URL encoding
    const webAppUrl = `https://csftasin.co/Fox/index.php?TG_ID=${userId}&UNIQ=${uniqueId}`;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Open Web App',
                        web_app: { url: webAppUrl }
                    },
                    {
                        text: 'Join Community',
                        url: 'https://t.me/Real_Fox_Community'
                    }
                ]
            ]
        }
    };

    // Send the welcome message with the user's name and image
    bot.sendPhoto(chatId, 'https://csftasin.co/Fox/icons/fox-pic.png', {
        caption: `Welcome, ${firstName}! 🦊\n\nWelcome to Fox Mining! Earn coins by completing tasks. Click below to get started!`,
        ...options
    });
});

console.log('Bot is running...');
