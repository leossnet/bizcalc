const http = require('http');
const fs = require('fs');

http.createServer(function(request, response) {
    const filePath = request.urs.substr();
    fs.readFile(filePath, function(error, data) {
        if ( error ) {
            response.statusCode = 404;
            response.end("Файл не найден.");
        }
        else {
            response.end(data);
        }
    });
}).listen(3000, function() {
    console.log("Server started at 3000");
});