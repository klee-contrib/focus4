import {motion} from "framer-motion";
import {useContext} from "react";

import {CSSProp, ScrollableContext, useTheme} from "@focus4/styling";
import {FloatingActionButton, FloatingActionButtonCss} from "@focus4/toolbox";

import buttonBttCss, {ButtonBttCss as BTTCss} from "./__style__/button-btt.css";
export type ButtonBttCss = BTTCss & FloatingActionButtonCss;
export {buttonBttCss};

/** Props du bouton de retour en haut de page. */
export interface ButtonBackToTopProps {
    /** CSS. */
    theme?: CSSProp<ButtonBttCss>;
}

/** Bouton de retour en haut de page. */
export function ButtonBackToTop({theme: pTheme}: ButtonBackToTopProps) {
    const {backToTop, ...theme} = useTheme<ButtonBttCss>("buttonBTT", buttonBttCss, pTheme);
    const scrollable = useContext(ScrollableContext);

    return (
        <motion.div animate={{scale: 1}} className={backToTop()} exit={{scale: 0}} initial={{scale: 0}}>
            <FloatingActionButton
                color="accent"
                icon="expand_less"
                onClick={() =>
                    scrollable.scrollTo({
                        top: 0
                    })
                }
                theme={theme}
            />
        </motion.div>
    );
}
