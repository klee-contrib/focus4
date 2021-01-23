import {isFunction} from "lodash";
import {computed, observable} from "mobx";
import {useObserver} from "mobx-react";
import {PropsWithChildren, useEffect} from "react";
import {CSSTransition, TransitionGroup} from "react-transition-group";

import {CSSProp, cssTransitionProps, fromBem, useTheme} from "@focus4/styling";

import overlayCss, {OverlayCss} from "./__style__/overlay.css";
export {overlayCss, OverlayCss};

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

export function Overlay({active, children, isAdditional, onClick, theme: pTheme}: PropsWithChildren<OverlayProps>) {
    const theme = useTheme("overlay", overlayCss, pTheme);

    useEffect(() => {
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
            {(isAdditional ? hasOneOverlay.get() : active) ? (
                <CSSTransition {...cssTransitionProps(fromBem(theme) as any)}>
                    <div className={theme.overlay()} onClick={onOverlayClick}>
                        {children}
                    </div>
                </CSSTransition>
            ) : null}
        </TransitionGroup>
    ));
}
