# ES6 - ByteSize Scripts - Number

## Convert number into array of digits

```js
const digitize = (n) => [...`${n}`].map((i) => parseInt(i));

// usage
digitize(123); // [1, 2, 3]
```
