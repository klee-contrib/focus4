import scroll from "smoothscroll-polyfill";
scroll.polyfill();

import * as React from "react";
import posed from "react-pose";
import {Button, ButtonTheme} from "react-toolbox/lib/button";

import {ScrollableContext} from "@focus4/components";
import {useTheme} from "@focus4/styling";

import styles from "../__style__/button-btt.css";
export type ButtonBackToTopStyle = Partial<typeof styles> & ButtonTheme;

/** Props du bouton de retour en haut de page. */
export interface ButtonBackToTopProps {
    /** CSS. */
    theme?: ButtonBackToTopStyle;
}

/** Bouton de retour en haut de page. */
export const ButtonBackToTop = posed(
    React.forwardRef<HTMLDivElement, ButtonBackToTopProps>(({theme: pTheme}, ref) => {
        const {backToTop, ...theme} = useTheme<ButtonBackToTopStyle>("buttonBTT", styles, pTheme);
        const scrollable = React.useContext(ScrollableContext);

        return (
            <div className={backToTop} ref={ref}>
                <Button
                    accent
                    onClick={() =>
                        scrollable.scrollTo({
                            top: 0
                        })
                    }
                    icon="expand_less"
                    floating
                    theme={theme}
                />
            </div>
        );
    })
)({
    enter: {scale: 1},
    exit: {scale: 0}
});
