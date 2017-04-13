import * as React from "react";

const specialReactKeys = {children: true, key: true, ref: true};

/** Provider de classes CSS pour le reste de l'application. Posé par le Layout. Considère que chacune de ses props est un container de classes CSS. */
export class StyleProvider<P> extends React.Component<P, void> {

    // On se réserve le contexte `classNames`.
    static childContextTypes = {
        classNames: React.PropTypes.object
    };

    // On autorise d'avoir plusieurs providers.
    static contextTypes = {
        classNames: React.PropTypes.object
    };

    context: {classNames: {}};

    /** Type le StyleProvider. */
    static type<P>() {
        return StyleProvider as new() => React.Component<P, void>;
    }

    /** Renvoie le contexte qui sera passé à tous les descendants, soit l'objet `classNames`. */
    getChildContext() {
        const classNames = {};

        // On regarde si on a pas déjà un StyleProvider parent. Dans ce cas, on récupère son contenu.
        const {classNames: parentClassNames} = this.context;
        if (parentClassNames) {
            for (const key in parentClassNames) {
                (classNames as any)[key] = (parentClassNames as any)[key];
            }
        }

        // Puis on parcourt toutes les props du StyleProvider et on les ajoute on contexte.
        for (const key in this.props) {
            if (!(key in specialReactKeys)) {
                (classNames as any)[key] = (this.props as any)[key];
            }
        }

        return {classNames};
    }

    render() {
        if (this.props.children) {
            return React.Children.only(this.props.children);
        } else {
            return null;
        }
    }
}
