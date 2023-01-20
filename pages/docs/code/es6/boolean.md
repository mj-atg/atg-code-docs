# ES6 - ByteSize Scripts - Boolean

## Check if NaN is equal to NaN

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

## Check if the object is a function

```ts
/**
 * Returns true if the object is a function.
 * @param value The value to check
 */
export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === "function";
}
```

## Identify if an input is Iterable

```ts
export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === "function";
}

export function isIterable(input: any): input is Iterable<any> {
  return isFunction(input?.[Symbol_iterator]);
}
```

## Cast Any Value to a Boolean

```ts
!!true; // true
!!2; // true
!![]; // true
!!"Test"; // true

!!false; // false
!!0; // false
!!"";
```

## Compress multiple conditions

```ts
const num = 1;

// LONGER FORM
if (num == 1 || num == 2 || num == 3) {
  console.log("Yay");
}

// SHORTHAND
if ([1, 2, 3].includes(num)) console.log("Yay");
```
