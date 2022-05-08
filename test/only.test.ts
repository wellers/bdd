import { strictEqual } from 'assert';
import { BddTest } from '../src/index.js';

type TestArguments = {
	someArg: string
};

new BddTest()
.given('only is not set', () => {
	throw new Error("This is an error!");
})
.should('not run this test.', () => {})
.run();

new BddTest({ only: true })
.given('only is true', {
	someArg: 'someValue'
})
.should('only run this test.', (test: TestArguments) => {
	strictEqual(test.someArg, "someValue");
})
.run();