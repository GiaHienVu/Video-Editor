const http = require("node:http");
const fs = require("node:fs/promises");

const { parseJSON, serveStatic } = require("./util");

class fakeExpress {
    constructor() {
        this.sever = http.createServer();
        this.routes = {};
        this.middleware = [];
        this.handleError;

        this.sever.on("request", (request, response) => {


            // / Send File Back to Client STATIC FILE ( NO NEED TO AUTHENTICATE)
            response.sendFile = async (path, mime) => {
                const fileHandle = await fs.open(path, "r");
                const readStream = fileHandle.createReadStream();

                response.setHeader("Content-Type", mime);
                readStream.pipe(response);
                readStream.on('end', () => {
                    fileHandle.close();
                })
            }

            response.status = (code) => {
                response.statusCode = code;
                return response;
            }

            response.json = (data) => {
                response.setHeader("Content-Type", "application/json");
                response.end(JSON.stringify(data));
            }

            const urlWithoutParams = request.url.split("?")[0];
            request.params = new URLSearchParams(request.url.split("?")[1]);


            const runMiddleWare = (req, res, middleware, index) => {
                if (index === middleware.length) {
                    if (!this.routes[request.method.toLocaleLowerCase() + urlWithoutParams]) {
                        return response.status(404).json({ error: `Cannot ${request.method} ${urlWithoutParams}` });
                    }


                    this.routes[request.method.toLocaleLowerCase() + urlWithoutParams](
                        request,
                        response,
                        (error) => {
                            response.setHeader("Connection", "close");
                            this.handleError(error, request, response);
                        }
                    )
                } else {
                    middleware[index](req, res, () => {
                        runMiddleWare(req, res, middleware, index + 1);
                    });
                }
            }

            runMiddleWare(request, response, this.middleware, 0);
        })
    }



    listen(PORT) {
        this.sever.listen(PORT);
        console.log("Sever listen on PORT:", PORT);
    }

    route(method, path, cb) {
        this.routes[method + path] = cb;
    }

    beforeEach(cb) {
        this.middleware.push(cb);
    }
    setErrorHandler(cb) {
        this.handleError = cb;
    }
}


fakeExpress.parseJSON = parseJSON;
fakeExpress.serveStatic = serveStatic;

module.exports = fakeExpress;