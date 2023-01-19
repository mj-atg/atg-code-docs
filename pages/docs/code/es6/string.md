# ES6 - ByteSize Scripts - String

## Repeat a string

```ts
const canada = "🇨🇦";

// 1. Repeat method
canada.repeat(3);

// 2. Fill method
Array(3).fill(canada).join("");

// 3. Simply Join method
Array(3).join(canada);

// 4. From method
Array.from({ length: 3 }, () => "🇨🇦").join("");
```

## Capitalize the first letter

```ts
const capitalized = ([first, ...rest]) =>
  `${first.toUpperCase()}${rest.join("")}`;

const capitalizedMore = (str: string): string =>
  `${str[0].toUpperCase()}${str.split(1)}`;
```

## Generate random ID

It uses `Date.now()` which reduces the changes of duplication drastically.

```ts
export function randomID(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).substr(2, 6)
  ).toUpperCase();
}
```

## Split phrase into words

Converts a given string into an array of words.

```ts
const words = (str: string, pattern: Regexp = /[^a-zA-Z-]+/): string =>
  str.split(pattern).filter(Boolean);

// usage
words("I love javaScript!!"); // ["I", "love", "javaScript"]
words("python, javaScript & coffee"); // ["python", "javaScript", "coffee"]
```
