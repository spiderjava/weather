const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const { Client } = require('pg');
const pgclient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

app.set('port', (process.env.PORT || 3000));

const apiKey = '56f0615a9269c2e635656856e4e66dbe';

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')


app.get('/', function (req, res) {
  res.render('index', {events: null, weather: null, error: null});
})

app.post('/', function (req, res) {
  let city = req.body.city;
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`
  let weatherText='';

  // CALL POSTGRES WITH SF HEROKU CONNECT
  pgclient.connect();
  pgclient.query('select name, name__c from salesforce.social_event__c where city__c=\''+city+'\'', (err, res) => {
    if (err) throw err;
    // CALL WEATHER SERVICE
    request(url, function (err, response, body) {
        if(err){
              console.log('Error, please try again');
        } else {
            let weather = JSON.parse(body)
            if(weather.main == undefined){
                console.log('Error, please try again');
            } else {
                let tempCels=Math.round((parseInt(weather.main.temp)-32)*0.5556);
                weatherText = `It's ${tempCels} degrees in ${weather.name} with ${weather.main.humidity}% of humidity!`;
            }
        }
    pgclient.end();
    });
  });

  res.render('index', {events: res, weather: weatherText, error: null});
});

app.listen(app.get('port'), function () {
  console.log('Example app listening on port '+ app.get('port'))
});
