import React, { ComponentType, MemoExoticComponent } from 'react';

export function withStable<T extends ComponentType<any>>(
  stableKeys: string[],
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
      if (typeof props[k] !== 'function' || stableKeys.indexOf(k) === -1) {
        stable[k] = props[k];
        continue;
      }
      if (!cache[k])
        cache[k] = (...args: any[]) => propsRef.current[k](...args);
      stable[k] = cache[k];
    }
    return <Memo {...stable} />;
  }

  return ComponentWithStable as any;
}
