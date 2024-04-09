const request = require("request");
const express = require('express');
const app = express()
const port = process.env.PORT || 3000
const url = "https://google.com";

request(url, cb);
function cb(err, response, html) {
  if (err) {
    console.log(err);
  } else {
    console.log(html);
  }
}

app.get('/', (req, res) => {
  res.json({
    message: 'Hello, world!',
  })
})
console.log("Before");
app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})
console.log("after");
