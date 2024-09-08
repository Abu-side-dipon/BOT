const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// Your bot token from @BotFather
const token = '6386409374:AAFOxmRrX9DD-IJ2IPNaxmrRvmWrrisV-MU';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Path to the file where user IDs are stored
const idsFilePath = path.join(__dirname, 'user_ids.txt');

// Helper function to generate a 12-character random unique ID
const generateUniqueId = () => {
    return Math.random().toString(36).substr(2, 12);
};

// Helper function to read IDs from file
const getIds = () => {
    if (!fs.existsSync(idsFilePath)) {
        fs.writeFileSync(idsFilePath, '');
    }
    return fs.readFileSync(idsFilePath, 'utf-8').split('\n').filter(line => line.trim());
};

// Helper function to store new ID
const storeId = (userId, uniqueId) => {
    const ids = getIds();
    const entry = `${userId}:${uniqueId}`;
    if (!ids.some(line => line.startsWith(userId + ':'))) {
        fs.appendFileSync(idsFilePath, entry + '\n');
    }
};

// Listen for any kind of message
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    let uniqueId;
    const ids = getIds();
    const existingEntry = ids.find(line => line.startsWith(userId + ':'));
    if (existingEntry) {
        uniqueId = existingEntry.split(':')[1];
    } else {
        uniqueId = generateUniqueId();
        storeId(userId, uniqueId);
    }

    const webAppUrl = `https://csftasin.co/Fox/index.php?TG_ID=${userId}&UNIQ=${uniqueId}`;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Open Web App',
                        web_app: { url: webAppUrl }
                    }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, 'Click the button below to open the web app:', options);
});

console.log('Bot is running...');
