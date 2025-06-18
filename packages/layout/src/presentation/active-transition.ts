import classNames from "classnames";
import {useEffect, useRef} from "react";
import {useTransitionState} from "react-transition-state";

import {CSSProp, fromBem, getDefaultTransition} from "@focus4/styling";

function getTimeout() {
    const {delay, duration} = getDefaultTransition();
    return (delay + duration) * 1000;
}

/**
 * Gère une transition active/inactive avec des animations de transition.
 * @param active Active
 * @param theme Objet CSS contenant les classes enter/enterActive/exit/exitActive à utiliser pour la transition.
 * @param onClosed Handler à appeler une fois que la transition de fermeture est bien terminée.
 * @returns Si le composant doit être afficher ou non + la classe CSS à poser sur l'élément à animer.
 */
export function useActiveTransition(
    active: boolean,
    theme: CSSProp<{enter: string; enterActive: string; exit: string; exitActive: string}>,
    onClosed?: () => void
) {
    const [{status, isMounted}, toggle] = useTransitionState({
        preEnter: true,
        preExit: true,
        mountOnEnter: true,
        unmountOnExit: true,
        timeout: getTimeout()
    });
    const {enter = "", enterActive = "", exit = "", exitActive = ""} = fromBem(theme);

    useEffect(() => toggle(active), [active, toggle]);

    const firstRender = useRef(true);
    useEffect(() => {
        if (!isMounted && !firstRender.current) {
            onClosed?.();
        }
        firstRender.current = false;
    }, [isMounted]);

    return [
        isMounted,
        status === "preEnter"
            ? enter
            : status === "entering"
              ? classNames(enter, enterActive)
              : status === "preExit"
                ? exit
                : status === "exiting"
                  ? classNames(exit, exitActive)
                  : ""
    ];
}
