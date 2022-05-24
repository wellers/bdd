import { testArray, Test } from '@wellers/testarray';
import { strictEqual } from 'assert';
import { BddSpec } from '../src/index.js';

const tests: Test[] = [
    {
        name: 'Given Bdd is called with non-integer timeout, should throw Error',
        args: {
            query: () => {
                // @ts-ignore
                BddSpec({ timeout: 'Hello, world!' });
            },
            error: "The 'timeout' field must be a number."
        }
    },
    {
        name: 'Given Bdd is called with non-integer concurrency, should throw Error',
        args: {
            query: () => {
                // @ts-ignore
                BddSpec({ concurrency: 'Hello, world!' });
            },
            error: "The 'concurrency' field must be a number."
        }
    },
    {
        name: 'Given Bdd is called with non-boolean only, should throw Error',
        args: {
            query: () => {
                // @ts-ignore
                BddSpec({ only: new Date() });
            },
            error: "The 'only' field must be a boolean."
        }
    },
    {
        name: 'Given Bdd is called with non-boolean skip, should throw Error',
        args: {
            query: () => {
                // @ts-ignore
                BddSpec({ skip: new Date() });
            },
            error: "The 'skip' field must be a boolean."
        }
    },
    {
        name: 'Given Bdd is called with non-boolean/non-string todo, should throw Error',
        args: {
            query: () => {
                // @ts-ignore
                BddSpec({ todo: new Date() });
            },
            error: "The 'todo' field must be a boolean.\r\nThe 'todo' field must be a string."
        }
    },
    {
        name: 'Given Bdd before() is called with an invalid setup, should throw Error',
        args: {
            query: () => {
                // @ts-ignore
                BddSpec().before(1);
            },
            error: 'setup must be of type function.'
        }
    },
    {
        name: 'Given Bdd given() is called with a non-string message, should throw Error',
        args: {
            query: () => {
                // @ts-ignore
                BddSpec().given(1, () => {});
            },
            error: 'message must be of type string.'
        }
    },
    {
        name: 'Given Bdd given() is called without passing establishContext, should throw Error',
        args: {
            query: () => {
                // @ts-ignore
                BddSpec().given('hello, world!');
            },
            error: 'establishContext is required.'
        }
    },
    {
        name: 'Given Bdd when() is called with a non-string message, should throw Error',
        args: {
            query: () => {
                // @ts-ignore
                BddSpec().given('message', () => {}).when(1, () => {});
            },
            error: 'message must be of type string.'
        }
    },
    {
        name: 'Given Bdd when() is called without passing observe, should throw Error',
        args: {
            query: () => {
                // @ts-ignore
                BddSpec().given('message', () => {}).when('message');
            },
            error: 'observe must be of type function.'
        }
    },
    {
        name: 'Given Bdd should() is called with a non-string message, should throw Error',
        args: {
            query: () => {                
                // @ts-ignore
                BddSpec().given('message', () => {}).when('message', () => {}).should(1, () => {});
            },
            error: 'message must be of type string.'
        }
    },
    {
        name: 'Given Bdd should() is called with an invalid assert, should throw Error',
        args: {
            query: () => {                
                // @ts-ignore
                BddSpec().given('message', () => {}).when('message', () => {}).should('message');
            },
            error: 'assert must be of type function.'
        }
    },
    {
        name: 'Given Bdd shouldThrow() is called with an non-string message, should throw Error',
        args: {
            query: () => {                
                // @ts-ignore
                BddSpec().given('message', () => {}).when('message', () => {}).shouldThrow(1);
            },
            error: 'errorMessage must be of type string.'
        }
    },
    {
        name: 'Given Bdd then() is called with an invalid teardown, should throw Error',
        args: {
            query: () => {                
                // @ts-ignore
                BddSpec().given('message', () => {}).when('message', () => {}).should('message', () => {}).then(1);
            },
            error: 'teardown must be of type function.'
        }
    },
    {
        name: 'Given a BddSpec with no assertions, should throw Error',
        args: {
            query: () => {                
                // @ts-ignore
                BddSpec().given('a BddSpec with no assertions', () => {}).when('run is called', () => {}).should('throw Error', () => null).run();
            },
            error: 'There must be at least one assertion.'
        }
    }
];

type TestArgument = {
    query: Function,
    result: any,
    error: string
}

testArray(tests, async ({ query, result, error }: TestArgument) => {
    let actual;
    try {
        actual = await query();
    }
    catch ({ message }) {
        strictEqual(message, error);
        return;
    }
    strictEqual(actual, result);
});