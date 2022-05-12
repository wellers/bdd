// @ts-ignore
import test from 'node:test';
import { strictEqual } from 'node:assert';
import Validator from 'fastest-validator';

interface BddSpecOptions {
	timeout?: number
	concurrency?: number,
	only?: boolean,
	skip?: boolean,
	todo?: boolean | string
}

type TestOptions = Omit<BddSpecOptions, 'timeout'>;

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
	options?: TestOptions;	
}

interface BeforeOrGiven {	
	before(setup: Function): Given;
	given(message: string, establishContext: Function | {}): When;
}

interface Given {
	given(message: string, establishContext: Function | {}): When;
}

interface When {
	when(message: string, observe: (context: any) => any): Should;
}

interface Should {
	should(message: string, assert: (actual: any) => void): ThenOrRun;
	shouldThrow(errorMessage: string): ThenOrRun;
}

interface ThenOrRun {
	then(teardown: Function): ThenOrRun;
	run(): Promise<void>;
}

class BddSpecification implements BeforeOrGiven, Given, When, Should, ThenOrRun {	
	private constructor(
		private specification: Specification
	) {	}

	static create(options?: BddSpecOptions): BeforeOrGiven {
		const specification: Specification = {
			name: '',
			establishContext: {},
			observe: () => { throw Error('observe must be set') },
			assert: () => { throw Error('assert must be set') }		
		};
		
		if (options) {
			const results = validateOptions(options);

			if (Array.isArray(results)) {
				const message = results.map(result => result.message).join('\r\n');

				throw Error(message);
			}

			const { timeout } = options;
			delete options.timeout;

			specification.timeout = timeout;
			specification.options = <TestOptions>options;
		}

		return new BddSpecification(specification);
	}

	before(setup: Function): Given {
		if (typeof setup !== 'function') {
			throw Error('setup must be of type function.');
		}

		this.specification.setup = setup;		

		return this;
	}	

	given(message: string, establishContext: Function | {}): When {
		if (typeof message !== 'string') {
			throw Error('message must be of type string.');
		}

		this.specification.name = `given ${message}, `;
		this.specification.establishContext = (async () => establishContext instanceof Function
			? await establishContext()
			: establishContext
		)();

		return this;
	}

	when(message: string, observe: (context: any) => any): Should {
		if (typeof message !== 'string') {
			throw Error('message must be of type string.');
		}

		if (typeof observe !== 'function') {
			throw Error('observe must be of type function.');
		}

		this.specification.name += `when ${message}, `;
		this.specification.observe = observe;

		return this;
	}

	should(message: string, assert: (actual: any) => void) : ThenOrRun {
		if (typeof message !== 'string') {
			throw Error('message must be of type string.');
		}

		if (typeof assert !== 'function') {
			throw Error('assert must be of type function.');
		}

		this.specification.name += `should ${message}`;
		this.specification.assert = assert;

		return this;
	}

	shouldThrow(errorMessage: string) : ThenOrRun {		
		this.specification.name += `should throw ${errorMessage}`;
		this.specification.assert = ({ message }) => strictEqual(message, errorMessage);		

		return this;
	}

	then(teardown: Function): ThenOrRun {
		if (typeof teardown !== 'function') {
			throw Error('teardown must be of type function.');
		}

		this.specification.teardown = teardown;

		return this;
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

const BddSpec = (options?: BddSpecOptions): BeforeOrGiven => BddSpecification.create(options);

export { BddSpec, BddSpecOptions }