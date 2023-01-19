# Typescript

## Most used utility types

### Recursive Types

TypeScript allows for recursive types. Thus, we can define a type that references itself, and goes one level deeper for nested objects. TypeScript knows to stop the recursion if `Obj[Key]` returns a primitive or value type, or a union of primitive or value types.

```ts
type DeepReadonly<Obj> = {
  readonly [Key in Obj]: DeepReadonly<Obj[Key]>;
};

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

// Implementation
function genDefaults(obj: UserPreferences): DeepreadOnly<UserPreferences> {
  return Object.freeze({ ...obj });
}
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

### `Partial<T>`

👉 [Implementation](https://github.com/Microsoft/TypeScript/blob/4ff71ecb98ccbd882feb1738b0c6f1cc93c2ea66/src/lib/es5.d.ts#L1404)

`Partial<T>` returns a type that has the same properties as `T` but all of them are optional. This is mostly useful when `strictNullChecks` flag is enabled. `Partial` works on a single level - it doesn’t affect nested objects.

**UseCase**: A common use case for `Partial` is when you need to type a function that accpets deltas.

```ts
const defaultSettings: Settings = {
  /* ... */
};

function getSettings(custom: Partial<Settings>): Settings {
  return { ...defaultSettings, ...custom };
}
```

However, if `custom` has a property that has been **explicitly set to `undefined`**, the result will end up having this property `undefined` as well. Therefore, its type (Settings) will be a lie. A more type-safe version of `getSettings` would look like this:

```ts
function getSettings(custom: Partial<Settings>): Partial<Settings> {
  return { ...defaultSettings, ...custom };
}
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

### `Required<T>`

