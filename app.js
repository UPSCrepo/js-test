const fs = require('fs');
const request = require("request");
const cheerio = require('cheerio');
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
//Chcek Health of Koyeb Port. Don't Remove this
const app = express()
const port = process.env.PORT || 3000
//End Koyeb Helth Chech 1st Code
const url = "https://google.com";

// Telegram Bot Token and Chat ID
const telegramToken = '6628553285:AAFc8rpbAmivkVH_sYNspvHWKckGeu28xro';
const chatId = '-1001995193470'; // Replace with your Telegram chat ID
const bot = new TelegramBot(telegramToken);

// Forum URL and Cookies
const forumUrl = 'https://ww1.sharespark.cfd/index.php?action=profile;area=showposts;u=2';
const cookies = {
  'PHPSESSID': 'c4u9qhshvlch1vebihrre9grq2',
  'SMFCookie72': 'a%3A4%3A%7Bi%3A0%3Bs%3A5%3A%2232471%22%3Bi%3A1%3Bs%3A40%3A%224e3d4ef7e38e43fef6911fa3b1ef7f41d6910318%22%3Bi%3A2%3Bi%3A1895564336%3Bi%3A3%3Bi%3A0%3B%7D'
};

// File to keep track of processed post URLs
const logFile = 'log-send.txt';

// Define the interval for checking new posts (in milliseconds)
const CHECK_INTERVAL = 300; // Check every hour

// Send to Telegram
function sendToTelegram(category, postUrl, postTitle, bbcLinks, secondImgUrl) {
    let baseMessage = `Category: ${category}\nTitle: [${postTitle}](${postUrl})\n\nGDToT Links:\n\n`;

    bbcLinks.forEach(bbcLink => {
        let linkText = bbcLink.text().trim() || "No Text Available";
        let linkHref = bbcLink.attr('href');
        baseMessage += `[${linkText}](${linkHref})\n\n`;
    });

    // Add the URL of the second "bbc_img" class image to the message
    if (secondImgUrl) {
        baseMessage += `\n`;
    }

    // Split the message into smaller parts to fit within the character limit
    const parts = baseMessage.match(/.{1,4096}/g);

    // Send each part as a separate message
    parts.forEach((part, index) => {
        console.log(`Sending Part ${index + 1}:\n${part}`); // Print the part for debugging
        bot.sendMessage(chatId, part, { parse_mode: 'Markdown' }).catch(err => {
            console.error("Telegram message sending failed. Skipping this part.", err);
        });

        // Introduce a wait time after sending each message part
        setTimeout(() => {}, 5000); // Adjust the delay time as needed
    });
}

// Extract Post Data
function extractSecondImageUrl(post) {
    const images = post.find('.bbc_img');
    if (images.length >= 2) {
        return images.eq(1).attr('src');
    }
    return null;
}

function extractBbcLinks(post) {
    return post.find('.bbc_link');
}

function scrapeAndSend() {
    let processedUrls = [];
    try {
        processedUrls = fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);
    } catch (error) {
        console.error("Error reading log file:", error);
    }

    // Make the request
    request({ url: forumUrl, headers: { 'Cookie': Object.keys(cookies).map(key => `${key}=${cookies[key]}`).join('; ') } }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const $ = cheerio.load(body);
            const posts = $('.topic');

            posts.each((index, post) => {
                const details = $(post).find('.topic_details');
                const category = details.find('a').eq(0).text().trim();
                const postUrl = details.find('a').eq(1).attr('href');
                const postTitle = details.find('a').eq(1).text().trim();

                // Skip already processed posts
                if (processedUrls.includes(postUrl)) {
                    return;
                }

                const bbcLinks = extractBbcLinks($(post));
                const secondImgUrl = extractSecondImageUrl($(post));

                // Send data to Telegram
                sendToTelegram(category, postUrl, postTitle, bbcLinks, secondImgUrl);

                // Log the processed URL
                fs.appendFile(logFile, postUrl + '\n', (err) => {
                    if (err) console.error("Error writing to log file:", err);
                });

                console.log(`Category: ${category}`);
                console.log(`Post Title: ${postTitle}`);
                console.log(`Post URL: ${postUrl}`);
                console.log(`BBC Links: ${bbcLinks}`);
                console.log(`Second Image URL: ${secondImgUrl}`);
                console.log("\n");
            });
        } else {
            console.error("Request error:", error);
        }
    });
}

function main() {
    setInterval(() => {
        try {
            scrapeAndSend();
            console.log("Waiting for the next check...");
        } catch (error) {
            console.error("An error occurred:", error);
            console.log("Retrying in 5 minutes...");
        }
    }, CHECK_INTERVAL);
}

main();


//Koyeb Helth Check. Don't Remove This
app.get('/', (req, res) => {
  res.json({
    message: 'Hello, world!',
  })
})
//End Koyeb Helth Chech 2nd Code
console.log("Before");

//Koyeb Helth Check. Don't Remove This
app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})
//End Koyeb Helth Chech 3rd Code

console.log("after");
