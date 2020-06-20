/**
 * Серверный модуль веб-сервера
 */
const http = require('http');
const fs = require('fs');

/**
 * Инициализация и запуск сервера приложения в контексте node.js
 */
http.createServer((request, response) => {
    const filePath = request.url.substr(1);
    fs.readFile(filePath, (error, data) => {
        if ( error ) {
            response.statusCode = 404;
            response.end("File not found...");
        }
        else {
            fs.createReadStream(filePath).pipe(response);
        }
    });
}).listen(80, function() {
    console.log("Server started at 80");
});
