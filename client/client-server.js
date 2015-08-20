/**
 * Simple server for the client that renders the index for all URLs except the media URL.
  */

var express = require('express');
var path = require('path');


var app = express();

app.all('*', function(req, res, next) {
    "use strict";

    var url = req.url;
    var segments = url.split('/');
    if (segments.length >= 2 && segments[1] === 'media') {
        next();
    } else {
        res.sendFile(path.join(__dirname + '/index.html'));
    }
});

app.use('/media', express.static('media'));

var server = app.listen(8000, function() {
    "use strict";

    var host = server.address().address;
    var port = server.address().port;

    console.log('Client side test app listening at http://%s:%s', host, port);
});