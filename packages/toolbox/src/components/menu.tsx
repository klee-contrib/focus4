import classNames from "classnames";
import {AnimatePresence, motion} from "framer-motion";
import {
    AriaRole,
    Children,
    createElement,
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
    /** Si renseigné, utilise des <div> à la place d'un <ul> et des <li> pour les éléments du Menu. */
    noList?: boolean;
    /** N'affiche pas le focus ring lors de la navigation clavier dans le Menu. */
    noRing?: boolean;
    /** Désactive complètement la sélection d'items dans le Menu (en particulier au clavier). */
    noSelection?: boolean;
    /** Handler optionel appelé au clic (y compris au clavier) d'un élément du Menu. La `key` de l'enfant sera passée en paramètre. */
    onItemClick?: (key?: string) => void;
    /** Handler appelé lorsque l'élément sélectionné par le Menu change (au hover ou au clavier).  */
    onSelectedChange?: (key?: string) => void;
    /**
     * Détermine la position du Menu par rapport à son élément ancre.
     *
     * Le Menu peut être placé au dessus (`top`) ou en dessous (`bottom`) en prenant toute la largeur de l'ancre,
     * ou bien en gardant la taille de son contenu l'alignant à gauche (`top-left` et `bottom-left`) ou à droite (`top-right` et `bottom-right`).
     *
     * La position peut être déterminée automatiquement selon la position de l'ancre sur la page au moment de son ouverture.
     * Il est possible de choisir entre
     * - `auto-fill` (`bottom` ou `top`)
     * - `auto-fit` (`bottom-left`, `bottom-right`, `top-left`, `top-right`)
     * - `auto-left` (`bottom-left` ou `top-left`)
     * - `auto-right` (`bottom-right` ou `top-right`)
     * - `bottom-auto` (`bottom-left` ou `bottom-right`)
     * - `top-auto` (`top-left` ou `top-right`)
     *
     * Par défaut : `auto-fit`.
     */
    position?:
        | "auto-fill"
        | "auto-fit"
        | "auto-left"
        | "auto-right"
        | "bottom-auto"
        | "bottom-left"
        | "bottom-right"
        | "bottom"
        | "top-auto"
        | "top-left"
        | "top-right"
        | "top";
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
    noList = false,
    noRing = false,
    noSelection = false,
    onItemClick,
    onSelectedChange,
    position: pPosition = "auto-fit",
    role,
    selected: pSelected,
    theme: pTheme
}: MenuProps) {
    const theme = useTheme("menu", menuCss, pTheme);

    const ref = useRef<HTMLDivElement | HTMLUListElement>(null);

    const [showRing, setShowRing] = useState(false);

    // Position du menu.
    const [position, setPosition] = useState(
        pPosition === "auto-fill"
            ? "bottom"
            : pPosition === "auto-fit" || pPosition === "auto-left" || pPosition === "bottom-auto"
            ? "bottom-left"
            : pPosition === "auto-right"
            ? "bottom-right"
            : pPosition === "top-auto"
            ? "top-left"
            : pPosition
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
                const bt = at < wh / 2 - ah / 2 ? "bottom" : "top";
                const lr = al < ww / 2 - aw / 2 ? "left" : "right";

                if (pPosition === "auto-fill") {
                    setPosition(bt);
                } else if (pPosition === "auto-fit") {
                    setPosition(`${bt}-${lr}`);
                } else if (pPosition === "auto-left") {
                    setPosition(`${bt}-left`);
                } else if (pPosition === "auto-right") {
                    setPosition(`${bt}-right`);
                } else if (pPosition === "bottom-auto") {
                    setPosition(`bottom-${lr}`);
                } else if (pPosition === "top-auto") {
                    setPosition(`top-${lr}`);
                }

                setPositions({
                    top: at + ah - pt,
                    bottom: pt + ph - at,
                    left: al - pl,
                    right: pl + pw - al - aw
                });

                const mh = Math.floor(bt === "bottom" ? wh - ah - at : at);
                let cssMh = mh;

                const cssMhValue = getComputedStyle(ref.current).getPropertyValue("--menu-max-height");
                if (cssMhValue) {
                    if (cssMhValue.endsWith("vh")) {
                        cssMh = (+cssMhValue.substring(0, cssMhValue.length - 2) / 100) * wh;
                    } else if (cssMhValue.endsWith("px")) {
                        cssMh = +cssMhValue.substring(0, cssMhValue.length - 2);
                    } else {
                        console.error(
                            `Invalid '${cssMhValue}' value for '--menu-max-height'. Value should be in 'px' or 'vh'.`
                        );
                    }
                }

                setMaxHeight(Math.min(mh, cssMh));
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
            if (!noSelection) {
                setSelected(s);
                onSelectedChange?.(s);
            }
        },
        [noSelection, onSelectedChange]
    );

    useEffect(() => {
        if (!keepSelectionOnToggle) {
            handleSelectedChange(undefined);
        }
    }, [active, keepSelectionOnToggle, handleSelectedChange]);

    // Au clic/appui sur Entrée sur un item.
    const handleItemClick = useCallback(
        function handleItemClick(item: ReactElement, e?: KeyboardEvent | MouseEvent<HTMLLIElement>) {
            if (noSelection) {
                return;
            }

            if (e) {
                e.stopPropagation();
                e.preventDefault();
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
        [noSelection, onItemClick, close]
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
                if (event.key === "Tab" || event.key === "Escape") {
                    setShowRing(false);
                    close?.();
                } else if (noSelection) {
                    return;
                } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
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
                }
            };

            document.addEventListener("keydown", handleKeyDown);
            return () => document.removeEventListener("keydown", handleKeyDown);
        }
    }, [
        active,
        children,
        close,
        handleItemClick,
        handleSelectedChange,
        noBlurOnArrowPress,
        noSelection,
        position,
        selected
    ]);

    const items = (Array.isArray(children) ? children.flat(Infinity) : [children])
        .map((item, i) => {
            if (!item) {
                return item;
            }

            const isHr = noSelection || unselectable(item);
            const key = (item as ReactElement)?.key ?? `${i}`;

            const itemElement = noList ? motion.div : motion.li;

            return createElement(
                itemElement as typeof motion.li,
                {
                    key: i,
                    animate:
                        !keepItemsInDOMWhenClosed || active ? {height: "auto", opacity: 1} : {height: 0, opacity: 0},
                    className: theme.item({focused: !noRing && selected === key && showRing}),
                    ...{"data-key": key},
                    exit: {height: 0, opacity: 0},
                    initial: {height: 0, opacity: 0},
                    onClick: isHr ? undefined : e => handleItemClick(item as ReactElement, e),
                    onPointerEnter: isHr
                        ? undefined
                        : () => {
                              handleSelectedChange(key);
                              setShowRing(false);
                          },
                    transition: {height: getSpringTransition(), opacity: {duration: 0.1}}
                },
                item
            );
        })
        .filter(x => !!x);

    const rootElement = noList ? "div" : "ul";
    return createElement(
        rootElement,
        {
            ref,
            className: classNames(
                theme.menu({
                    active: active && Children.toArray(children).filter(x => x).length > 0,
                    full: position === "top" || position === "bottom"
                }),
                className
            ),
            id,
            onPointerLeave: () => {
                if (!keepSelectionOnPointerLeave) {
                    handleSelectedChange();
                }
            },
            role,
            style: useMemo(
                () => ({
                    top: position.includes("bottom") ? positions.top : undefined,
                    bottom: position.includes("top") ? positions.bottom : undefined,
                    left: position.includes("left") ? positions.left : undefined,
                    right: position.includes("right") ? positions.right : undefined,
                    maxHeight
                }),
                [maxHeight, position, positions]
            )
        },
        keepItemsInDOMWhenClosed ? items : <AnimatePresence>{active ? items : null}</AnimatePresence>
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
