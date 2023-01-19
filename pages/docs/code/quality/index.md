# Best Practices - Write Quality Javascript

A collection of tips on how to write good ES6 code.

---

## Prefer named exports with destructured import

> Favor named module exports to benefit from renaming refactoring and code autocomplete.

With the usage of named exports, the editor does better renaming: every time you change the original class name, all consumer modules also change the class name. In addition, you get the benefit of intellisense autocomplete during destructured import.

**Method A**

```js
// greeter.js
export class Grreter {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return `Hello, ${this.name}!`;
  }
}

// someOtherFile.js
import { Grreter as Greeter } from "./greeter";
import * as Greeter from "./greeter";
```

**Method B**

```js
const rendererTypes = {};

function getRendererTypes() {
  return rendererTypes;
}

function setRendererType(uid: string, type: string) {
  rendererTypes[uid] = type;
}

function unsetRendererType(uid: string) {
  delete rendererTypes[uid];
}

export { getRendererTypes, setRendererType, unsetRendererType };
```

**Method C**

```js
const valsCache = new WeakMap();
export function values(imm: Record<string, any>) {
  if (!valsCache.has(imm)) {
    valsCache.set(imm, Object.values(imm));
  }
  return valsCache.get(imm);
}

const keysCache = new WeakMap();
export function keys(imm: Record<string, any>) {
  if (!keysCache.has(imm)) {
    keysCache.set(imm, Object.keys(imm));
  }
  return keysCache.get(imm);
}

export const ObjectTypedKeys = <T>(obj: T) => {
  return Object.keys(obj) as (keyof T)[];
};
```

Below I also present a few more reasons:

- **Poor Discoverability**: Discoverability is very poor for default exports. You cannot explore a module with intellisense to see if it has a default export or not.

- **Autocomplete**: Irrespective of if you know about the exports, you even autocomplete at this `import {/*here*/} from "./foo";` cursor location. Gives your developers a bit of wrist relief.

- **Typo Protection:** You don't get typos like one dev doing `import Foo from "./foo";` and another doing `import foo from "./foo";`

- **TypeScript auto-import**: Auto import quickfix works better. You use `Foo` and auto import will write down `import { Foo } from "./foo";` cause its a well defined name exported from a module.

- **Re-exporting**: Re-exporting is common for the root index file in npm packages, and forces you to name the default export manually e.g. `export { default as Foo } from "./foo";` (with default) vs. `export * from "./foo"` (with named exports).

- **Dynamic Imports**: Default exports expose themselves badly named as default in dynamic imports e.g.

  ```js
  // Dymanic Imports
  const {HighCharts} = await import('https://code.highcharts.com/js/esmodules/masters/highcharts.src.js');

  HighCharts.chart('container', { ... }); // Notice `.default`
  ```

On a side note, a default export defets the Tree shaking practice under which dead code is removed making sure all unused modules are excluded from the output. It's not hard to prepare your package for tree shaking, the decisive factor is the module format you choose.

```js
// Here, both functions will be bundled, even if only one is ever used
export default {
  add(a, b) {
    return a + b;
  },
  subtract(a, b) {
    return a - b;
  },
};
```

## No work during import

> When imported, the module shouldn’t execute any heavy work. Rather, the consumer should decide when to perform runtime operations.

The module-level scope _defines_ functions, classes, light objects, variables and it shouldn't do heavy computation like parsing JSON, making HTTP requests, reading local storage and etc.

```js
// Module-level scope

// configuration.js
export const configuration = {
  // Bad
  data: JSON.parse(bigJsonString),
};

// aboutus.js
// Bad: parsing happens when the module is imported
import { configuration } from "configuration";

export function AboutUs() {
  return <p>{configuration.data.siteName}</p>;
}
```

At a higher level, the module-level scope’s role is to define the module components, import dependencies, and export public components: _dependencies resolution process_. Separate it from the _runtime_: parsing JSON, making requests, handling events.

Let’s refactor the `configuration` module to perform lazy parsing:

```js
// configuration.js
let parsedData = null;
export const configuration = {
  // Good
  get data() {
    if (parsedData === null) {
      parsedData = JSON.parse(bigJsonString);
    }
    return parsedData;
  },
};
```

