import classNames from "classnames";
import {isFunction} from "lodash";
import {computed, observable} from "mobx";
import {useObserver} from "mobx-react";
import {PropsWithChildren, useEffect} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {useActiveTransition} from "./active-transition";

import overlayCss, {OverlayCss} from "./__style__/overlay.css";
export {overlayCss};
export type {OverlayCss};

export interface OverlayProps {
    active: boolean;
    onClick?: () => void;
    isAdditional?: boolean;
    theme?: CSSProp<OverlayCss>;
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
    isAdditional = false,
    onClick,
    theme: pTheme
}: PropsWithChildren<OverlayProps>) {
    const theme = useTheme("overlay", overlayCss, pTheme);

    useEffect(() => {
        if (isAdditional || !active) {
            return;
        }
        const noop = {handler: "none"};
        overlays.push(onClick ?? noop);
        return () => {
            const oIdx = overlays.findIndex(o => o === (onClick ?? noop));
            if (oIdx >= 0) {
                overlays.splice(oIdx);
            }
        };
    }, [active, onClick]);

    return useObserver(() => {
        const [displayed, tClassName] = useActiveTransition(isAdditional ? hasOneOverlay.get() : active, theme);
        return displayed ? (
            <div className={classNames(tClassName, theme.overlay())} onClick={onOverlayClick}>
                {children}
            </div>
        ) : null;
    });
}
