var HOST = location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(HOST);
// Log a message when connection is successful.
ws.onopen = function() {
    log('Connected to server');
};

document.getElementById('send').onclick = function() {
    //            var msgSend = document.getElementById('entry').value;
    //            log("Browser sends: " + msgSend);
    //            Once user's input is received, we send it to the server.
    //            ws.send(msgSend);

    var data = {
        to: "sec-websocket-identifier",
        message: 'hello from client 1'
    };
    data.to = document.getElementById('entry').value;
    ws.send(JSON.stringify(data));
};

// When a message from server is received, we display it on the screen.
ws.onmessage = function(evt) {
    var msgReceived = evt.data;
    log("Websocket server responds: " + msgReceived);
};

// As soon as the connection is closed, we inform the user.
ws.onclose = function() {
    log('Disconnected from server');
};
