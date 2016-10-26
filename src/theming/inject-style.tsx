import * as React from "react";

/**
 * Décorateur qui fusionnne le contenu de `this.props.classNames` avec celui du `classContainerName` passé en props d'un StyleProvider parent.
 * @param classContainerName Le nom du conteneur de classes CSS.
 */
export function injectStyle<P extends {classNames?: {[key: string]: any}}>(classContainerName: string): (Component: React.ComponentClass<P>) => void

/**
 * Fusionnne le contenu de `props.classNames` avec celui du `classContainerName` passé en props d'un StyleProvider parent.
 * @param classContainerName Le nom du conteneur de classes CSS.
 * @param Component Le composant cible.
 */
export function injectStyle<P extends {classNames?: {[key: string]: any}}>(classContainerName: string, Component: ReactComponent<P>): React.ComponentClass<P>
export function injectStyle<P extends {classNames?: {[key: string]: any}}>(classContainerName: string, Component?: ReactComponent<P>): any {
    function makeInjectedComponent(Comp: ReactComponent<P>) {
        return class StyleInjector extends React.Component<P, void> {
            static contextTypes = {classNames: React.PropTypes.object};
            static wrappedComponent = Comp;

            context: {classNames: {[key: string]: {[key: string]: any}}};
            wrappedInstance?: ReactComponent<P>;

            render() {
                const contextClassNames = this.context && this.context.classNames && this.context.classNames[classContainerName];
                const {classNames = {}} = this.props;
                if (!contextClassNames) {
                    console.warn(`Le conteneur de classes CSS ${classContainerName} n'a pas été trouvé dans un StyleProvider parent.`);
                } else {
                    fillClassNames(contextClassNames, classNames);
                }
                if (!isStateful(Comp)) {
                    return <Comp {...this.props} classNames={contextClassNames || classNames} />;
                } else {
                    return <Comp {...this.props} classNames={contextClassNames || classNames} ref={(instance: any) => this.wrappedInstance = instance} />;
                }
            }
        };
    }

    if (Component) {
        return makeInjectedComponent(Component);
    } else {
        return makeInjectedComponent as any;
    }
}

function isStateful(Component: any): Component is React.ComponentClass<any> {
    return !!Component.prototype.render;
}

function fillClassNames(contextContainer: {[key: string]: any}, propsContainer: {[key: string]: any}) {
    for (const className in contextContainer) {
        if (propsContainer[className]) {
            if (typeof contextContainer[className] === "string" && typeof propsContainer[className] === "string") {
                contextContainer[className] += " " + propsContainer[className];
            } else if (typeof contextContainer[className] === "object" && typeof propsContainer[className] === "object") {
                fillClassNames(contextContainer[className], propsContainer[className]);
            } else if (typeof contextContainer[className] !== typeof propsContainer[className]) {
                console.warn(`${className} est un ${typeof contextContainer[className]} dans le contexte et un ${typeof propsContainer[className]} dans les props.`);
            }
        }
    }

    for (const className in propsContainer) {
        if (!contextContainer[className]) {
            contextContainer[className] = propsContainer[className];
        }
    }
}
