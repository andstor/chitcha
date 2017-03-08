"strict mode";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'chitcha';

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


/**
 * Global variables
 */
// latest 100 messages
var history = [];
// list of currently connected clients (users)
var clients = [];

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

wss.on('connection', function(client) {
    console.log(new Date());

    var KID = client.upgradeReq.headers['sec-websocket-key'];
    console.log('New Connection KID :: ', KID);
    //client.send(id);
    clients[KID] = client;
    var index = clients.push(client) - 1;
    console.log(index);

    var userName = false;


    // send back chat history
    if (history.length > 0) {
        client.send(JSON.stringify({
            'type': 'history',
            'data': history
        }));
    }

    client.on('message', function incoming(data) {
        if (userName === false) { // first message sent by user is their name
            // remember user name
            userName = htmlEntities(data);
            console.log((new Date()) + ' User is known as: ' + userName);

            client.send(JSON.stringify({
                'type': 'init',
                'data': userName
            }));

        } else { // log and broadcast the message
            console.log((new Date()) + ' Received Message from ' +
                userName + ': ' + data);

                // we want to keep history of all sent messages
                var messageObj = {
                    'time': (new Date()).getTime(),
                    'text': htmlEntities(data),
                    'author': userName
                };

                history.push(messageObj);
                history = history.slice(-100);

                // broadcast message to all connected clients
                var json = JSON.stringify({
                    'type': 'message',
                    'data': messageObj
                });

                var toUserKID = false;

                // Check if a specified user is selected
                if (toUserKID) {
                  console.log('Sent to ' + messageArray[0] + ': ' + json.data);
                  clients[toUserKID].send(data.message); // Send message to user with KID...

                } else {
                  broadcast(json); // Broadcast to all users (general chat group)
                }

            //clients[data.to].send(data.message);
        }
    });

    client.on('close', function(reason) {
        var KID = client.upgradeReq.headers['sec-websocket-key'];
        console.log('Closing :: %s' + '\n' + 'Reason :: %s', KID, reason);
        clients.splice(KID, 1);
    });

    //clients.push = client;
});


//send message to all clients
function broadcast(msg) {
    for (var i = 0; i < clients.length; i++) {
        clients[i].send(msg);
    }
}



// Logging
/*
app.use(function(request, response, next) {
    console.log("In comes a " + request.method + " to " + request.url);
    next();
});
*/
