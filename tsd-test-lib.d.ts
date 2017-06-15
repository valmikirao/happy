export interface Foo {alongvar : string, B : string}

export const foo : Foo = {alongvar : "Hello", B : "World"}

export function return_same<T>(thing :T) : T

let zoo = return_same(foo);