👉 [Implementation](https://github.com/Microsoft/TypeScript/blob/4ff71ecb98ccbd882feb1738b0c6f1cc93c2ea66/src/lib/es5.d.ts#L1411)

`Required<T>` removes optionality from T‘s properties. Again, you’ll most likely need it if you have `strictNullChecks` enabled (which you should 😉). Similarly to `Partial`, it works on the top level only. Here, we accept an object that has some optional properties. Then, we apply default values when a property is not present. The result is an object with no optional properties - `Required<Settings>`.

**UseCase**: A use case is when a type has optional members but portions of your code need all of them to be provided. You can have a config with optional members, but internally, you initialize them so you don’t have to handle null checking all your code:

```ts
// Optional members for consumers
type CircleConfig = { color?: string; radius?: number };

class Circle {
  // Required: Internally all members will always be present
  private config: Required<CircleConfig>;

  constructor(config: CircleConfig) {
    this.config = {
      color: config.color ?? "green",
      radius: config.radius ?? 0,
    };
  }

  draw() {
    // No null checking needed :)
    console.log(
      "Drawing a circle.",
      "Color:",
      this.config.color,
      "Radius:",
      this.config.radius
    );
  }
}
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

### `Readonly<T>`

👉 [Implementation](https://github.com/Microsoft/TypeScript/blob/4ff71ecb98ccbd882feb1738b0c6f1cc93c2ea66/src/lib/es5.d.ts#L1418)

`Readonly<T>` returns a type that has the same properties as T but they are all `readonly`. Once again, `Readonly` doesn’t affect nested objects.

**Use Case:** It is extremally useful for functional programming because it lets you ensure immutability at compile time. In addition, it is used in the common pattern of freezing an object to prevent edits:

```ts
function makeReadonly<T>(object: T): Readonly<T> {
  return Object.freeze({ ...object });
}

const editablePoint = { x: 0, y: 0 };
editablePoint.x = 2; // Success: allowed

const readonlyPoint = makeReadonly(editablePoint);
readonlyPoint.x = 3; // Error: readonly
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

### `Pick<T>`

👉 [Implementation](https://github.com/Microsoft/TypeScript/blob/4ff71ecb98ccbd882feb1738b0c6f1cc93c2ea66/src/lib/es5.d.ts#L1425)

`Pick` lets you create a type that only has selected properties of another type.

**Use Case**: This is useful for getting a subset of objects. A more common use case is to simply get the properties you are interested in

```ts
// All the CSSProperties
type CSSProperties = {
  color?: string;
  backgroundColor?: string;
  width?: number;
  height?: number;
  // ... lots more
};

function setSize(
  element: HTMLElement,
  // Usage: Just need the size properties
  size: Pick<CSSProperties, "width" | "height">
) {
  element.setAttribute("width", (size.width ?? 0) + "px");
  element.setAttribute("height", (size.height ?? 0) + "px");
}
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

### `Record<Keys, Value>`

👉 [Implementation](https://github.com/Microsoft/TypeScript/blob/4ff71ecb98ccbd882feb1738b0c6f1cc93c2ea66/src/lib/es5.d.ts#L1432)

Given a set of member names specified by `Keys`, this creates a type where each member is of type `Value`. When all the members of a type have the same `Value`, using `Record` can help your code read better because it’s immediately obvious that all members have the same Value type:

`Use Case`: When there is a large number of members, which members are known, then `Record` is even more useful.

```ts
type PageInfo = { id: string; title: string };

// Manually maintained type
type Pages = {
  home: PageInfo;
  services: PageInfo;
  about: PageInfo;
  contact: PageInfo;
};

// Index singature (Very Generic)
// Members are unknown
interface Pages {
  [key: string]: { id: string; title: string };
}

// Record
// Members are known
type Pages = Record<
  "home" | "services" | "about" | "contact",
  { id: string; title: string }
>;
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

### `Exclude<Type, ExcludedUnion>`

👉 [Implementation](https://github.com/Microsoft/TypeScript/blob/4ff71ecb98ccbd882feb1738b0c6f1cc93c2ea66/src/lib/es5.d.ts#L1439)

Exclude creates a new type by excluding all union members from `Type` that are assignable to `ExcludedUnion`:

**Use Case** : The most common use cases are: a) to exclude certain keys from a union and b) used to exlude other undesirable members (e.g., null and undefined) from a union:

```ts
type T0 = Exclude<"a" | "b" | "c", "a">; // 'b' | 'c'
type T1 = Exclude<"a" | "b" | "c", "a" | "b">; // 'c'
type T2 = Exclude<string | number | (() => void), Function>; // string | number

type Dimensions3D = "x" | "y" | "z";
type Point3D = Record<Dimensions3D, number>;

// Use exclude to create Point2D
type Dimensions2D = Exclude<Dimensions3D, "z">;
type Point2D = Record<Dimensions2D, number>;

// Undesirable Members
type StrOrNullOrUndefined = string | null | undefined;
type Str = Exclude<StrOrNullOrUndefined, null | undefined>;
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

### `Extract<T, ExtractedUnion>`

👉 [implementation](https://github.com/Microsoft/TypeScript/blob/4ff71ecb98ccbd882feb1738b0c6f1cc93c2ea66/src/lib/es5.d.ts#L1444)

This extracts `Extracted` types from `T`. You can view it as an opposite of `Exclude` because, instead of specifying which types you want to exclude (`Exclude`), you specify which types you want to keep/extract (`Extract`). Extract can be **thought of as an intersection of given types**.

**Use Case** : One use case of `Extract` is to find the common base of two types, like so:

```ts
type T0 = Extract<"a" | "b" | "c", "a">; // 'a'
type T1 = Extract<"a" | "b" | "c", "a" | "b">; // 'a' | 'b'
type T2 = Extract<string | number | (() => void), Function>; // () => void

// Thought as intersection of given types
type T3 = Extract<"a" | "b" | "c", "a" | "b" | "d">; // 'a' | 'b'

// Find common base of two types
type Person = { id: string; name: string; email: string };
type Animal = { id: string; name: string; species: string };

/** Use Extract to get the common keys */
type CommonKeys = Extract<keyof Person, keyof Animal>;

/**
 * Map over the keys to find the common structure
 * Same as `{ id: string, name: string }`
 **/
type Base = {
  [K in CommonKeys]: (Animal & Person)[K];
};
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

### `NonNullable<T>`

👉 [Implementation](https://github.com/Microsoft/TypeScript/blob/4ff71ecb98ccbd882feb1738b0c6f1cc93c2ea66/src/lib/es5.d.ts#L1449)

👉 [Example](https://codewithstyle.info/Deep-property-access-in-TypeScript/)

This excludes `null` and `undefined` from the type `T`. It has the same effect as `Exclude<T, null | undefined>`. It has no effect on a type that is already not nullable.

Here is the same example we saw with `Exclude`, but this time, let’s use `NonNullable`:

```ts
type StrOrNullOrUndefined = string | null | undefined;

// Same as `string`
// Same as `Exclude<StrOrNullOrUndefined, null | undefined>`
type Str = NonNullable<StrOrNullOrUndefined>;
```

Let’s write our own version of get. In the first iteration get will only accept a single level of nesting (ie. it will handle `get(c, 'company')` properly).

```ts
// ONE Level Deep
function get<T, P extends keyof NonNullable<T>>(
  obj: T | undefined,
  prop: P
): NonNullable<T>[P] | undefined {
  if (obj) {
    return (obj as NonNullable<T>)[prop];
  } else {
    return undefined;
  }
}

// THREE LEVELS DEEP
// get(c, 'company', 'address', 'city')
function get<T, P1 extends keyof NonNullable<T>>(
  obj: T,
  prop1: P1
): NonNullable<T>[P1] | undefined;

function get<
  T,
  P1 extends keyof NonNullable<T>,
  P2 extends keyof NonNullable<NonNullable<T>[P1]>
>(
  obj: T,
  prop1: P1,
  prop2: P2
): NonNullable<NonNullable<T>[P1]>[P2] | undefined;

function get<
  T,
  P1 extends keyof NonNullable<T>,
  P2 extends keyof NonNullable<NonNullable<T>[P1]>,
  P3 extends keyof NonNullable<NonNullable<NonNullable<T>[P1]>[P2]>
>(
  obj: T,
  prop1: P1,
  prop2: P2,
  prop3: P3
): NonNullable<NonNullable<NonNullable<T>[P1]>[P2]>[P3] | undefined;

// ...and so on...

function get(obj: any, ...props: string[]): any {
  return (
    obj &&
    props.reduce(
      (result, prop) => (result == null ? undefined : result[prop]),
      obj
    )
  );
}
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

### `Omit<T, Keys>`

Omits the `keys` specified by Keys from the type `T`.

**Use Case**: Omitting certain properties from an object before passing it on is a common pattern in JavaScript. The `Omit` type function offers a convenient way to annotate such transforms. It is, for example, conventional to remove PII (personally identifiable information such as email addresses and names) before logging in.

```ts
type Person = { id: string; hasConsent: boolean; name: string; email: string };
// Utility to remove PII from `Person`
function cleanPerson(person: Person): Omit<Person, "name" | "email"> {
  const { name, email, ...clean } = person;
  return clean;
}
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

### `Parameters<Function>`

👉 [implementation](https://github.com/Microsoft/TypeScript/blob/4ff71ecb98ccbd882feb1738b0c6f1cc93c2ea66/src/lib/es5.d.ts#L1454)

Given a `Function` type, this type returns the types of the function parameters as a tuple.

**Use Case**: A key use case for `Parameters` is the ability to capture the type of a function parameter so you can use it in your code to ensure type safety.

```ts
/***
 * Example 1:
 * Simple Usage
 *
 *
 */
const add = (a: number, b: number) => a + b;

// Same as `[a: number, b: number]`
type AddParameters = Parameters<typeof add>;

/***
 * Example 2:
 * Combine `Parameters` with TypeScript’s index lookup
 * types to get any individual parameter. such as
 * fetching the type of the first parameter
 *
 */

// Same as `number`
type A = Parameters<typeof add>[0];

// A save function in an external library
function save(person: { id: string; name: string; email: string }) {
  console.log("Saving", person);
}

// Ensure that ryan matches what is expected by `save`
const ryan: Parameters<typeof save>[0] = {
  id: "1337",
  name: "Ryan",
  email: "ryan@example.com",
};

/***
 * Example 3:
 * Typing wrapper functions without having to repeat the parameter list
 *
 *
 */
function fetchDataLogged(...params: Parameters<typeof fetchData>) {
  console.log("calling fetchData");
  fetchData(...params);
}
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

### `ConstructorParameters<ClassConstructor>`

👉 [implementation](https://github.com/Microsoft/TypeScript/blob/4ff71ecb98ccbd882feb1738b0c6f1cc93c2ea66/src/lib/es5.d.ts#L1459)

This is similar to the `Parameters` type we saw above. The only difference is that `ConstructorParameters` works on a class constructor. One caveat is that you have to remember about **typeof** in front of the class name.

```ts
class Point {
  private x: number;
  private y: number;
  constructor(initial: { x: number; y: number }) {
    this.x = initial.x;
    this.y = initial.y;
  }
}

// Same as `[initial: { x: number, y: number} ]`
type PointParameters = ConstructorParameters<typeof Point>;
```

The main use case for `ConstructorParamters` is also similar to `Parameters`. In the following example, we use it to ensure that our initial values are something that will be accepted by the `Point` class:

```ts
class Point {
  private x: number;
  private y: number;
  constructor(initial: { x: number; y: number }) {
    this.x = initial.x;
    this.y = initial.y;
  }
}

// Ensure that `center` matches what is expected by `Point` constructor
const center: ConstructorParameters<typeof Point>[0] = {
  x: 0,
  y: 0,
};
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

### `ReturnType<Function>`

👉 [implementation](https://github.com/Microsoft/TypeScript/blob/4ff71ecb98ccbd882feb1738b0c6f1cc93c2ea66/src/lib/es5.d.ts#L1464)

Given a `Function` type, this gets the type returned by the function.

**Use Case**: A possible use case is similar to the one we saw with Parameters. It allows you to get the return type of a function so you can use it to type other variables.

```ts
function createUser(name: string) {
  return {
    id: Math.random(),
    name: name,
  };
}

// Same as `{ id: number, name: string }`
type User = ReturnType<typeof createUser>;
```

You can also use `ReturnType` to ensure that the output of one function is the same as the input of another function. This is common in React where you have a custom hook that manages the state needed by a React component.

```ts
import React from "react";

// Custom hook
function useUser() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  return {
    name,
    setName,
    email,
    setEmail,
  };
}

// Custom component uses the return value of the hook
function User(props: ReturnType<typeof useUser>) {
  return (
    <>
      <div>Name: {props.name}</div>
      <div>Email: {props.email}</div>
    </>
  );
}
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

### `InstanceType<ClassConstructor>`

👉 [Implementation](https://github.com/Microsoft/TypeScript/blob/4ff71ecb98ccbd882feb1738b0c6f1cc93c2ea66/src/lib/es5.d.ts#L1469)

`InstanceType` is similar to `ReturnType` we saw above. The only difference is that `InstanceType` works on a class constructor.

In TypeScript, `class C` defines two things:

- a constructor function C for creating new instances of class C
- an interface for objects of class C - the instance type

```ts
class Point {
  x: number;
  y: number;
  constructor(initial: { x: number; y: number }) {
    this.x = initial.x;
    this.y = initial.y;
  }
}

// Same as `{x: number, y: number}`
type PointInstance = InstanceType<typeof Point>;

/***
 *
 * Implementation
 */

// You would NOT do this
const verbose: InstanceType<typeof Point> = new Point({ x: 0, y: 0 });

// Because you can do this
const simple: Point = new Point({ x: 0, y: 0 });
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

### `Nullable<T>`

A custom helper type `Nullable` that adds `undefined` in a uninion.

```ts
type Nullable<G> = G | undefined;

// Define Class
class Container {
  #element: Nullable<HTMLElement>;
  #prefs: UserPreferences;
  constructor(prefs: UserPreferences) {
    this.#prefs = prefs;
  }
  // We can set the element to an HTML element
  set element(value: Nullable<HTMLElement>) {
    this.#element = value;
  }

  get element(): Nullable<HTMLElement> {
    return this.#element;
  }
}

// Usage
const container = new Container(userPrefs);
container.element = document.createElement("video");
container.loadVideo(videos);
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]
