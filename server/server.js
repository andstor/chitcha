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

var nameList = [];
/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

wss.on('connection', function(client) {
    console.log("--------------!!!!!!!!!!!!!!!!!---------------");
    console.log(new Date());
    var KID = client.upgradeReq.headers['sec-websocket-key'];
    console.log('New Connection KID :: ', KID);
    //client.send(id);

    clients.push(client);
    var index = clients.length - 1;

    // send back active clients list
    broadcast(JSON.stringify({
        'type': 'nameList',
        'data': nameList
    }));

    var username = false;

    // send back chat history
    if (history.length > 0) {
        client.send(JSON.stringify({
            'type': 'history',
            'data': history
        }));
    }

    client.on('message', function incoming(data) {
        retIndex(KID, function(err, index) {
            if (username === false) { // first message sent by user is their name
                // remember user name
                username = htmlEntities(data);
                console.log((new Date()) + ' User is known as: ' + username + index);

                clients[index].username = username;
                updateNamesList(index, 'add', function(err, index) {

                    client.send(JSON.stringify({
                        'type': 'init',
                        'data': username
                    }));
                });
            } else { // log and broadcast the message
                console.log((new Date()) + ' Received Message from ' +
                    username + ': ' + data);

                // we want to keep history of all sent messages
                var messageObj = {
                    'time': (new Date()).getTime(),
                    'text': htmlEntities(data),
                    'author': username
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
                    broadcast(json, "send msg"); // Broadcast to all users (general chat group)
                }

                //clients[data.to].send(data.message);
            }
        });
    });

    client.on('close', function(reason) {
        retIndex(KID, function(err, index) {

            console.log('Closing :: %s' + '\n' + 'Reason :: %s', KID, reason);
            console.log("Removing client at index: %s", index);

            clients.splice(index, 1);
            updateNamesList(index, 'remove', function(err, val) {});
        });
    });

    //clients.push = client;
});


// Retrieve the client's index value
function retIndex(KID, callback) {
    for (var i = 0; i < clients.length; i++) {
        if (clients[i].upgradeReq.headers['sec-websocket-key'] === KID) {
            console.log("Found: " + i);
            return callback(null, i);
        } else {
            console.log("Not found");
        }
    }
}

//send message to all clients
function broadcast(msg) {
    for (var i = 0; i < clients.length; i++) {
        console.log("found client: " + i + "::" + clients[i].username);
        clients[i].send(msg);
    }
}

// Function for updating (adding and removing) items (client name and KID) in nameList
function updateNamesList(index, type, callback) {
    if (type === 'add') {
        var listObj = ({
            'KID': clients[index].upgradeReq.headers['sec-websocket-key'],
            'name': clients[index].username
        });
        nameList.splice(index, 0, listObj); // Insert listObj at index

    } else if (type === 'remove') {
        nameList.splice(index, 1); // Remove obj at index
    } else {
        console.log("DO NOTHING");
    }
    broadcast(JSON.stringify({
        'type': 'nameList',
        'data': nameList
    }));
    return callback(null, "namesList updated");
}


// Logging
/*
app.use(function(request, response, next) {
    console.log("In comes a " + request.method + " to " + request.url);
    next();
});







for (var i = 0; i < clients.length; i++) {
    if (clients.hasOwnProperty(i)) {
        if (clients[i].username === clientUsername) {

        }
    }
}




function retClientIndex(KID, callback) {
    for (var i in clients) {
        if (clients.hasOwnProperty(i)) {
            if (clients[i].upgradeReq.headers['sec-websocket-key'] === KID) {
                console.log("Found: " + i);
                return callback(null, i);
            } else {
                console.log("Not found");
            }
        }
    }
}
*/
