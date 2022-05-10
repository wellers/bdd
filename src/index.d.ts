declare module '@wellers/bdd' {    
    export type BddSpecOptions = {
        timeout?: number;
        concurrency?: number;
        only?: boolean;
        skip?: boolean;
        todo?: boolean | string;
    };

    export type TestOptions = {
        concurrency?: number;
        only?: boolean;
        skip?: boolean;
        todo?: boolean | string;
    };

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
    };

    export class BddSpec {
        private specification;
        constructor(options?: BddSpecOptions);
        before(setup: Function): Given;
        given(message: string, establishContext: Function | {}): When;
    }

    class Given {
        private specification;
        constructor(specification: Specification);
        given(message: string, establishContext: Function | {}): When;
    }

    class When {
        private specification;
        constructor(specification: Specification);
        when(message: string, observe: (context: any) => any): Should;
    }

    class Should {
        private specification;
        constructor(specification: Specification);
        should(message: string, assert: (actual: any) => void): ThenOrRun;
        shouldThrow(errorMessage: string): ThenOrRun;
    }

    class ThenOrRun {
        private specification;
        constructor(specification: Specification);
        then(teardown: Function): ThenOrRun;
        run(): Promise<void>;
    }
}