import {AnimatePresence, motion} from "framer-motion";
import {action, toJS} from "mobx";
import {useLocalObservable, useObserver} from "mobx-react";
import {
    createElement,
    MouseEventHandler,
    ReactNode,
    MouseEvent as RMouseEvent,
    useCallback,
    useContext,
    useEffect,
    useRef
} from "react";

import {CSSProp, getDefaultTransition, useTheme} from "@focus4/styling";
import {FontIcon, Icon, PointerEvents, Ripple, useInputRef} from "@focus4/toolbox";

import {MenuContext} from "./context";
import {MainMenuList} from "./list";

import mainMenuCss, {MainMenuCss} from "./__style__/main-menu.css";

/** Props du MenuItem. */
export interface MainMenuItemProps extends PointerEvents<HTMLButtonElement | HTMLLinkElement> {
    /** Pour passer un sous-menu. */
    children?: ReactNode;
    /** Si renseigné, pose une balise <a> à la place du <button>. */
    href?: string;
    /** Icône a afficher dans l'item de menu. */
    icon?: Icon;
    /**  Libellé de l'item de menu. */
    label?: string;
    /** Au clic sur le l'item de menu. */
    onClick?: MouseEventHandler<HTMLButtonElement | HTMLLinkElement>;
    /** La route associée, pour comparaison avec la route active définie dans le `MainMenu`. */
    route?: string;
    /** CSS. */
    theme?: CSSProp<MainMenuCss>;
}

/**
 * Elément de menu, à poser comme enfant direct d'un `MainMenu` ou d'un autre `MainMenuItem` (pour faire un sous-menu).
 */
export function MainMenuItem({
    children,
    href,
    icon,
    label,
    onClick,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    route,
    theme: pTheme
}: MainMenuItemProps) {
    const theme = useTheme<MainMenuCss>("mainMenu", mainMenuCss, pTheme);
    const context = useContext(MenuContext);
    const state = useLocalObservable(() => ({hasSubMenu: false, top: 0, left: 0}));

    const li = useRef<HTMLLIElement>(null);
    const panel = useRef<HTMLDivElement>(null);

    const onItemClick = useCallback(
        action((event: RMouseEvent<HTMLButtonElement | HTMLLinkElement>) => {
            if (children) {
                const liRect = li.current!.getBoundingClientRect();
                state.hasSubMenu = !state.hasSubMenu;
                state.top = liRect.top;
                state.left = liRect.left + liRect.width;
            }
            if (onClick) {
                onClick(event);
                context.closePanel();
            }
        }),
        []
    );

    const onDocumentClick = useCallback((e: MouseEvent) => {
        if (panel.current && li.current) {
            if (!panel.current.contains(e.target as Node) && !li.current.contains(e.target as Node)) {
                state.hasSubMenu = false;
            }
        }
    }, []);

    useEffect(() => {
        document.addEventListener("mouseup", onDocumentClick);
        return () => document.removeEventListener("mouseup", onDocumentClick);
    }, []);

    const {ref, handlePointerLeave, handlePointerUp} = useInputRef({
        onPointerLeave,
        onPointerUp
    });

    const element = href ? "a" : "button";

    return useObserver(() => {
        const props = {
            ref,
            className: theme.item({active: route === context.activeRoute, opened: state.hasSubMenu}),
            href,
            onClick: onItemClick,
            type: !href ? "button" : undefined
        };
        return (
            <>
                <li ref={li}>
                    <Ripple
                        onPointerDown={onPointerDown}
                        onPointerEnter={onPointerEnter}
                        onPointerLeave={handlePointerLeave}
                        onPointerUp={handlePointerUp}
                    >
                        {createElement(
                            element,
                            props,
                            icon ? <FontIcon className={theme.icon()} icon={icon} /> : null,
                            label ? <span className={theme.label()}>{label}</span> : null
                        )}
                    </Ripple>
                </li>
                {context.renderSubMenu(
                    <AnimatePresence>
                        {state.hasSubMenu ? (
                            <motion.div
                                ref={panel}
                                animate="visible"
                                className={theme.panel()}
                                exit="hidden"
                                initial="hidden"
                                style={toJS(state)}
                                transition={getDefaultTransition()}
                                variants={{
                                    visible: {
                                        width: "auto",
                                        opacity: 1
                                    },
                                    hidden: {
                                        width: 0,
                                        opacity: 0.7
                                    }
                                }}
                            >
                                <MainMenuList
                                    activeRoute={context.activeRoute}
                                    closePanel={() => (state.hasSubMenu = false)}
                                    theme={theme}
                                >
                                    {children}
                                </MainMenuList>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                )}
            </>
        );
    });
}
