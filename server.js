const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express()
app.set('port', (process.env.PORT || 3000));

const apiKey = '56f0615a9269c2e635656856e4e66dbe';

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.render('index', {weather: null, error: null});
})

app.post('/', function (req, res) {
  let city = req.body.city;
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`

  request(url, function (err, response, body) {
    if(err){
      res.render('index', {weather: null, error: 'Error, please try again'});
    } else {
      let weather = JSON.parse(body)
      if(weather.main == undefined){
        res.render('index', {weather: null, error: 'Error, please try again'});
      } else {
        let tempCels=Math.round((parseInt(weather.main.temp)-32)*0.5556);
        let weatherText = `It's ${tempCels} degrees in ${weather.name} with ${weather.main.humidity}% of humidity!`;
        res.render('index', {weather: weatherText, error: null});
      }
    }
  });
})

app.listen(app.get('port'), function () {
  console.log('Example app listening on port '+ app.get('port'))
})