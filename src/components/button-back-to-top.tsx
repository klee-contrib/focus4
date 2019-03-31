import scroll from "smoothscroll-polyfill";
scroll.polyfill();

import * as React from "react";
import {Button, ButtonTheme} from "react-toolbox/lib/button";

import {useTheme} from "../theme";

import {ScrollableContext} from "./scrollable";

import * as styles from "./__style__/button-btt.css";
export type ButtonBackToTopStyle = Partial<typeof styles> & ButtonTheme;

/** Props du bouton de retour en haut de page. */
export interface ButtonBackToTopProps {
    /** Offset avant l'apparition du bouton. Par défaut : 100. */
    offset?: number;
    /** Comportement du scroll. Par défaut : "smooth" */
    scrollBehaviour?: ScrollBehavior;
    /** CSS. */
    theme?: ButtonBackToTopStyle;
}

/** Bouton de retour en haut de page. */
export function ButtonBackToTop({offset = 100, scrollBehaviour = "smooth", theme: pTheme}: ButtonBackToTopProps) {
    const {backToTop, ...theme} = useTheme<ButtonBackToTopStyle>("buttonBTT", styles, pTheme);
    const scrollable = React.useContext(ScrollableContext);
    const [isVisible, setIsVisible] = React.useState(false);

    /** Permet de n'afficher le bouton que si le scroll a dépassé l'offset. */
    React.useEffect(() => scrollable.registerScroll(top => setIsVisible(top > offset)), [offset]);

    /** Remonte la page, de façon fluide. */
    const scrollToTop = React.useCallback(
        () =>
            scrollable.scrollTo({
                top: 0,
                behavior: scrollBehaviour
            }),
        [scrollBehaviour]
    );

    return isVisible ? (
        <div className={backToTop}>
            <Button accent onClick={scrollToTop} icon="expand_less" floating theme={theme} />
        </div>
    ) : null;
}
