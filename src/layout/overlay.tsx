import {isFunction} from "lodash";
import {computed, observable} from "mobx";
import React from "react";

import {useTheme} from "../theme";

import * as styles from "./__style__/overlay.css";
export type OverlayStyle = Partial<typeof styles>;
export {styles as overlayStyles};

export interface OverlayProps {
    onClick?: () => void;
    isAdditional?: boolean;
    theme?: OverlayStyle;
}

const overlays = observable<(() => void) | {handler: string}>([], {deep: false});
export const hasOneOverlay = computed(() => !!overlays.length);

function onOverlayClick() {
    const topOverlay = overlays[overlays.length - 1];
    if (isFunction(topOverlay)) {
        topOverlay();
        overlays.pop();
    }
}

export function Overlay({children, isAdditional, onClick, theme: pTheme}: React.PropsWithChildren<OverlayProps>) {
    const theme = useTheme("overlay", styles, pTheme);

    React.useEffect(() => {
        if (isAdditional) {
            return;
        }
        const noop = {handler: "none"};
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
