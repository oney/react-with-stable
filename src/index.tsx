import React, { ComponentType, MemoExoticComponent } from 'react';

export function withStable<P, T extends ComponentType<P>>(
  stableKeys: string[],
  Component: T
): MemoExoticComponent<T> {
  const Memo = React.memo(Component);
  function ComponentWithStable(props: any) {
    const extract: any = {};
    for (const k in props) {
      if (props.hasOwnProperty(k)) {
        if (stableKeys.indexOf(k) !== -1) extract[k] = props[k];
      }
    }
    const ref = React.useRef(extract);
    React.useLayoutEffect(() => {
      ref.current = extract;
    });
    const stable = React.useMemo(() => {
      const stable: any = {};
      for (const k in ref.current) {
        stable[k] = (...args: any[]) => ref.current[k](...args);
      }
      return stable;
    }, []);

    return <Memo {...props} {...stable} />;
  }

  return ComponentWithStable as any;
}
