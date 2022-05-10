// @ts-ignore
import test from 'node:test';
import Validator from 'fastest-validator';

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

type Spec = {
    name?: string;
	setup?: Function;
	establishContext?: EstablishContext;
	observe: Function;
	assert: Function;
	timeout?: number;
	teardown?: Function;
	options?: TestOptions | {};	
}

export class BddSpec {
	private spec: Spec = {
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

			this.spec.timeout = timeout;
			this.spec.options = {
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
        
        this.spec.setup = setup;

        return new Given(this.spec);
    }

    given(message: string, establishContext: Function | {}) {
        return new Given(this.spec).given(message, establishContext);
    }
}

class Given {
    private spec: Spec;

    constructor(spec: Spec) {
        this.spec = spec;
    }

    given(message: string, establishContext: Function | {}) {
        if (typeof message !== 'string') {
			throw Error('message must be of type string.');
		}

		this.spec.name = `given ${message}, `;
		this.spec.establishContext = (async () => establishContext instanceof Function
			? await establishContext()
			: establishContext)();

        return new When(this.spec);
    }
}

class When {
    private spec: Spec;

    constructor(spec: Spec) {
        this.spec = spec;
    }

    when(message: string, observe: (context: any) => any) {
        if (typeof message !== 'string') {
			throw Error('message must be of type string.');
		}

		if (typeof observe !== 'function') {
			throw Error('observe must be of type function.');
		}

		this.spec.name = `${this.spec.name}when ${message}, `;		
		this.spec.observe = observe;

        return new Should(this.spec);
    }
}

class Should {
    private spec: Spec;

    constructor(spec: Spec) {
        this.spec = spec;
    }

    should(message: string, assert: (actual: any) => void) {
        this.spec.name = `${this.spec.name}should ${message}`;
		this.spec.assert = assert;

        return new ThenOrRun(this.spec);
    }
}

class ThenOrRun {
    private spec: Spec;

    constructor(spec: Spec) {
        this.spec = spec;
    }

    then(teardown: Function) {
		if (typeof teardown !== 'function') {
			throw Error('teardown must be of type function.');
		}

		this.spec.teardown = teardown;

        return new ThenOrRun(this.spec);
    }

    async run(): Promise<void> {		
		test(this.spec.name, this.spec.options, async () => {
			if (this.spec.timeout !== undefined) {
				return new Promise(resolve => setTimeout(resolve, this.spec.timeout));
			}			
			
			const context = await this.spec.establishContext;

			if (this.spec.setup !== undefined) {
				await this.spec.setup(context);
			}
			
			const result = await this.spec.observe(context);

			await this.spec.assert(result);

			if (this.spec.teardown !== undefined) {
				await this.spec.teardown(context);
			}
		});		
	}
}