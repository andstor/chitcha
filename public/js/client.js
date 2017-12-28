function messageHandling() {

	// My name sent to the server
	var myName = false;

	// Whom shall recieve message (KID or "all").
	var recieverKID = 'all';

	// If user is running mozilla then use it's built-in WebSocket
	window.WebSocket = window.WebSocket || window.MozWebSocket;

	// If browser doesn't support WebSocket, just show some notification and exit
	if (!window.WebSocket) {
		content.html($('<p>', {
			text: 'Sorry, but your browser doesn\'t ' +
                'support WebSockets.'
		}));
		$('#input').hide();
		return;
	}


	var HOST = location.origin.replace(/^http/, 'ws');
	var ws = new WebSocket(HOST);
	// Log a message when connection is successful.

	ws.onopen = function() {
		console.log('Connected to server');
		// first we want users to enter their names
		$('#input').removeAttr('disabled');
		$('#input').attr('placeholder', 'Enter a name ...');
	};

	ws.onerror = function(error) {
		// just in there were some problems with conenction...
		$('.content').html($('<p>', {
			text: 'Sorry, but there\'s some problem with your ' +
                'connection or the server is down.'
		}));
	};

	// When a message from server is received, we display it on the screen.
	ws.onmessage = function(message) {
		var msgReceived = message.data;
		console.log('Websocket server responds: ' + msgReceived);

		// try to parse JSON message. Because we know that the server always returns
		// JSON this should work without any problem but we should make sure that
		// the massage is not chunked or otherwise damaged.
		var json;

		try {
			json = JSON.parse(message.data);
			console.log(json);

		} catch (e) {
			console.log('This doesn\'t look like a valid JSON: ', message.data);
			return;
		}
		if (json.type === 'init') {
			$('#input').removeAttr('disabled').focus();
			// from now user can start sending messages
			$('#input').attr('placeholder', 'Message');

			document.getElementById('username').innerHTML = '@' + json.data + ' <span class=\'light_text\'>(you)</span>'; // Show the username

		} else if (json.type === 'nameList') {
			console.log(json.data);
			addClientsNames(json);

		} else if (json.type === 'history') { // entire message history
			// insert every single message to the chat window
			for (var i = 0; i < json.data.length; i++) {
				addMessage(json.data[i].author, json.data[i].text, new Date(json.data[i].time));
			}

		} else if (json.type === 'message') { // it's a single message
			$('#input').removeAttr('disabled'); // let the user write another message
			addMessage(json.data.author, json.data.text, new Date(json.data.time));
		} else {
			console.log('Hmm..., I\'ve never seen JSON like this: ', json);
		}


	};

	// As soon as the connection is closed, we inform the user.
	ws.onclose = function() {
		console.log('Disconnected from server');
	};



	/**
     * Send mesage when user presses Enter key

     */
	/*
        document.getElementById('send').onclick = function() {
            //            var msgSend = document.getElementById('entry').value;
            //            log("Browser sends: " + msgSend);
            //            Once user's input is received, we send it to the server.
            //            ws.send(msgSend);

            var data = {
                to: "sec-websocket-identifier",
                message: 'hello from client 1'
            };
            data.to = document.getElementById('input').value;
            ws.send(JSON.stringify(data));
        };*/



	$('textarea').keydown(function(e) {

		if (e.keyCode === 13 && !e.shiftKey) {
			e.preventDefault();

			var msg = $(this).val();
			if (!msg) {
				return;
			}

			/*
                    var data = {
                        to:      "sec-websocket-identifier",
                        from:    name,
                        message: 'message text from client'
                    };

                    data.message = msg;
                    // send the message as an ordinary text
                    ws.send(JSON.stringify(data));
            */

			ws.send(msg);
			$(this).val('');
			// disable the input field to make the user wait until server
			// sends back response
			$('#input').attr('disabled', 'disabled');

			// we know that the first message sent from a user their name
			if (myName === false) {
				myName = msg;
			}
		}
	});


	/**
     * This method is optional. If the server wasn't able to respond to the
     * in 3 seconds then show some error message to notify the user that
     * something is wrong.
     */
	setInterval(function() {
		if (ws.readyState !== 1) {
			$('#input').attr('placeholder', 'Error');
			$('#input').attr('disabled', 'disabled').val('Unable to comminucate ' +
                'with the WebSocket server.');
		}
	}, 3000);

	/**
     * Add message to the chat window
     */
	function addMessage(author, message, dt) {
		$('#msgs_board').append('<div class="message_content">' + '<b class="author">' + author + '</b>' + ' ' + '<div class="timestamp">' + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':' +
            (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes()) + '</div>' + '<br/> ' + message + '</div>');
		updateScroll();
	}


	function addClientsNames(json) {
		$('#clients-list').html('');
		console.log('lol');
		for (var j = 0; j < json.data.length; j++) {
			$('#clients-list').append('<li>' + json.data[j].name + '</li>');

			if (json.data[j].KID === recieverKID) {
				document.getElementById('clients-list').getElementsByTagName('li')[j].className = 'active';
				console.log('Virker');
			} else {
				console.log('virker ikke');
			}
		}
	}

	function updateScroll() {
		var element = document.getElementById('msgs_board');
		element.scrollTop = element.scrollHeight;
	}



}


//Runs when the document is loaded. Initialises the script.
document.addEventListener('DOMContentLoaded', function() {
	'use strict';
	messageHandling();
});
