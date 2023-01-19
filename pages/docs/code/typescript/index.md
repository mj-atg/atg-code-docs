# Typescript on a daily basis

✨ Common operations and practises in typescript for daily coding

---

## Use _declare_ to type function heads

We use `declare` keyword to create _ambient content_ under which we can define variables and function heads without concrete implementation. Taking into consideration that ambient content can be exported, its a great way to think about types and the function’s interface before going into the details. We can remove the `declare` keyword later and make sure we get a proper implementation.

```ts
// Typescript will not transpile the function into javascript cause of `declare`
export declare function search(query: string, tags?: string[]): string;

// We play with types not concrete implementations

declare const qry: string;
declare const tagList: string[];

search(qry); // Pass
searchFn(qry, tagList); // Pass
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

## Use _any_ explicity, if it is needed

First make sure that you set the compiler flag `noImplicitAny:true` so you do not have `any` somewhere in your code you don't expect it to be.

TypeScript **can’t infer types** from `any` because its a wildcard, and hence allows you to pass anything and return everything, even if we explicity type the return value.

Be certain that you want to use `any` explicitly as a type annotation. And **if you want to enter through the backdoor to JavaScript flexibility, be very intentional through a type cast**:

```ts
// We KNOW exactly what we are doing
(theObject as any).firstLetter.toUppercase();
```

The `any` is useful if you don't know which types to expect but in this case we can use type guards to narrow down to specific type. For example:

```ts
declare const deliveryAddresses: string[];
deliveryAddresses.push("421 Smashing Hill, 90210");

function selectDeliveryAddress(addressOrIndex: any) {
  // `Type guard` narrow it down into a number !
  if (typeof addressOrIndex === "number") {
    // `Conrol Flow` analysis provides the right type for the next steps.
    return deliveryAddresses[addressOrIndex];
  }
  // Outside the `if-statment` the `addressOrIndex` is still type `any`.
  // so everything is allowed in this line
  return addressOrIndex;
}
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

## Use _unknown_ with type guards instead of _any_

TypeScript has a partner to any: `unknown`. The `unknown` is also compatible with every type in TypeScript, so it’s also a top type but requires much more caution and concern. Where we are allowed to do everything with `any`, **we aren’t allowed to do anything** with `unknown`. Likewise, no operations are permitted on an `unknown` without first asserting or narrowing to a more specific type.

```ts
declare const deliveryAddresses: string[];
deliveryAddresses.push("421 Smashing Hill, 90210"); // ok

function selectDeliveryAddress(addressOrIndex: unknown): string {
  // `Type guard` narrow it down into a number !
  if (typeof addressOrIndex === "number") {
    return deliveryAddresses[addressOrIndex];
    // `Type guard` narrow it down into a string !
  } else if (typeof addressOrIndex === "string") {
    return addressOrIndex;
  }
  // The `addressOrIndex` can not be used outside the if-else
  return "";
}

selectDeliveryAddress("yes please");
```

With `unknown` we need to make extensive use of type guards in order to narrow types down because typescript won't allow us to work with the assigned parameter.

```ts
let vAny: any = 10; // We can assign anything to any
let vUnknown: unknown = 10; // We can assign anything to unknown just like any

let s1: string = vAny; // Any is assignable to anything
let s2: string = vUnknown; // Boom! we can't assign vUnknown to any other type (without an explicit assertion)

vAny.method(); // Ok; anything goes with any
vUnknown.method(); // Boom! we don't know anything about this variable
```

**The suggested usage is:**

There are often times where we want to describe the least-capable type in TypeScript. This is useful for APIs that want to signal “this can be any value, so you must perform some type of checking before you use it”. This forces users to safely introspect returned values.

