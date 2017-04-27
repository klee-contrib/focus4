import * as React from "react";

/** Wrapper d'un composant avec du style injecté. */
export interface StyleInjector<C> {

    /** L'instance du composant wrappé (React.Component uniquement). */
    instance: C;
}

/**
 * Décorateur qui fusionnne le contenu de `this.props.classNames` avec celui du `classContainerName` passé en props d'un StyleProvider parent.
 * @param classContainerName Le nom du conteneur de classes CSS.
 */
export function injectStyle<P extends {classNames?: {[key: string]: any}}>(classContainerName: string): (Component: React.ComponentClass<P>) => void;

/**
 * Fusionnne le contenu de `props.classNames` avec celui du `classContainerName` passé en props d'un StyleProvider parent.
 * @param classContainerName Le nom du conteneur de classes CSS.
 * @param Component Le composant cible.
 */
export function injectStyle<P extends {classNames?: {[key: string]: any}}>(classContainerName: string, Component: ReactComponent<P>): React.ComponentClass<P>;
export function injectStyle<P extends {classNames?: {[key: string]: any}}>(classContainerName: string, Component?: ReactComponent<P>): any {
    function makeInjectedComponent(Comp: ReactComponent<P>) {
        class StyleInjector extends React.Component<P, void> {

            /** On récupère `classNames` dans le contexte. */
            static contextTypes = {classNames: React.PropTypes.object};
            static wrappedComponent = Comp;

            /** `classNames` est une map de containers de map de classes CSS. */
            context: {classNames: {[key: string]: {[key: string]: any}}};
            /** L'instance du composant wrappé. */
            instance: React.Component<P, React.ComponentState>;

            /** Fusion des `classNames` du contexte et des props. */
            classNames: {[key: string]: {[key: string]: any}};

            componentWillMount() {
                // On va cherche les `classNames` dans le contexte et on les fusionne avec les props si on les trouve.
                const contextClassNames = this.context && this.context.classNames && this.context.classNames[classContainerName];
                const {classNames = {}} = this.props;
                if (contextClassNames) {
                    fillClassNames(contextClassNames, classNames);
                }

                this.classNames = contextClassNames || classNames;
            }

            render() {
                // Si le composant est une fonction, alors on ne peut pas poser de ref dessus.
                if (!isStateful(Comp)) {
                    return <Comp {...this.props as any} classNames={this.classNames} />;
                } else {
                    return <Comp {...this.props as any} classNames={this.classNames} ref={i => this.instance = i} />;
                }
            }
        }

        // On fusionne les propriétés statiques du composant (sinon on ne peut pas y accéder) avec le wrapper et on retire l'observer MobX qui s'y trouve.
        return Object.assign(StyleInjector, Comp, {isMobXReactObserver: false});
    }

    // On gère les deux signatures de la méthode.
    if (Component) {
        return makeInjectedComponent(Component);
    } else {
        return makeInjectedComponent as any;
    }
}

/**
 * Vérifie si un composant est une classe.
 * @param Component Le composant.
 */
function isStateful(Component: any): Component is React.ComponentClass<any> {
    return !!Component.prototype.render;
}

/**
 * Fusionne récursivement les deux objets `classNames` du contexte et des props.
 * @param contextContainer L'objet `classNames` du contexte (objet de sortie).
 * @param propsContainer L'objet `classNames` des props.
 */
function fillClassNames(contextContainer: {[key: string]: any}, propsContainer: {[key: string]: any}) {

    // On parcourt les classes du contexte.
    for (const className in contextContainer) {

        // Si la classe est aussi dans les props.
        if (propsContainer[className]) {
            if (typeof contextContainer[className] === "string" && typeof propsContainer[className] === "string") { // string - string -> on concatène.
                contextContainer[className] += ` ${propsContainer[className]}`;
            } else if (typeof contextContainer[className] === "object" && typeof propsContainer[className] === "object") { // objet - objet -> récursion.
                fillClassNames(contextContainer[className], propsContainer[className]);
            } else if (typeof contextContainer[className] !== typeof propsContainer[className]) { // types différents -> erreur.
                console.warn(`${className} est un ${typeof contextContainer[className]} dans le contexte et un ${typeof propsContainer[className]} dans les props.`);
            }
        }
    }

    // Pour les classes dans les props et pas dans le contexte, on les ajoute simplement à l'objet de sortie.
    for (const className in propsContainer) {
        if (!contextContainer[className]) {
            contextContainer[className] = propsContainer[className];
        }
    }
}
