const puppeteer = require('puppeteer-extra');

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
  })
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage()
  await page.goto('https://www.instagram.com/')
  await page.setViewport({
    width: 800,
    height: 500
  });
  // wait for the login page to load
  await page.waitForSelector(
    '#loginForm > div > div:nth-child(1) > div > label > input',
    { timeout: 5000 }
  )
  // enter login credentials 
  await page.type('#loginForm > div > div:nth-child(1) > div > label > input' , email)
  await page.type('#loginForm > div > div:nth-child(2) > div > label > input', password)
  console.log('logged in')

  try {
    await page.waitForSelector('.L3NKy > div:nth-child(1)', {timeout: 4000})
  } catch { }

  await page.click('.L3NKy > div:nth-child(1)')
  await page.waitForSelector('#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.oJZym > a > div > div > img',  { timeout: 9000 })
  await page.goto('https://www.instagram.com/trevorthegnar/')
  console.log('at profile')
  // open follower pop up
  await page.click('#react-root > section > main > div > header > section > ul > li:nth-child(2) > a')
  try {
    // wait for followers to load
    await page.waitForSelector('body > div.RnEpo.Yx5HN > div > div.isgrP > ul > div > li',  { timeout: 6000 })
  } catch {
      // on fail it retrys
      console.log('first failure')
      await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
      // open followers pop-up
      await page.click('#react-root > section > main > div > header > section > ul > li:nth-child(2) > a')
      // wait for followers to load
      await page.waitForSelector('body > div.RnEpo.Yx5HN > div > div > div.isgrP > ul > div > li',  { timeout: 9000 })
      console.log('made it')
    }

  // creates list of followers
  const extractFollowers = () => {
    let followers = [];
    let elements = document.getElementsByClassName('FPmhX notranslate _0imsa ');
    for (let element of elements)
        followers.push(element.textContent);
    return followers;
  }

  // scrolls through all followers/following and creates lists of them
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

  // wait for the close follower pop-up svg to load then click it
  await page.waitForSelector('body > div.RnEpo.Yx5HN > div > div > div:nth-child(1) > div > div:nth-child(3) > button > div > svg')
  await page.click('body > div.RnEpo.Yx5HN > div > div > div:nth-child(1) > div > div:nth-child(3) > button > div > svg')

  //open following pop-up and wait for the items to load
  await page.click('#react-root > section > main > div > header > section > ul > li:nth-child(3) > a')
  await page.waitForSelector('body > div.RnEpo.Yx5HN > div > div > div.isgrP > ul > div > li')

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
  await page.waitForSelector('body > div.RnEpo.Yx5HN > div > div > div:nth-child(1) > div > div:nth-child(3) > button')
  await page.click('body > div.RnEpo.Yx5HN > div > div > div:nth-child(1) > div > div:nth-child(3) > button')

  const unfollowers = []
  for (i = 0; i < findFollowers2.length; i++) {
    if (!findFollowers.includes(findFollowers2[i])) {
      unfollowers.push(findFollowers2[i])
    }
  }
  console.log('Unfollowers:\n', unfollowers)

  browser.close()
  return(unfollowers)

} catch (error) {
  console.log(error)
  }
}

async function find_unfollowing(username, password, res) {
  const ret = await scrape(username, password)
  return(res.render('index2.html', {unfollows: ret, amount: String(ret.length)}))
}

module.exports = {
  find_unfollowing
}