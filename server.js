// SPECIFY YOUR API KEY GET FROM https://openweathermap.org/api
//const apiKey = '56f0615a9269c2e635656856e4e66dbe';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

app.set('port', (process.env.PORT || 3000));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.render('index', {events: null, weather: null, error: null});
})

app.post('/', function (req, res) {
  //old1
  //let url = `http://api.openweathermap.org/data/2.5/weather?q=${req.body.city}&units=imperial&appid=${apiKey}`
  let url = `http://weatherserviceimpl-enem.de-c1.cloudhub.io/weather?city=${req.body.city}`;
  
  let sfquery=`select name, name__c, duration__c, event_date__c, description__c from salesforce.social_event__c where city__c='${req.body.city.toLowerCase()}'`;
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
        // CALL WEATHER SERVICE
        request(url, function (err, response, body) {
            if (err) throw err;
            let weather = JSON.parse(body);
            if(weather != undefined){
                //weather.main....
                //let tempCels=Math.round((parseInt(weather.main.temp)-32)*0.5556);
                let tempCels=Math.round(parseInt(weather.temp));
                let weatherText = `${weather.weather} with ${tempCels} degrees of temperature and ${weather.humidity}% of humidity in ${weather.city} !`;
                //COMPOSE RESPONSE
                res.render('index', {events: dbres, weather: weatherText, error: null});
            }        
        });    
    });
  }catch (err){
    console.log(err);
  }finally{
    console.log('End GetEvent Post!!');
  }
});


app.get("/api/events/:city", function (req, res) {
  let city = req.params.city;
  let sfquery=`select name, name__c, duration__c, event_date__c, description__c from salesforce.social_event__c where city__c='${city.toLowerCase()}'`;
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
    let events=[];
    for ( var event in dbres.rows) {
      console.log(event);
      events.push({
          event_date: dbres.rows[event].event_date__c,
          name: dbres.rows[event].name__c,
          duration: dbres.rows[event].duration__c,
          description: dbres.rows[event].description__c
       });
    }
    res.set('Content-Type', 'application/json');
    res.status(200).send(events);
    });
  }catch (err){
    console.log(err);
  }finally{
    console.log('End Events API!!');
  }

 
});




app.listen(app.get('port'), function () {
  console.log('Example app listening on port '+ app.get('port'))
});
