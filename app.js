const request = require("request");
const cheerio = require('cheerio');
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

//Chcek Health of Koyeb Port. Don't Remove this
const app = express()
const port = process.env.PORT || 3000
//End Koyeb Helth Chech 1st Code

//Koyeb Helth Check. Don't Remove This
app.get('/', (req, res) => {
  res.json({
    message: 'Hello, world!',
  })
})
//End Koyeb Helth Chech 2nd Code

// Initialize Telegram bot
const botToken = '6628553285:AAFc8rpbAmivkVH_sYNspvHWKckGeu28xro'; // Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your bot token
const chatId = '-1001995193470'; // Replace 'YOUR_TELEGRAM_CHANNEL_ID' with your channel ID
const bot = new TelegramBot(botToken);

// Array to store processed postLinks
let processedPostLinks = [];

// Function to split message into parts if it exceeds 4096 characters
function splitMessage(message) {
  const maxCharacters = 4096;
  const messageParts = [];

  while (message.length > maxCharacters) {
    const part = message.substring(0, maxCharacters);
    messageParts.push(part);
    message = message.substring(maxCharacters);
  }

  // Push the remaining part or the whole message if it's shorter than 4096 characters
  messageParts.push(message);

  return messageParts;
}

// Function to send message parts with delay between each part
function sendParts(parts, delay = 0) {
  parts.forEach((part, index) => {
    setTimeout(() => {
      bot.sendMessage(chatId, part.trim(), { parse_mode: 'HTML' });
    }, delay + index * 1000); // Delay of 1 second between sending each part
  });
}

// Function to scrape and send data to Telegram
function scrapeAndSendData() {
  const url = 'https://ww1.sharespark.cfd/index.php?action=profile;area=showposts;u=2'; // Replace 'YOUR_URL_HERE' with the URL you want to scrape
  const cookies = {
    'PHPSESSID': 'c4u9qhshvlch1vebihrre9grq2',
    'SMFCookie72': 'a%3A4%3A%7Bi%3A0%3Bs%3A5%3A%2232471%22%3Bi%3A1%3Bs%3A40%3A%224e3d4ef7e38e43fef6911fa3b1ef7f41d6910318%22%3Bi%3A2%3Bi%3A1895564336%3Bi%3A3%3Bi%3A0%3B%7D'
  };

  // Making the HTTP request with cookies
  const requestOptions = {
    url: url,
    headers: {
      'Cookie': Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join('; ')
    }
  };

  request(requestOptions, (error, response, html) => {
    if (!error && response.statusCode == 200) {
      // Parsing the HTML with cheerio
      const $ = cheerio.load(html);
      
      // Extracting data for each "topic"
      let newTopicsFound = false;
      $('.topic').each((index, element) => {
        const topic = $(element);

        // Extracting Post Link
        const postLink = topic.find('.topic_details a:nth-child(2)').attr('href');

        // Check if postLink is already processed
        if (!processedPostLinks.includes(postLink)) {
          // Extracting Category Link, Category Text, Post Title, Poster, and GDToT Links
          const categoryLink = topic.find('.topic_details a:nth-child(1)').attr('href');
          const categoryText = topic.find('.topic_details a:nth-child(1)').text();
          const postTitle = topic.find('.topic_details a:nth-child(2)').text();
          const poster = topic.find('.bbc_img').eq(1).attr('src');
          const gdTotLinks = [];
          topic.find('.bbc_link').each((index, element) => {
            gdTotLinks.push({
              text: $(element).text(),
              link: $(element).attr('href')
            });
          });

          // Construct the message
          let message = `
          ${postTitle}\n\n<a href="${poster}">Poster</a> | ${categoryText}\n\n<b>GDToT Links:</b>\n\n${gdTotLinks.map(link =>`${link.text.trim()}\n${link.link}`).join('\n\n')}
          `;

          // Split message into parts if it exceeds 4096 characters
          const messageParts = splitMessage(message);

          // Send message parts with delay between each part
          sendParts(messageParts, index * 10000);

          // Mark postLink as processed
          processedPostLinks.push(postLink);

          newTopicsFound = true;
        }
      });

      if (!newTopicsFound) {
        console.log('No New Topics');
      }

      // Schedule the next scrape after sending messages to Telegram
      setTimeout(scrapeAndSendData, $('.topic').length * 10000);
    } else {
      console.error('Failed to fetch data from the URL');
      
      // Schedule the next scrape on error
      setTimeout(scrapeAndSendData, 10000);
    }
  });
}

// Start scraping and sending data to Telegram
scrapeAndSendData();

//Koyeb Helth Check. Don't Remove This
app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})
//End Koyeb Helth Chech 3rd Code
