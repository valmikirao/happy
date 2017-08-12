import Store from './ref-util.js';

let store = new Store();

let fooRef1 = store.refNew({entity : 'foo', value : 'B', key : 'AAA'});
console.log(store.data);
console.log(fooRef1);
console.log(fooRef1.get());

