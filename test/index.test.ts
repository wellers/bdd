import child_process from 'child_process';
import path from 'path';
import { promisify } from 'util';
import { BddSpec } from '../src/index.js';

const exec = promisify(child_process.exec);

type TestArguments = {
	files: Test[],
};

type Test = {
	file: string,
	only: boolean
}

BddSpec()
	.given('tests', {
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
		}]
	})
	.when('tests are run', args => args)
	.should('all pass', ({ files }: TestArguments) => new Promise<void>(async (resolve, reject) => {
		async function runTest({ file, only }: Test): Promise<void> {
			const testPath = path.join('./test', file);
			const isOnlyTest = only ? '--test-only ' : '';

			const { stdout } = await exec(`node --loader ts-node/esm ${isOnlyTest}${testPath}`);

			console.log(file);
			console.log(stdout);
		};

		try {
			await Promise.all(files.map(file => runTest(file)));
		}
		catch ({ message }) {
			return reject(message);
		}

		return resolve();
	}))
	.run();