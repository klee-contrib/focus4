import {isFunction} from "lodash";
import {computed, observable} from "mobx";
import {useObserver} from "mobx-react-lite";
import React from "react";
import {CSSTransition, TransitionGroup} from "react-transition-group";

import {cssTransitionProps, useTheme} from "@focus4/styling";

import * as styles from "./__style__/overlay.css";
export type OverlayStyle = Partial<typeof styles>;
export {styles as overlayStyles};

export interface OverlayProps {
    active: boolean;
    onClick?: () => void;
    isAdditional?: boolean;
    theme?: OverlayStyle;
}

const overlays = observable<(() => void) | {handler: string}>([], {deep: false});
const hasOneOverlay = computed(() => !!overlays.length);

function onOverlayClick() {
    const topOverlay = overlays[overlays.length - 1];
    if (isFunction(topOverlay)) {
        topOverlay();
        overlays.pop();
    }
}

export function Overlay({
    active,
    children,
    isAdditional,
    onClick,
    theme: pTheme
}: React.PropsWithChildren<OverlayProps>) {
    const theme = useTheme("overlay", styles, pTheme);

    React.useEffect(() => {
        if (isAdditional || !active) {
            return;
        }
        const noop = {handler: "none"};
        overlays.push(onClick || noop);
        return () => {
            const oIdx = overlays.findIndex(o => o === (onClick || noop));
            if (oIdx >= 0) {
                overlays.splice(oIdx);
            }
        };
    }, [active, onClick]);

    return useObserver(() => (
        <TransitionGroup component={null}>
            {(isAdditional ? (
                hasOneOverlay.get()
            ) : (
                active
            )) ? (
                <CSSTransition {...cssTransitionProps(theme)}>
                    <div className={theme.overlay} onClick={onOverlayClick}>
                        {children}
                    </div>
                </CSSTransition>
            ) : null}
        </TransitionGroup>
    ));
}
