const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const xmlParser = require('express-xml-bodyparser');
const fetch = require('node-fetch-json');
const getPixels = require('get-pixels');
const rgbHex = require('rgb-hex');

// const db = require('./config/mongoConnection');
const index = require('./routes/index');
const graphRoute = require('./routes/graphDatabase');

const app = express();
const port = process.env.PORT || '3030';

app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(xmlParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api/graph/', graphRoute);

app.use((req, res) => {
  res.status(404).send({ url: `${req.originalUrl} not found` });
});

const server = app.listen(port, () => {});
console.log(`Connected on port ${port}`);
var lalala
const satan = async () => {
  // for(var i = 0 ; i > -2; i++){
  //   lalala = fetch('http://31.220.22.185:9090/movie-names');
  //   console.log(i);  
  // }
  // for(var i = 0; i < 500 ; i++){
  //   for(var j = 0 ; j < 1000; j++){
  //     lalala = await fetch.put('http://10.26.16.181:3030/paint', {x:j, y:i, color:'#000000'} );
  //   }
  // }
  // console.log('fim')
  let total = 0
  getPixels("img.jpg", async function(err, pixels) {
    if(err) {
      console.log("Bad image path")
      return
    }
    for(var i = 0; i < 500 ; i++){
      for(var j = 0 ; j < 1000; j++){
        const cor = '#' + rgbHex(pixels.data[total], pixels.data[total+1], pixels.data[total+2]);
        total += 4;
        lalala = await fetch.put('http://10.26.16.181:3030/paint', {x:j, y:i, color:cor} );
      }
    }
    console.log("got pixels", pixels.shape.slice())
    console.log("Pixel at", pixels.data[1]);
  })
};


const resp = satan();

module.exports = app;
