import {d$referencer} from './json-deref-util.js';
import {expect} from 'chai';

console.log('Starting test ...');

let data = {
    person : [
        {
            d$self : {$ref : '#/person/0'},
            name : 'Jen',
            mom : {$ref : '#/person/1'},
        },
        {
            d$self : {$ref : '#/person/0'},
            name : 'Mary'  
        }
    ]
};

let d$ref = d$referencer(data);
let jen = d$ref(data.person[0].d$self)


expect(d$ref(jen.d$self).name).to.equal('Jen');
expect(d$ref(jen.mom).name).to.equal('Mary');

let jensMom = d$ref(jen.mom);
jensMom.mom = d$ref.push('person', {name : 'Marge'}).d$self;

expect(d$ref.data.person).to.have.lengthOf(3);
expect(d$ref(jensMom.mom).name).to.equal('Marge');

console.log('... success!!!');