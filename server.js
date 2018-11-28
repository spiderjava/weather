const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();




app.set('port', (process.env.PORT || 3000));

const apiKey = '56f0615a9269c2e635656856e4e66dbe';

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')


app.get('/', function (req, res) {
  res.render('index', {events: null, weather: null, error: null});
})

app.post('/', function (req, res) {
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${req.body.city}&units=imperial&appid=${apiKey}`
  let sfquery=`select name, name__c from salesforce.social_event__c where city__c='${req.body.city.toLowerCase()}'`;
  let weatherText='';
  
  let { Client } = require('pg');
  let pgclient = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    });

  try{
    // CALL POSTGRES WITH SF HEROKU CONNECT
    pgclient.connect();
    console.log(sfquery);
    pgclient.query(sfquery, (err, dbres) => {
        console.log(dbres);
        //if (err) throw err;
        // CALL WEATHER SERVICE
        request(url, function (err, response, body) {
            if (err) throw err;
            let weather = JSON.parse(body);
            if(weather.main != undefined){
                let tempCels=Math.round((parseInt(weather.main.temp)-32)*0.5556);
                weatherText = `It's ${tempCels} degrees in ${weather.name} with ${weather.main.humidity}% of humidity!`;
                //COMPOSE RESPONSE
                res.render('index', {events: dbres, weather: weatherText, error: null});
            }        
        });    
    });
  }catch (err){
    console.log(err);
  }finally{
    //pgclient.end();
  }
});

app.listen(app.get('port'), function () {
  console.log('Example app listening on port '+ app.get('port'))
});
