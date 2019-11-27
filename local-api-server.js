const express = require('express'),
    readline = require('readline'),
    rl = readline.createInterface(process.stdin),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    bodyParser = require('body-parser');

const debugDataInfo = [
    {
        dataName: 'getTestData',
        fileName: 'test'
    },
    {
        dataName: 'test1',
        fileName: 'test1'
    },
    {
        dataName: 'test2',
        fileName: 'test2'
    }
];

const allFileName = debugDataInfo.map(info => info.fileName);

var data = {};

function initDebugData() {
    console.log('deleting require cache...');
    allFileName.forEach(
        fileName =>
            delete require.cache[require.resolve(`./data/${fileName}.json`)]
    );
}

function loadDebugData() {
    initDebugData();

    debugDataInfo.forEach(dataInfo => {
        data[dataInfo.dataName] = require(`./data/${dataInfo.fileName}.json`);
    });

    console.log(data);
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
    console.log(`Request-URL(No Params): ${req.url.split('?')[0]}`);
    console.log('Request-Params:', req.query);
    console.log(`Request-Method: ${req.method}`);
    console.log(`X-Feature-Path: ${req.header('X-Feature-Path')}`);
    console.log(
        '------------------------------------------------------------------------------'
    );
    return next();
});

app.all('*', async (req, res, next) => {
    const url = req.url.split('?')[0],
        method = req.method,
        params = req.query; // GET POST PUT DELETE...
    switch (url) {
        case '/getTestData': {
            console.log(method);
            if (method === 'GET') {
                return res.json(ok(data.getTestData)).end();
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
        case '/test1': {
            return res.json(ok(data.test1)).end();
        }
        case '/test2': {
            return res.json(ok(data.test2)).end();
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
        console.log(
            '------------------------------------------------------------------------------'
        );
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
