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
function noop() {
    /* */
}

export function Overlay({children, onClick, theme: pTheme}: React.PropsWithChildren<OverlayProps>) {
    const theme = useTheme("overlay", styles, pTheme);

    React.useEffect(() => {
        overlays.push(onClick || noop);
        return () => {
            overlays.remove(onClick || noop);
        };
    }, [onClick]);

    return (
        <div className={theme.overlay} onClick={onOverlayClick}>
            {children}
        </div>
    );
}
