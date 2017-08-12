export interface Reference<T> { $ref : string };
export interface WithSelf<T> extends T {
    d$self : Reference<T>
}

// cheating here: d$ref isn't really a class, but I will use it like one
// so it can be called as both a function and an object
// function d$ref<Data>(reference : Reference<T>) : T
// interface d$ref<Data>
function d$refFunction<T>(reference : Reference<T>) : T
interface d$refObject<D> {
    data : D,
    push<T>(entityName : string, newEntityData : T) : WithSelf<T>
}

type d$ref<D> = d$refFunction | d$refObject<D>


export const d$referencer : (data : any) => (reference : Reference<T>) => T

export interface Thing {
    one: number, two : number
}

let thingRef : Reference<Thing> = {$ref : '#/pointer/thing'};
let myThing = d$refFunction(thingRef);

let d$refTest = d$referencer<Thing>({some : 'data'});

let Foo : (foo : any) => <U>(bar : U) => U;

let foo = Foo({some : "thing"})
let bar = foo({other : "thing"})




let myOtherThing = d$refTest(thingRef);


 
