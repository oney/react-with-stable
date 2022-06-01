# react-with-stable

[![npm](https://img.shields.io/npm/v/react-with-stable?style=flat-square)](https://www.npmjs.com/package/react-with-stable)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-with-stable?style=flat-square)](https://bundlephobia.com/result?p=react-with-stable)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/oney/react-with-stable/blob/master/src/index.tsx)
[![GitHub](https://img.shields.io/github/license/oney/react-with-stable?style=flat-square)](https://github.com/oney/react-with-stable/blob/master/LICENSE)

This package provides stable **inline callbacks** when passing props.

Please ⭐ star this repo if it's useful!

## Stable inline event callback

Take [this example](https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md#reading-stateprops-in-event-handlers-breaks-optimizations) from `useEvent` RFC.
```jsx
import { withStable } from "react-with-stable";

const SendButton = withStable(["onClick"], ({ onClick }) => (
  <button onClick={onClick}>click</button>
));

function Chat() {
  const [text, setText] = useState('');
  return <SendButton onClick={() => { sendMessage(text); }} />;
}
```

No matter how `text` state changes, the `Chat` component never re-renders because `onClick` is declared as a stable prop.  
But when `onClick` fires as an event handler, it will get the latest `text` value.

Note: don't use `onClick` in effects or rendering.

## Stable inline callback for render or effect
```jsx
import { withStable, depFn } from "react-with-stable";

const Render = withStable([], ({ render }) => {
  useEffect(() => {
    console.log(render());
  }, [render]);
  return <div>{render()}</button>;
});

export default function App() {
  const [text, setText] = React.useState("a");
  const [other, setOther] = React.useState("a");

  return (
    <div>
      <Render render={depFn(() => `render: ${text}`, [text])}/>
    </div>
  );
}
```

When `other` changes but `text` doesn't change, the `Render` component never re-renders because its props `render` callback is wrapped by `depFn` with the dependency which is `text`.

You can consider `depFn` as inline `useCallback` that provides memo callbacks when the dependencies are the same.

## Demo
Please check [this codesandbox example](https://codesandbox.io/s/withstable-hoc-ogfep7?file=/src/App.tsx). It proves that the `withStable` wrapped components never re-render unless
1. other non-stable props change  
OR  
2. dependencies of `depFn` wrapped callback change.

## Explanation
This package basically does the same thing as `useEventHandler` like [many](https://github.com/Volune/use-event-callback) [community](https://ahooks.js.org/hooks/use-memoized-fn) [implementaion](https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback) and [`useEvent` RFC](https://github.com/reactjs/rfcs/pull/220) the React team is working on. The difference is that it wraps callbacks in HOC, so it can provide stable identity for **inline callback** where hook methods can't achieve it.

You have to explicitly provide stable prop keys in the first parameter of `withStable` like `withStable(["onClick"],`. This is actually better in concept in most scenario because it should be the callback consumer (i.e. `Chat` component) to know this prop (`onClick`) is stable and only used in events.

For `depFn` usage, just consider it as inline `useCallback`, and list all values used in the callback to the second parameter.