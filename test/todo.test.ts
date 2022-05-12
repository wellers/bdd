import child_process from 'child_process';
import path from 'path';
import { promisify } from 'util';
import { BddSpec } from '../src/index.js';

const exec = promisify(child_process.exec);

type TestArguments = {
	file: string,
	responses: string[]
};

BddSpec
	.create()
	.given('todo is set', {
		file: 'todos.test.ts',
		responses: [
			'ok 1 - given todo is true, when test is run, should return todo. # TODO',
			'ok 2 - given todo is a string, when test is run, should return todo. # TODO this is todo',
			'# todo 2'
		]
	})
	.when('test is run', args => args)
	.should('return todo.', ({ file, responses }: TestArguments) => new Promise<void>(async (resolve, reject) => {
		const testPath = path.join('./test', file);

		try {
			const { stdout } = await exec(`node --loader ts-node/esm ${testPath}`);

			if (responses.some(response => !stdout.includes(response))) {
				return reject('Expected responses are not in stdout of tests.');
			}
		}
		catch ({ message }) {
			return reject(message);
		}

		return resolve();
	}))
	.run();