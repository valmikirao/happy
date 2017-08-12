export function describe(name : string, tests : () => void) : void {
    tests();
}

export function it(name : string, test : () => void) : void {
    test();
}

export function before(beforeFunc : () => void) : void {
    beforeFunc();
}

export function after(afterFunc : () => void) : void {
    afterFunc();
}