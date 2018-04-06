import scroll from "smoothscroll-polyfill";
scroll.polyfill();

import {action, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";
import {Button, ButtonTheme} from "react-toolbox/lib/button";

import * as styles from "./__style__/button-btt.css";
export type ButtonBackToTopStyle = Partial<typeof styles>;

/** Props du bouton de retour en haut de page. */
export interface ButtonBackToTopProps {
    /** Offset avant l'apparition du bouton. Par défaut : 100. */
    offset?: number;
    /** Comportement du scroll. Par défaut : "smooth" */
    scrollBehaviour?: ScrollBehavior;
    /** CSS. */
    theme?: ButtonTheme & ButtonBackToTopStyle;
}

/** Bouton de retour en haut de page. */
@observer
export class ButtonBackToTop extends React.Component<ButtonBackToTopProps, void> {

    @observable isVisible = false;

    componentDidMount() {
        window.addEventListener("scroll", this.scrollSpy);
        window.addEventListener("resize", this.scrollSpy);
        this.scrollSpy();
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.scrollSpy);
        window.removeEventListener("resize", this.scrollSpy);
    }

    /** Détermine si le bouton est visible, c'est-à-dire quand on a dépassé l'offset. */
    @action.bound
    scrollSpy() {
        const {offset = 100} = this.props;
        this.isVisible = (window.pageYOffset || document.documentElement.scrollTop) > offset;
    }

    /** Remonte la page, de façon fluide. */
    @action.bound
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: this.props.scrollBehaviour || "smooth"
        });
    }

    render() {
        const {theme} = this.props;
        return this.isVisible ?
            <div className={theme!.backToTop}>
                <Button
                    accent
                    onClick={this.scrollToTop}
                    icon="expand_less"
                    floating
                    theme={theme}
                />
            </div>
        : null;
    }
}

export default themr("buttonBTT", styles)(ButtonBackToTop);
