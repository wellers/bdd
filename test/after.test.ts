import { BddTest } from "../src/index.js";

new BddTest()
	.given('a timeout within the test', () => ({
		x: setTimeout(() => { }, 5000)
	}))
	.should('clear timeout after test.', () => { })
	.then((test: any) => {
		clearTimeout(test.x);
	})
	.run();