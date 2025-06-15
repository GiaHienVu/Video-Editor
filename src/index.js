const fakeExpress = require("./fakeEpress/fakeExpress");
const apiRouter = require("./router");

const sever = new fakeExpress();
const PORT = 3000;


apiRouter(sever);

sever.beforeEach(fakeExpress.serveStatic('../public'))




sever.setErrorHandler((err, req, res) => {
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});


sever.listen(PORT);
