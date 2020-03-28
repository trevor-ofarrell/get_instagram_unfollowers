const express = require('express')
const puppeteer = require('puppeteer-extra')
const nunjucks = require('nunjucks')
var bodyParser = require('body-parser')
const path = require('path')
const ig_bot = require("./ig_unfollow_bot.js")

const app = express()
app.use(express.static('static'))
app.use(bodyParser.urlencoded())
nunjucks.configure('static')
nunjucks.configure(path.join(__dirname, '/static'), {
    express: app,
    autoescape: true
})
app.listen(3000)
app.get('/', (req, res) => {})
app.post('/', (req, res) => { ig_bot.find_unfollowing(req.body.username, req.body.password, res) })