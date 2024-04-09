const request = require("request");
const cheerio = require('cheerio');
const express = require('express');

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

// Web Scraping Logic
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
    $('.topic').each((index, element) => {
      const topic = $(element);

      // Extracting Category Link and Category Text
      const categoryLink = topic.find('.topic_details a:nth-child(1)').attr('href');
      const categoryText = topic.find('.topic_details a:nth-child(1)').text();

      // Extracting Post Link and Post Title
      const postLink = topic.find('.topic_details a:nth-child(2)').attr('href');
      const postTitle = topic.find('.topic_details a:nth-child(2)').text();

      // Extracting Poster
      const poster = topic.find('.bbc_img:nth-child(2)').attr('src');

      // Extracting GDToT Links
      const gdTotLinks = [];
      topic.find('.bbc_link').each((index, element) => {
        gdTotLinks.push({
          link: $(element).attr('href'),
          text: $(element).text()
        });
      });

      // Printing variables for the current topic
      console.log('Topic:', index + 1);
      console.log('Category Link:', categoryLink);
      console.log('Category Text:', categoryText);
      console.log('Post Link:', postLink);
      console.log('Post Title:', postTitle);
      console.log('Poster:', poster);
      console.log('GDToT Links:');
      gdTotLinks.forEach(link => {
        console.log('Link:', link.link);
        console.log('Text:', link.text);
      });
      console.log('--------------------------------------------------');
    });
  } else {
    console.error('Failed to fetch data from the URL');
  }
});

//Koyeb Helth Check. Don't Remove This
app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})
//End Koyeb Helth Chech 3rd Code
