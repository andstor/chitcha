// Imort needed modules
var http = require('http');
var Duplex = require('stream').Duplex;
var WebSocket = require('ws');
var url = require('url');

var router = require('./router');
var ip = "localhost";
var port = Number(process.env.PORT || 3000);


var server = http.createServer(router.handleRequest);

var wss = new WebSocket.Server({
    server: server
});

server.listen(port, function() {
    console.log('Listening on %d', server.address().port);
});


var sockets = [];

wss.on('connection', function connection(client) {
    var id = client.upgradeReq.headers['sec-websocket-key'];
    console.log('New Connection id :: ', id);
    //client.send(id);

    var stream = new Duplex({
        objectMode: true
    });

    stream._write = function(chunk, encoding, callback) {
        console.log('s->c', chunk);
        client.send(JSON.stringify(chunk));
        return callback();
    };

    stream._read = function() {}; // Ignore. You can't control the information, man!

    stream.headers = client.upgradeReq.headers;

    stream.remoteAddress = client.upgradeReq.connection.remoteAddress;

    client.on('message', function incoming(data) {
        console.log('c->s ', data);
        return stream.push(JSON.parse(data));
    });

    stream.on('error', function(msg) {
        return client.close(msg);
    });

    client.on('close', function(reason) {
        var id = client.upgradeReq.headers['sec-websocket-key'];
        console.log('Closing :: %d \n Reason :: %s', id, reason);

        stream.push('null');
        stream.emit('close');
        console.log('client went away');
        return client.close(reason);
    });

    stream.on('end', function() {
        client.close();
    });


    sockets[id] = client;
    // ... and give the stream to ShareJS.
    //return share.listen(stream)
});





// Logging
/*
app.use(function(request, response, next) {
    console.log("In comes a " + request.method + " to " + request.url);
    next();
});
*/
