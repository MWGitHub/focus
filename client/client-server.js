/**
 * Simple server for the client that renders the index for all URLs except the media URL.
  */

var express = require('express');
var path = require('path');
var config = require('./config.json');

var app = express();

app.all('*', function(req, res, next) {
    "use strict";

    var url = req.url;
    var segments = url.split('/');
    if (segments.length >= 2 && (segments[1] === 'media' || segments[1] === 'bower_components')) {
        next();
    } else {
        res.sendFile(path.join(__dirname + '/index.html'));
    }
});

app.use('/media', express.static('media'));
app.use('/bower_components', express.static('bower_components'));

var server = app.listen(config.port, config.host, function() {
    "use strict";

    var host = server.address().address;
    var port = server.address().port;

    console.log('Client side test app listening at http://%s:%s', host, port);
});