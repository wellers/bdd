// @ts-ignore
import test from 'node:test';
import Validator from 'fastest-validator';
import { strictEqual } from 'node:assert';

export type BddSpecOptions = {
	timeout?: number,
	concurrency?: number,
	only?: boolean,
	skip?: boolean,
	todo?: boolean | string
}

export type TestOptions = {
	concurrency?: number,
	only?: boolean,
	skip?: boolean,
	todo?: boolean | string
}

const optionsSchema = {
	timeout: { type: "number", optional: true },
	concurrency: { type: "number", optional: true },
	only: { type: "boolean", default: false },
	skip: { type: "boolean", default: false },
	todo: { type: "any", optional: true }
};

const validator = new Validator();
const validateOptions = validator.compile(optionsSchema);

type EstablishContext = Promise<Function> | {};

type Specification = {
	name: string;
	setup?: Function;
	establishContext: EstablishContext;
	observe: (context: any) => any;
	assert: (assert: any) => void;
	timeout?: number;
	teardown?: Function;
	options?: TestOptions | {};	
}

export class BddSpec {
	private specification: Specification = {
		name: '',
		establishContext: {},
		observe: () => { throw Error('observe must be set') },
		assert: () => { throw Error('assert must be set') }		
	};

	constructor(options?: BddSpecOptions) {
		if (options) {
			const results = validateOptions(options);

			if (Array.isArray(results)) {
				const message = results.map(result => result.message).join('\r\n');

				throw Error(message);
			}

			const { timeout, concurrency, only, skip, todo } = options;

			this.specification.timeout = timeout;
			this.specification.options = {
				concurrency,
				only,
				skip,
				todo
			};
		}
	}

	before(setup: Function) {
		if (typeof setup !== 'function') {
			throw Error('setup must be of type function.');
		}

		this.specification.setup = setup;

		return new Given(this.specification);
	}

	given(message: string, establishContext: Function | {}) {
		return new Given(this.specification).given(message, establishContext);
	}
}

class Given {
	constructor(
		private specification: Specification
	) { }

	given(message: string, establishContext: Function | {}) {
		if (typeof message !== 'string') {
			throw Error('message must be of type string.');
		}

		this.specification.name = `given ${message}, `;
		this.specification.establishContext = (async () => establishContext instanceof Function
			? await establishContext()
			: establishContext)();

		return new When(this.specification);
	}
}

class When {
	constructor(
		private specification: Specification
	) { }

	when(message: string, observe: (context: any) => any) {
		if (typeof message !== 'string') {
			throw Error('message must be of type string.');
		}

		if (typeof observe !== 'function') {
			throw Error('observe must be of type function.');
		}

		this.specification.name += `when ${message}, `;
		this.specification.observe = observe;

		return new Should(this.specification);
	}
}

class Should {
	constructor(
		private specification: Specification
	) { }

	should(message: string, assert: (actual: any) => void) {
		this.specification.name += `should ${message}`;
		this.specification.assert = assert;

		return new ThenOrRun(this.specification);
	}

	shouldThrow(message: string, errorMessage: string) {		
		this.specification.name += `should ${message}`;
		this.specification.assert = ({ message }) => strictEqual(message, errorMessage);		

		return new ThenOrRun(this.specification);
	}
}

class ThenOrRun {
	constructor(
		private specification: Specification
	) { }

	then(teardown: Function) {
		if (typeof teardown !== 'function') {
			throw Error('teardown must be of type function.');
		}

		this.specification.teardown = teardown;

		return new ThenOrRun(this.specification);
	}

	async run(): Promise<void> {
		const {
			name,
			options,
			timeout,
			establishContext,
			setup,
			observe,
			assert,
			teardown
		} = this.specification;

		test(name, options, async () => {
			if (timeout !== undefined) {
				return new Promise(resolve => setTimeout(resolve, timeout));
			}

			const context = await establishContext;

			if (setup !== undefined) {
				await setup(context);
			}

			let actual;
			try {
				actual = await observe(context);
			} catch (err) {
				actual = err;
			}

			await assert(actual);

			if (teardown !== undefined) {
				await teardown(context);
			}
		});
	}
}