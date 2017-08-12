/*

Maybe don't have to do this

declare module 'promise' {

    // Promises, all the way down
    type ThenCallT<T, U> = (value? : T) => U | MyPromiseI<U>;

    type ResolveT<T> = (T) => void;
    type RejectT = (any) => void;
    type NewCallBackT<T> = (resolve: ResolveT<T>, reject: RejectT) => void;

    class MyPromiseI<T> {
        constructor(callback : NewCallBackT<T>)

        then<U>(call : ThenCallT<T, U>) : MyPromiseI<U>;
        then(call : ThenCallT<T, any>) : MyPromiseI<any>;

        catch(call : (any) => any) : MyPromiseI<any>; // keeping the catch super-generic

        // this only takes promises of all the same types for now
        static all<U>(promises : MyPromiseI<U>[]) : MyPromiseI<MyPromiseI<U>[]>
    }

    export = MyPromiseI;
}
*/

// declare module 'isomorphic-fetch' {
//     interface RequestInit {
//         method?: string;
//         headers?: any;
//         body?: any;
//         referrer?: string;
//         referrerPolicy?: ReferrerPolicy;
//         mode?: RequestMode;
//         credentials?: RequestCredentials;
//         cache?: RequestCache;
//         redirect?: RequestRedirect;
//         integrity?: string;
//         keepalive?: boolean;
//         window?: any;
//     }

//     import PromiseM = require('promise');

//     function fetch(input: string, init?: RequestInit): PromiseM<Response>;
    
//     export = fetch;
// }


declare module 'mongoose' {
    /*
        @types/mongoose doesn't seem to work
        so creating this

        This is only what I need.  Also, function
        returns are void if we are currently ignoring
        their return values

        Some types are 'any' when we don't
        think it's worth it to be more specific
    */

    import PromiseM = require('promise');
    
    export var Promise : typeof PromiseM;

    class Schema {
        constructor(any) // for now, maybe tighten this up
    }

    export interface Document {}

    interface Model<T extends Document> {
        constructor(any)

        save() : PromiseM<T>
    }

    interface DocumentQuery<T> {
        sort(any) : DocumentQuery<T>,
        findOne(any) : DocumentQuery<T>
        exec() : PromiseM<T>
    }

    interface TypeOfModel<T> extends DocumentQuery<T> {
        new(T) : Model<T>,
    }

    function model<T>(
        name: string,
        schema?: Schema,
    ) : TypeOfModel<T>;

    interface Connection {
        on(on : 'error', any) : void;
        once(once : 'open', callback : () => void)
    }

    function connect(url : string, options : {useMongoClient : boolean}) : void

    var connection : Connection

    function disconnect() : PromiseM<any>;
}

declare module 'react-dom' {
    // seems to be a bug in react-dom.d.ts
	const render : (element : any, root : any) => any;
}

