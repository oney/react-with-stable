import React, { ComponentType, MemoExoticComponent } from 'react';

export const Prefix = '__react-with-stable__';
export const StableSymbol = `${Prefix}stableSymbol`;

export function withStable<T extends ComponentType<any>>(
  stableKeys: Set<string>,
  Component: T
): MemoExoticComponent<T> {
  const Memo = React.memo(Component);
  function ComponentWithStable(props: any) {
    const propsRef = React.useRef(props);
    React.useLayoutEffect(() => {
      propsRef.current = props;
    });
    const cache = React.useMemo(() => ({} as any), []);

    const stable = {} as any;
    for (const k in props) {
      if (!props.hasOwnProperty(k)) continue;
      stable[k] = (() => {
        if (
          typeof props[k] !== 'function' ||
          !stableKeys.has(k) ||
          props[k][StableSymbol]
        )
          return props[k];
        if (cache[k]) return cache[k];
        cache[k] = (...args: any[]) => propsRef.current[k](...args);
        cache[k][StableSymbol] = 1;
        return cache[k];
      })();
    }
    return <Memo {...stable} />;
  }

  return ComponentWithStable as any;
}
