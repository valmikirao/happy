import {Reference, WithSelf} from './json-deref-util';

interface Person {
    d$self : Reference<Person>,
    name : string,
    mom : Reference<Person>
}

interface Data {
    person : Person[]
}

let data : Data
let _data : Data