# Best Practices - Write Quality Javascript

## Iterative code

> Iteration refers to a situation where some statements are executed again and again using loops until some condition is satisfied.

### Synchronous iteration with `for-of`

This is a new loop in ES6 that replaces both `for-in` and `forEach()` and supports the new iteration protocol. Use it to loop over data structures that are iterable (Arrays, strings, Maps, Sets, etc) and has support for `break` and `continue`.

```ts
// [1] for-of + iterable data structure
const arr = ;
for (const value of ['a', 'b', '', 'never']) {
  if (value.length === 0) break;
  console.log(`${value}`)
}

// [2] for-of + constant iterations + desctructing
const iterable = Array.from({ length: 10}, (value,index) => index);
for (const [index, value] of iterable.entries() ) {
  // ......
}

// [3] combine `new Map() + destructing`
const map = new Map().set(false, 'no').set(true, 'yes');
for (const [k, v] of map) {
  console.log(`key = ${k}, value = ${v}`);
}
```

### Synchronous iteration with `nested loops`

Using nested loops its not necessairly a bad practice just the efficiency of such a practice might simply depend on the size of the data set. However, its truth that nested loops increase the time conpexity by `O(n * m)` where `n` is the length of the outer array and `m` the length of the inner array. As a rule of thumb, you should be keeping your nested loops at 2 levels maximum.

If you find yourself going more than 2 levels deep then you should be thinking about using a better data structure and change the nested loops for `Array#reduce`, `Array#map`, `Array#filter`, `Array#includes`, `Array#findIndexOf`, `Array#some` and `Array#every`.

```ts
loopOne: for (let i = 0; i <= 5; i++) {
  loopTwo: for (let j = 0; j <= 5; j++) {
    if (i === 3) continue loopOne;
    if (j === 3) break loopTwo;
    console.log(`i = ${i}, j = ${j}`);
  }
}
```

### Asynchronous, Sequential iteration with `for...of` and `reducer`

Those two methods used in cases where the order of execution matters.

```ts
async function printFiles() {
  const files = await getFilePaths();
  // Version 1
  for (const file of files) {
    const contents = await fs.readFile(file, "utf8");
    console.log(contents);
  }

  const contents = files.reduce(async (memo, cur, idx) => {
    /**
     * Make sure to `await memo` before await-ing anything else,
     * if you want to run it sequentally.
     */
    const accumulator = await memo;
    const content = await fs.readFile(file, "utf8");
    return Promise.resolve([...accumulator, content]);
  }, Promise.resolve([]));
}
```

### Asynchronous iteration with `for-await-of`

This is the async version `for-of` loop and primary used with iterables that return a promise but can also be used with sync iterables as it converts each iterated value via `Promise.resolve()` to a Promise, which it then awaits.

The `for-await-of` loop **run async operations in a sequence** meaning that each loop iteration will be delayed until the entire asynchronous operation completes.

```ts
const simulateDelay = (val, delay) =>
  new Promise((resolve) => setTimeout(() => resolve(val), delay));

class RandomNumberGenerator {
  [Symbol.asyncIterator]() {
    return {
      next: async () => {
        return simulateDelay({ value: Math.random() }, 1000); //return the value after 200ms of delay
      },
    };
  }
}

const rand = new RandomNumberGenerator();

(async () => {
  for await (const random of rand) {
    if (random < 0.1) break;
  }
})();
```

The `gotcha` in this case is that, the `for-await-of` is supposed to be used with asynchronous iterators, not with arrays of pre-existing promises.

```ts
// Do not use it like that.
for await (const res of items.map((e) => somethingAsync(e))) {
  // ...
}

// because it works the same as
const promises = [somethingAsync(items[0]), somethingAsync(items[1])];
for await (const res of promises) {
  // ...
}
```

The `somethingAsync` calls are happening immediately, all at once, before anything is awaited. Then, they are awaited one after another, which is definitely a problem if any one of them gets rejected: it will cause an unhandled promise rejection error. Using `Promise.all` is the only viable choice to deal with the array of promises:

```ts
for (const res of await Promise.all(promises)) {
  // ...
}
```

Here is a small example for reference

```ts
let i = 1;
function somethingAsync(time) {
  console.log("fired");
  return delay(time).then(() => Promise.resolve(i++));
}
const items = [1000, 2000, 3000, 4000];

function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

(async () => {
  console.time("first way");
  const promises = await Promise.all(items.map((e) => somethingAsync(e)));
  for (const res of promises) {
    console.log(res);
  }
  console.timeEnd("first way");

  i = 1; //reset counter
  console.time("second way");
  for await (const res of items.map((e) => somethingAsync(e))) {
    // do some calculations
    console.log(res);
  }
  console.timeEnd("second way");
})();
```

### Asynchronous, Parallel iteration with `map`

In cases we need to perform asynchronous loops in parallel we can combine `await + promise.all + map` to correctly perform tasks in parallel.

```ts
export async function printFiles() {
  const files = await getFilePaths();

  await Promise.all(
    files.map(async (file) => {
      const contents = await fs.readFile(file, "utf8");
      console.log(contents);
    })
  );
}
```

**Key Points 🎯**

1. If you want to execute `await` calls in series, use a `for-of` (or any loop without a callback).
2. Don't ever use `await` with `forEach`. Use a `for-of` (or any loop without a callback) instead.
3. Don't `await` inside `filter` and `reduce`. Always `await` an array of promises with `map`, then `filter` or `reduce` accordingly.
4. As soon as you create a promise it starts processing in the background. You don't need to start a promise. It fires right out of the gates and this can be easily achieved with the use of `Promise.all()`.
5. In your **eslint** add the `noAwaitInLoop:true` to avoid risking not taking full advantage of the parallelization benefits of `async/await`. Avoid to use `await` inside a `for...of` loop else each loop iteration will be delayed until the entire asynchronous operation completes.
