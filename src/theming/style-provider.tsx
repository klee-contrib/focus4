import * as React from "react";

const specialReactKeys = {children: true, key: true, ref: true};

export class StyleProvider<P> extends React.Component<P, void> {

    static contextTypes = {
        classNames: React.PropTypes.object
    };

    static childContextTypes = {
        classNames: React.PropTypes.object
    };

    context: {classNames: {}};

    /** Type le StyleProvider. */
    static type<P>() {
        return StyleProvider as new() => React.Component<P, void>;
    }

    getChildContext() {
        const classNames = {};
        const {classNames: parentClassNames} = this.context;
        if (parentClassNames) {
            for (let key in parentClassNames) {
                (classNames as any)[key] = (parentClassNames as any)[key];
            }
        }

        for (let key in this.props) {
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
