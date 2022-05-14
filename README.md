## Overview

Node.js v18 introduced the experimental Test Runner module under `node:test`.

This module provides functions for writing fluent BDD-style specifications with Node.js Test Runner module.

```js
import { strictEqual } from "assert";
import { BddSpec } from "@wellers/bdd";

// function to test
function addOne(num) {
	if (typeof num !== 'number') {
		throw new Error('num must be of type number.');
	}

	return num + 1;
}

BddSpec()
  .given('num is a string', 'Hello, World')
  .when('addOne is called with num', num => addOne(num))	
  .shouldThrow('num must be of type number.')
  .run();

BddSpec()
  .given('num is 1', 1)
  .when('addOne is called with num', num => addOne(num))
  .should('return 2', actual => strictEqual(actual, 2))
  .run();

BddSpec()
  .given('num is 2', 2)
  .when('addOne is called with num', num => addOne(num))
  .should('return 3', actual => strictEqual(actual, 3))
  .run();

BddSpec()
  .given('num is 3', 3)
  .when('addOne is called with num', num => addOne(num))
  .should('return 4', actual => strictEqual(actual, 4))
  .run();
```

## API

**`BddSpec(options)`** - Initialise a new BDD Specification.

* options - `object` - Optional BDD Specification options.
    * timeout - `number` - Timeout in ms for this specific test.
    * concurrency - `number` - The number of tests that can be run at the same time. Default: 1.
    * only - `boolean` - Only execute this test. `--test-only` command-line option is required when running tests to use this option.
    * skip - `boolean` - Skip this test.
    * todo - `boolean`  or `string` - If truthy, the test marked as TODO. If a string is provided, that string is displayed in the test results as the reason why the test is TODO.  

<br>

**`spec.before(setup)`** - Optional set-up function.
   * setup - `function` or `async function` - Execute a function prior to execution of the test.

<br>

**`spec.given(message, establishContext)`** - Set-up `context` for test.
   * message - `string` - Message that is prefixed with "given ".
   * establishContext - `object`, `function` or `async function` - Sets the `context` for the test.

<br>

**`spec.when(message, observe)`** - Set-up what to observe.
   * message - `string` - Message that is prefixed with "when ".
   * observe - `function(context)` or `async function(context)` - The observation. Returns `actual`. Errors are caught and returned as `actual`.

<br>

**`spec.should(message, assert)`** - Assert the result of the observation.
   * message - `string` - Message that is prefixed with "should ".
   * assert - `function(actual)` or `async function(actual)` - Assertion to perform on the return value of the observation.

<br>

**`spec.shouldThrow(errorMessage)`** - Assert the result of the observation throws an Error.    
   * errorMessage - `string` - Optional error message that should be thrown by the observation.

<br>

**`spec.then(teardown)`** - Optional teardown function.
   * teardown - `function` or `async function` -  Execute a function after the execution of the test.

<br>

**`spec.run()`** - Execute the test.