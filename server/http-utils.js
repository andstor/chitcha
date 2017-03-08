var headers = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "content-type, accept",
    "access-control-max-age": 10,
    "Content-Type": "text/html"
};
exports.headers = headers;

exports.setHeaderCType = function(url) {

    var contentTypes = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/js",
        ".jpg": "image/jpg",
        ".png": "image/png",
        ".ico": "image/x-icon",
        ".svg": "image/svg+xml",
        ".MP3": "audio/mpeg"
    };

    for (var suffix in contentTypes) {
        // If the current property is not a direct property of contentTypes - skip (continue) to next property.
        if (!contentTypes.hasOwnProperty(suffix)) {
            continue;
        }
        //req.url has the pathname, check the requested filetype and set the corresponding "Content-Type"
        if (url.indexOf(suffix) != -1) {
            headers['Content-Type'] = contentTypes[suffix];
        }
    }
};



exports.prepareResponse = function(req, cb) {
    var data = "";
    req.on('data', function(chunk) {

        // Too much POST data, kill the connection!
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (requestBody.length > 1e7) {
            data += chunk;
        }
    });
    req.on('end', function() {
        cb(data);
    });
};

exports.respond = function(res, data, status) {
    status = status || 200;
    res.writeHead(status, headers);
    res.end(data);
};

exports.send404 = function(res) {
    exports.respond(res, 'Not Found', 404);
};

exports.redirector = function(res, loc, status) {
    status = status || 302;
    res.writeHead(status, {
        Location: loc
    });
    res.end();
};
