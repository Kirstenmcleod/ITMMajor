const serverless    = require("serverless-http");
const express       = require('express');
const app           = express();
const path          = require('path');
const locations     = require('./ajax/locations');
const secrets       = require('./lib/secrets');

// Developer environment settings

// Configure Express
app.use(async function(req, res, next) {
    console.log(`${req.method} - ${req.url}`);
    await secrets.init();
    next();
});

app.get(['/','/index.html','/index','/mother'], (req, res) => {
    res.sendFile(path.join(__dirname,`/public/Index.html`));
})

app.get('/ajax/locations', locations.get);

app.use('/public',express.static(path.join(__dirname, 'public'),{
    dotfiles: "ignore",
    etag: true,
    index: false,
    maxAge: "365d",
    immutable:true
}));

app.use(async function(req,res,next) { 
    console.log('Not Found',req.originalUrl)
    return res.status(404).json({
      error: "Not Found",
    });
});
  
module.exports.handler = serverless(app);
