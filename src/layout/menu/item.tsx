import {action, observable} from "mobx";
import {useObserver} from "mobx-react";
import * as React from "react";
import posed, {Transition} from "react-pose";
import {Button, ButtonProps, IconButton, IconButtonTheme} from "react-toolbox/lib/button";

import {useTheme} from "../../theme";

import {MenuContext} from "./context";
import {MainMenuList} from "./list";

import * as styles from "./__style__/menu.css";

/** Props du MenuItem. */
export interface MainMenuItemProps extends ButtonProps {
    /** La route associée, pour comparaison avec la route active. */
    route?: string;
    /** CSS. */
    theme?: IconButtonTheme & {panel?: string};
}

/** Elément de menu. */
export function MainMenuItem({label, icon, onClick, route, children, theme: pTheme, ...otherProps}: MainMenuItemProps) {
    const theme = useTheme("mainMenu", styles, pTheme);
    const context = React.useContext(MenuContext);
    const [state] = React.useState(() => observable({hasSubMenu: false, top: 0, left: 0}));

    const li = React.useRef<HTMLLIElement>(null);
    const panel = React.useRef<HTMLDivElement>(null);

    const onItemClick = React.useCallback(
        action(() => {
            if (children) {
                const liRect = li.current!.getBoundingClientRect();
                state.hasSubMenu = !state.hasSubMenu;
                state.top = liRect.top;
                state.left = liRect.width;
            }
            if (onClick) {
                onClick();
                context.closePanel();
            }
        }),
        []
    );

    React.useLayoutEffect(() => {
        const render = label
            ? ([
                  li,
                  <Button {...otherProps} icon={icon} label={label} onClick={onItemClick} theme={theme} />,
                  route
              ] as const)
            : ([li, <IconButton {...otherProps} icon={icon} onClick={onItemClick} theme={theme} />, route] as const);
        context.addItem(render);
        return () => context.removeItem(render);
    }, []);

    const onDocumentClick = React.useCallback((e: MouseEvent) => {
        if (panel.current && li.current) {
            if (!panel.current.contains(e.target as Node) && !li.current.contains(e.target as Node)) {
                state.hasSubMenu = false;
            }
        }
    }, []);

    React.useEffect(() => {
        document.addEventListener("mouseup", onDocumentClick);
        return () => document.removeEventListener("mouseup", onDocumentClick);
    }, []);

    return useObserver(() => (
        <Transition>
            {state.hasSubMenu && (
                <PosedDiv key="panel" ref={panel} className={theme.panel} style={state}>
                    <MainMenuList
                        activeRoute={context.activeRoute}
                        closePanel={() => (state.hasSubMenu = false)}
                        theme={theme}
                    >
                        {children}
                    </MainMenuList>
                </PosedDiv>
            )}
        </Transition>
    ));
}

const PosedDiv = posed.div({
    enter: {
        x: "0%",
        opacity: 1,
        transition: {type: "tween"}
    },
    exit: {
        x: "-100%",
        opacity: 0,
        transition: {type: "tween"}
    }
});
