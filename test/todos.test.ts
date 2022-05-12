import { BddSpec } from "../src/index.js";

BddSpec
	.create({ todo: true })
	.given('todo is true', {
		arg: 'someValue'
	})
	.when('test is run', args => args)
	.should('return todo.', () => { })
	.run();

BddSpec
	.create({ todo: 'this is todo' })
	.given('todo is a string', {
		arg: 'someValue'
	})
	.when('test is run', args => args)
	.should('return todo.', () => { })
	.run();