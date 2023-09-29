import classNames from "classnames";
import {
    Children,
    cloneElement,
    MouseEvent,
    MouseEventHandler,
    ReactElement,
    ReactNode,
    RefObject,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";

import {FontIcon} from "./font-icon";
import {Ripple} from "./ripple";

import menuCss, {MenuCss} from "./__style__/menu.css";
export {menuCss, MenuCss};

export interface MenuProps {
    /** If true, the menu will be displayed as opened by default. */
    active?: boolean;
    /** Anchor element for the menu. */
    anchor?: RefObject<HTMLElement | null>;
    /** Class name for root element. */
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
    /** Determine the position of the menu. Auto means that the it will decide the opening direction based on the current position. To force a position use topLeft, topRight, bottomLeft, bottomRight. */
    position?: "auto" | "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
    /** If true, the menu will keep a value to highlight the active child item. */
    selectable?: boolean;
    /** Used for selectable menus. Indicates the current selected value so the child item with this value can be highlighted. */
    selected?: string;
    /** Toggle menu on/off. */
    toggle?: () => void;
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
 * Item de Menu a utiliser dans un `Menu`.
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

/** Hook pour attacher un menu à un élément et une fonction pour l'ouvrir et le fermer. */
export function useMenu<T extends HTMLElement>() {
    const anchor = useRef<T | null>(null);
    const [active, setActive] = useState(false);
    return {anchor, active, toggle: () => setActive(a => !a)};
}

/**
 * Menu déroulant. Peut s'attacher à un élément parent. A utiliser avec `useMenu()`.
 *
 * Exemple :
 *  ```tsx
 *  const menu = useMenu<HTMLDivElement>();
 *
 *  // Remarque : L'élément conteneur impérativement avoir "position: relative".
 *  return (
 *      <span ref={menu.anchor} style={{position: "relative", display: "inline-block"}}>
 *          <IconButton icon="more_vert" onClick={menu.toggle}>
 *          <Menu {...menu}>
 *              <MenuItem
 *                  caption={mode.dark ? "Mode clair" : "Mode sombre"}
 *                  icon={mode.dark ? "light_mode" : "dark_mode"}
 *                  onClick={() => (mode.dark = !mode.dark)}
 *              />
 *              <MenuItem caption="Se déconnecter" icon="login" onClick={signOut} />
 *          </Menu>
 *      </span>
 *  );
 *  ```
 */
export function Menu({
    active: pActive,
    anchor,
    children,
    className = "",
    onHide,
    onSelect,
    onShow,
    outline = true,
    position: pPosition = "auto",
    selected,
    selectable = true,
    toggle,
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
    const [anchorHeight, setAnchorHeight] = useState(0);

    useLayoutEffect(() => {
        setAnchorHeight(anchor?.current?.clientHeight ?? 0);
    });

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
                toggle?.();
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
    }, [active, onHide, toggle]);

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
            toggle?.();
        },
        [onSelect, onSelect, toggle]
    );

    const rootStyle = useMemo(
        () => ({
            position: "absolute" as const,
            width,
            height,
            top: position.startsWith("top") ? anchorHeight : undefined,
            bottom: position.startsWith("bottom") ? anchorHeight : undefined,
            right: position.endsWith("Right") ? 0 : undefined,
            display: !activated ? "none" : undefined
        }),
        [activated, height, position, width, anchorHeight]
    );

    const outlineStyle = {width, height};

    const menuStyle = useMemo(() => {
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
    }, [active, height, position, width]);

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
