



const logUser = (request, response) => {

     console.log("logUser was called");
    response.setHeader("Content-Type", "text/html");
    response.end(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Respond End Example</title>
    <style>
      body { font-family: sans-serif; padding: 2rem; background: #f5f5f5; }
      h1 { color: #007bff; }
    </style>
  </head>
  <body>
    <h1>Hello from response.end!</h1>
    <p>This HTML page was sent using <code>response.end()</code>.</p>
  </body>
  </html>
`);

}

const controller = {
    logUser
}

module.exports = controller;