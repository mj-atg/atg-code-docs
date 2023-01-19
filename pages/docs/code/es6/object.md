# ES6 - ByteSize Scripts - Object

## Check if NaN is equal to NaN `@boolean,@object`

```ts
const item = NaN;

// Huh?? this doesn't work
item === NaN; // false

// Yay, this works!
Object.is(item, NaN); // true
```

There are two common cases for checking `NaN` equality :

```ts

/**
 *
 * Ex 1: When trying to do a mathematical calculation
 *
*/

const isDivisible = 5 / "Some String";
isDivisible // returns NaN

isDivisible === NaN // returns false

if (isDivisible === NaN) // ❌ so this statement would never work since this will always return false because NaN is never equal to NaN


/**
 *
 * Ex 2: When trying to extract a number from a string
 *
*/

const hasNumber = parseInt("Hello");
hasNumber // returns NaN

hasNumber === NaN // returns false

if(hasNumber === NaN) // ❌ again, you won’t be able to use this logic because this will always return false
```

## Collect Object’s Values into an Array

```ts
const info = { name: "Matt", country: "Finland", age: 35 };
const data = Object.values(info);
```

## Omit property from object

```ts
export const omitProperty = (prop: string, { [prop]: _, ...rest }) => rest;

// Usage
// omitProperty('b', {a:1, b:2});
```
