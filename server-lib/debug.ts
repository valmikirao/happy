import {expect} from 'chai';

import * as dateUtils from 'date-fns';
import * as child_process from 'child_process';
import Promise = require('promise');
import * as tmp from 'tmp';

import * as Persistence from '../server-lib/persistence';


const it = (_, call) => call()

class ItPromise<T> {
    private promise : Promise<T>;

    constructor(promise : Promise<T>) {
        this.promise = promise;
    }

    succeeds() {
        it('succeeds', () => this.promise);
    }

    private identityTransform(value : T) : T {return value}

    equals(
        name : string,
        match : any,
        transform : (T) => any = this.identityTransform,
    ) {
        it(name + ' === ' + match, () => {
            return this.promise.then(rawValue => {
                let value = transform(rawValue);

                expect(1).to.equal(2);

                expect(value).to.equal(match);
            });
        });
    }
}

const testDate = new Date('2017-07-19T11:45:50.241Z');
const yesterday = dateUtils.addDays(testDate, -1);

let itPromise = new ItPromise(
    Persistence
        .recordScore({
            gameConfigKey : '_test_',
            score: 135,
            date : yesterday,
        })
        .then(() => {
            return Persistence
                .getAllHighScores({
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