[ Back To [🔝](#typescript-on-a-daily-basis) ]

## The structural contract needs to be fullfilled

TypeScript is a structural type system. This means that as long as the defined properties of a type are available in an object, the structural contract is fulfilled. In other words, all we should care about is that **all properties that we need are available** thus the excess property check won't fail when we assign an object into a variable. However, the excess property check will fail if we have a direct value assignment after a type annotation because typescript thinks that we may make a mistake.

```ts
export type Article = { title: string; price: number };

const movBackup = { title: "Helvetica", price: 6.66, vat: 0.19 };

// Totally OK!
// The extraneous – or excess – rating property is swept under the rug
const movie: Article = movBackup;

// Totally NOT OK !
// The Excess Property Check Fails
let movie: Article = {
  title: "Helvetica",
  price: 6.66,
  vat: 0.19, // Boom ! Excess Property Check fails
};
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

## Keep types maintenance into the minimum

With the `typeof` operator, we were able to do type checking - type guard - during runtime in Javascript's world. But in TypeScript’s type system, the `typeof` operator **takes any object or function, or constant and extracts the shape of it**. On top of it, the type gets updated automatically when the object gets updated. The `typeof` works on real javacript objects/parameters, not on types.

```ts
const defaultOrder = {
  customer: { name: "Fritz Furball", dateOfBirth: new Date(2006, 9, 1) },
  articles: [
    { price: 1200.5, vat: 0.2, title: "Macbook Air Refurbished - 2013" },
  ],
};

// Typescript did all the heavy lifting by "assuming" the types for ALL onject's properties, even the nested ones.
// Btw, the moment you update your `defaultOrder` object, the type `Order` gets updated as well!
// Very usefull when you want to keep `Fixtures` in sync with Types.
type Order = typeof defaultOrder;

declare function checkOrders(orders: Order[]): boolean;
```

Another important usage of `typeof` is for passing the shape of some data into a type utility and produce the final type on-the-fly:

```ts
const Direction = { Up: 0, Down: 1, Left: 2, Right: 3 } as const;

// Get to the const values of any object
type Values<T> = T[keyof T];

// Values<typeof Direction> yields 0 | 1 | 2 | 3
// because we cast "Direction" with `as const`
declare function move(direction: Values<typeof Direction>): void;

// Values<typeof Direction>
// Equals to
type ValuesTypeofDirection = {
  readonly Up: 0;
  readonly Down: 1;
  readonly Left: 2;
  readonly Right: 3;
}["Up" | "Down" | "Left" | "Right"];
```

A similar type guard is the `instanceof` which allow us to identify the object type and hence use its properties through a control flow:

```ts
function displaySearch(
  inputId: string,
  outputId: string,
  search: SearchFn
): void {
  document.getElementById(inputId)?.addEventListener("change", function () {
    // This is of type HTMLElement because
    // getElementById says so
    this.parentElement?.classList.add("active");

    if (this instanceof HTMLInputElement) {
      // From here on, this is
      // of type HTMLInputElement
      const searchTerm = this.value; // Works!
      search(searchTerm).then((results) => {
        // ....
      });
    }
  });
}
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

## Extend global objects with interfaces

**Declaration merging** for interfaces means we can declare an interface at separate positions in the same file, with different properties, and TypeScript combines all declarations and merges them into one. There is a special use case where declaration merging makes a lot of sense and this is in situations where variables, functions, or classes from somewhere outside become available globally.

```ts
declare namespace NodeJS {
  interface Global {
    isDevelopment: boolean;
  }
}
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

## Prefer literal `union types` over `enums`

A simple union type gives you something that works similarly to `enum` and is much more aligned with TypeScript.

```ts
type Status = "Admin" | "User" | "Moderator";

declare function closeThread(threadId: number, status: Status): void;

closeThread(10, "Admin"); // All good 😄
```

if you want to write your code enum-style, with an object and a named identifier, a `const` object with a Values helper type might just give you the desired behaviour and is much closer to JavaScript:

```ts
// Get to the const values of any object
type Values<T> = T[keyof T];

// And now for the Status enum
const Status = {
  Admin: "Admin",
  User: "User",
  Moderator: "Moderator",
} as const;

// Values<typeof Status> yields "Admin" | "User" | "Moderator"
declare function closeThread(
  threadId: number,
  status: Values<typeof Status>
): void;

closeThread(10, "Admin"); // All good!
closeThread(10, Status.User); // enum style
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

## Typing function heads

Function shapes work a little differently from objects: structure and shape aren’t defined by the names of arguments as in objects, but by the order of arguments. This means we can rename our parameters and still retain types or even drop the arguments entirely if we don't have any use for them.

```ts
type Result = { title: string; url: string; abstract: string };
// Delcare a function head
declare function search(query: string, tags?: string[]): Promise<Result[]>;

// Proceed with actual implementation
function search(query: string, tags?: string[]): Promise<Result[]> {
  let queryString = `?query=${query}`;
  if (tags && tags.length) {
    queryString += `&tags=${tags.join()}`;
  }

  return fetch(`/search${queryString}`).then((ret) => ret.json());
}

// Get the function type by using `typeof`
type SearchFn = typeof search;
// the above gets transpilled to the following
// type SearchFn = (query: string, tags?: string[] | undefined) => Promise<Result[]>

// Anonymous Function satisfying the type contract from `SearchFn`
const testSearch: SearchFn = (term): Promise<Result[]> => {
  // term is a string (as defined by query)
  // options is an optional string array
  return Promise.resolve([
    {
      title: `The ${term} test book`,
      url: `/${term}-design-patterns`,
      abstract: `A practical book on ${term}`,
    },
  ]);
};
```

On a side note, in the `search` example the type of `response.json’`s return value is `Promise<any>`. And rightfully so! How should TypeScript know what you get once you call your back end? What we want is actually what we get: a promise of results. Or, in types: `Promise<Result[]>`. The way to achieve correct typing in the return value is **to be explicit** and this can be achieved in two ways: A) Be explicit, through a **type casting** on the returned value or B) define the function's return value **in the function head**. Both versions work the same.

```ts
// (1) Be explicit, through a TYPE CAST on the returned value
function search(query: string, tags?: string[]) {
  //...
  return fetch(`/search${qryString}`).then(
    (resp) => resp.json() as Promise<Result[]>
  );
}

// (2) Be explicit, by define return value in the function head.
function search(query: string, tags?: string[]): Promise<Result[]> {
  //...
  return fetch(`/search${qryString}`).then((resp) => resp.json());
}
```

