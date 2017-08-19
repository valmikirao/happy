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

    let returnPromise = timeout(1000)
        .then<StartTmpMongoInfoI>(({}) => {
            let tmpMongoDbProcess = child_process.spawn('mongod', [
                '--dbpath', tmpDir,
                '--port', `${port}`,
                '--journal',
            ], {stdio : 'ignore'});
            // {stdio : 'inherit'});

            // there is probably a more complete way to make sure the server is ready,
            // but waiting 1 second is good enough for now
            return timeout(2000).then<StartTmpMongoInfoI>(() => {
                return {
                    process : tmpMongoDbProcess,
                    url : 'mongodb://localhost:' + port + '/db',
                }
            });
        });
    
    return returnPromise;
};

type ItTransform<T> = (T) => any;

class ItPromise<T> {
    private promise : Promise<T>;

    constructor(promise : Promise<T>) {
        this.promise = promise;
    }

    succeeds() {
        it('succeeds', () => this.promise);
    }

    // private identityTransform(value : T) : T {return value}

    equals<U>(
        name : string,
        match : U,
        transform : (T) => U,
    ) {
        it(name + ' === ' + match, () => {
            return this.promise.then(rawValue => {
                let value = transform(rawValue);

                expect(value).to.equal(match);
            });
        });
    }
}

const main = () => {
    let mongoProcess : child_process.ChildProcess;

    const user = '_test_user_';

    before(() => {
        startTmpMongoDb()
            .then(mongoInfo =>  {
                mongoProcess = mongoInfo.process;

                Persistence.init({url : mongoInfo.url});
            })
    });

    describe('1 persistence.js', () => {
        describe('#putSentenceSet -> #getSentenceSet', () => {
            let itPromise = new ItPromise(
                Persistence
                    .putSentenceSet({
                        gameConfigKey : '__test__',
                        sentences : [[[{
                                    text : 'text',
                                    isCorrect : true,
                        }]]],
                    })
                    .then(() =>
                        Persistence
                            .getSentenceSet({gameConfigKey : '__test__'})
                    )
            );

            itPromise.equals<string>('sentences[0][0][0].text', 'text', (sentenceSet : ISentenceSetData) => {
                return sentenceSet.sentences[0][0][0].text
            });
        });

        describe('#getAllHighScores(130)', () => {
            let itPromise = new ItPromise(
                Persistence
                    .getAllHighScores({
                        user,
                        latestScore : 130,
                        gameConfigKey : '_test_',
                    })
            );

            itPromise.succeeds();
            itPromise.equals('allTimeHigh', 130, (all) => {return all.allTimeHigh});
            itPromise.equals('weekHigh', 130, (all) => {return all.weekHigh});
            itPromise.equals('dayHigh', 130, (all) => {return all.dayHigh});
        });

        describe('#recordScore(135) -> getAllHighScores(130)', function () {
            const testDate = new Date('2017-07-19T11:45:50.241Z');
            const yesterday = dateUtils.addDays(testDate, -1);

            let itPromise = new ItPromise(
                Persistence
                    .recordScore({
                        user,
                        gameConfigKey : '_test_',
                        score: 135,
                        date : yesterday,
                    })
                    .then(() => {
                        return Persistence
                            .getAllHighScores({
                                user,
                                latestScore : 130,
                                gameConfigKey : '_test_',
                                date : testDate,
                            })
                    })
            );

            itPromise.succeeds();
            itPromise.equals('allTimeHigh', 135, (all) => {return all.allTimeHigh});
            itPromise.equals('weekHigh', 135, (all) => {return all.weekHigh});
            itPromise.equals('dayHigh', 130, (all) => {return all.dayHigh});
        });
    });

    after(function () {
        Persistence.disconnect();
        mongoProcess.kill();
    });

    
};

main();

