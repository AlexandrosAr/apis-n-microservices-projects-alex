// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
require('dotenv').config();
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const shortid = require('shortid');
const validUrl = require('valid-url');

/* Initialize MongoDB create schema and Model */
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const UrlSchema = mongoose.Schema({
	original_url: { type: String },
	short_url: { type: String }
});

const Url = mongoose.model('Url', UrlSchema);

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

/* Mount body parser */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
	res.sendFile(__dirname + '/views/index.html');
});

app.get("/timestamp", function (req, res) {
	res.sendFile(__dirname + '/views/timestamp.html');
});

app.get("/headerparser", function (req, res) {
	res.sendFile(__dirname + '/views/headerparser.html');
});

app.get("/url-shortener", function (req, res) {
	res.sendFile(__dirname + '/views/urlshortener.html');
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
	res.json({ greeting: 'hello API' });
});

/* fcc Timestamp */
app.get("/api/timestamp", (req, res) => {
	let today = new Date()

	if (today != 'Invalid Date') {
		res.json({
			unix: today.getTime(),
			utc: today.toUTCString()
		});
	} else if (today == 'Invalid Date') {
		res.json({
			error: 'Invalid Date'
		});
	}

});

app.get("/api/timestamp/:date_string", (req, res) => {
	console.log(typeof req.params.date_string)
	let date_string = req.params.date_string;
	let isNum = /^\d+$/.test(date_string);

	if (isNum) {
		date_string = parseInt(req.params.date_string);
	} else {
		date_string = req.params.date_string;
	}
	let date = new Date(date_string);
	let timestamp = date.getTime();
	let utcTime = date.toUTCString();

	if (utcTime == 'Invalid Date') {
		res.json({
			error: 'Invalid Date'
		});
	} else {
		res.json({
			unix: timestamp,
			utc: utcTime
		});
	}
});

/* fcc Header parser */
app.get("/api/whoami", (req, res) => {
	res.json({
		ipaddress: req.ip,
		language: req.headers['accept-language'],
		software: req.headers['user-agent']
	});
});

/* fcc url shortner */

app.post("/api/shorturl/new", async (req, res) => {
	console.log("REQUEST " + req.body.url);
	if (!validUrl.isWebUri(req.body.url)) {
		res.json({
			error: 'invalid url'
		});
		return;
	}

	try {
		let originalUrl = req.body.url;
		let findOne = await Url.findOne({ original_url: originalUrl });

		if (findOne) {
			res.json({
				original_url: findOne.original_url,
				short_url: findOne.short_url
			})
		} else {
			let shortUrl = shortid.generate();
			let newUrl = new Url({
				original_url: originalUrl,
				short_url: shortUrl
			});

			newUrl.save((err) => {
				if (err) {
					console.error(err);
					return;
				}
				console.log('Save successfull');
				res.json({
					original_url: newUrl.original_url,
					short_url: newUrl.short_url
				});
			});
		}
	} catch (err) {
		console.log(err);
	}

});

app.get("/api/shorturl/:short_url", (req, res) => {
	try {
		let short_url = req.params.short_url;
		Url.findOne({ short_url: short_url }, (err, record) => {
			if (err) {
				console.error(err);
				return;
			}
			console.log(record);
			res.redirect(record.original_url)
		});
	} catch(err) {
		console.log(err);
	}
	

});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
	console.log('Your app is listening on port ' + listener.address().port);
});