There will be times where, you may need to establish a public API and define what goes in and what goes out of a function withouth thinking the implementation in first place. In such cases, typescript can be very handy, here is an example:

```ts
// Think inputs and outputs without implementation
declare function getListItem(list: string[], id: string): string | undefined;
// Create a named function type by extracting its shape with `typeof`
type GetListItemFn = typeof getListItem;
// Implement the function that performs the search while adhering to the stuctural contract
const searchList: GetListItemFn = (list, id) => list.find((str) => str === id);
// Call it
const item = searchList([], "js");
if (item) console.log(item);
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

## Interesection, Union, Value Types and Discriminated unions

`Intersection Types`: It uses the `&` operator as `and` as the way to combine two or more types into one, much like extending from an object type. This method allows to define base schemas with mandatory properties and then intersect with the optional ones.

```ts
type Talk = {
  title: string;
  abstract: string;
  speaker: string;
};

type TechEventBase = {
  title: string;
  description: string;
  data: Date;
  capacity: number;
  rsvp: number;
  kind: string;
};

type Conference = TechEventBase & {
  location: string;
  price: number;
  talks: Talk[];
  kind: "conference"; // value type
};

type Meetup = TechEventBase & {
  location: string;
  price: string;
  talks: Talk[];
  kind: "meetup"; // value type
};

type Webinar = TechEventBase & {
  url: string;
  price?: number;
  talks: Talk;
  kind: "webinar"; // value type
};

// Intersection + Discrimination Union
type Hackathon = TechEventBase & {
  url: string;
  price?: number;
  talks: Talk[];
  kind: "hackathon"; // value type
};
```

`Union Types`: It uses the pipe `|` operator as `or`, as a way to extract the lowest common denominator. This category is widely used in cases where we do not know exactly what types we get but only that they belong to a specific set of types. Often we _combine the union types with control flow for narrowing down types with type guards_.

```ts
type TechEvent = Webinar | Conference | Meetup | Hackathon;

function printEvent(event: TechEvent) {
  // Its either array or object. So i will have to use control flow
  if (Array.isArray(event.talks)) {
    event.talks.forEach((talk) => console.log(talk.title));
  } else {
    console.log(talk.title);
  }

  // Its optional. So i have to use control flow
  if (event.price) {
    if (typeof event.price === "number")
      console.log("Price in EUR: ", event.price);
    else console.log("It is free!");
  }
}
```

`Value Type`: It is a constant type where the value can not change. Thus, types casted with `as const` considered as value types. In addition, a property defined with `const` typescript identifies it as value type whereas a property defined with `let` is considered as string because value can change.

```ts
let conference = "conference"; // Type is string, because the value can change
const conf = "conference"; // Type is 'conference', because the value can't  change anymore.

function neverError(
  msg: string,
  token: never // should never happen
) {
  return new Error(`${message}. ${token} should not exist`);
}
```

`Discriminated Union Types`: Using `value types` for properties works like a hook for TypeScript to find the exact shape inside a union, and they are a wonderful tool when you want to steer your control flow in the right direction.

```ts
// Implementation for Discrimination Types based on value types
function getEventTeaser(event: TechEvent) {
  switch (event.kind) {
    case "conference":
      // We now know that I'm in type Conference
      return (
        `${event.title} (Conference), ` +
        // Suddenly I don't have to check for price as
        // TypeScript knows it will be there
        `priced at ${event.price} USD`
      );
    case "meetup":
      // We now know that we're in type Meetup
      return (
        `${event.title} (Meetup), ` +
        // Suddenly we can say for sure that this
        // event will have a location, because the
        // type tells us
        `hosted at ${event.location}`
      );
    case "webinar":
      // We now know that we're in type Webinar
      return (
        `${event.title} (Webinar), ` +
        // Suddenly we can say for sure that there will
        // be a URL
        `available online at ${event.url}`
      );
    default:
      // If we do not exhaust all the options TS will compain.
      // But if we go through all `cases` TS knows that `default` case will never run
      // so it stops compaining.
      throw neverError("Not sure what to do with that!", event);
  }
}
```

`Never`: We get a safeguard that can be used for situations that could occur, but should never occur. `never` is the bottom type of all other types and behaves pretty much like the anti-type of `any`.

[ Back To [🔝](#typescript-on-a-daily-basis) ]

## Dynamic Unions

`Index Access Types` : Similar to Javascript, we can access types with an index. Useful when we want to access lists or object properties via the index access operator. `userEventList['watching']`

```ts
type TechEvent = Webinar | Conference | Meetup;

declare const event: TechEvent;

// Accessing the `kind` value type via index operator
// `EventKind` is a lookup type
// `EventKind` is now: 'conference' | 'webinar' | 'meetup' | 'hackathon'
type EventKind = TechEvent["kind"];
```

`Mapped Types`: Rather than having clear property names, they use brackets to indicate a placeholder for eventual property keys. The main operator used for creating such property keys is: `in`. Useful for cases where we create objects out of existing value types, such as grouping list items: `[Kind in EventKind]: TechEvent[]`.

```ts
/**
 * Manually
 * Maintained Typed
 *
 **/
