import {expect} from 'chai';
import 'mocha';

import * as dateUtils from 'date-fns';
import * as child_process from 'child_process';
import Promise = require('promise');
import * as tmp from 'tmp';

import * as Persistence from '../server-lib/persistence';

import {ISentenceSetData} from '../server-lib/isomporphic-types';

// const assert = require('assert');

const timeout = (milliseconds : number) => {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, milliseconds);
    })
}


interface StartTmpMongoInfoI {
    process : child_process.ChildProcess,
    url : string,
};
type StartTmpMongoDbT = () => Promise<StartTmpMongoInfoI>;

const startTmpMongoDb : StartTmpMongoDbT = () => {
    let tmpDir = tmp.dirSync().name;

    const port = 27018;

    let tmpMongoDbProcess = child_process.spawn('mongod', [
        '--dbpath', tmpDir,
        '--port', `${port}`,
        '--journal',
    ], {stdio : 'ignore'});
    // {stdio : 'inherit'});

    // Wait at least 1 second before trying to connect
    return timeout(1000).then<StartTmpMongoInfoI>(() => {
        return {
            process : tmpMongoDbProcess,
            url : 'mongodb://localhost:' + port + '/db',
        }
    });
};

type ItTransform<T> = (T) => any;

class ItPromise<T> extends Promise<T> {

    succeeds() {
        it('succeeds', () => this);
    }

    // private identityTransform(value : T) : T {return value}

    equals<U>(
        name : string,
        match : U,
        transform : (T) => U,
    ) {
        it(name + ' === ' + match, () => {
            return this.then(rawValue => {
                let value = transform(rawValue);

                expect(value).to.equal(match);
            });
        });
    }

}

type TTryPersistInit = (args : {url : string, triesRemaing : number}) => Promise<void>
const tryPersistInit = ({url, triesRemaing}) => {
    return Persistence
        .init({url, silent : true, auth : false}) // silent to avoid stack traces for each attempt
        .catch(err => {
            if (err.name = 'MongoError' && triesRemaing > 1) {
                return timeout(500) // wait before trying again
                    .then(() =>
                        tryPersistInit({url, triesRemaing : triesRemaing - 1})
                    );
            }
            else {
                throw err;
            }
        })
}

function itAsync<T>(description :string, promise : Promise<T>) : void {
    it(description, () => promise);
}

