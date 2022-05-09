import { strictEqual } from "assert";
import { BddSpec } from "../src/index.js";

function addOne(num: number) {
	return num + 1;
}

new BddSpec()
	.given('num is 0', () => 0)
	.when('test is run', num => addOne(num))
	.should('return 1', actual => strictEqual(actual, 1))
	.run();

new BddSpec()
	.given('num is 1', () => 1)
	.when('test is run', num => addOne(num))
	.should('return 2', actual => strictEqual(actual, 2))
	.run();

new BddSpec()
	.given('num is 2', () => 2)
	.when('test is run', num => addOne(num))
	.should('return 3', actual => strictEqual(actual, 3))
	.run();

new BddSpec()
	.given('num is 3', () => 3)
	.when('test is run', num => addOne(num))
	.should('return 4', actual => strictEqual(actual, 4))
	.run();