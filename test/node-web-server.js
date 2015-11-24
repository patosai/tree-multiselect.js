var express = require('express'),
    app = express(),
    port = 3000;
app.use(express.static(__dirname + '/../'));
app.listen(port);
