# ES6 - ByteSize Scripts - Array

## Get rid of duplicates

```js
const uniq = [...new Set([1, 1, 2, 3, 4, 4, 4, 5, 6, 7])];
```

## Non-destructive sorting

```ts
const arr = ["F", "E", "D", "B", "C", "A"];
const ascending = [...arr].sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
const descending = [...arr].sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));
```

## Create array of specific length

```ts
// Method 1
const arr1 = [...Array.from({ length: 5 }, (v, i) => i)];

// Method 2
const arr2 = [...Array(5).keys()];
```

## Random selection

```ts
const randomSelection = (arr) => arr[Math.floor(Math.random() * arr.length)];
```

## Truthy for All or Any

```ts
const all = (arr, fn = Boolean) => arr.every(fn);
// USAGE
// all([4, 2, 3], x => x > 1); // true
// all([1, 2, 3]); // true
const any = (arr, fn = Boolean) => arr.some(fn);
// USAGE
// any([0, 1, 2, 0], x => x >= 2); // true
// any([0, 0, 1, 0]); // true
```

## Cast value as an array

```ts
const castArray = (val) => (Array.isArray(val) ? val : [val]);

// usage
castArray("foo"); // ['foo']
castArray([1]); // [1]
```

## Count occurances in array

Counts the occurrences of a value in an array. Use `Array.prototype.reduce()` to increment a counter each time you encounter the specific value inside the array.

```js
const countOccurrences = (arr, val) =>
  arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

// usage
countOccurrences([1, 1, 2, 1, 2, 3], 1); // 3
```

## Filter out non-unique values

Use `Array.prototype.filter()` for an array containing only the unique values.

```js
const filterNonUnique = (arr) =>
  arr.filter((i) => arr.indexOf(i) === arr.lastIndexOf(i));

// usage
filterNonUnique([1, 2, 2, 3, 4, 4, 5]); // [1, 3, 5]
```

## Get list of elements that exists in both arrays

```ts
const similarity = (a, b) => a.filter((v) => b.includes(v));

// usage
// similarity([1, 2, 3], [1, 2, 4]); // [1, 2]
```

## Get all indices of value in array

```js
const indexOfAll = (arr, val) =>
  arr.reduce((acc, el, i) => (el === val ? [...acc, i] : acc), []);

// usage
indexOfAll([1, 2, 3, 1, 2, 3], 1); // [0, 3]
indexOfAll([1, 2, 3], 4); // []
```

## Get the last n elements

```ts
const takeRight = (arr, n = 1) => arr.slice(arr.length - n, arr.length);
// USAGE
// takeRight([1, 2, 3], 2); // [ 2, 3 ]
// takeRight([1, 2, 3]); // [3]
```

## Returns every element that exists in any of the two arrays once

Create a `Set` with all values of `a` and `b` and convert to an array.

```ts
const union = (a, b) => Array.from(new Set([...a, ...b]));

// usage
union([1, 2, 3], [4, 3, 2]); // [1, 2, 3, 4]
```

## Repeat array

```ts
// Method 1
export function makeRepeated<T>(arr: T[], repeats: number): T[] {
  return Array.from({ length: repeats }, () => arr).flat();
}

// Method 2:  Recursive Alternative (tail optimized)
export function makeRepeatedRecursive<T>(a: T[], n: number): T[] {
  return n ? a.concat(makeRepeatedRecursive(a, n - 1)) : [];
}

// Method 3
export function makeRepeatedWithConcat<T>(arr: T[], repeats: number) {
  return [].concat(...Array(repeats).fill(arr));
}

// Method 4
export function makeRepeatedWithFill<T>(a: T[], n: number) {
  return Array(n).fill(a).flat(1);
}

export function makeRepeatShallowObject<T extends object>(a: T, n: number) {
  return Array(n)
    .fill("")
    .map(() => ({ ...a }));
}
```

## Remove items from array

```ts
export function removeByIndex<T>(arr: Array<T>, index: number): Array<T> {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
  // return arr.slice(0, index).concat(arr.slice(index + 1, arr.length));
}

export function removeMultiple<T>(arr: Array<T>, values: T[]): Array<T> {
  return arr.filter((a) => !values.includes(a));
}
```