const main = () => {
    let mongoProcess : child_process.ChildProcess;

    const user = '_test_user_';

    before(() => {
        startTmpMongoDb()
            .then(mongoInfo =>  {
                mongoProcess = mongoInfo.process;

                return tryPersistInit({url : mongoInfo.url, triesRemaing : 10});
            })
    });

    describe('persistence.js', () => {
        const gameConfigKey = '__test__';
        const gameConfigKey2 = '__test_2__'

        const getSetAsync = Persistence
            .putSentenceSet({
                gameConfigKey : gameConfigKey,
                name : 'Test',
                sentences : [[[{
                            text : 'text',
                            isCorrect : true,
                }]]],
            })
            .then(() => Persistence
                .putSentenceSet({
                    gameConfigKey : gameConfigKey2,
                    name : 'Test 2',
                    sentences : [[[{
                                text : 'text 2',
                                isCorrect : true,
                    }]]],
                })
            )
            .then(() =>
                Persistence
                    .getSentenceSet({gameConfigKey : gameConfigKey})
            );

        describe('#putSentenceSet -> #getSentenceSet', () => {
            itAsync('name', getSetAsync.then(({name}) => expect(name).to.equal('Test')));
            itAsync('sentences[0][0][0].text', getSetAsync.then(({sentences}) => expect(sentences[0][0][0].text).to.equal('text')));
        });

        const getOtherSetAsync = getSetAsync
            .then(() => Persistence
                .getSentenceSet({gameConfigKey : gameConfigKey2})
            );

        describe('#putSentenceSet -> #getSentenceSet 2', () => {
            itAsync('name', getOtherSetAsync.then(({name}) => expect(name).to.equal('Test 2')));
            itAsync('sentences[0][0][0].text', getOtherSetAsync.then(({sentences}) => expect(sentences[0][0][0].text).to.equal('text 2')));
        });

        const getListAsync = getOtherSetAsync
            .then(() => Persistence
                .getSentenceSetList()
            )
        
        describe('#getSentenceSetList', () => {
            itAsync('list is right', getListAsync.then(list => expect(list).to.deep.equal([
                {name : 'Test', gameConfigKey : gameConfigKey},
                {name : 'Test 2', gameConfigKey : gameConfigKey2},
            ])))
        })


        const getAllSameAsync = getListAsync.then(() =>
            Persistence
                .getAllHighScores({
                    user,
                    latestScore : 130,
                    gameConfigKey : gameConfigKey,
                })
        );

        describe('#getAllHighScores(130)', () => {
            itAsync('allTimeHigh', getAllSameAsync.then(({allTimeHigh}) => expect(allTimeHigh).to.equal(130)));
            itAsync('weekHigh', getAllSameAsync.then(({weekHigh}) => expect(weekHigh).to.equal(130)));
            itAsync('dayHigh', getAllSameAsync.then(({dayHigh}) => expect(dayHigh).to.equal(130)));
        });

        const testDate = new Date('2017-07-19T11:45:50.241Z');
        const yesterday = dateUtils.addDays(testDate, -1);

        
        const getAllDifferentAsync = getAllSameAsync
            .then(() => Persistence
                .recordScore({
                    user,
                    gameConfigKey : gameConfigKey,
                    score: 135,
                    date : yesterday,
                })
            )
            .then(() => Persistence
                .getAllHighScores({
                    user,
                    latestScore : 130,
                    gameConfigKey : gameConfigKey,
                    date : testDate,
                })
            )

        describe('#recordScore(135) -> getAllHighScores(130)', function () {
            itAsync('allTimeHigh', getAllDifferentAsync.then(({allTimeHigh}) => expect(allTimeHigh).to.equal(135)));
            itAsync('weekHigh', getAllDifferentAsync.then(({weekHigh}) => expect(weekHigh).to.equal(135)));
            itAsync('dayHigh', getAllDifferentAsync.then(({dayHigh}) => expect(dayHigh).to.equal(130)));
        });

        const user2 = '_test_user_2_';
        
        const getAllMultiUser = getAllDifferentAsync
            .then(() => Persistence
                .recordScore({
                    user : user2,
                    gameConfigKey : gameConfigKey,
                    score: 2000,
                    date : yesterday,
                })
            )
            .then(() => Persistence
                .getAllHighScores({
                    user,
                    latestScore : 130,
                    gameConfigKey : gameConfigKey,
                    date : testDate,
                })
            );

        describe('#recordScore(2000, _new_test_user_) -> getAllHighScores(130, _test_user_)', () => {
            itAsync('allTimeHigh', getAllMultiUser.then(({allTimeHigh}) => expect(allTimeHigh).to.equal(135)));
            itAsync('weekHigh', getAllMultiUser.then(({weekHigh}) => expect(weekHigh).to.equal(135)));
            itAsync('dayHigh', getAllMultiUser.then(({dayHigh}) => expect(dayHigh).to.equal(130)));

            const getAllMultiUser2 = getAllMultiUser
                .then(() => Persistence
                    .getAllHighScores({
                        user : user2,
                        latestScore : 130,
                        gameConfigKey : gameConfigKey,
                        date : testDate,
                    })
                )

            itAsync('allTimeHigh[user2]', getAllMultiUser2.then(({allTimeHigh}) => expect(allTimeHigh).to.equal(2000)));
            itAsync('weekHigh[user2]', getAllMultiUser2.then(({weekHigh}) => expect(weekHigh).to.equal(2000)));
            itAsync('dayHigh[user2]', getAllMultiUser2.then(({dayHigh}) => expect(dayHigh).to.equal(130)));
        });

    });

    after(function () {
        Persistence.disconnect();
        mongoProcess.kill();
    });
};

main();

