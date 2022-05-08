import { strictEqual } from "assert";
import { BddTest } from "../src/index.js";

new BddTest()
.given('', () => ({
	error: 'given() must be called with a message before should().'
}))
.should('throw error', ({ error }) => strictEqual(error, 'given() must be called with a message before should().'))
.then((test: any) => {
	clearTimeout(test.x);
})
.run();