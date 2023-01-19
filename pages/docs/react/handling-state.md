# Handling React State

---

## What is React State

### Derived State

**React re-renders a component in four situations:**

- State Changes
- Prop Changes
- Parent Renders
- Context Changes

**We can call some performance features that can skip renders:**

- Make use of React.Memo()
- Make use of pure component
- React.useEffect(() => {}, [])

### Where to Declare State

The most common mistake when declaring a state is to do it in the wrong spot. The signs of being on the wrong spot is that: its hard to consume and share. **We should always start local and lift when needed**.

The `Priniciple of Least Privilege` says that, every module must be able to access only the information and resources that are necessary for its legitimate purpose. In our case this means that, each React component should only has access to the data/funcs it needs.

**Start local and lift state**

1. Declare state in the component that needs it
2. Child components need the state ? Pass state down via props.
3. Non-child component needs it ? Lift state to common parent (one or two levels up).
4. Passing props getting annoying ? Consider Context, Redux and etc.

### Why setting state async ?

You can not expect state updates to happen immediatelly. The reason why is that react updates states in batches and based on priority ratings in order to maintain smooth animations, tranisitions and performance. For instance, a state change coming from a keystroke gets reflected immediately as opposed to async call changes.

So its better to use function form to reference existing state:

```js
const [count, setCount] = useState(0);

// Avoid since unreliable. The value of `count` may be an old value.
setCount(count + 1);

// Prefer this – Use a function to reference existing state
setCount((count) => count + 1);
```

### Why immutability matters in react

If state is mutable, we have to perform an extensive number of operations in order to determine if state has changes. Such operations is the `Value Equality (==)` where we have to traverse through the object's properties compore each one of them.

If state is immutable, we can simply perform `Reference Equality (===)`. With reference equality react checks: If old and new state reference the same spot in memory, then the state hasn't changed. So the comparison is fast, scalable and simple.

**Handle Immutability**

- Object.assign
- Spread Syntax ({ ...myObj })
- Array Methods (.map, .filter, .reduce, .concat)

**Warning: Avoid Shallow Copies**

```js
const user = {
  name: "Cory",
  email: "cory@reactjsconsulting.com",
  address: {
    city: "Chicago",
  },
};
// Avoid
const [user, setUser] = useState(user);
// Prefer
const [user, setUser] = useState(user);
const [address, setAddress] = useState(user.address);
```

**Warning: Only clone What Changes**

1. Deep cloning is expensive
2. Deep cloning is typically wasteful
3. Deep cloning causes unnecessary renders

Instead, clone only the sub-objects that have changed

### useState - Initilization

**The default value we apply in default state, it only applies on first render but it is evaluated on every render**. This means, we have to avoid doing expensive operations when initializing states. The solution to that will be to declare the default using a function, as it gets lazy evaluated. The function will only be run the first time the component renders.

```js
const [cart, setCart] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("cart")) ?? [];
  } catch {
    console.error("The cart could not be parsed into JSON.");
    return [];
  }
});
```

---

## Eight ways to handle state

### 1. URL

> When to use it: **Sharable app location**

This is useful for tracking where the user is within the app as well as their current settings.

Here is a few examples of location related information that should be stored in the URL: Current item being viewed, Filters, Pagination, Sorting settings and Campaign Tags (utm).

Keeping location related data in the URL means that your users can share deep links with others and to avoid the URL on your app getting out of sync. Use the URL as a state of record and read from them as it is needed when such setting change.

Finally, you can use react Router to handle URL state changes.

### 2. Web Storage

> When to use it: **Persist between sessions, one browser**

This is useful when you want to persist state between reloads or even reboots. Examples include **cookies**, **local storage** and **IndexedDB**.

These is a valid option for storing data and keep in mind data persisted in the browser is tied to a single browser. So if user loads the site in a different browser, their data won't be available.

And avoid storing sensitive data in the browser, since the user may access your app on a shared machine.

Some examples of where Web storage might be useful include storing the user's shopping cart or storing partially completed form data.

Avoid doing frequent writes because its a Block I/O storage.

### 3. Local State

> when to use it: **Only one component needs the state**

We can store state inside a react component and make state available only to that component. The cases we may want to have local state is: Forms, Toggles and Local Lists.

### 4. Lifted State

> when to use it: **A few related components need the state**

Consider Lifted State pattern when few related components needs to access the same state. This method is a two step process: A) Declare state in a parent component and B) Pass state down via props.

### 5. Derived State

> when to use it: **State can be derived from existing state**

Sometimes we do not need to store a state but calculate a state from derived state/props. These usually called Stateless components.

### 6. Refs

> when to use it: **DOM refrence, state that isn't rendered**

DOM Reference are useful for managing `uncontrolled components`. Uncotrolled components are: a) form inputs whose values isn't controlled by React, b) interfacing with non-React libraries.

In addition to, we can use refs to keep state that isn't displayed such as: A) Tracking if component is mounted, B) Hold Timer, C) Store previous state value, which is useful for features such as `undo`, `reundo`

### 7. Context

> when to use it: **Global or subtree state**

If you have data and functions being used by your entire app or by significant portion of your app, react context can be useful.

Context avoids having to pass props down to every component that needs a given value, commonly called `prop drilling`.

Examples of state that you might want to store in context include:

- Logged in user
- Authorization settings
- Theming
- Internationalization settings.

### 8. Third Party State

> when to use it: **Global state, Remote state**

The final option is to handle some of your APP state via a third party library. A few popular options include:

- Redux
- Mobx
- Recoil

And they're also specialized state management libraries for handling data that you fetch from API calls. A few popular remote state libraries are:

- react query
- SWR.
- Relay or Apollo (for GraphQL)

> **Server State: Questions To Ask**

1. Should I cache data on the client for a certain period?
2. Should I load fresh data when the tab is refocused?
3. Should I load fresh data when the network reconnects?
4. Should I retry failed HTTP calls?
5. Should I return cached data, then fetch fresh data behind the scenes?
6. Should I handle server cache separately from app state?
7. Should I avoid refetching recently fetched data?
8. Should I prefetch data the user is likely to want?

Usually third party libraries that fetch data have already considered the questions above.

## State Management Guidelines

Although React is self-sufficient in terms of state, **it gets complicated when it comes to sharing data among multiple components, asynchronous data fetching, etc**. State can be classified as **global**, **local** and **derived**.

- `constants`: Those are simple javascript values that do not change after they get defined.
- `global`: This state can be accessed from any component within the application.
- `local` : It can be accessed only from whithin the component the state is defined.
- `derived`: It usually gets generated after an asynchronous data fetching operation.

Most of the times we will need to combine more than one categories in order to produce efficient and clean code. In the list below we will try to provide some good practises on when to use each category.

1. We can define constanst values within a react component
2. Use `local state` for changing the state of a UI, such as validating/hidding forms. In this case we ca use a react hook that can manage this state and it can be defined on a seperate file (`hooks.ts`) but within the component's module.
3. If we have to share a `local state` with other components but **within the same module** then we can pass that state through props by using the `lift up` pattern. To note, a **state should be passed maximum one level deep**.
4. If we need to share a state with other components but **outside the module** then we need to use a state management library such as Recoil/Redux which exposes the state to the whole application and hence make it **global**.
5. When we perform an asynchronous data fetching operation we generate a derived state that may not be ready to be consumed from our components. Thus, this state usually goes through some kind of data trasformation process before it gets stored in local or global state.