Because `data` property is defined as a getter, the `bigJsonString` is parsed only when the consumer accesses `configuration.data`.

```js
// Good: JSON parsing doesn't happen when the module is imported
import { configuration } from "configuration";
export function AboutUs() {
  // JSON parsing happens now
  return <p>{configuration.data.companyDescription}</p>;
}
```

## Favor high cohesion modules

> Favor high cohesion modules whose functions, classes, variables are closely related and perform a common task. Refactor big low cohesion modules by splitting them into multiple high cohesion ones.

[Cohesion](<https://en.wikipedia.org/wiki/Cohesion_(computer_science)>) describes the degree to which the components inside a module belong together. The functions, classes or variables of a high cohesion module are closely related. They are focused on a single task.

The module `formatDate` is high cohesive because its functions are closely related and focus on date formatting:

```js
// formatDate.js
const MONTHS = [
  'January', 'February', 'March','April', 'May',
  'June', 'July', 'August', 'September', 'October',
  'November', 'December'
];
function ensureDateInstance(date) {
  if (typeof date === 'string') {
    return new Date(date);
  }
  return date;
}
export function formatDate(date) {
  date = ensureDateInstance(date);
  const monthName = MONTHS[date.getMonth())];
  return `${monthName} ${date.getDate()}, ${date.getFullYear()}`;
}
```

`formatDate()`, `ensureDateInstance()` and `MONTHS` are closely-related to each other.

Deleting either `MONTHS` or `ensureDateInstance()` would break `formatDate()`: that’s the sign of high cohesion.

### The problem of low cohesion modules

On the other side, there are low cohesion modules. Those that contain components that are unrelated to each other.

The following `utils` module has 3 functions that perform different tasks:

```js
// utils.js
import cookies from "cookies";
export function getRandomInRange(start, end) {
  return start + Math.floor((end - start) * Math.random());
}
export function pluralize(itemName, count) {
  return count > 1 ? `${itemName}s` : itemName;
}
export function cookieExists(cookieName) {
  const cookiesObject = cookie.parse(document.cookie);
  return cookieName in cookiesObject;
}
```

`getRandomInRange()`, `pluralize()` and `cookieExists()` perform different tasks: generate a random number, format a string and check the existence of a cookie. Deleting any of these functions doesn’t affect the functionality of the remaining ones: that’s the sign of low cohesion.

Because the low cohesion module focuses on multiple mostly unrelated tasks, it’s difficult to reason about such a module.

Plus, the low cohesion module forces the consumer to depend on modules that it doesn’t always need, which creates unneeded transitive dependencies.

For example, the component `ShoppingCartCount` imports `pluralize()` function from `utils` module:

```js
// ShoppingCartCount.jsx
import { pluralize } from "utils";
export function ShoppingCartCount({ count }) {
  return (
    <div>
      Shopping cart has {count} {pluralize("product", count)}
    </div>
  );
}
```

While `ShoppingCartCount` module uses only the `pluralize()` function out of the `utils` module, it has a transitive dependency on the `cookies` module (which is imported inside `utils`).

The good solution is to split the low cohesion module `utils` into several high cohesive ones: `utils/random`, `utils/stringFormat` and `utils/cookies`.

Now, if `ShoppingCart` module imports `utils/stringFormat`, it wouldn’t have a transitive dependency on `cookies`:

```js
// ShoppingCartCount.jsx
import { pluralize } from "utils/stringFormat";
export function ShoppingCartCount({ count }) {
  // ...
}
```

The best examples of high cohesion modules are Node built-in modules, like `fs`, `path`, `assert`.

## Arrow function name inference

> A good practice is to use function name inference to name the arrow functions.

The arrow function in JavaScript is _anonymous_: the `name` property of the function is an empty string `''`.

```js
((number) => number + 1).name; // => ''
```

The anonymous functions are marked as `anonymous` during a debug session or call stack analysis. Unfortunately, `anonymous` gives no clue about the code being executed.

Fortunately, the _function name inference_ (a feature of ES2015) can [detect](https://stackoverflow.com/a/58983095/1894471) the function name under certain conditions. The idea of name inference is that JavaScript can determine the arrow function name from its syntactic position: e.g. from the variable name that holds the function object.

Let’s see how function name inference works:

```js
const increaseNumber = (number) => number + 1;
increaseNumber.name; // => 'increaseNumber'
```

Because the variable `increaseNumber` holds the arrow function, JavaScript decides that `'increaseNumber'` could be a good name for that function. Thus the arrow function receives the name `'increaseNumber'`.

## Inline when possible

> When the function has one expression, a good practice is to inline the arrow function.

An inline function is a function that has only one expression. I like about arrow functions the ability to compose short inline functions.

```js
// Bad
const array = [1, 2, 3];
array.map((number) => {
  return number * 2;
});

// Good
const array = [1, 2, 3];
array.map((number) => number * 2);
```

## Fat arrow and comparison operators

> If the arrow function contains the operators `>`, `<`, `<=` and `>=`, a good practice is to wrap the expression into a pair of parentheses or deliberately use a longer arrow function form.

The comparison operators `>`, `<`, `<=` and `>=` look similar to the fat arrow `=>` (which defines the arrow function).

When these comparison operators are used in an inline arrow function, it creates some confusion.

Let’s define an arrow function that uses `<=` operator:

```js
const negativeToZero = (number) => (number <= 0 ? 0 : number);
```

The presence of both symbols `=>` and `<=` on the same line is misleading.

To distinguish clearly the fat arrow from the comparison operator, the first option is to wrap the expression into a pair of parentheses:

```js
const negativeToZero = (number) => (number <= 0 ? 0 : number);
```

The second option is to deliberately define the arrow function using a longer form:

```js
const negativeToZero = (number) => {
  return number <= 0 ? 0 : number;
};
```

These refactorings eliminate the confusion between fat arrow symbol and comparison operators.

## Be aware of excessive nesting

> A good practice is to avoid excessive nesting of arrow functions by extracting them into variables as separate functions or, if possible, embrace `async/await` syntax.

The arrow function syntax is short, which is good. But as a side effect, it could be cryptic when many arrow functions are nested.

Let’s consider the following scenario. When a button is clicked, a request to server starts. When the response is ready, the items are logged to console:

```js
myButton.addEventListener("click", () => {
  fetch("/items.json")
    .then((response) => response.json())
    .then((json) => {
      json.forEach((item) => {
        console.log(item.name);
      });
    });
});
```

The arrow functions are 3 levels nesting. It takes effort and time to understand what the code does.

To increase readability of nested functions, the first approach is to introduce variables that each holds an arrow function. The variable should describe concisely what the function does (see [arrow function name inference](https://dmitripavlutin.com/javascript-arrow-functions-best-practices/#1-arrow-function-name-inference) best practice).

```js
const readItemsJson = (json) => {
  json.forEach((item) => console.log(item.name));
};
const handleButtonClick = () => {
  fetch("/items.json")
    .then((response) => response.json())
    .then(readItemsJson);
};
myButton.addEventListener("click", handleButtonClick);
```

The refactoring extracts the arrow functions into variables `readItemsJson` and `handleButtonClick`. The level of nesting decreases from 3 to 2. Now, it’s easier to understand what the script does.

Even better you could refactor the entire function to use `async/await` syntax, which is a great way to solve the nesting of functions:

```js
const handleButtonClick = async () => {
  const response = await fetch("/items.json");
  const json = await response.json();
  json.forEach((item) => console.log(item.name));
};
myButton.addEventListener("click", handleButtonClick);
```

## Minimize the variable’s scope

The variables live within the [scope](https://dmitripavlutin.com/javascript-scope/) they’ve been created. A code block and a function body create a scope for `const` and `let` variables.

A good practice to increase the readability of variables is to keep them in the smallest scope. For example, the following function is an implementation of [binary search algorithm](https://en.wikipedia.org/wiki/Binary_search_algorithm):

```js
function binarySearch(array, search) {
  let middle;
  let middleItem;
  let left = 0;
  let right = array.length - 1;
  while (left <= right) {
    middle = Math.floor((left + right) / 2);
    middleItem = array[middle];
    if (middleItem === search) {
      return true;
    }
    if (middleItem < search) {
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }
  return false;
}
binarySearch([2, 5, 7, 9], 7); // => true
binarySearch([2, 5, 7, 9], 1); // => false
```

The `middle` and `middleItem` variables are declared at the beginning of the function body. Thus, these variables are available within the entire scope created by `binarySearch()` function body.

`middle` variable keeps the middle index of binary search, while `middleItem` variable keeps the middle item.

However, `middle` and `middleItem` variables are used only within the `while` cycle code block. So… why not declaring these variables directly within `while` code block?

```js
function binarySearch(array, search) {
  let left = 0;
  let right = array.length - 1;
  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const middleItem = array[middle];
    if (middleItem === search) {
      return true;
    }
    if (middleItem < search) {
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }
  return false;
}
```

Now, `middle` and `middleItem` variables exist solely in the scope that uses the variables. They have a minimal lifetime and lifespace, and it is easier to reason about their role.

## Close to use

I have the urge to declare all the variables at the top of the function body, especially if the function is big. Unfortunately, this practice has the downside of cluttering the intent variables I’m using in the function.

Try to declare the variable as close as possible to the usage place. This way, you won’t have to guess: _Hey, I see the variable declared here, but… where is it used?_

Let’s say you have a function that has lots of statements in its body. You declare and initialize a variable `result` at the beginning of the function, however use `result`only in `return` statement:

```js
function myBigFunction(param1, param2) {
  const result = otherFunction(param1);
  let something;
  /*
   * calculate something...
   */
  return something + result;
}
```

The problem is that `result` variable is declared at the beginning, but used only at the end. There isn’t any good reason to declare the variable at the beginning.

To increase the understanding of the function and the role of `result` variable, always try to keep the variable declaration as close as possible to the usage place.

Let’s improve the function by moving the `result` variable declaration right before the `return` statement:

```js
function myBigFunction(param1, param2) {
  let something;
  /*
   * calculate something...
   */
  const result = otherFunction(param1);
  return something + result;
}
```

Now, `result` variable has its right place within the function.

## Good naming means easy reading

You’ve probably heard a lot about good naming of variables, so I’ll keep it short and to the point.

From the multitude of rules of good variable naming, I distinguish 2 important ones.

The first one is simple: _use the [camel case](https://en.wikipedia.org/wiki/Camel_case) for the variable’s name_. And keep the camel case consistently applied to all variables.

```js
const message = "Hello";
const isLoading = true;
let count;
```

The one exception to the above rule is the magical literals: like numbers or strings that have special meaning. The variables holding magical literals are usually uppercased with an underscore between words, to distinguish them from regular variables:

```js
const SECONDS_IN_MINUTE = 60;
const GRAPHQL_URI = "http://site.com/graphql";
```

The second rule, which I consider the most important in variable naming: _the variable name should clearly, without ambiguity indicate what data holds the variable_.

Here are a few examples of good naming of variables:

```js
let message = "Hello";
let isLoading = true;
let count;
```

`message` name indicates that this variable contains some kind of message, which is most likely a string.

Same with `isLoading` — a boolean indicating whether loading is in progress.

`count` variable, without doubt, indicates a number type variable that holds some counting results.

Choose a variable name that without doubt, clearly, indicates its role.

## Introduce intermediate variables

I avoid commenting my code. I prefer writing self-documenting code that expresses the intent through good naming of variables, properties, functions, classes.

A good practice to write self-documenting code is to introduce intermediate variables. They’re great when dealing with long expressions.

Consider the expression:

```js
const sum = val1 * val2 + val3 / val4;
```

Let’s introduce 2 intermediate variables and boost the readability of the long expression:

```js
const multiplication = val1 * val2;
const division = val3 / val4;
const sum = multiplication + division;
```

Also, let’s look back to the binary search implementation algorithm:

```js
function binarySearch(array, search) {
  let left = 0;
  let right = array.length - 1;
  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const middleItem = array[middle];
    if (middleItem === search) {
      return true;
    }
    if (middleItem < search) {
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }
  return false;
}
```

Here `middleItem` is an intermediate variable holding the middle item. It is easier to use the intermediate variable `middleItem`, rather than directly using the item accessor `array[middle]`.

Compare with a version of the function where `middleItem` explanatory variable is missing:

```js
function binarySearch(array, search) {
  let left = 0;
  let right = array.length - 1;
  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    if (array[middle] === search) {
      return true;
    }
    if (array[middle] < search) {
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }
  return false;
}
```

This version, without the explanatory variable, is slightly more difficult to understand.

Use intermediate variables to _explain code with code_. Intermediate variables might add a few declaration statements, but the increased code readability worth it.

## Arrow function and `this` context

> Arrow functions shine best with anything that requires `this` to be bound to the context, and not the function itself.

The most important thing to remember about arrow functions is the way they handle the `this` keyword. In particular, the `this` keyword inside an arrow function doesn’t get rebound.

Unlike every other form of function, arrow functions do not have their own [execution context](https://blog.bitsrc.io/understanding-execution-context-and-execution-stack-in-javascript-1c9ea8642dd0). Practically, this means that both `this` and `arguments` are _inherited_ from their parent function.

If an extracted method is to work as a callback, you must specify a fixed `this`, otherwise it will be invoked as a function (and `this` will be `undefined` or the global object). For example:

```js
obj.on("anEvent", this.handleEvent.bind(this));
```

An alternative is to use an arrow function:

```js
obj.on("anEvent", (event) => this.handleEvent(event));
```

An arrow function is different from a normal function in only two ways:

- The following constructs are lexical: `arguments`, `super`, `this`, `new.target`
- It can’t be used as a constructor: Normal functions support `new` via the internal method `[[Construct]]` and the property `prototype`. Arrow functions have neither, which is why `new (() => {})` throws an error.

Apart from that, there are no observable differences between an arrow function and a normal function. For example, `typeof` and `instanceof` produce the same results:

```js
typeof (() => {}) // function
() => {} instanceof Function // true

typeof function () {} // 'function'
function () {} instanceof Function // true
```

## Wrap 3rd party libs into service

It is very common to use 3rd party libraries to instaniate connections to remote resources, such as a Database, and then share that object among different modules through out your code.

Below is a good example of how to structure a module which exposes specific methods, limiting the access to the 3rd party client as much as possible.

**Create the public methods**

```tsx
// indexSearch.service.ts
import {
  convertStringToFuzzy,
  generateSearchDocumentCommandArgs,
} from "@utils/commands";
import { IServiceWithContext, ISearchDocuments } from "./types/index.type";

type SearchDocumentsFunctionParams = ISearchDocuments & IServiceWithContext;
type SearchDocumentsFunction = (
  params: SearchDocumentsFunctionParams
) => Promise<unknown>;
export const searchDocuments: SearchDocumentsFunction = ({
  context,
  indexName,
  query,
  options,
  useFuzzy = false,
}) => {
  try {
    const conditionallyCheckedQuery = useFuzzy
      ? convertStringToFuzzy(query)
      : query;
    const { cmd, args } = generateSearchDocumentCommandArgs({
      indexName,
      query: conditionallyCheckedQuery,
      options,
    });
    return new Promise((resolve, reject) =>
      context.client.send_command(cmd, args, (err, info) => {
        if (err) return reject(err);
        resolve(info);
      })
    );
  } catch (error) {
    throw error;
  }
};
```

**Create the Class**

```tsx
// redisearchfuzzy.ts
import { RedisClient } from "redis";
import { searchDocuments as _searchDocuments } from "@features/index/indexSearch.service";
import { ISearchDocuments } from "@features/index/types/index.type";

export class RediSearchFuzzy {
  public readonly client;

  constructor(readonly redisClient: RedisClient) {
    // The connection object, passed into the constructor
    this.client = redisClient;
  }

  public searchDocuments({
    indexName,
    query,
    useFuzzy,
    options,
  }: ISearchDocuments): Promise<unknown> {
    // the connection object is passed as `context` to each individual function
    return _searchDocuments({
      context: this,
      indexName,
      query,
      useFuzzy,
      options,
    });
  }
  // ...more methods here
}
```

**Use the service**

```tsx
// index.ts
import { RediSearchFuzzy } from "redisearchfuzzy";
import Redis from "redis";
const myRedisClient = Redis.createClient();
const Fuzzy = new RediSearchFuzzy(myRedisClient);

// use it
const res = await Fuzzy.searchDocuments({
  indexName: "FAVORITE_LIST",
  query: "snake cobre venomus and capabl",
  useFuzzy: true,
  options: ["HIGHLIGHT"],
});
```

## Avoid too many arguments on functions

> Our functions should have the minimum number of arguments possible. As Uncle Bob (Robert C. Martin) said, three is the maximum arguments acceptable.

One of the problems that could emerge in our application if we have too many arguments is that the function is doing too many things, not respecting the [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single_responsibility_principle). Another potential risk is that we could pass the parameters in the wrong order when calling the function resulting in difficult to spot bugs.

In cases where we need to pass too many paramters we should think of turning them into its own object, using the [Parameter Object](https://refactoring.guru/introduce-parameter-object) pattern. We can aggregate arguments that are within same context, and then create a plain object containing those arguments.

```js
// Bad
function keeUserDetails( email, userName, country, city, street, phone )

// good
function keeUserDetails({ email, userName, country, city, street, phone })
```

Reducing the arguments' number in functions bring improvements in the code:

- It makes the code more readable
- Probably the functions are smaller and following the single responsibility principle
- Makes the code easier to test

## Default output data on methods

Default output payload on methods is a great way to make sure that you do not break the public contract and improve readability by having less `if-statements`. This method is especially useful on complex block of codes.

```js
// bad
export function getPaymentErrorMessage(errorReason) {
  const errorTitle =
    errorReason === "404" ? "Error404 Title" : "DefaultError Title";
  const errorDescription =
    errorReason === "404" ? "Error404 Description" : "DefaultError Description";

  return { errorTitle, errorDescription };
}

// good
export function getPaymentErrorMessage(errorReason) {
  // Define a default `output` payload
  const output = {
    errorTitle: "DefaultError Title",
    errorDescription: "DefaultError Description",
  };

  if (errorReason === "404") {
    output.errorTitle = "Error404 Title";
    output.errorDescription = "Error404 Description";
  }

  return { ...output };
}
```

## Fast indexing and caching

### Use `Set` for fast indexing by value

`Set` is a data structure that allows you to store unique values (without keys). If you try to add the same value multiple times, the `Set` will only add it once and ignore all other requests.

An array allows you to search a value by index in constant time `O(1)`; however, **if you don’t know the index**, searching a value would take you linear time `O(n)`. A `Set` doesn’t allow you to search value by index, but you can search by value in constant time `O(1)`. The `Set.add`, `Set.has` and `Set.delete` method both are `O(1)` in average.

The most common gotach with `Set` is that anything that is added and it is not a `number`, `string`, or `symbol` would be matched by reference.

```js
const events = new Set();
const event1 = { type: "concert", day: "Saturday" };
const event2 = { type: "book launch", day: "Wednesday" };
const event3 = { type: "conference", day: "Thursday" };
const event4 = { type: "meet up", day: "Monday" };
// Let's add each event to the set
events.add(event1);
events.add(event2);
events.add(event3);
events.add(event4);

for (let [key, value] of events.entries()) {
  console.log(item);
}

console.log(events.has(event2));
// Delete individual item
events.delete(event3);
// REMOVE ALL items in the set
events.clear();
```

### Use `Map` for caching

A Map is a data structure where a `key` is mapped to a `value`. It’s used for a fast lookup of values based on the given key. Only one key can map to a value (no key duplicates are possible).

A map shares some similarities with an array. In an array, the key/index is always a number, while the value in a Map can be anything! Both an Array and Map are very fast for getting values by key in constant time `O(1)` on average.

There’s a catch when you use **objects/arrays/classes** as keys on a `Map`. JavaScript will **match the key only if it has the same reference in memory**.

```js
// Array as a Map's key
const map = new Map();
map.set([1, 2, 3], "value");
console.log(map.get([1, 2, 3])); // undefined '

const map = new Map();
const arr = [1, 2, 3];
map.set(arr, "value");
console.log(map.get(arr)); // 'value'
```

The most common usage of Maps are:

- `Caching`: One everyday use case for key/value data structures is caching. If you cache results instead of hitting the database and other expensive services every time, your application will scale better. A common issue with cache you want to expire data you don’t often use to make room for hot data (LRU - Least Recently Used).
- `Indexing`: Index a collection for quick lookups.

## Tranducers for data processing

> Pipe methods with reduce in order to simulate functional programming

**Transducers** are higher order reducers: Reducer functions that take a reducer and return a new reducer. Rich Hickey describes transducers as process transformations, meaning that as opposed to simply changing the values flowing through transducers, transducers change the processes that act on those values.

```js
const performanceLogs = [
  {
    expression: 1,
    diffs: [
      {
        createdAt: "2017-10-15T07:45:00.000Z",
        createdTs: 1508053500,
        _id: "59e3130ff04f3899939e5fda",
      },
    ],
  },
  {
    expression: 2,
    diffs: [
      {
        createdAt: "2017-04-14T23:00:00.000Z",
        createdTs: 1492210800,
        _id: "59e3130ff04f3899939e5fdf",
      },
      {
        createdAt: "2017-10-15T07:45:00.000Z",
        createdTs: 1508053500,
        _id: "59e3130ff04f3899939e5fe7",
      },
    ],
  },
  {
    expression: 12,
    diffs: [
      {
        createdAt: "2017-01-10T00:00:00.000Z",
        createdTs: 1484006400,
        _id: "59e316d2f04f3899939e5ff1",
      },
    ],
  },
];

function debug(stage) {
  return (data) => {
    console.log(`[${stage}]`, JSON.stringify(data));
    return data;
  };
}

function reduceDates(performanceLogs) {
  return performanceLogs.reduce((memo, { diffs }) => {
    const output = diffs.map((d) => ({ iso: d.createdAt, ts: d.createdTs }));
    return [...memo, ...output];
  }, []);
}

function sortInDescending(dates) {
  return [...dates].sort((d1, d2) =>
    d1.ts > d2.ts ? -1 : d1.ts < d2.ts ? 1 : 0
  );
}

function constructFinalObject(sortedDates) {
  return {
    start: sortedDates[sortedDates.length - 1].iso,
    end: sortedDates[0].iso,
    totWeeks: 0,
  };
}

function calculateTotalWeeks(data) {
  const t2 = new Date(data.end).getTime();
  const t1 = new Date(data.start).getTime();

  const totalWeeks = parseInt((t2 - t1) / (24 * 3600 * 1000 * 7));
  return { ...data, totalWeeks };
}

const pipped =
  (...fns) =>
  (x) =>
    fns.reduce((v, f) => f(v), x);

const composed = pipped(
  reduceDates,
  debug("reduceDates"),
  sortInDescending,
  debug("sortInDescending"),
  constructFinalObject,
  debug("constructFinalObject"),
  calculateTotalWeeks
);

const { totalWeeks, end, start } = composed(performanceLogs);
console.log(`${start} - ${end} : ${totalWeeks} weeks`);
```

## Use delta functions on default data

Make use of delta functions to safely overwrite default values

```ts
import { Category } from "../../functions/category/types";
import { createUserMock } from "./user";

const user = createUserMock();

const categoryMock: Category = {
  createdBy: user,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  customFields: [],
  faq_link: "",
  faq_label: "",
  id: "0dxpntQjdKPSUTHgbB3e",
  name: "Customer Issue",
  userTypeRestriction: "employee",
  approvals: null,
};

export const createCategoryMock = (
  category: Partial<Category> = categoryMock
): Category => {
  return { ...categoryMock, ...category };
};
```

## Use getters on field to safely retrieve value

```ts
type Getter = (value: any) => string | undefined;

export const fieldValueGetter: Record<string, Getter> = {
  title: (value: string) => value,
  description: (value?: { text: string }) => value?.text,
  assignee: (value?: { displayName: string }) => value?.displayName,
  watchers: (value?: { displayName: string }[]) =>
    (value ?? []).map((u) => u.displayName).join(","),
  attachments: (value?: { fileName: string }[]) =>
    (value ?? []).map(({ fileName }) => fileName).join(", "),
  isPrivate: (value: boolean) => (value ? "Private" : "Public"),
};

export const fieldLabel = {
  title: "Summary",
  description: "Details",
  assignee: "Assignee",
  watchers: "Watchers",
  attachments: "Attachments",
  isPrivate: "Visibility",
};

export function labelOf(field: string) {
  return fieldLabel[field as keyof typeof fieldLabel];
}

export function valueOf(field: string, value: any): any {
  const getter = fieldValueGetter[field as keyof typeof fieldValueGetter];

  if (getter) {
    return getter(value);
  }

  return null;
}
```
