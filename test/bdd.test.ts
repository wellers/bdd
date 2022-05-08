import { strictEqual } from "assert";
import { BddTest } from "../src/index.js";

new BddTest()
	.given('', () => ({
		error: 'given() must be called with a message before should().'
	}))
	.should('throw error', ({ error }) => strictEqual(error, 'given() must be called with a message before should().'))
	.run();

new BddTest()
	.given('message is passed', () => ({
		error: 'both given() and should() must be called with a message before then().'
	}))
	.should('', ({ error }) => strictEqual(error, 'both given() and should() must be called with a message before then().'))
	.then(() => { })
	.run();