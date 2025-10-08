import classNames from "classnames";
import {observable} from "mobx";
import {useLocalObservable} from "mobx-react";
import {PropsWithChildren, ReactNode, useContext, useId, useLayoutEffect, useState} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {OverlayContext, ScrollableContext} from "../utils/contexts";

import {useActiveTransition} from "./active-transition";

import overlayCss, {OverlayCss} from "./__style__/overlay.css";

export {overlayCss};
export type {OverlayCss};

/**
 * Active l'overlay, utilisé pour faire un Dialog ou une Popin.
 * @param active Active/désactive l'overlay
 * @param close Pour fermer l'overlay au clic dessus.
 * @param overAll Force l'affichage de l'overlay sur tous les `Scrollable`.
 */
export function useOverlay(active: boolean, close?: () => void, overAll = false) {
    const {toggle} = useContext(OverlayContext);
    const scrollable = useContext(ScrollableContext);
    const level = overAll ? Infinity : scrollable.level;
    const overlayId = useId();
    useLayoutEffect(() => {
        toggle(overlayId, level, active, close);
    }, [active, close, level]);
    useLayoutEffect(() => () => toggle(overlayId, level, false), []);
}

/** Composant pour afficher un overlay. */
export function Overlay({
    active = false,
    close,
    theme: pTheme
}: PropsWithChildren<{
    active: boolean;
    close: () => void;
    theme?: CSSProp<OverlayCss>;
}>) {
    const theme = useTheme("overlay", overlayCss, pTheme);
    const [displayed, tClassName] = useActiveTransition(active, theme);
    // oxlint-disable-next-line click-events-have-key-events
    return displayed ? <div className={classNames(tClassName, theme.overlay())} onClick={close} /> : null;
}

/** Provider de contexte pour l'overlay, pour que chaque Scrollable (et le MainMenu) puissent afficher l'overlay quand il est demandé par un composant. */
export function OverlayProvider({children}: {children: ReactNode}) {
    const [overlays] = useState(() => observable.array<{id: string; level: number; close?: () => void}>([]));

    const context = useLocalObservable(() => ({
        get activeLevel() {
            return Math.max(...overlays.map(o => o.level)) ?? -1;
        },
        toggle(id: string, level: number, active: boolean, close?: () => void) {
            const overlay = overlays.find(o => o.id === id);
            if (!overlay && active) {
                overlays.push({id, level, close});
            } else if (overlay && !active) {
                overlays.remove(overlay);
            } else if (overlay) {
                overlay.close = close;
            }
        },
        close() {
            if (overlays.length > 0) {
                const topOverlay = overlays.at(-1);
                topOverlay?.close?.();
            }
        }
    }));

    return <OverlayContext.Provider value={context}>{children}</OverlayContext.Provider>;
}
