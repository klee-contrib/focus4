declare type ReactComponent<P> = React.ComponentClass<P> | ((props: P) => React.ReactElement<any>);
