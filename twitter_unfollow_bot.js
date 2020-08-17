var Twitter = require('twit');
var config = require('./config.js');
const request = require('request')

var T = new Twitter(config);

request('https://api.twitter.com/1.1/followers/ids.json?cursor=-1&screen_name=trevorthegnar&count=5000', { json: true }, (err, res, body) => {
    if (err) { return console.log(err); }
    console.log(res.body);
});