import classNames from "classnames";
import {AnimatePresence, motion} from "framer-motion";
import {
    AriaRole,
    Children,
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

import {CSSProp, getSpringTransition, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";

import {FontIcon} from "./font-icon";
import {Ripple} from "./ripple";

import menuCss, {MenuCss} from "./__style__/menu.css";
export {menuCss, MenuCss};

export interface MenuControls<T extends HTMLElement = HTMLDivElement> {
    /** Element HTML parent du menu sur lequel le menu s'attachera (au dessus ou en dessous, selon la position).  */
    anchor: RefObject<T>;
    /** Affiche le menu. */
    active: boolean;
    /** Ferme le menu. */
    close: () => void;
    /** Ouvre le menu. */
    open: () => void;
    /** Ouvre ou ferme le menu, selon son état. */
    toggle: () => void;
}

export interface MenuProps extends MenuControls {
    /** Classe CSS pour le composant racine du Menu. */
    className?: string;
    /**
     * Eléments enfants à afficher dans le menu.
     * Ces éléments seront sélectionnables au clavier par le Menu, qui appelera leur `onClick` (si défini) lorsqu'on appuie sur Entrée.
     */
    children?: ReactNode;
    /**
     * Si renseigné, les items de Menu ne sont jamais retirés du DOM quand le Menu est fermé.
     *
     * Les animations au retrait d'éléments du Menu lorsqu'il est ouvert ne pourront pas fonctionner avec cette option.
     */
    keepItemsInDOMWhenClosed?: boolean;
    /**
     * Ne vide pas l'élément du Menu sélectionné lorsque la souris sort du Menu
     * (pour pouvoir toujours cliquer sur cet élément en appuyant sur Entrée par exemple).
     */
    keepSelectionOnPointerLeave?: boolean;
    /**
     * Ne vide pas l'élément du Menu sélectionné lorsque le menu s'ouvre ou se ferme.
     * (pour pouvoir contrôler l'élément sélectionné depuis un composant parent).
     */
    keepSelectionOnToggle?: boolean;
    /** Valeur de `id` pour le `ul` HTML. */
    id?: string;
    /** Si renseigné, la navigation clavier dans le Menu n'appelera pas le `blur` de l'élément courant actif (pour un input par exemple). */
    noBlurOnArrowPress?: boolean;
    /** N'affiche pas le focus ring lors de la navigation clavier dans le Menu. */
    noRing?: boolean;
    /** Handler optionel appelé au clic (y compris au clavier) d'un élément du Menu. La `key` de l'enfant sera passée en paramètre. */
    onItemClick?: (key?: string) => void;
    /** Handler appelé lorsque l'élément sélectionné par le Menu change (au hover ou au clavier).  */
    onSelectedChange?: (key?: string) => void;
    /**
     * Détermine la position du Menu par rapport à son élément ancre.
     *
     * Le Menu peut être placé en haut ou en bas, et optionnellement sur la gauche ou à droite (au lieu de prendre toute la largeur de l'ancre).
     *
     * La position peut être également définie en `auto` (choisie entre `topLeft`, `topRight`, `bottomLeft` et `bottomRight`) ou `full-auto`
     * (choisie entre `top` et `bottom`), selon la position de l'ancre sur la page au moment de son ouverture.
     *
     * Par défaut : `auto`.
     */
    position?: "auto" | "bottom" | "bottomLeft" | "bottomRight" | "full-auto" | "top" | "topLeft" | "topRight";
    /** Valeur de `role` pour le `ul` HTML. */
    role?: AriaRole;
    /** Permet de surcharger l'élement sélectionné du Menu, au lieu de le laisser utiliser son état interne. A utiliser avec `onSelectedChange`. */
    selected?: string;
    /** CSS. */
    theme?: CSSProp<MenuCss>;
}

export interface MenuItemProps extends PointerEvents<HTMLLIElement> {
    /** Le libellé de l'item de Menu. */
    caption: string;
    /** Classe CSS pour le composant racine. */
    className?: string;
    /** Désactive l'élément de Menu, qui ne pourra plus être sélectionné. */
    disabled?: boolean;
    /** Icône à poser devant l'item de Menu. */
    iconLeft?: ReactNode;
    /** Icône à poser derrière l'item de Menu. */
    iconRight?: ReactNode;
    /** Handler de clic sur l'item de Menu. */
    onClick?: MouseEventHandler<HTMLLIElement>;
    /** CSS. */
    theme?: CSSProp<MenuCss>;
}

/**
 * Item de Menu a utiliser dans un `Menu`.
 */
export function MenuItem({
    caption,
    className = "",
    disabled = false,
    iconLeft,
    iconRight,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    theme: pTheme
}: MenuItemProps) {
    const theme = useTheme("menu", menuCss, pTheme);
    return (
        <Ripple
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onPointerUp={onPointerUp}
        >
            <span className={classNames(theme.menuItem({disabled}), className)}>
                {iconLeft ? <FontIcon className={theme.icon()}>{iconLeft}</FontIcon> : null}
                <span className={theme.caption()}>{caption}</span>
                {iconRight ? <FontIcon className={theme.icon()}>{iconRight}</FontIcon> : null}
            </span>
        </Ripple>
    );
}

/** Hook pour attacher un menu à un élément et des fonctions pour l'ouvrir et le fermer. */
export function useMenu<T extends HTMLElement = HTMLDivElement>(): MenuControls<T> {
    const anchor = useRef<T | null>(null);
    const [active, setActive] = useState(false);
    return {
        anchor,
        active,
        close: useCallback(() => setActive(false), []),
        open: useCallback(() => setActive(true), []),
        toggle: useCallback(() => setActive(a => !a), [])
    };
}

/**
 * Menu déroulant. Peut s'attacher à un élément parent. A utiliser avec `useMenu()`.
 *
 * Exemple :
 *  ```tsx
 *  const menu = useMenu();
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
    active,
    anchor,
    children,
    className = "",
    close,
    keepItemsInDOMWhenClosed = false,
    keepSelectionOnPointerLeave = false,
    keepSelectionOnToggle = false,
    id,
    noBlurOnArrowPress = false,
    noRing = false,
    onItemClick,
    onSelectedChange,
    position: pPosition = "auto",
    role,
    selected: pSelected,
    theme: pTheme
}: MenuProps) {
    const theme = useTheme("menu", menuCss, pTheme);

    const ref = useRef<HTMLUListElement>(null);

    const [showRing, setShowRing] = useState(false);

    // Position du menu.
    const [position, setPosition] = useState(
        pPosition === "auto" ? "topLeft" : pPosition === "full-auto" ? "top" : pPosition
    );
    const [positions, setPositions] = useState({top: 0, bottom: 0, left: 0, right: 0});
    const [maxHeight, setMaxHeight] = useState(0);

    const updatePositions = useCallback(
        function updatePositions() {
            if (ref.current && anchor.current) {
                const {top: at, left: al, height: ah, width: aw} = anchor.current.getBoundingClientRect();
                const {
                    top: pt,
                    left: pl,
                    height: ph,
                    width: pw
                } = (ref.current.offsetParent ?? anchor.current).getBoundingClientRect();
                const ww = window.innerWidth || document.documentElement.offsetWidth;
                const wh = window.innerHeight || document.documentElement.offsetHeight;
                const toTop = at < wh / 2 - ah / 2;
                const toLeft = al < ww / 2 - aw / 2;

                if (pPosition === "auto" || pPosition === "full-auto") {
                    setPosition(
                        `${toTop ? "top" : "bottom"}${pPosition === "auto" ? (toLeft ? "Left" : "Right") : ""}` as const
                    );
                    setPositions({
                        top: at + ah - pt,
                        bottom: pt + ph - at,
                        left: al - pl,
                        right: pl + pw - al - aw
                    });
                }

                setMaxHeight(toTop ? wh - ah - at : at);
            }
        },
        [pPosition]
    );

    useLayoutEffect(() => {
        if (active && anchor.current) {
            updatePositions();
            getScrollableParent(anchor.current).addEventListener("scroll", updatePositions);
            window.addEventListener("resize", updatePositions);
            return () => {
                getScrollableParent(anchor.current!).addEventListener("scroll", updatePositions);
                window.addEventListener("resize", updatePositions);
            };
        }
    }, [active, updatePositions]);

    // Fermeture du menu au clic à l'extérieur.
    useEffect(() => {
        function handleDocumentClick(event: Event) {
            if (
                anchor.current &&
                ref.current &&
                !anchor.current.contains(event.target as Node) &&
                !ref.current.contains(event.target as Node)
            ) {
                close?.();
                setShowRing(false);
            }
        }
        if (active) {
            document.addEventListener("pointerdown", handleDocumentClick);
        }
        return () => {
            if (active) {
                document.removeEventListener("pointerdown", handleDocumentClick);
            }
        };
    }, [active, close]);

    // Element sélectionné.
    const [selected, setSelected] = useState<string | undefined>(pSelected);
    useEffect(() => setSelected(pSelected), [pSelected]);

    const handleSelectedChange = useCallback(
        function handleSelectedChange(s?: string) {
            setSelected(s);
            onSelectedChange?.(s);
        },
        [onSelectedChange]
    );

    useEffect(() => {
        if (!keepSelectionOnToggle) {
            handleSelectedChange(undefined);
        }
    }, [active, keepSelectionOnToggle, handleSelectedChange]);

    // Au clic/appui sur Entrée sur un item.
    const handleItemClick = useCallback(
        function handleItemClick(item: ReactElement, e?: KeyboardEvent | MouseEvent<HTMLLIElement>) {
            if (e) {
                e.stopPropagation();
            }
            if (!item.props.disabled) {
                item.props.onClick?.();
            }
            if (item.key) {
                onItemClick?.(item.key);
            }
            setShowRing(false);
            close?.();
        },
        [onItemClick, close]
    );

    const resetPointerEvents = useCallback(function resetPointerEvents() {
        if (ref.current) {
            ref.current.style.pointerEvents = "";
            document.removeEventListener("pointermove", resetPointerEvents);
        }
    }, []);
    useEffect(() => resetPointerEvents, []);

    // Navigation clavier.
    useEffect(() => {
        if (active) {
            const items = (
                Children.map(children, (item, i) => ({
                    key: (item as ReactElement)?.key ?? `${i}`,
                    item: item as ReactElement
                })) ?? []
            ).filter(({item}) => !!item && !unselectable(item));

            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                    setShowRing(true);
                    event.preventDefault();
                    event.stopPropagation();
                    if (!noBlurOnArrowPress) {
                        (document.activeElement as HTMLElement)?.blur();
                    }
                    const keys = items?.map(c => c?.key).filter(x => x) ?? [];
                    let index =
                        (!selected ? (position.startsWith("top") ? -1 : keys.length) : keys.indexOf(selected)) +
                        (event.key === "ArrowDown" ? +1 : -1);
                    if (index < 0) {
                        index = keys.length - 1;
                    }
                    if (index >= keys.length) {
                        index = 0;
                    }

                    handleSelectedChange(keys[index]);

                    if (ref.current) {
                        ref.current.style.pointerEvents = "none";
                        document.addEventListener("pointermove", resetPointerEvents);
                        ref.current
                            .querySelector(`[data-key="${keys[index]}"]`)
                            ?.scrollIntoView({block: "nearest", inline: "nearest", behavior: "smooth"});
                    }
                } else if (event.key === "Enter" && selected) {
                    const item = items.find(i => i.key === selected);
                    if (item) {
                        handleItemClick(item.item, event);
                    }
                } else if (event.key === "Tab" || event.key === "Escape") {
                    setShowRing(false);
                    close?.();
                }
            };

            document.addEventListener("keydown", handleKeyDown);
            return () => document.removeEventListener("keydown", handleKeyDown);
        }
    }, [active, children, close, handleItemClick, handleSelectedChange, noBlurOnArrowPress, position, selected]);

    const items = (Array.isArray(children) ? children.flat(Infinity) : [children])
        .map((item, i) => {
            if (!item) {
                return item;
            }

            const isHr = unselectable(item);
            const key = (item as ReactElement)?.key ?? `${i}`;

            return (
                <motion.li
                    key={i}
                    animate={
                        !keepItemsInDOMWhenClosed || active ? {height: "auto", opacity: 1} : {height: 0, opacity: 0}
                    }
                    className={theme.item({focused: !noRing && selected === key && showRing})}
                    data-key={key}
                    exit={{height: 0, opacity: 0}}
                    initial={{height: 0, opacity: 0}}
                    onClick={isHr ? undefined : e => handleItemClick(item as ReactElement, e)}
                    onPointerEnter={
                        isHr
                            ? undefined
                            : () => {
                                  handleSelectedChange(key);
                                  setShowRing(false);
                              }
                    }
                    transition={{height: getSpringTransition(), opacity: {duration: 0.1}}}
                >
                    {item}
                </motion.li>
            );
        })
        .filter(x => !!x);

    return (
        <ul
            ref={ref}
            className={classNames(
                theme.menu({
                    active: active && Children.toArray(children).filter(x => x).length > 0,
                    full: position === "top" || position === "bottom"
                }),
                className
            )}
            id={id}
            onPointerLeave={() => {
                if (!keepSelectionOnPointerLeave) {
                    handleSelectedChange();
                }
            }}
            role={role}
            style={useMemo(
                () => ({
                    top: position.startsWith("top") ? positions.top : undefined,
                    bottom: position.startsWith("bottom") ? positions.bottom : undefined,
                    left: position.endsWith("Left") ? positions.left : undefined,
                    right: position.endsWith("Right") ? positions.right : undefined,
                    maxHeight
                }),
                [maxHeight, position, positions]
            )}
        >
            {keepItemsInDOMWhenClosed ? items : <AnimatePresence>{active ? items : null}</AnimatePresence>}
        </ul>
    );
}

function unselectable(item: ReactNode): boolean {
    return (item as ReactElement)?.type === "hr" || (item as ReactElement)?.props.disabled;
}

function isScrollable(ele: HTMLElement) {
    const hasScrollableContent = ele.scrollHeight > ele.clientHeight;

    const overflowYStyle = window.getComputedStyle(ele).overflowY;
    const isOverflowHidden = overflowYStyle.includes("hidden");

    return hasScrollableContent && !isOverflowHidden;
}

function getScrollableParent(ele: HTMLElement): HTMLElement {
    return !ele || ele === document.body
        ? document.body
        : isScrollable(ele)
        ? ele
        : getScrollableParent(ele.parentNode as HTMLElement);
}
