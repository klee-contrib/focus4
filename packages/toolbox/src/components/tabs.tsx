import classNames from "classnames";
import {cloneElement, CSSProperties, ReactElement, ReactNode, useCallback, useEffect, useRef, useState} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";

import {FontIcon} from "./font-icon";
import {Ripple} from "./ripple";

import tabsCss, {TabsCss} from "./__style__/tabs.css";
export {TabsCss, tabsCss};

export interface TabProps extends PointerEvents<HTMLDivElement> {
    /** @internal */
    active?: boolean;
    /** Contenu du Tab. */
    children?: ReactNode;
    /** Classe CSS pour l'élément racine. */
    className?: string;
    /** Désactive le Tab. */
    disabled?: boolean;
    /** Icône du Tab. */
    icon?: ReactNode;
    /** @internal */
    index?: number;
    /** Libellé du Tab. */
    label?: string;
    /** Handler appelé lorsque le Tab devient actif. */
    onActive?: () => void;
    /** @internal */
    onClick?: (index: number) => void;
    /** CSS. */
    theme?: CSSProp<TabsCss>;
}

export interface TabsProps {
    /** Seuls des <Tab> sont supportés en tant qu'enfant de Tabs. */
    children?: ReactNode;
    /** Classe CSS pour l'élément racine. */
    className?: string;
    /** Index du Tab actif. */
    index?: number;
    /** Handler appelé au changement de Tab. */
    onChange?: (index: number) => void;
    /** Affiche les Tabs comme des Tabs "secondaires". */
    secondary?: boolean;
    /** CSS. */
    theme?: CSSProp<TabsCss>;
}

/**
 * Un Tab, à utiliser dans Tabs.
 */
export function Tab({
    active = false,
    className = "",
    disabled = false,
    icon,
    index = 0,
    label,
    onActive,
    onClick,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    theme: pTheme
}: TabProps) {
    const theme = useTheme("tabs", tabsCss, pTheme);

    useEffect(() => {
        if (active) {
            onActive?.();
        }
    }, [active, onActive]);

    const handleClick = useCallback(() => {
        if (!disabled && onClick) {
            onClick(index);
        }
    }, [disabled, index, onClick]);

    return (
        <Ripple
            disabled={disabled}
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onPointerUp={onPointerUp}
        >
            <div
                className={classNames(theme.tab({active, disabled}), className)}
                onClick={handleClick}
                onKeyDown={e => e.key === "Enter" && handleClick()}
                role="tab"
                tabIndex={disabled ? undefined : 0}
            >
                {icon ? <FontIcon className={theme.icon()}>{icon}</FontIcon> : null}
                {label ? <span className={theme.label()}>{label}</span> : null}
            </div>
        </Ripple>
    );
}

/** Permet de poser un système de tabs avec Tab. */
export function Tabs({children, className = "", index = 0, onChange, secondary, theme: pTheme}: TabsProps) {
    const theme = useTheme("tabs", tabsCss, pTheme);
    const navigationNode = useRef<HTMLDivElement | null>(null);

    const [pointer, setPointer] = useState<CSSProperties>({});
    const updatePointer = useCallback(
        (idx: number) => {
            if (navigationNode.current?.children[idx]) {
                const nav = navigationNode.current.getBoundingClientRect();
                const tab = (
                    secondary
                        ? navigationNode.current.children[idx]
                        : navigationNode.current.children[idx].querySelector("span:last-of-type")!
                )?.getBoundingClientRect();
                const left = navigationNode.current.scrollLeft;
                setPointer({
                    top: `${nav.height}px`,
                    left: `${tab?.left + left - nav.left}px`,
                    width: `${tab?.width}px`
                });
            }
        },
        [secondary]
    );

    useEffect(() => {
        updatePointer(index);
    }, [index, children]);

    useEffect(() => {
        let resizeTimeout: NodeJS.Timeout;
        const handleResize = () => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = setTimeout(() => {
                updatePointer(index);
            }, 100);
        };

        window.addEventListener("resize", handleResize);
        handleResize();
        return () => {
            clearTimeout(resizeTimeout);
            window.removeEventListener("resize", handleResize);
        };
    }, [index]);

    const tabs = (Array.isArray(children) ? children.flat(Infinity) : [children])
        .filter(child => (child as ReactElement)?.type === Tab)
        .map((child, i) =>
            cloneElement(child as ReactElement<TabProps>, {
                key: i,
                index: i,
                theme,
                active: index === i,
                onClick: onChange
            })
        );

    return (
        <div className={classNames(theme.tabs({secondary}), className)}>
            <div ref={navigationNode} className={theme.navigation()} role="tablist">
                {tabs}
                <span className={theme.pointer()} style={pointer} />
            </div>
            {tabs.some(tab => tab.props.children) ? (
                <div className={theme.content()}>
                    {tabs.map(tab => (
                        <section
                            key={tab.props.index}
                            role="tabpanel"
                            style={{transform: `translateX(-${100 * index}%)`}}
                        >
                            {tab.props.children}
                        </section>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
