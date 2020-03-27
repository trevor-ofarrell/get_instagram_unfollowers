const express = require('express');
const puppeteer = require('puppeteer-extra');
const nunjucks = require('nunjucks');
var bodyParser = require('body-parser');
const path = require('path')

const app = express();

// set up static files
app.use(express.static('static'));
app.use(bodyParser.urlencoded())
nunjucks.configure('static')

nunjucks.configure(path.join(__dirname, '/static'), {
    express: app,
    autoescape: true
});

// set port number to listen with
app.listen(3000);

app.get('/', (req, res) => {
    res.sendFile('index.html')
})
app.put('/', (req, res) => res.send('Received a PUT HTTP method'));

app.delete('/', (req, res) => res.send('Received a DELETE HTTP method'));

app.post('/', (req, res) => {
    async function scrape(email, password) {
        try {
          const browser = await puppeteer.launch({
            executablePath: '/usr/bin/google-chrome-stable',
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-infobars',
              '--ignore-certifcate-errors',
              '--ignore-certifcate-errors-spki-list',
              '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
            ],
            headless: false,
        });
    
        const page = await browser.newPage()
        await page.goto('https://www.instagram.com/')
        await page.setViewport({
          width: 1200,
          height: 800
        });
        await page.waitForSelector(
          '#react-root > section > main > article > div.rgFsT > div:nth-child(1) > div > form > div:nth-child(2) > div > label > input',
          { timeout: 5000 }
        )
        await page.type('#react-root > section > main > article > div.rgFsT > div:nth-child(1) > div > form > div:nth-child(2) > div > label > input', email)
        await page.waitForSelector('div.-MzZI:nth-child(3) > div:nth-child(1) > label:nth-child(1) > input:nth-child(2)', { timeout: 9000 })
        await page.type('div.-MzZI:nth-child(3) > div:nth-child(1) > label:nth-child(1) > input:nth-child(2)', password)
        try {
          await page.waitForSelector('.L3NKy > div:nth-child(1)', {timeout: 4000})
        } catch { }
        await page.click('.L3NKy > div:nth-child(1)')
        await page.waitForSelector('#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.oJZym > a > div > div > img',  { timeout: 9000 })
        await page.goto('https://www.instagram.com/trevorthegnar/')
        await page.click('#react-root > section > main > div > header > section > ul > li:nth-child(2) > a')
        try {
          await page.waitForSelector('body > div.RnEpo.Yx5HN > div > div.isgrP > ul > div > li',  { timeout: 6000 })
        } catch {
            await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
            await page.click('#react-root > section > main > div > header > section > ul > li:nth-child(2) > a')
            await page.waitForSelector('body > div.RnEpo.Yx5HN > div > div.isgrP > ul > div > li',  { timeout: 9000 })
          }

        const extractFollowers = () => {
          let followers = [];
          let elements = document.getElementsByClassName('FPmhX notranslate _0imsa ');
          for (let element of elements)
              followers.push(element.textContent);
          return followers;
        }
    
        async function scrapeInfiniteScrollItems(
          page,
          extractFollowers,
          followersTargetCount
        ) {
          let items = [];
          let x;
          try {
            while (items.length < followersTargetCount) {
              items = await page.evaluate(extractFollowers);
              childToSelect = items.length;
              await page.hover(`div.isgrP > ul > div > li:nth-child(${childToSelect})`);
            }
          } catch(e) { return (e) }
          items.length = followersTargetCount;
          return items;
        }
        follower_amount = await page.$eval(
          '#react-root > section > main > div > header > section > ul > li:nth-child(2) > a > span', (elem) => {
          return elem.innerHTML
        })
        const findFollowers = await scrapeInfiniteScrollItems(page, extractFollowers, Number(follower_amount) - 1)
        //console.log(findFollowers, follower_amount);
    
        await page.waitForSelector('body > div.RnEpo.Yx5HN > div > div:nth-child(1) > div > div:nth-child(3) > button > svg')
        await page.click('body > div.RnEpo.Yx5HN > div > div:nth-child(1) > div > div:nth-child(3) > button > svg')
        await page.click('#react-root > section > main > div > header > section > ul > li:nth-child(3) > a')
        await page.waitForSelector('body > div.RnEpo.Yx5HN > div > div.isgrP > ul > div > li')
        
         
        const extractFollowing = () => {
          let followers = [];
          let elements = document.getElementsByClassName('FPmhX notranslate _0imsa ');
          for (let element of elements)
              followers.push(element.textContent);
          return followers;
        }

        async function scrapeInfiniteScrollItems2(
          page,
          extractFollowing,
          followersTargetCount
        ) {
          let items = [];
          let x;
          try {
            while (items.length < followersTargetCount) {
              items = await page.evaluate(extractFollowing);
              childToSelect = items.length;
              await page.hover(`div.isgrP > ul > div > li:nth-child(${childToSelect})`);
            }
          } catch(e) { }
          items.length = followersTargetCount;
          return items;
        }
        following_amount = await page.$eval(
          '#react-root > section > main > div > header > section > ul > li:nth-child(3) > a > span', (elem) => {
          return elem.innerHTML
        })
        const findFollowers2 = await scrapeInfiniteScrollItems2(page, extractFollowing, Number(following_amount) - 1)
        console.log("made it")
        await page.waitForSelector('body > div.RnEpo.Yx5HN > div > div:nth-child(1) > div > div:nth-child(3) > button > svg')
        await page.click('body > div.RnEpo.Yx5HN > div > div:nth-child(1) > div > div:nth-child(3) > button > svg')
    
        const unfollowers = []
        for (i = 0; i <= findFollowers2.length; i++) {
          if (!findFollowers.includes(findFollowers2[i])) {
            unfollowers.push(findFollowers2[i])
          }
        }
        console.log('Unfollowers:\n', unfollowers)

        /*user_profile = []
        for (let i = 0; i <= unfollowers.length; i++) {
          await page.goto('https://instagram.com/' + String(unfollowers[i]))
          uf_pic = await page.$eval('#react-root > section > main > div > header > div > div > span > img', (elem) => {
            return elem
          })
          user_profile.push((unfollowers[i], uf_pic))
        }
        console.log(user_profile)*/
        browser.close()
        return(unfollowers)
    
    } catch (error) {
        console.log(error)
        }
    }

    async function find_unfollowing() {
      const ret = await scrape(req.body.username, req.body.password)
      return(res.render('index2.html', {unfollows: ret, amount: String(ret.length)}))
    }

    find_unfollowing()
})