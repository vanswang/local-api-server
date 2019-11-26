const express = require('express'),
    readline = require('readline'),
    rl = readline.createInterface(process.stdin),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    bodyParser = require('body-parser');

var test, data;

function initDebugData() {
    delete require.cache[require.resolve('./data/test.json')];
}

function loadDebugData() {
    initDebugData();

    test = require('./data/test.json');
    data = {
        test: test
    };
}

function ok(something) {
    return {
        code: 2000,
        data: something || null,
        message: 'OK'
    };
}

function error(message, code, data) {
    return {
        code: code || 20001,
        data: data || null,
        message: message
    };
}

app.use(bodyParser.json());

app.get('/api/download', req => {
    console.log(req.url);
    // res.sendFile(path.join(__dirname, './data/download.sample.zip'));
});

app.all('*', (req, res, next) => {
    let date = new Date();
    console.log(date.toLocaleString());
    console.log(req.query);
    console.log(`X-Feature-Path: ${req.header('X-Feature-Path')}`);
    return next();
});

app.all('*', async (req, res, next) => {
    const url = req.url,
        method = req.method; // GET POST PUT DELETE
    switch (url) {
        case '/Insurance/test': {
            console.log(method);
            if (method === 'GET') {
                return res.json(ok('test')).end();
            } else {
                return res
                    .json(
                        error(
                            'Method is not right! The method of this API should be GET!'
                        )
                    )
                    .end();
            }
        }
        case '/Insurance/test1': {
            return res.json(ok(data.test)).end();
        }
        default:
            return next();
    }
});

function start() {
    loadDebugData();
    server.listen(8899, () => {
        console.log(`api @ 8899`);
        console.log(`press enter to reset data to initial state`);
    });
}

rl.addListener('line', () => {
    console.log(`closing...`);
    server.close(() => {
        console.log(`restarting...`);
        start();
    });
});

start();