type GroupedEvents = {
  conference: TechEvent[];
  webinar: TechEvent[];
  meetup: TechEvent[];
  hackathon: TechEvent[];
};

/**
 * Dynamically
 * Updating type
 *
 **/

type GroupedEventsDynamically = {
  [Kind in EventKind]: TechEvent[];
};

function groupEvents(events: TechEvent[]): GroupedEvents {
  const grouped: GroupedEvents = {
    conference: [],
    meetup: [],
    webinar: [],
    hackathon: [],
  };
  events.forEach((el) => grouped[el.kind].push(el));
  return grouped;
}
```

`Keyof` : With `keyof` we can get the object keys of **every type we define** as a union. Useful for creating types dynamically out of existing types.

```ts
type UserEvents = {
  watching: TechEvent[];
  rvsp: TechEvent[];
  attended: TechEvent[];
  signedout: TechEvent[];
};

// Dyanmically create a new type
type DynamicEvents = {
  [Prop in keyof UserEvents]: TechEvent[];
};
```

`Type Predicates`: They are used to add more information to control flow analysis. Type predicates work with functions that return a Boolean, if a function evaluates to `true` then we can be sure that a _value_ is a key of an object.

```ts
function isUserEventListCategory(
  list: UserEvents,
  category: string
): category is keyof UserEvents {
  // The type predicate
  return Object.keys(list).includes(category);
}

function filterUserEvent(
  list: UserEvents,
  category: string,
  filterKind?: EventKind
) {
  // Predicate function accepts identical arguments to the caller.
  // The idea is increase the safety without changing the
  // pre-existing function arguments.
  if (isUserEventListCategory(list, category)) {
    const filteredList = userEventList[category];
    if (filterKind)
      return filteredList.filter((event) => event.kind === filterKind);
    return filteredList;
  }
  return list;
}
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

## Extend generic types to set boundaries

Typescript gives you the ability to define boundaries, or subsets of the type space. This makes generic type parameters a little bit narrower before they're substituted by real types. We get information up front if we pass an object that shouldn't be passed.

To define generic subsets, TypeScript uses the `extends` keyword. We check if a generic type parameter `extends` a specific subset of types. If we only want to pass objects, we can extend from the type object:

```ts
// Predicate function to check if `key` exists
// within a specific object type
function isAvailable<FormatList>(
  obj: FormatList,
  key: string | number | symbol // Narrow `key` down as much as possible
): key is keyof FormatList {
  return key in obj;
}
```

With `<FormatList extends object>`, **we tell TypeScript that the argument we pass `needs to be at least an object`**. All primitive types and even arrays are excluded.

