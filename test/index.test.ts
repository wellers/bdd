import { promisify } from 'util';
import child_process from 'child_process';
import path from 'path';
import { BddSpec } from '../src/index.js';

const exec = promisify(child_process.exec);

type TestArguments = {
	files: Test[],
};

type Test = {
	file: string,
	only: boolean
}

new BddSpec()
	.given('tests', () => ({
		files: [{
			file: 'arguments.test.ts'
		},
		{
			file: 'after.test.ts'
		},
		{
			file: 'example.test.ts'
		},
		{
			only: true,
			file: 'only.test.ts'
		},
		{
			file: 'todo.test.ts'
		},
		{
			file: 'bdd.test.ts'
		}]
	}))
	.when('test is run', args => args)
	.should('pass', ({ files }: TestArguments) => new Promise<void>(async (resolve, reject) => {
		try {
			await Promise.all(files.map(async ({ file, only }) => {
				const testPath = path.join('./test', file);
				const isOnlyTest = only ? '--test-only ' : '';

				await exec(`node --loader ts-node/esm ${isOnlyTest}${testPath}`);
			}));
		}
		catch ({ message }) {
			return reject(message);
		}

		return resolve();
	}))
	.run();