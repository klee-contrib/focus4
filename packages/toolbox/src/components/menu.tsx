import classNames from "classnames";
import {
    Children,
    cloneElement,
    MouseEvent,
    MouseEventHandler,
    ReactElement,
    ReactNode,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";

import {Button, ButtonProps} from "./button";
import {FontIcon} from "./font-icon";
import {IconButton} from "./icon-button";
import {Ripple} from "./ripple";
import {Tooltip, TooltipProps} from "./tooltip";

import menuCss, {MenuCss} from "./__style__/menu.css";
export {menuCss, MenuCss};

/** Props du ButtonMenu, qui est un simple menu React-Toolbox avec un bouton personnalisable. */
export interface ButtonMenuProps extends MenuProps {
    /** Les props du bouton. */
    button: ButtonProps & {
        /** A renseigner pour poser une tooltip autour du bouton. */
        tooltip?: Omit<TooltipProps, "children">;
        /** L'icône à afficher quand le bouton est ouvert. */
        openedIcon?: ReactNode;
    };
    onClick?: MouseEventHandler<HTMLButtonElement>;
}

export interface IconMenuProps {
    /** If true, the inner Menu component will be active. */
    active?: boolean;
    /** Class for the root node. */
    className?: string;
    /** Children to pass through the component. */
    children?: ReactNode;
    /** Icon font key string or Element to display the opener icon. */
    icon?: ReactNode;
    /** If true, the neutral colors are inverted. Useful if the icon is over a dark background. */
    inverse?: boolean;
    /** Callback that will be called when the menu is being clicked. */
    onClick?: MouseEventHandler<HTMLButtonElement | HTMLLinkElement>;
    /** Callback that will be called when the menu is being hidden. */
    onHide?: () => void;
    /** Callback that will be invoked when a menu item is selected. */
    onSelect?: (value: any) => void;
    /** Callback that will be invoked when the menu is being shown. */
    onShow?: () => void;
    /** Determines the position of the menu. This property is transferred to the inner Menu component. */
    position?: "auto" | "bottomLeft" | "bottomRight" | "static" | "topLeft" | "topRight";
    /** If true, the menu will keep a value to highlight the active child item. */
    selectable?: boolean;
    /** Used for selectable menus. Indicates the current selected value so the child item with this value can be highlighted. */
    selected?: any;
    /** Classnames object defining the component style. */
    theme?: CSSProp<MenuCss>;
}

export interface MenuItemProps extends PointerEvents<HTMLLIElement> {
    /** The text to include in the menu item. Required. */
    caption: string;
    className?: string;
    /** Children to pass through the component. */
    children?: ReactNode;
    /** If true, the item will be displayed as disabled and is not selectable. */
    disabled?: boolean;
    /** Icon font key string or Element to display in the right side of the option. */
    icon?: ReactNode;
    onClick?: MouseEventHandler<HTMLLIElement>;
    /** @internal */
    selected?: boolean;
    /** Displays shortcut text on the right side of the caption attribute. */
    shortcut?: string;
    /** Classnames object defining the component style. */
    theme?: CSSProp<MenuCss>;
    /** Passed down to the root element. */
    value?: string;
}

export interface MenuProps {
    /** If true, the menu will be displayed as opened by default. */
    active?: boolean;
    className?: string;
    /** Children to pass through the component. */
    children?: ReactNode;
    /** Callback that will be called when the menu is being hidden. */
    onHide?: () => void;
    /** Callback that will be invoked when a menu item is selected. */
    onSelect?: (value?: string) => void;
    /** Callback that will be invoked when the menu is being shown. */
    onShow?: () => void;
    /** If true the menu wrapper will show an outline with a soft shadow. */
    outline?: boolean;
    /** Determine the position of the menu. With static value the menu will be always shown, auto means that the it will decide the opening direction based on the current position. To force a position use topLeft, topRight, bottomLeft, bottomRight. */
    position?: "auto" | "bottomLeft" | "bottomRight" | "static" | "topLeft" | "topRight";
    /** If true, the menu will keep a value to highlight the active child item. */
    selectable?: boolean;
    /** Used for selectable menus. Indicates the current selected value so the child item with this value can be highlighted. */
    selected?: string;
    /** Classnames object defining the component style. */
    theme?: CSSProp<MenuCss>;
}

export interface MenuDividerProps {
    /** Classnames object defining the component style. */
    theme: CSSProp<MenuCss>;
}

/**
 * Séparateur dans un Menu, entre des MenuItems.
 */
export function MenuDivider({theme: pTheme}: MenuDividerProps) {
    const theme = useTheme("RTMenu", menuCss, pTheme);
    return <hr className={theme.menuDivider()} data-react-toolbox="menu-divider" />;
}

/**
 * Affiche un menu, utilisé par ButtonMenu et IconMenu.
 */
export function Menu({
    active: pActive = false,
    children,
    className = "",
    onHide,
    onSelect,
    onShow,
    outline = true,
    position: pPosition = "static",
    selected,
    selectable = true,
    theme: pTheme
}: MenuProps) {
    const theme = useTheme("RTMenu", menuCss, pTheme);

    const rootNode = useRef<HTMLDivElement | null>(null);
    const menuNode = useRef<HTMLUListElement | null>(null);

    const [active, setActive] = useState(pActive);
    const [activated, setActivated] = useState(false);
    const [rippled, setRippled] = useState(false);
    const [position, setPosition] = useState(pPosition === "auto" ? "topLeft" : pPosition);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    useLayoutEffect(() => {
        if (pActive) {
            setActivated(true);
            setActive(false);
            if (pPosition === "auto") {
                const parentNode = rootNode.current?.parentNode;
                if (parentNode) {
                    const {top, left, height: ph, width: pw} = (parentNode as HTMLElement).getBoundingClientRect();
                    const ww = window.innerWidth || document.documentElement.offsetWidth;
                    const wh = window.innerHeight || document.documentElement.offsetHeight;
                    const toTop = top < wh / 2 - ph / 2;
                    const toLeft = left < ww / 2 - pw / 2;
                    setPosition(`${toTop ? "top" : "bottom"}${toLeft ? "Left" : "Right"}` as const);
                }
            }

            const timeout = setTimeout(() => setActive(true), 20);
            onShow?.();
            return () => {
                clearTimeout(timeout);
            };
        } else {
            setActive(false);
            onHide?.();
        }
    }, [pActive, pPosition, onHide, onShow]);

    useEffect(() => {
        function handleDocumentClick(event: Event) {
            if (!targetIsDescendant(event, rootNode.current)) {
                setActive(false);
                setRippled(false);
                onHide?.();
            }
        }
        if (active) {
            document.addEventListener("click", handleDocumentClick);
            document.addEventListener("touchend", handleDocumentClick);
        }
        return () => {
            if (active) {
                document.removeEventListener("click", handleDocumentClick);
                document.removeEventListener("touchend", handleDocumentClick);
            }
        };
    }, [active, onHide]);

    const handleSelect = useCallback(
        (item: ReactElement, event: MouseEvent<HTMLLIElement>) => {
            const {value, onClick} = item.props;
            if (onClick) {
                event.persist();
            }
            setActive(false);
            setRippled(true);
            onClick?.(event);
            onSelect?.(value);
            onHide?.();
        },
        [onSelect]
    );

    const menuStyle = useMemo(() => {
        if (position !== "static") {
            if (active) {
                return {clip: `rect(0 ${width}px ${height}px 0)`};
            } else {
                switch (position) {
                    case "bottomLeft":
                        return {clip: `rect(${height}px 0 ${height}px 0)`};
                    case "bottomRight":
                        return {clip: `rect(${height}px ${width}px ${height}px ${width}px)`};
                    case "topLeft":
                        return {clip: "rect(0 0 0 0)"};
                    case "topRight":
                        return {clip: `rect(0 ${width}px 0 ${width}px)`};
                }
            }
        }

        return undefined;
    }, [active, height, position, width]);

    const rootStyle = useMemo(
        () => (position !== "static" ? (activated ? {width, height} : {width, height, display: "none"}) : undefined),
        [activated, height, position, width]
    );

    const outlineStyle = {width, height};

    const items = useMemo(
        () =>
            Children.map(children, item => {
                if (!item) {
                    return item;
                }

                const item2 = item as ReactElement;
                if (item2.type === MenuItem) {
                    return cloneElement(item2, {
                        selected:
                            typeof item2.props.value !== "undefined" && selectable && item2.props.value === selected,
                        onClick: (e: MouseEvent<HTMLLIElement>) => handleSelect(item2, e)
                    });
                }

                return cloneElement(item2);
            }),
        [children, handleSelect, selectable, selected]
    );

    useLayoutEffect(() => {
        const {height: ch, width: cw} = menuNode.current!.getBoundingClientRect();
        setWidth(cw);
        setHeight(ch);
    }, [activated, items]);

    return (
        <div
            ref={rootNode}
            className={classNames(theme.menu({[position]: true, active, rippled}), className)}
            data-react-toolbox="menu"
            style={rootStyle}
        >
            {outline ? <div className={theme.outline()} style={outlineStyle} /> : null}
            <ul ref={menuNode} className={theme.menuInner()} style={menuStyle}>
                {items}
            </ul>
        </div>
    );
}

function targetIsDescendant(event: Event, parent: Element | null) {
    let node = event.target;
    while (node !== null) {
        if (node === parent) return true;
        node = (node as Element).parentNode;
    }
    return false;
}

/**
 * Item de Menu a utiliser dans un `ButtonMenu`, `IconMenu` ou `Menu`.
 */
export function MenuItem({
    caption,
    children,
    className = "",
    disabled = false,
    icon,
    onClick,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    selected = false,
    shortcut,
    theme: pTheme
}: MenuItemProps) {
    const theme = useTheme("RTMenu", menuCss, pTheme);

    const handleClick = useCallback(
        (event: MouseEvent<HTMLLIElement>) => {
            if (onClick && !disabled) {
                onClick(event);
            }
        },
        [disabled, onClick]
    );

    return (
        <Ripple
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onPointerUp={onPointerUp}
        >
            <li
                className={classNames(theme.menuItem({disabled, selected}), className)}
                data-react-toolbox="menu-item"
                onClick={handleClick}
            >
                {icon ? <FontIcon className={theme.icon()} value={icon} /> : null}
                <span className={theme.caption()}>{caption}</span>
                {shortcut ? <small className={theme.shortcut()}>{shortcut}</small> : null}
                {children}
            </li>
        </Ripple>
    );
}
/**
 * Crée un menu à partir d'un `IconButton`.
 *
 * Exemple :
 *  ```tsx
 *  <IconMenu icon="more_vert" position="topRight">
 *      <MenuItem
 *          caption={mode.dark ? "Mode clair" : "Mode sombre"}
 *          icon={mode.dark ? "light_mode" : "dark_mode"}
 *          onClick={() => (mode.dark = !mode.dark)}
 *      />
 *      <MenuItem caption="Se déconnecter" icon="login" onClick={signOut} />
 *  </IconMenu>
 *  ```
 */
export function IconMenu({
    active: pActive = false,
    className = "",
    children,
    inverse,
    icon = "more_vert",
    onClick,
    onHide,
    onSelect,
    onShow,
    position = "auto",
    selected,
    selectable = false,
    theme: pTheme
}: IconMenuProps) {
    const theme = useTheme("RTMenu", menuCss, pTheme);

    const [active, setActive] = useState(pActive);
    useEffect(() => setActive(pActive), [pActive]);

    const clickHandler = useCallback(
        (e: MouseEvent<HTMLButtonElement | HTMLLinkElement>) => {
            e.stopPropagation();
            setActive(o => !o);
            onClick?.(e);
        },
        [onClick]
    );

    const hideHandler = useCallback(() => {
        setActive(false);
        onHide?.();
    }, [onHide]);

    return (
        <div className={classNames(theme.iconMenu(), className)}>
            <IconButton className={theme.icon()} icon={icon} inverse={inverse} onClick={clickHandler} />
            <Menu
                active={active}
                onHide={hideHandler}
                onSelect={onSelect}
                onShow={onShow}
                position={position}
                selectable={selectable}
                selected={selected}
                theme={theme}
            >
                {children}
            </Menu>
        </div>
    );
}

/**
 * Crée un menu à partir d'un `Button`.
 *
 * Exemple :
 *
 *  ```tsx
 *  <ButtonMenu
 *      button={{
 *          label: userStore.userName,
 *          icon: "more_vert"
 *      }}
 *      position="topRight"
 *  >
 *      <MenuItem
 *          caption={mode.dark ? "Mode clair" : "Mode sombre"}
 *          icon={mode.dark ? "light_mode" : "dark_mode"}
 *          onClick={() => (mode.dark = !mode.dark)}
 *      />
 *      <MenuItem caption="Se déconnecter" icon="login" onClick={signOut} />
 *  </ButtonMenu>
 *  ```
 */
export function ButtonMenu({
    button: {icon, openedIcon, ...buttonProps},
    onClick,
    onHide,
    position = "topLeft",
    ...menuProps
}: ButtonMenuProps) {
    const ref = useRef<HTMLDivElement | null>(null);

    /** Menu ouvert. */
    const [opened, setOpened] = useState(false);

    /** Hauteur du bouton, pour placer le menu. */
    const [buttonHeight, setButtonHeight] = useState(0);

    // On récupère à tout instant la hauteur du bouton.
    useLayoutEffect(() => {
        setButtonHeight(ref.current?.querySelector("button")?.clientHeight ?? 0);
    });

    const clickHandler = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            setOpened(o => !o);
            onClick?.(e);
        },
        [onClick]
    );

    const hideHandler = useCallback(() => {
        setOpened(false);
        onHide?.();
    }, [onHide]);

    /** Génère le style à passer au menu pour le positionner, en fonction de la position souhaitée et de la taille du bouton. */
    const menuStyle = useMemo(() => {
        if (position === "auto") {
            return undefined;
        }
        return {
            position: "absolute" as const,
            top: position.startsWith("top") ? buttonHeight : undefined,
            bottom: position.startsWith("bottom") ? buttonHeight : undefined,
            right: position.endsWith("Right") ? 0 : undefined
        };
    }, [position, buttonHeight]);

    const button = <Button {...buttonProps} icon={opened && openedIcon ? openedIcon : icon} onClick={clickHandler} />;
    return (
        <div ref={ref} data-focus="button-menu" style={{position: "relative", display: "inline-block"}}>
            {buttonProps.tooltip ? <Tooltip {...buttonProps.tooltip}>{button}</Tooltip> : button}
            <div style={menuStyle}>
                <Menu {...menuProps} active={opened} onHide={hideHandler} position={position} theme={menuProps.theme}>
                    {menuProps.children}
                </Menu>
            </div>
        </div>
    );
}
