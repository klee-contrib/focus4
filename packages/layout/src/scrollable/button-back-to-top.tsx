import scroll from "smoothscroll-polyfill";
scroll.polyfill();

import * as React from "react";
import posed from "react-pose";

import {ScrollableContext} from "@focus4/components";
import {useTheme} from "@focus4/styling";
import {Button, ButtonTheme} from "@focus4/toolbox";

import buttonBTTStyles from "./__style__/button-btt.css";
export {buttonBTTStyles};
export type ButtonBackToTopStyle = Partial<typeof buttonBTTStyles> & ButtonTheme;

/** Props du bouton de retour en haut de page. */
export interface ButtonBackToTopProps {
    /** CSS. */
    theme?: ButtonBackToTopStyle;
}

/** Bouton de retour en haut de page. */
export const ButtonBackToTop = posed(
    React.forwardRef<HTMLDivElement, ButtonBackToTopProps>(({theme: pTheme}, ref) => {
        const {backToTop, ...theme} = useTheme<ButtonBackToTopStyle>("buttonBTT", buttonBTTStyles, pTheme);
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
