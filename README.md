# webshot

A microservice for taking screenshots of websites.

It can serve as a image proxy and a website screenshoter.

There is only one endpoint which you need to know, which is /api?url=[URL], where [URL] is the url you want to screenshot.

By default, there is a rate limit of 10 requests per minute per IP address.

Demo URL: screenshot.aboutdavid.me