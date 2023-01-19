# Typescript with React - ByteSize Scripts

---

## Conditional Rendering with Type Safety

Let's say that we have a component that renders a fact about the chosen fruit. Conditionally rendering based on several states is common for status labels, forms, stepper components, wizards, and the like. To reiterate, there is no if/else if chain, switch, or nested ternaries in this implementation.

Instead, a more maintainable and compact solution is used. It is essentially a lookup table using an object - but with **added type-safety, which allows TypeScript to ensure all states are included**.

To begin with, we create a union type that contains all possible states in order to enforce type-safety and exhaustive pattern matching.

```ts
export type Fruit = "apple" | "kiwi" | "cherry" | "grape";
```

Next we create a lookup table object which acts as a map of the union type to a string containing the fruit facts. For a type-safe object we are going to use `Record` utility type.

```ts
const fact: Record<Fruit, string> = {
  apple:
    "Apples ripen up to 10 times faster at room temperature than if they are refrigerated.",
  kiwi: "Kiwi fruits contain about as much potassium as Bananas and a high amount of Vitamin C, more than Oranges.",
  cherry:
    "Cherries are rich in vitamin A, B and C, mineral salts and dietary minerals (zinc, copper, manganese, cobalt).",
  grape:
    'Grapes come in many colors, including green, red, black, yellow, pink, and purple. "White" grapes are actually green.',
};
```

Finally, we apply the same pattern to the conditional rendering of elements or components. For this, instead of a record mapping the fruit union to a string, we will map it to a React node.

```ts
import { ReactNode } from "react";

const Apple = () => <span>🍎🍏</span>;
const Kiwi = () => <span>🥝</span>;
const Cherry = () => <span>🍒</span>;
const Grape = () => <span>🍇</span>;

const icon: Record<Fruit, ReactNode> = {
  apple: <Apple />,
  kiwi: <Kiwi />,
  cherry: <Cherry />,
  grape: <Grape />,
};
```

It’s worth reiterating what we have so far because this is a powerful pattern:

- A union type of all possible states
- Record types mapping from the state to strings and React nodes
- _Exhaustive_ pattern matching, which ensures **all states have to be included to be valid code**

**Final Code**

```ts
const Apple = () => <span>🍎🍏</span>;
const Kiwi = () => <span>🥝</span>;
const Cherry = () => <span>🍒</span>;
const Grape = () => <span>🍇</span>;

export type Fruit = "apple" | "kiwi" | "cherry" | "grape";

export const ConditionalFruitFacts = ({ fruit }: { fruit: Fruit }) => {
  const fact: Record<Fruit, string> = {
    apple:
      "Apples ripen up to 10 times faster at room temperature than if they are refrigerated.",
    kiwi: "Kiwi fruits contain about as much potassium as Bananas and a high amount of Vitamin C, more than Oranges.",
    cherry:
      "Cherries are rich in vitamin A, B and C, mineral salts and dietary minerals (zinc, copper, manganese, cobalt).",
    grape:
      'Grapes come in many colors, including green, red, black, yellow, pink, and purple. "White" grapes are actually green.',
  };

  const icon: Record<Fruit, ReactNode> = {
    apple: <Apple />,
    kiwi: <Kiwi />,
    cherry: <Cherry />,
    grape: <Grape />,
  };

  return (
    <div className="inline-block">
      <span className="flex flex-col text-center">
        {icon[fruit]}
        {fact[fruit]}
      </span>
    </div>
  );
};
```

**Testing**

```ts
import { render, screen } from "@testing-library/react";
import { ConditionalFruitFacts, Fruit } from "./ConditionalFruitFacts";

describe("Example unit test", () => {
  it.each<Fruit, string>([
    ["apple", "🍎🍏"],
    ["kiwi", "🥝"],
    ["cherry", "🍒"],
    ["grape", "🍇"],
  ])(`should render the correct icon for %s`, (fruit, icon) => {
    render(<ConditionalFruitFacts fruit={fruit} />);
    expect(screen.getByText(icon)).toBe(true);
  });
});
```
