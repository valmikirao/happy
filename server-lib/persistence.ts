/// <reference path="types.d.ts"/>

import Promise = require('promise');
import * as clone from 'clone';
import * as dateUtils from 'date-fns';
import * as assert from 'assert';
import {IScoreHistory, IScoreHistoryData, TAllHighScores, ISentenceSet, ISentenceSetData} from './isomporphic-types';
import {TSentenceSetList, TSentenceSetListItem} from './isomporphic-types';

import mongoose = require('mongoose');
mongoose.Promise = Promise;

const scoreHistorySchema = new mongoose.Schema({
    user : {type : String, required : true},
    gameConfigKey : {type : String, required : true},
    score : {type : Number, required : true},
    date : {type : Date, default : Date.now},
});


type IScoreHistoryModel = mongoose.Model<IScoreHistory>;

const ScoreHistory = mongoose.model<IScoreHistory>(
        'scoreHistory',
        scoreHistorySchema,
    );

const sentenceSetSchema = new mongoose.Schema({
    gameConfigKey : {type : String, required : true, unique : true},
    name : {type : String, required : true},
    sentences : [[[{
        text : {type : String, required : true},
        isCorrect : {type : Boolean, required : true},
    }]]],
});

const SentenceSet = mongoose.model<ISentenceSet>(
    'sentenceSet',
    sentenceSetSchema,
);

type InitT = (args?: {
        url? : string,
        silent? : boolean,
    })
    => Promise<mongoose.Connection>;

const init : InitT = ({url = 'mongodb://localhost:27017/db', silent = false} = {}) => {
    mongoose.connect(url, {
        useMongoClient : true,
    });

    if (!silent) {
        mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
    }

    let returnPromise = new Promise<mongoose.Connection>(function (resolve, reject) {
        mongoose.connection.once('open', () => {
            if (!silent) console.log('Connected to MongoDB');
            resolve(mongoose.connection);
        });
 
        mongoose.connection.on('error', reject);
    });

    return returnPromise;
}

export type TRecordScore = (args : IScoreHistoryData & {user : string}) => Promise<IScoreHistoryData>;

const recordScore : TRecordScore = ({score, date = undefined, gameConfigKey, user}) => {
    let scoreHistory = new ScoreHistory({score, date, gameConfigKey, user});

    // types force us to be convoluted here,
    // I have a feeling mong
    let promise : Promise<IScoreHistory> = scoreHistory.save();
    // let promise  = new Promise<IScoreHistoryModel>((resolve) => {
    //     scoreHistory.save(resolve)
    // });
    
    return promise;
};


type TGetHighScore = (args : {
    user : string,
    latestScore? : number,
    since? : Date,
    gameConfigKey : string,
}) => Promise<number>;

const getHighScore : TGetHighScore = ({
    latestScore = null,
    since = null,
    gameConfigKey,
    user,
}) => {
    let query : {user : string, gameConfigKey : string, date? : any} = {gameConfigKey, user};
    if (since !== null) {
        query.date = { $gt : since };
    }

    const promise = ScoreHistory
        .findOne(query)
        .sort({score : -1})
        // .limit(1)
        .exec<IScoreHistoryData>()
        .then(function (doc) {
            let score = doc !== null ? doc.score : 0;
            if (latestScore !== null) {
                score = latestScore > score ? latestScore : score;
            }

            return score;
        });

    return promise;
};

export type TGetAllHighScores = (args: {
        user : string;
        latestScore : number,
        gameConfigKey : string,
        date? : Date,
    }) => Promise<TAllHighScores>;


const getAllHighScores : TGetAllHighScores = (args) => {
    const {latestScore, gameConfigKey, user} = args;
    const {date = new Date()} = args; // date defaults to now

    assert(gameConfigKey, 'gameConfigKey is required');

    let allTimePromise = getHighScore({
        user,
        gameConfigKey,
        latestScore,
    });

    let dayPromise = getHighScore({
        user,
        gameConfigKey,
        latestScore,
        since : dateUtils.startOfDay(date),
    });

    let weekPromise = getHighScore({
        user,
        gameConfigKey,
        latestScore,
        since : dateUtils.startOfWeek(date),
    });

    let monthPromise = getHighScore({
        user,
        gameConfigKey,
        latestScore,
        since : dateUtils.startOfMonth(date),
    });

    let yearPromise = getHighScore({
        user,
        gameConfigKey,
        latestScore,
        since : dateUtils.startOfYear(date),
    });
    
    let promises = [
        allTimePromise,
        dayPromise,
        weekPromise,
        monthPromise,
        yearPromise,
    ];

    let allPromise = Promise
        .all(promises)
        .then(function (results) {
            return {
                allTimeHigh : results.shift(),
                dayHigh : results.shift(),
                weekHigh : results.shift(),
                monthHigh : results.shift(),
                yearHigh : results.shift(),
            };
        });

    return allPromise;
}

type TGetSentenceSet = ({gameConfigKey : string}) => Promise<ISentenceSetData>;

const getSentenceSet : TGetSentenceSet = ({gameConfigKey}) => {
    return SentenceSet
        .findOne({gameConfigKey})
        .exec<ISentenceSetData>()
}

type TListSentenceSets = () => Promise<TSentenceSetList>;

const getSentenceSetList = () => {
    return SentenceSet
        .find({})
        .limit(100) // this shouldn't be an issue for a while, but for now keep it from getting crazy
        .select({name : 1, gameConfigKey : 1})
        .sort({name : 1, gameConfigKey : 1})
        .exec<mongoose.TFoundDoc<TSentenceSetListItem>[]>()
        .then(found =>
            found.map(({_doc}) => {
                const {name, gameConfigKey} = _doc;

                return {name, gameConfigKey};
            })
        );
}

type TPutSentenceSet = (sentenceData : ISentenceSetData) => Promise<ISentenceSet>
const putSentenceSet : TPutSentenceSet = (sentenceData) => new SentenceSet(sentenceData).save()

const disconnect : () => Promise<any> = () => {
    return mongoose.disconnect();
}

export {
    recordScore,
    getHighScore,
    getAllHighScores,
    init,
    disconnect,
    putSentenceSet,
    getSentenceSet,
    getSentenceSetList,
};
