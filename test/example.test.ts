import { strictEqual } from "assert";
import { BddSpec } from "../src/index.js";

function addOne(num: number) {
	return num + 1;
}

new BddSpec()
	.given('num is 0', () => ({ num: 0, result: 1 }))
	.should('return 1', ({ num, result }) => strictEqual(addOne(num), result))
	.run();

new BddSpec()
	.given('num is 1', () => ({ num: 1, result: 2 }))
	.should('return 2', ({ num, result }) => strictEqual(addOne(num), result))
	.run();

new BddSpec()
	.given('num is 2', () => ({ num: 2, result: 3 }))
	.should('return 3', ({ num, result }) => strictEqual(addOne(num), result))
	.run();

new BddSpec()
	.given('num is 3', () => ({ num: 3, result: 4 }))
	.should('return 4', ({ num, result }) => strictEqual(addOne(num), result))
	.run();