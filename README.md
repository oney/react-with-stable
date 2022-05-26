# react-with-stable

[![npm](https://img.shields.io/npm/v/react-with-stable?style=flat-square)](https://www.npmjs.com/package/react-with-stable)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-with-stable?style=flat-square)](https://bundlephobia.com/result?p=react-with-stable)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/oney/react-with-stable/blob/master/src/index.tsx)
[![GitHub](https://img.shields.io/github/license/oney/react-with-stable?style=flat-square)](https://github.com/oney/react-with-stable/blob/master/LICENSE)

This package provides stable identity inline callback when passing props.

## TL;DR
```jsx
import { withStable } from "react-with-stable";

const Event = withStable(["onClick"], ({ onClick }) => (
  <button onClick={onClick}>click</button>
));

export default function App() {
  const [text, setText] = React.useState("a");

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <Event onClick={() => alert(`click: ${text}`)}/>
    </div>
  );
}
```
No matter how `text` state changes, the Event component never re-renders because `onClick` is declared as a stable prop.  
But when `onClick` fires as an event handler, it will get latest `text` value.

Note: don't use `onClick` in effects or rendering.

## Explanation
This package basically does the same thing as `useEventHandler` like [many](https://github.com/Volune/use-event-callback) [community](https://ahooks.js.org/hooks/use-memoized-fn) [implementaion](https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback) and [`useEvent` RFC](https://github.com/reactjs/rfcs/pull/220) the React team is working on. The difference is that it wraps callbacks in HOC, so it can provide stable identity for **inline callback** where hook methods can't achieve it.

You have to explicitly provide stable prop keys in the first parameter of `withStable` like `withStable(["onClick"],`. This is actually better in concept in most scenario because it should be the callback consumer (i.e. `Event`) to know this prop (`onClick`) is stable and only used in events.

This package doesn't solve the old values in closure problem in effects, so I believe `useEvent` RFC should still be essential.
