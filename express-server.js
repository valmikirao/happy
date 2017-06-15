'use strict';

// $    
// $ /c/Program\ Files\ \(x86\)/MongoDB/Server/3.2/bin/mongod --dbpath mongo-dir/ --port 27017 --storageEngine=mmapv1 --journal

const express = require('express')
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');

var app = express();

const Persistence = require('./server-lib/persistence');

Persistence.init();

// app.get('/', function (req, res) {
//   res.send('Hello World!');
// })

app.use(bodyParser.json());

app.use(function(request, response, next) {
    console.log('%s %s %s %s %s',
        new Date(),
        request.method,
        request.url,
        JSON.stringify(request.query),
        JSON.stringify(request.body)
    );

    next();
});

app.use(basicAuth({
    users : {'miki' : 'Lyanna123'},
    challenge : true,
    realm : 'default',
}));

app.use('/static', express.static(__dirname));

app.post('/rest/recordScore', function(request, response, next) {
    const score = parseInt(request.body.score);
    let date = request.body.date;
    const gameConfigKey = request.body.gameConfigKey;
    
    if (date !== void(0)) {
        date = new Date(date);
    }

    Persistence
        .recordScore({
            gameConfigKey,
            score,
            date,
        })
        .then(function (doc) {

            response.json(doc);
        })
        .catch(next);
});


app.get('/rest/getAllHighScores', function (request, response, next) {
    const latestScore = parseInt(request.query.latestScore);
    const gameConfigKey = request.query.gameConfigKey;

    Persistence
        .getAllHighScores({
            latestScore,
            gameConfigKey,
        })
        .then(function (scores) {
            response.json(scores);
        })
        .catch(next);
});

app.use(function (error, request, response, next) {
    console.error(error.stack);

    response.status(500);
    response.json({
      error : true,
      errorMessage : error.toString(),
      errorStack : error.stack,
    });
})

app.listen(8000, function () {
    console.log('Example app listening on port 8000 in ' + __dirname);
})
