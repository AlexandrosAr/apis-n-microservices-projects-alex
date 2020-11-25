// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get("/timestamp", function (req, res) {
  res.sendFile(__dirname + '/views/timestamp.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({ greeting: 'hello API' });
});

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



// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
