import {observable} from "mobx";
import React from "react";

import {useTheme} from "../theme";

import * as styles from "./__style__/overlay.css";
export type OverlayStyle = Partial<typeof styles>;
export {styles as overlayStyles};

export interface OverlayProps {
    onClick?: () => void;
    theme?: OverlayStyle;
}

const overlays = observable<() => void>([]);
function onOverlayClick() {
    overlays[overlays.length - 1]();
}

export function Overlay({children, onClick, theme: pTheme}: React.PropsWithChildren<OverlayProps>) {
    const theme = useTheme("overlay", styles, pTheme);

    React.useEffect(() => {
        if (onClick) {
            overlays.push(onClick);
            return () => {
                overlays.remove(onClick);
            };
        }
    }, [onClick]);

    return (
        <div className={theme.overlay} onClick={onOverlayClick}>
            {children}
        </div>
    );
}

export function cssTransitionProps(theme: {enter: string; exit: string}) {
    const {animationDelay, animationDuration} = window.getComputedStyle(document.body);
    return {
        timeout: toMs(animationDelay) + toMs(animationDuration),
        classNames: {
            enter: theme.exit,
            enterActive: theme.enter,
            exitActive: theme.exit
        }
    };
}

function toMs(d: string) {
    if (d.endsWith("s")) {
        return +d.substring(0, d.length - 1) * 1000;
    } else {
        return +d.substring(0, d.length - 2);
    }
}
