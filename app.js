const puppeteer = require('puppeteer');
var express = require('express')
var validator = require('validator');
var slugify = require('slugify')
var download = require('image-downloader')
var fs = require('fs')
var CronJob = require('cron').CronJob;
var rateLimit = require("express-rate-limit");

var app = express()
// 10 request per second
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10
});
app.use("/api", limiter);

app.set('trust proxy', 1);

app.get('/', function (req, res) {
  res.set("content-type", "text/plain")
  res.send(`This API allows you to fetch Webpages and it's html is rendered into an image (png)

Usage:

/               Shows this help page
/api?url=<URL>  Generates a screenshot of a website, where <URL> is the url of the website you want to fetch

Notes: 

- This has a rate limit of 10 requests per minute
- Images will not be rendered as html, but will return the image

Demo:           screenshot.aboutdavid.me
Source Code:    github.com/aboutDavid/PuppeteerScreenshot
  `)
})

app.get('/api', async function (req, res) {
  var url = req.query.url
  if (!url) {
    res.send("Please provide a URL!").status(400)
    return
  } else if (!validator.isURL(url)) {
    res.send("Please provide a valid URL!").status(400)
    return
  }
  // If it is a image
  if (Array.isArray(url.match(/\.(gif|jpe?g|tiff?|png|webp|bmp|ico)$/i))) {
    console.log(`${url} is an image!`)
    const options = {
      url: url,
      dest: __dirname + "/images"
    }
    download.image(options)
      .then(({ filename }) => {
        res.sendFile(filename)
      })
      .catch((err) => console.error(err))
    return;
  }
  const browser = await puppeteer.launch({
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.screenshot({ path: `images/${slugify(url)}.png`, fullPage: true });

  await browser.close();
  res.sendFile(__dirname + `/images/${slugify(url)}.png`)
})
app.listen(3000, "0.0.0.0")