const puppeteer = require('puppeteer-extra');

async function scrape(email, password) {
  try {
    const browser = await puppeteer.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
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
  await page.waitForSelector(
    '#react-root > section > main > article > div.rgFsT > div:nth-child(1) > div > form > div:nth-child(2) > div > label > input',
    { timeout: 5000 }
  )
  await page.type('#react-root > section > main > article > div.rgFsT > div:nth-child(1) > div > form > div:nth-child(2) > div > label > input', email)
  await page.waitForSelector('div.-MzZI:nth-child(3) > div:nth-child(1) > label:nth-child(1) > input:nth-child(2)', { timeout: 9000 })
  await page.type('div.-MzZI:nth-child(3) > div:nth-child(1) > label:nth-child(1) > input:nth-child(2)', password)
  console.log('logged in')
  try {
    await page.waitForSelector('.L3NKy > div:nth-child(1)', {timeout: 4000})
  } catch { }
  await page.click('.L3NKy > div:nth-child(1)')
  await page.waitForSelector('#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.oJZym > a > div > div > img',  { timeout: 9000 })
  await page.goto('https://www.instagram.com/trevorthegnar/')
  console.log('at profile')
  await page.click('#react-root > section > main > div > header > section > ul > li:nth-child(2) > a')
  try {
    await page.waitForSelector('body > div.RnEpo.Yx5HN > div > div.isgrP > ul > div > li',  { timeout: 6000 })
  } catch {
      console.log('first failure')
      await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
      await page.click('#react-root > section > main > div > header > section > ul > li:nth-child(2) > a')
      await page.waitForSelector('body > div.RnEpo.Yx5HN > div > div.isgrP > ul > div > li',  { timeout: 9000 })
      console.log('made it')
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