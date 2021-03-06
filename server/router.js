var path = require('path');
var url = require('url');
var fs = require('fs');
var querystring = require('querystring');
var utils = require('./http-utils');

var actions = {

    // Handle GET requests from client
    'GET': function(req, res) {
        // if your router needs to pattern-match endpoints
        var parsedUrl = url.parse(req.url, true);
        var endPoint = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;

        //console.log(parsedUrl);
        //console.log(endPoint);

        /*
        else if(req.method=='GET') {
                var url_parts = url.parse(req.url,true);
                console.log(url_parts.query);
            }*/
        /*
         * DO SOMETHING - get asset, query database, etc. -> store as `data`
         * pass the result of that operation as data into responder -> store result status code as `statusCode`
         * pass the status code into responder
         */
        var data;
        var statusCode = 200;

        if (req.url === "/") req.url = '/index.html'; // If no path specified, redirect to 'index.html'

        // Serve file
        function serveFile(path, callback) {
            utils.setHeaderCType(path);

            // async callback invokes callback with response
            fs.readFile(__dirname + '/../public' + path, 'utf8', function(err, content) {
                if (err) return callback(err);

                data = content;
                //console.log(__dirname + req.url);
                callback(null, content);
            });
        }



        serveFile(req.url, function(err, content) {
            if (err) {
                utils.redirector(res, '404.html', req.url); // Redirect user to '404 not found' page
            }
            // process the async result
            utils.respond(res, data, statusCode);
        });
    },

    // Handle POST requests from client
    'POST': function(req, res) {
        utils.prepareResponse(req, function(data) {
            // Do something with the data that was just collected by the helper
            // e.g., validate and save to db
            // either redirect or respond
            // should be based on result of the operation performed in response to the POST request intent
            // e.g., if user wants to save, and save fails, throw error
            if (req.url === "/inbound") {

                console.log("POST method is working!!!");

            } else {
                utils.send404(res);
            }
            utils.redirector(res /* redirect path , optional status code -  defaults to 302 */ );
        });
    }
};

exports.handleRequest = function(req, res) {
    var action = actions[req.method];
    action ? action(req, res) : utils.send404(res);
};








/*
MANUAL FILE HANDLERS -- NOT DYNAMIC--

function serveFiles(callback) {
    // async callback invokes callback with response
    if (req.url.indexOf('.html') != -1) { //req.url has the pathname, check if it conatins '.html'
        utils.headers['Content-Type'] = "text/html";
        if (req.url == "/index.html") {
            fs.readFile(__dirname + '/../public/index.html', 'utf8', function(err, content) {
                data = content;
                if (err) return callback(err);
                callback(null, "lol");
            });
        }
    } else if (req.url.indexOf('.css') != -1) { //req.url has the pathname, check if it conatins '.js'
        utils.headers['Content-Type'] = "text/css";
        if (req.url == "/css/main.css") {
            fs.readFile(__dirname + '/../public/css/main.css', 'utf8', function(err, content) {
                data = content;
                if (err) return callback(err);
                callback(null, content);
            });
        }


    } else if (req.url.indexOf('.js') != -1) { //req.url has the pathname, check if it conatins '.css'
        utils.headers['Content-Type'] = "text/js";
        if (req.url == "/js/main.js") {
            fs.readFile(__dirname + '/../public/js/main.js', 'utf8', function(err, content) {
                data = content;
                if (err) return callback(err);
                callback(null, content);
            });
        }
    }
}

serveFiles(function(err, content) {
    // process the async result
    utils.respond(res, data, statusCode);
    console.log(data);

});






function serveFiles(callback) {
    // async callback invokes callback with response
    var url = req.url;

    fs.readFile(__dirname + '/../' + url, 'utf8', function(err, content) {
        console.log(__dirname + '/../public' + url);
        if (url.indexOf('.html') != -1) { //req.url has the pathname, check if it conatins '.html'
            utils.headers['Content-Type'] = "text/html";
        }

        if (err) return callback(err);
        callback(null, content);
    });
}





if (url.indexOf('.html') != -1) { //req.url has the pathname, check if it conatins '.html'
    utils.headers['Content-Type'] = "text/html";
} else if (url.indexOf('.css') != -1) { //req.url has the pathname, check if it conatins '.css'
    utils.headers['Content-Type'] = "text/css";
} else if (url.indexOf('.js') != -1) { //req.url has the pathname, check if it conatins '.js'
    utils.headers['Content-Type'] = "application/javascript";
} else if (url.indexOf('.jpg') != -1) { //req.url has the pathname, check if it conatins '.jpg'
    utils.headers['Content-Type'] = "image/jpg";
} else if (url.indexOf('.png') != -1) { //req.url has the pathname, check if it conatins '.png'
    utils.headers['Content-Type'] = "image/png";
} else if (url.indexOf('.svg') != -1) { //req.url has the pathname, check if it conatins '.svg'
    utils.headers['Content-Type'] = "image/svg+xml";
}



*/
