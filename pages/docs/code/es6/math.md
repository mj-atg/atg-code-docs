# ES6 - ByteSize Scripts - Math

## Check if a Number is positive or negative

```ts
const positive = 5;
const negative = -5;
const zero = 0;

Math.sign(positive); // 1
Math.sign(negative); // -1
Math.sign(zero); // 0

Math.sign(NaN); // NaN
Math.sign("hello"); // NaN
Math.sign(); //NaN
```