[ Back To [🔝](#typescript-on-a-daily-basis) ]

## Work with index signatures when structure is unknown

The idea of the `index signatures` is to type objects of unknown structure when you **only know the key and value types**. The syntax of an index signature is pretty simple: `{ [key: keyType]: ValueType }`.

With the use of index types we can define a perfect shape - constraint - for our generic type parameters:

```ts
// Step 1: Define an Index Type with our constraint
type URLList = {
  [k: string]: URL;
};

// Step 2: Define our generic type method by using our constraint
declare function loadFile<Formats extends URLList>(
  fileFormats: Formats,
  format: string
);
```

Some times we can replace index signature object types with `Record` utility producing similar resulsts. The benefit of using `Record` is that we can create an object type on-the-fly.

```ts
type ProductID = string;

type AvailabilityTypes = "sold_out" | "in_stock" | "pre_order";

type Availability = {
  availability: AvailabilityTypes;
  amount: number;
};

type StoreProps = Record<ProductID, Availability>;

const store: StoreProps = {
  "0d3d8fhd": { availability: "in_stock", amount: 23 },
  "0ea43bed": { availability: "sold_out", amount: 0 },
  "6ea7fa3c": { availability: "sold_out", amount: 0 },
};
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

## Narrow down parameters from union into value type

How to tackle accessing object properties in TS while keeping the parameters generic and the function reusable ? We can easily achieve this by adding a second type parameter to our generic declaration, one that shows the relationship with the first, but works as its own type once we declare it.

That second parameter is known as `related typed parameter` and through this inter-connection with the passed object allow us to narrow down a union into value type. So when we explicity pass a single value type, we get that type as return instead of the union defined in the parameter.

```ts
type MockedURL = { href: string };

type AllFormats = "format360p" | "format480p" | "format720p" | "format1080p";

type URLObject = {
  [key: string]: MockedURL;
};

type VideoFormatURLs = {
  [Key in AllFormats]: MockedURL;
};

type Loaded<Key> = {
  format: Key;
  loaded: boolean;
  url: MockedURL["href"];
};

const video: VideoFormatURLs = {
  format360p: { href: "/format360p" },
  format480p: { href: "/format480p" },
  format720p: { href: "/format720p" },
  format1080p: { href: "/format1080p" },
};

function loadFile<Formats extends URLObject, Key extends keyof Formats>(
  fileFormat: Formats,
  format: Key
): Loaded<Key> {
  const url = fileFormat[format].href;
  return {
    format,
    url,
    loaded: true,
  };
}

const result = loadFile(video, "format360p");
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

## Prefer Partials with delta functions

In the example below we try to update the user preferences by stroring only **deltas**. If a user changes their preferred video format to something different, it's only the new format that we store. To get to the full set of preferences, we merge our default preferences with the user's preferences in a function:

```ts
type UserPreferences = {
  format: keyof VideoFormatURLs;
  subtitles: {
    active: boolean;
    language: keyof SubtitleURLs;
  };
  theme: "dark" | "light";
};

function combinePreferences(
  defaultP: UserPreferences,
  userP: Partial<UserPreferences>
) {
  return { ...defaultP, ...userP };
}

// OK!
const defaultUP: UserPreferences = {
  format: "format1080p",
  subtitles: { active: false, language: "english" },
  theme: "light",
};

const prefs = combinePreferences(defaultUP, { format: "format720p" });
```

In case that we **know exactly the deltas** to be stored we can use the `Pick` utility instead of `Partial`.

```ts
function combinePreferences(
  defaultP: UserPreferences,
  userP: Pick<UserPreferences, "theme" | "format">
) {
  return { ...defaultP, ...userP };
}
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

## Map inputs to outputs with conditionals

Conditional types are common in cases where we need to map each input type to an output type. One way to model such behavior is by using **function overload** and explicity define ALL the outcomes, but it will get very verbose very quickly. The other way is to use **conditional types**. The syntax for conditional types is based on generics.

```ts
// T is the generic type
// U, A and B are other types
type Conditional<T> = T extends U ? A : B;

/***
 * Lets see a simple example with conditionals
 *
 */
type FetchParams = number | Customer | Product;

// Step1: Constrain `Params` to the possible shapes/types
// Step2: Map input into output type.
type FetchReturn<Param extends FetchParams> = Param extends Customer
  ? Order[]
  : Param extends Product
  ? Order[]
  : Order;

function fetchOrder<Param extends FetchParams>(
  params: Param
): FetchReturn<Param> {
  // code here
}

// Usage
fetchOrder(customer); // Order[] OK!
fetchOrder(product); // Order[] OK!
fetchOrder(2); // Order OK!

declare;
x: any;
// any is not part of `FetchParams`
fetchOrder(x);
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

## Dealing with optional arguments

There are scenarios where a healthy mix of **function overloads** and **conditional types** create much better readability and clearer outcomes. One such scenario is **dealing with optional arguments**.

The complexity of different function heads was better suited to function overloads. The input and output behavior is clear and easy to understand, and the function shape is different enough to qualify for being defined explicitly. As a rule of thumb for your functions:

1. If your input arguments rely on union types, and you need to select a respective return type, then a conditional type is the way to go.
2. If the function shape is different (e.g. optional arguments), and the relationship between input arguments and output types is easy to follow, a function overload will do the trick.

### Function Overload + Conditionals

```ts
type FetchParams = number | Customer | Product;

// Step1: Constrain `Params` to the possible shapes/types
// Step2: Map input into output type.
type FetchReturn<Param extends FetchParams> = Param extends Customer
  ? Order[]
  : Param extends Product
  ? Order[]
  : Order;

// A callback helper type
type Callback<Res> = (result: Res) => void;

// Version 1. Similar to the version from
// the previous lesson, but wrapped in a promise
function fetchOrder<Param extends FetchParams>(
  inp: Param
): Promise<FetchReturn<Param>>;

// Version 2. We pass a callback function that
// gets the result, and return void.
function fetchOrder<Param extends FetchParams>(
  inp: Param,
  fun: Callback<FetchReturn<Param>>
): void;

// The implementation!
function fetchOrder<Par extends FetchParams>(
  inp: Par,
  fun?: Callback<FetchReturn<Par>>
): Promise<FetchReturn<Par>> | void {
  // Fetch the result
  const res = fetch(`/backend?inp=${JSON.stringify(inp)}`).then((res) =>
    res.json()
  );
  // If there’s a callback, call it
  if (fun) {
    res.then((result) => {
      fun(result);
    });
  } else {
    // Otherwise return the result promise
    return res;
  }
}
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

### Function Overload + Rest Parameters + Conditionals

In cases like this, it might be a better idea to still rely on function overloads and conditionals because hurts readability and correctness.

```ts
// Callback Version
function fetchOrder<Param extends FetchParams>(
  ...args: [Param, Callback<FetchReturn<Param>>]
): void

// Promise Version
function fetchOrder<Param extends FetchParams>(
  ...args: [Param]
): Promise<FetchReturn<Param>>

// sum up the entire argument list.
// conditional type that selects the right output type.
type Callback<Res> = (result: Res) => void
type FetchCb<T extends FetchParams> = Callback<FetchReturn<T>>

type AsyncResult<
  FHead,
  Param extends FetchParams
> = FHead extends [Par, FetchCb<Par>>] ? void :
    FHead extends [Par] ? Promise<FetchReturn<T>> :
    never


function fetchOrder<
  Param extends FetchParam,
  FHead,
>(...args: FHead) : AsyncResult<FHead, Param>
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

### Distibution over unions

In most cases conditional types are distributed over unions during instantiation, thus `FetchReturn` can be characterized as a distributive contional type. This means that each constituent of the generic type parameter is instantiated with the same conditional type. In short: a conditional type of a union type is like a union of conditional types.

An important precondition to distributive conditional types is that the generic type parameter is a **naked type**. Naked type is type system jargon and means that the type parameter is present **as is**, without being part of any other construct. Being naked is the most common case for generic type pa- rameters. The non-naked version can lead to interesting side effects.

```ts
type FetchByProductOrId = FetchReturn<Product | number | number>;

// Equal to
type FetchByProductOrId =
  | (Product extends Customer
      ? Order[]
      : Product extends Product
      ? Order[]
      : Order)
  | (Customer extends Customer
      ? Order[]
      : Customer extends Product
      ? Order[]
      : Order)
  | (number extends Customer
      ? Order[]
      : number extends Product
      ? Order[]
      : Order);

// Equal to
type FetchByProductOrId = Order[] | Order[] | Order;

// Removed redundancies
type FetchByProductOrId = Order[] | Order;
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

## Filtering subtypes with _conditional types_ and _never_

### The Model

```ts
// Contains our base properties
type Medium = {
  id: number;
  title: string;
  artist: string;
};

// Stores the number of tracks and the total duration.
type TrackInfo = {
  duration: number;
  tracks: number;
};

// A CD is a combination of `Medium` and `TrackInfo`
// We also add `kind` to create discriminated union.
type CD = Medium &
  TrackInfo & {
    kind: "cd";
  };

// An LP is also derived from the base Medium class
// It contains two sides which each store `TrackInfo`
type LP = Medium & {
  kind: "lp";
  sides: {
    a: TrackInfo;
    b: TrackInfo;
  };
};

type AllMedia = CD | LP;

type MediaKinds = AllMedia["kind"]; // ‘lp’ | ‘cd’

declare function createMedium<
  // use a generic to bind the actual value type if we use a literal
  Kin extends MediaKinds
>(
  // The first argument is the type we want to create, either an LP or a CD.
  kind: Kin,
  // The second argument is all the missing info we need to successfully create this medium.
  // We don’t need the properties type, which we defined in our first argument, nor the ID, as this will be generated by the function.
  info
  // The function returns the newly created medium.
): AllMedia;
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

### `Extract` specific branch

How can we select a certain branch in our union ? Remember that conditional types are distributed over union types, meaning that a conditional of unions is like a union of conditionals. We can use this behavior to create a conditional type that checks if each constituent of a union is a subtype of the kind we are filtering for. If so, we return the constituent. If not, we return `never`.

```ts
type SelectBranch<Brnch, Kin> = Brnch extends { kind: Kin } ? Brnch : never

// We create a type where we want to select the
// cd branch of the AllMedia Union
type SelectCD = SelectBranch<AllMedia, 'cd'>

// This equals
type SelectCD = SelectBranch<CD | LP, 'cd'>

// A conditional of unions is like a union of
// conditionals
type SelectCD =
  SelectBranch<CD, 'cd'> |
  SelectBranch<LP, 'cd'>

// Substitute for the implementation
type SelectCD =
  (CD extends { kind: 'cd' } ? CD : never) |
  (LP extends { kind: 'cd' } ? LP : never)

// Evaluate!
type SelectCD =
  // This is true! Awesome! Let’s return CD
  (CD extends { kind: 'cd' } ? CD : never) |
  // This is false. let’s return `never`
  (LP extends { kind: 'cd' } ? LP : never)

// Equal to
// But never is the impossible type
// thus TypeScript removes everything that resolves to `never` from the union.
type SelectCD = CD | never

// Finally
type SelectCD = SelectBranch<AllMedia, 'cd'> = CD;
```

Thus lets update our function head to use `SelectBranch`, as its gonna help us identify which returning type to expect when selecting a certain kind.

```ts
declare function createMedium<
  // use a generic to bind the actual value type if we use a literal
  Kin extends MediaKinds
>(kind: Kin, info): SelectBranch<AllMedia, Kin>;
```

A much more generic type is the built-in helper type `Extract<A, B>`. The documentation says that it extracts from `A` those types that are assignable to `B`. This can be a set of keys, or (in our case) objects.

In our case it replaces the `SelectBranch<AllMedia, Kin>` with `Extract<AllMedia, {kind: Kin}>`

```ts
type Extract<A, B> = A extends B ? A : never;

// Resolves to LP
type SelectLP = Extract<AllMedia, { kind: "lp" }>;
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

### `Omit` unecessary information

Now we want to focus on the missing information. Remember, we want to add everything that’s necessary to create a full medium, except for `id`, which is autogenerated by `createMedium`, or `kind`, which we already defined.

The first thing we want to take care of is knowing which keys of our object we actually need. The best way to do this is by knowing which keys we don’t need: `kind` and `id`. We can create another object excluding the keys we do not need.

```ts
// It reads that if the type A is part of B,
// remove it (never); otherwise keep it
type Remove<A, B> = A extends B ? never : A;

// Keys that we do not need
type Removable = "kind" | "id";

// First our keys
type CDKeys = keyof CD;

// Equal to
type CDKeys = "id" | "description" | "title" | "kind" | "tracks" | "duration";

// Now for the keys we actuall want
type CDInfoKeys = Remove<CDKeys, Removable>;

// Equal to
type CDInfoKeys = Remove<
  "id" | "description" | "title" | "kind" | "tracks" | "duration",
  "id" | "kind"
>;

// A conditional of a union
// is a union of conditionals
type CDInfoKeys =
  | Remove<"id", "id" | "kind">
  | Remove<"description", "id" | "kind">
  | Remove<"title", "id" | "kind">
  | Remove<"kind", "id" | "kind">
  | Remove<"tracks", "id" | "kind">
  | Remove<"duration", "id" | "kind">;

// Substitute
type CDInfoKeys =
  | ("id" extends "id" | "kind" ? never : "id")
  | ("description" extends "id" | "kind" ? never : "description")
  | ("title" extends "id" | "kind" ? never : "title")
  | ("kind" extends "id" | "kind" ? never : "kind")
  | ("tracks" extends "id" | "kind" ? never : "tracks")
  | ("duration" extends "id" | "kind" ? never : "duration");

// Evaluate
type CDInfoKeys =
  | never
  | "description"
  | "title"
  | never
  | "tracks"
  | "duration";

// Remove impossible types from the union
type CDInfoKeys = "description" | "title" | "tracks" | "duration";
```

TypeScript has a built-in type for exactly this combination of _Pick_ and _Exclude_, called `Omit`.

```ts
type CDInfo = Omit<CD, "kind" | "id">;

// Lets put all together
type RemovableKeys = "kind" | "id";

type GetInfo<Med> = Omit<Med, RemovableKeys>;

declare function createMedium<
  // use a generic to bind the actual value type if we use a literal
  Kin extends MediaKinds
>(
  kind: Kin,
  info: GetInfo<SelectedBranch<AllMedia, Kin>>
): SelectBranch<AllMedia, Kin>;
```

#### t vs Exclude

_On a side note_, `Omit` is used on interface or object type but **NOT** on a union string literal. If we want to remove a constituent of a union we have to use the `Exclude` utility which accepts a union type as an argument. Here is [stackoverflow question](https://stackoverflow.com/questions/56916532/difference-b-w-only-exclude-and-omit-pick-exclude-typescript) and an example below:

```ts
// Official Docs: https://github.com/Microsoft/TypeScript/blob/4ff71ecb98ccbd882feb1738b0c6f1cc93c2ea66/src/lib/es5.d.ts
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type Exclude<T, U> = T extends U ? never : T; // will return never if T extends U, and T if it does not.

// I have a type with union literals like this
type something = "abc" | "bcd" | "cde" | "def";
// I wanted to create a Mapped type like this
type mappedType = {
  [k in something]: string;
};
// This is equivalent to
type mappedType = {
  abc: string;
  bcd: string;
  cde: string;
  def: string;
};

// Now let's consider if I want to omit one property.
type mappedTypeWithOmit = {
  [k in Omit<something, "def">]: string; // BOOM!  Type 'Omit<something, "def">' is not assignable to type 'string | number | symbol'
};

type mappedTypeWithExclude = {
  [k in Exclude<something, "def">]: string; // OK!
};
```

**Takeway**

- Omit utility type works on object type or interfaces to omit one of the key-value pair.
- Exclude only works on union literal to exclude one of the property.
- Omit uses Pick and Exclude under the hook.

[ Back To [🔝](#typescript-on-a-daily-basis) ]

## Retrieve the return type from the function signature

In situations where we want to retrieve the return type from the function signature, TypeScript allows us to **infer type variables in the extends clause** of a conditional type.

This happens with the `infer R` keyword, where we effectively say that no matter the return type of this function, we store it in the type variable `R`. If we have a valid function, we return `R` as type.

```ts
// We are interest on the return type of the below function
function createUser(
  name: string,
  role: "admin" | "maintenance" | "shipping",
  isActive: boolean
) {
  return {
    userId: userId++,
    name,
    role,
    isActive,
    createdAt: new Date(),
  };
}

// Generic function
type GetReturn<Fun> = Fun extends (...args: any[]) => infer R ? R : never;
// We pass our function, we get the type of the function in return
type User = GetReturn<typeof createUser>;
```

Utility types are essential if we construct functions and libraries where **we care more about the behavior and interconnection of parts rather than the actual types themselves**. Storing and retrieving objects from a database, creating objects based on a schema, that kind of thing. With the `infer` keyword we get powerful flexibility to get types even when we don’t know yet what we are dealing with.

When we have a value and need to know its type, we can use `[typeof](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html)`. What happens when we use it on a function? We always get back Function. When we need information about the return type or the parameters it needs, we can now reach for these utilities, such as `ReturnType` and `Parameters`, together with `typeof`. We can’t use a value with these type utilities; we have to use a type.

```ts
// method we don't have access to
import { saveCart } from "cartAPI";

// Arguments for the function
type CartCreationParams = Parameters<typeof saveCart>;
// Return type for the function
type SavedCart = ReturnType<typeof saveCart>;

// Now we can declare our own functions to operate
// with the external one in case some transformation
// is needed, the FormInput type is out of the scope
// of this example
const submit = (form: FormInput): SavedCart => {
  // The types will make sure we call the function
  // with the right arguments
  const cartParams: CartCreationParams = form.parse();
  return saveCart(cartParams);
};
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

## Be explicit about nullish values

If we implement a function with `fetch` we see that we have a problem: `fetch` returns a promise of `any` (the top type that covers everything and takes anything, including `null` and `undefined` – and `never`, if we take the possibility of an error into account). This means that inside this function, **we lose the information if the return value is actually defined**. We have to be more specific about the set of possible return values, especially since `strictNullChecks` says we don’t take nullish values into our sets.

To handle `null`, we have two possibilities: a) add `null` to the input arguments which which means that nullish value checks happening inside the function and b) make sure that we never pass nullish values to the function, which means that we have to do null checks before calling the function. **It’s recommended to consider nullish values early on**. Keep the core of your application null-free, and try to catch any possible side effects as soon as possible.

