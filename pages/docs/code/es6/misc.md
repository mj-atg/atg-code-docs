# ES6 - ByteSize Scripts - Mmiscellaneous

## Pretty JSON

```ts
const obj = { name: "Haider", age: 22, class: 12 };
console.log(JSON.stringify(obj, null, "\t"));
```

## Swap two variables without a third one

```ts
let x = 1;
let y = 2;

[x, y] = [y, x];
```

## Nullish coalescing for shorter If-Else conditional

```ts
let maybeSomething;

// LONG FORM
if (maybeSomething) console.log(maybeSomething);
else console.log("Nothing found");

//SHORTHAND
console.log(maybeSomething ?? "Nothing found");
```

## Optional chaining to prevent crashes

```ts
const student = { name: "Matt", age: 27, address: { state: "New York" } };

// LONG FORM
console.log(student && student.address && student.address.ZIPCode); // Doesn't exist - Returns undefined

// SHORTHAND
console.log(student?.address?.ZIPCode); // Doesn't exist - Returns undefined
```

## Use bitwise operator to check for `-1` value

Both `Array#indexOf` and `Array#findIndex` return -1 if an element is absent from an array.

```js
// ~-1 => 0
const index = array.indexOf(element);
if (~index) {
  // element exists
}

/* OR we can create a method returning True/False */
const foundIndex = (index) => Boolean(~index);

const numbers = [1, 3, 5, 7, 9];
console.log(foundIndex(numbers.indexOf(5))); // true
console.log(foundIndex(numbers.indexOf(8))); // false
```

## Use bitwise operator to check if number is even or odd

The use of the `&` operator in checking for set bits for a decimal number can be extended to check whether a given decimal number is even or odd. To achieve this, `1` is used as the bit mask (to determine whether the first bit or rightmost bit is set).

```js
const isOdd = (int) => (int & 1) === 1;
const isEven = (int) => (int & 1) === 0;

console.log(isOdd(34)); // false
console.log(isOdd(-63)); // true
console.log(isEven(-12)); // true
console.log(isEven(199)); // false
```
