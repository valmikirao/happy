import prototyper, {shuffle} from './array-random.js';
import randomSeed from 'seed-random';
import {expect} from 'chai';

console.log('Starting test ...');


let array = [1, 2, 3, 4, 5];

randomSeed('Something awesome!!!!', {global : true});
expect(shuffle(array)).to.deep.equal([ 2, 3, 5, 4, 1 ]);
expect(shuffle(array)).to.deep.equal([ 4, 5, 1, 2, 3 ]);
expect(shuffle(array)).to.deep.equal([ 2, 5, 4, 1, 3 ]);

prototyper(Array);

randomSeed('Something awesome!!!!', {global : true});
expect(array.shuffle()).to.deep.equal([ 2, 3, 5, 4, 1 ]);
expect(array.shuffle()).to.deep.equal([ 4, 5, 1, 2, 3 ]);
expect(array.shuffle()).to.deep.equal([ 2, 5, 4, 1, 3 ]);

randomSeed('Something awesome!!!!', {global : true});
expect(array.randomElement()).to.equal(2);
expect(array.randomElement()).to.equal(2);
expect(array.randomElement()).to.equal(4);

console.log('... success!!!');




