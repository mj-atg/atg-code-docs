# Best Practices - Write Quality Javascript

## The art of naming variables

### Name the boolean a yes/no "question" in the affirmative

As we know, booleans have the ability to be one of two values: `true` or `false`. I believe that the variable name should be a question and the value should answer that question. More importantly, I'm not fond of asking negating questions because double negatives can cause confusion. Using prefixes like `is`, `has`, and `can` will help the reader infer the type of the variable.

```js
// bad
const active = true;
const disabled = false;

// bad - negating questions
const isInactive = false;
const isDisabled = true;

// preferred
const isActive = true;
const isEnabled = false;
```

What about predicate functions (functions that return booleans)? It can become tricky to name the value, after naming the function. In this case, I like to prefix my predicates with either check or get.

```js
const user = { fruits: ["apple"] };

const checkHasFruit = (user, fruitName) => user.fruits.includes(fruitName);

const hasFruit = checkHasFruit(user, "apple");
```

### Use plural nouns for array names

Arrays are a data structure that hold multiple values inside of a single variable. A lot of the time, these values will be of the same type. The variable name is an aggregate of what the array holds.

```js
// not quite
const array = ["Nigeria", "Mexico", "France", "Ethiopia"];

// better
const foreignCountries = ["Nigeria", "Mexico", "France", "Ethiopia"];
```

### Use a verb and object to name functions

> _If a function exists in your program, it has a purpose; otherwise, take it out! If it has a purpose, it has a natural name that describes that purpose. If it has a name, you the code author should include that name in the code, so that the reader does not have to infer that name from reading and mentally executing that function's code. - Kyle Simpson_

When I hear function, I think action. Functions are invoked to do something: update a value, return a value, modify a data structure, etc. The verb-object syntax is a great way to name functions.

```js
// bad
function update(currentUsername, updatedUsername) {}

// good
function fetchAccountDetails(accountNumber) {}
function updateUsername(currentUsername, updatedUsername) {}
```

### Not affraid over making names too long

Variable names need not to be one letter, and in a lot of cases one word is even too short. Descriptive variable names ease the impact when someone sees the code for the first time. When developers write shorter variable names, they tend to write a lot more comments about how the code works. Comments should explain why and your variable names tell us how.

### Keep the reader in the thoughts

Unless you never plan to share your code, it will be read by someone else other than yourself. You shouldn't be the only person to understand it. From a black-box standpoint, if I never look at the inner workings of a function, I should have a general idea of what is happening.
