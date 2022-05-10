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
    type Spec = {
        name?: string;
        setup?: Function;
        establishContext?: EstablishContext;
        observe: Function;
        assert: Function;
        timeout?: number;
        teardown?: Function;
        options?: TestOptions | {};
    };
    export class BddSpec {
        private spec;
        constructor(options?: BddSpecOptions);
        before(setup: Function): Given;
        given(message: string, establishContext: Function | {}): When;
    }
    class Given {
        private spec;
        constructor(spec: Spec);
        given(message: string, establishContext: Function | {}): When;
    }
    class When {
        private spec;
        constructor(spec: Spec);
        when(message: string, observe: (context: any) => any): Should;
    }
    class Should {
        private spec;
        constructor(spec: Spec);
        should(message: string, assert: (actual: any) => void): ThenOrRun;
    }
    class ThenOrRun {
        private spec;
        constructor(spec: Spec);
        then(teardown: Function): ThenOrRun;
        run(): Promise<void>;
    }
}