```ts
function isAvailable<Obj>(obj: Obj): obj is NonNullable<Obj> {
  return typeof obj !== "undefined" && obj !== null;
}

// orders is Order[] | null
const orders = await fetchOrderList(customer);
if (isAvailable(orders)) {
  //orders is Order[]
  listOrders(orders);
}
```

[ Back To [🔝](#typescript-on-a-daily-basis) ]

## Substitutability - void

In `JavaScript`, all functions have a return value. If we don’t return one on our own, the return value is by default `undefined`. In `TypeScript`, every function has a return type. If we don’t explicitly type or infer, the return type is by default `void`. **`void` in TypeScript is a different way of saying `undefined`**. The void type can take only one value, which is `undefined`, but there are some interesting features to it.

```ts
function searchHandler(results: Result[]): void {
  console.log(results);
  return;
  // return results.length
}

function searchWithCbk(
  query: string,
  callback: (results: Result[]) => void,
  tags?: string[]
) {
  // ...
  fetch(`/search${query}`)
    .then((res: { json: () => any }) => res.json() as Promise<Result[]>)
    // If you really want to make sure that no value is returned, you can either put `void`
    // in front of callback in plain JavaScript:
    .then((results: Result[]) => void callback(results));
}

function searchWithCbkUndefined(
  query: string,
  // By explicity defining the return type as `undefined`,
  // it force for every calledback passed as argument to
  // return `undefined` NOT `void`
  callback: (results: Result[]) => undefined,
  tags?: string[]
) {
  // ...
}

// PASSES !!!!
searchWithCbk("Ember", searchHandler);
// Boom ! This breaks now!
//Because we can NOT subtitute `void` for `undefined` value
searchWithCbkUndefined("Ember", searchHandler);
```

As we can’t substitute `undefined` for `number`. Substitutability is a concept in TypeScript that you will stumble upon if you work a lot with functions. Instead of being too strict with exact function shapes, it complements the way JavaScript works with functions: asking only for the parameters that you actually need.

On a side note, in TS word you can consider `void` as a superset of `undefined`. This means, as we show in the example above, we can subtitute `void` for `undefined` but not the opposite.

[ Back To [🔝](#typescript-on-a-daily-basis) ]

## Convert an Enum to a Union Type

Use a template literal type to convert an enum to a union type, e.g. type ValuesUnion = `${StringEnum}`. Template literal types have the same syntax as template literal strings in Javascript but are used in type positions. The union type will contain all of the values of the enum.

```ts
enum StringEnum {
  Small = "S",
  Medium = "M",
  Large = "L",
}

// 👇️ type ValuesUnion = "S" | "M" | "L"
type ValuesUnion = `${StringEnum}`;

// 👇️ type KeysUnion = "Small" | "Medium" | "Large"
type KeysUnion = keyof typeof StringEnum;
```

The second example uses `keyof typeof` to convert the enum to a union type containing the enum's keys.

```ts
enum StringEnum {
  Small = "S",
  Medium = "M",
  Large = "L",
}

// 👇️ type KeysUnion = "Small" | "Medium" | "Large"
type KeysUnion = keyof typeof StringEnum;
```

Either of the two approaches would defend us against making a typo when writing out the enums keys or values.

```ts
enum StringEnum {
  Small = "S",
  Medium = "M",
  Large = "L",
}

// 👇️ type KeysUnion = "Small" | "Medium" | "Large"
type KeysUnion = keyof typeof StringEnum;

// ⛔️ Error: Type "Test" is not assignable to type "Small" | "Medium" | "Large"
const str: KeysUnion = "Test";
```

Because `Test` is not present in the enum's keys, TypeScript alerts us that we have a typo.

[ Back To [🔝](#typescript-on-a-daily-basis) ]
