import {motion} from "framer-motion";
import {ReactNode, useState} from "react";

import {CSSProp, getSpringTransition, useTheme} from "@focus4/styling";
import {Button} from "@focus4/toolbox";

import lateralMenuCss, {LateralMenuCss} from "./__style__/lateral-menu.css";
export {lateralMenuCss};
export type {LateralMenuCss};

export interface LateralMenuProps {
    /** Contenu du menu. */
    children?: ReactNode;
    /** Taille du header, pour le 'position: sticky'. */
    headerHeight?: number;
    /** Menu rétractable. */
    retractable?: boolean;
    /** CSS. */
    theme?: CSSProp<LateralMenuCss>;
}

/**
 * Le `LateralMenu` permet de créer un menu latéral (à priori à gauche), qui restera sticky au scroll en haut de la page.
 *
 * Il doit être posé dans un conteneur avec un `display: flex`, et s'il est rétractable, alors son contenu devrait idéalement avoir une taille fixe.
 */
export function LateralMenu({children, headerHeight = 0, retractable = true, theme: pTheme}: LateralMenuProps) {
    const theme = useTheme("lateralMenu", lateralMenuCss, pTheme);
    const [opened, setOpened] = useState(true);

    return (
        <>
            <motion.div
                animate={opened ? "opened" : "closed"}
                className={theme.menu()}
                initial={false}
                style={{
                    top: `calc(${headerHeight}px + var(--content-padding-top))`,
                    maxHeight: `calc(100vh - ${headerHeight}px - 2 * var(--content-padding-top))`
                }}
                transition={getSpringTransition()}
                variants={{
                    opened: {width: "auto", marginLeft: "var(--content-padding-side)"},
                    closed: {width: 0, marginLeft: 0}
                }}
            >
                {children}
            </motion.div>
            {retractable ? (
                <Button
                    className={theme.button()}
                    icon={`keyboard_arrow_${opened ? "left" : "right"}`}
                    onClick={() => setOpened(!opened)}
                    style={{top: `calc(${headerHeight}px + var(--content-padding-top))`}}
                />
            ) : null}
        </>
    );
}
