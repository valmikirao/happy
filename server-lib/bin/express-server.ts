// $    
// $ /c/Program\ Files\ \(x86\)/MongoDB/Server/3.2/bin/mongod --dbpath mongo-dir/ --port 27017 --storageEngine=mmapv1 --journal

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as basicAuth from 'express-basic-auth';
import * as yargs from 'yargs';

const {port = 8000} = yargs.argv;

var app = express();

import * as Persistence from '../persistence';

Persistence.init();

// app.get('/', function (req, res) {
//   res.send('Hello World!');
// })

app.use(bodyParser.json());

app.use((request, response, next) =>{
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
    users : {
        'miki' : 'Lyanna123',
        'tom'  : 'Cat123',
        'renu' : 'Chewie123',
    },
    challenge : true,
    realm : 'default',
}));

console.log(process.cwd());
app.use('/static', express.static('.'));

app.post('/rest/recordScore', (request : basicAuth.IBasicAuthedRequest, response, next) => {
    const score = parseInt(request.body.score);
    let date = request.body.date;
    const gameConfigKey = request.body.gameConfigKey;
    const {user} = request.auth;
    
    if (date !== void(0)) {
        date = new Date(date);
    }

    Persistence
        .recordScore({
            user,
            gameConfigKey,
            score,
            date,
        })
        .then(function (doc) {
            response.json(doc);
        })
        .catch(next);
});


app.get('/rest/getAllHighScores', (request : basicAuth.IBasicAuthedRequest, response, next) => {
    const latestScore = parseInt(request.query.latestScore);
    const gameConfigKey = request.query.gameConfigKey;
    const user = request.auth.user;

    Persistence
        .getAllHighScores({
            user,
            latestScore,
            gameConfigKey,
        })
        .then(scores => {
            response.json(scores);
        })
        .catch(next);
});

const respondWithSentenceSet = (response) => (sentenceSet) => response.json({
            gameConfigKey : sentenceSet.gameConfigKey,
            sentences : sentenceSet.sentences,
        })

app.put('/rest/sentenceSet/:gameConfigKey', (request, response, next) => {
    const {gameConfigKey} = request.params;
    const {sentences, name} = request.body;

    Persistence
        .putSentenceSet({gameConfigKey, sentences, name})
        .then(respondWithSentenceSet(response))
        .catch(next);
});

app.get('/rest/sentenceSet/:gameConfigKey', (request, response, next) => {
    const {gameConfigKey} = request.params;

    Persistence
        .getSentenceSet({gameConfigKey})
        .then(respondWithSentenceSet(response))
        .catch(next);
});

app.get('/rest/sentenceSetList', (request, response, next) => {
    const {user} = request.body;

    Persistence
        .getSentenceSetList()
        .then(list => response.json(list))
})

app.use((error, request, response, next) => {
    console.error(error.stack);

    response.status(500);
    response.json({
      error : true,
      errorMessage : error.toString(),
      errorStack : error.stack,
    });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port} in ${__dirname}`);
});
