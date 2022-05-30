import React, { ComponentType, MemoExoticComponent } from 'react';
import type { DependencyList } from 'react';

export const Prefix = '__react-with-stable__';
export const StableSymbol = `${Prefix}StableSymbol`;
export const DepsSymbol = `${Prefix}DepsSymbol`;

export function areEqual(a: any, b: any): boolean {
  if (
    !(
      typeof a === 'function' &&
      a[DepsSymbol] &&
      typeof b === 'function' &&
      b[DepsSymbol]
    )
  ) {
    return a === b;
  }
  const depsA: any[] = a[DepsSymbol];
  const depsB: any[] = b[DepsSymbol];
  for (const [i, itemA] of depsA.entries()) {
    if (!areEqual(itemA, depsB[i])) return false;
  }
  return true;
}

export function withStable<T extends ComponentType<any>>(
  stableKeys: string[],
  Component: T
): MemoExoticComponent<T> {
  const stableSet = new Set(stableKeys);
  const Memo = React.memo(Component, (prev, next) => {
    for (const k in prev) {
      if (!prev.hasOwnProperty(k)) continue;
      if (!areEqual(prev[k], next[k])) return false;
    }
    for (const k in next) {
      if (!next.hasOwnProperty(k)) continue;
      if (!areEqual(next[k], prev[k])) return false;
    }
    return true;
  });
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
        if (typeof props[k] !== 'function') return props[k];

        if (stableSet.has(k)) {
          if (props[k][StableSymbol]) return props[k];
          if (cache[k]) return cache[k];
          cache[k] = (...args: any[]) => propsRef.current[k](...args);
          cache[k][StableSymbol] = true;
          return cache[k];
        }

        return props[k];
      })();
    }
    return <Memo {...stable} />;
  }

  return ComponentWithStable as any;
}

export function depFn<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T {
  (callback as any)[DepsSymbol] = deps;
  return callback;
}
