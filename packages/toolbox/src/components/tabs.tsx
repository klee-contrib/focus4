import classNames from "classnames";
import {
    Children,
    cloneElement,
    CSSProperties,
    MouseEvent,
    ReactElement,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";

import {FontIcon} from "./font-icon";
import {Ripple} from "./ripple";

import tabsCss, {TabsCss} from "./__style__/tabs.css";
export {tabsCss, TabsCss};

export interface TabContentProps {
    active?: boolean;
    className?: string;
    children?: ReactNode;
    hidden?: boolean;
    /** @internal */
    tabIndex?: number;
    theme?: CSSProp<TabsCss>;
}

/**
 * Contenu d'un Tab, à utiliser dans Tabs.
 */
export function TabContent({active = false, children, className = "", hidden = true, theme: pTheme}: TabContentProps) {
    const theme = useTheme("RTTabs", tabsCss, pTheme);
    return (
        <section aria-expanded={hidden} className={classNames(theme.tab({active}), className)} role="tabpanel">
            {children}
        </section>
    );
}

export interface TabProps extends PointerEvents<HTMLDivElement> {
    /** If true, the current component is visible. */
    active?: boolean;
    children?: ReactNode;
    className?: string;
    /** If true, the current component is not clickable. */
    disabled?: boolean;
    /** If true, the current component is not visible. */
    hidden?: boolean;
    /** Icon to be used in inner FontIcon. */
    icon?: ReactNode;
    index?: number;
    /** Label text for navigation header. */
    label?: string;
    /** Callback function that is fired when the tab is activated. */
    onActive?: () => void;
    /** Called on click on the tab. */
    onClick?: (event: MouseEvent<HTMLDivElement>, index: number) => void;
    /** Classnames object defining the component style. */
    theme?: CSSProp<TabsCss>;
}

/**
 * Un Tab, à utiliser dans Tabs.
 */
export function Tab({
    active = false,
    className = "",
    children,
    disabled = false,
    hidden = false,
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
    const theme = useTheme("RTTabs", tabsCss, pTheme);

    useEffect(() => {
        if (active) {
            onActive?.();
        }
    }, [active, onActive]);

    const handleClick = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            if (!disabled && onClick) {
                onClick(event, index);
            }
        },
        [disabled, index, onClick]
    );

    return (
        <Ripple
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onPointerUp={onPointerUp}
        >
            <div
                className={classNames(theme.label({active, disabled, hidden, withIcon: !!icon}), className)}
                data-react-toolbox="tab"
                onClick={handleClick}
                role="tab"
                tabIndex={0}
            >
                {icon ? <FontIcon className={(theme as any).icon?.()}>{icon}</FontIcon> : null}
                {label}
                {children}
            </div>
        </Ripple>
    );
}

export interface TabsProps {
    /** Children to pass through the component. */
    children?: ReactNode;
    className?: string;
    /** Current  */
    index?: number;
    /**
     * `unmounted` mode will not mount the tab content of inactive tabs.
     * `display` mode will mount but hide inactive tabs.
     * Consider holding state outside of the Tabs component before using `display` mode
     */
    hideMode?: "display" | "unmounted";
    /**  If True, the tabs will have an inverse style. */
    inverse?: boolean;
    /** If True, the tabs will be fixed, covering the whole width. */
    fixed?: boolean;
    /** Callback function that is fired when the tab changes. */
    onChange?: (idx: number) => void;
    /** Classnames object defining the component style. */
    theme?: CSSProp<TabsCss>;
}

/**
 * Permet de poser un système de tabs avec Tab et TabContent.
 */
export function Tabs({
    children,
    className = "",
    fixed = false,
    hideMode = "unmounted",
    index = 0,
    inverse = false,
    onChange,
    theme: pTheme
}: TabsProps) {
    const theme = useTheme("RTTabs", tabsCss, pTheme);
    const navigationNode = useRef<HTMLDivElement | null>(null);

    const [arrows, setArrows] = useState<{left: boolean; right: boolean}>({left: false, right: false});
    const updateArrows = useCallback(() => {
        if (navigationNode.current) {
            const idx = navigationNode.current.children.length - 2;

            if (idx >= 0) {
                const left = navigationNode.current.scrollLeft;
                const nav = navigationNode.current.getBoundingClientRect();
                const lastLabel = navigationNode.current.children[idx].getBoundingClientRect();

                setArrows({
                    left: left > 0,
                    right: nav.right < lastLabel.right - 5
                });
            }
        }
    }, []);

    const [pointer, setPointer] = useState<CSSProperties>({});
    const updatePointer = useCallback((idx: number) => {
        if (navigationNode.current?.children[idx]) {
            const nav = navigationNode.current.getBoundingClientRect();
            const label = navigationNode.current.children[idx].getBoundingClientRect();
            const left = navigationNode.current.scrollLeft;
            setPointer({
                top: `${nav.height}px`,
                left: `${label.left + left - nav.left}px`,
                width: `${label.width}px`
            });
        }
    }, []);

    useEffect(() => {
        updatePointer(index);
    }, [index, children]);

    useEffect(() => {
        let resizeTimeout: number;
        const handleResize = () => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = setTimeout(() => {
                updatePointer(index);
                updateArrows();
            }, 100) as any;
        };

        window.addEventListener("resize", handleResize);
        handleResize();
        return () => {
            clearTimeout(resizeTimeout);
            window.removeEventListener("resize", handleResize);
        };
    }, [index]);

    const scrollNavigation = useCallback((factor: number) => {
        if (navigationNode.current) {
            const oldScrollLeft = navigationNode.current.scrollLeft;
            navigationNode.current.scrollLeft += factor * navigationNode.current.clientWidth;
            if (navigationNode.current.scrollLeft !== oldScrollLeft) {
                updateArrows();
            }
        }
    }, []);

    const scrollRight = useCallback(() => scrollNavigation(-1), [scrollNavigation]);
    const scrollLeft = useCallback(() => scrollNavigation(+1), [scrollNavigation]);

    const c = useMemo(() => {
        const headers: ReactElement<TabProps>[] = [];
        const contents: ReactElement<TabContentProps>[] = [];

        Children.forEach(children, item => {
            if (!item) {
                return;
            }

            const tab = item as ReactElement<TabProps>;
            const tabContent = item as ReactElement<TabContentProps>;
            if (tab.type === Tab) {
                headers.push(tab);
                if (tab.props.children) {
                    contents.push(<TabContent theme={theme}>{tab.props.children}</TabContent>);
                }
            } else if (tabContent.type === TabContent) {
                contents.push(tabContent);
            }
        });

        return {headers, contents};
    }, [children]);

    return (
        <div className={classNames(theme.tabs({fixed, inverse}), className)} data-react-toolbox="tabs">
            <div className={theme.navigationContainer()}>
                {arrows.left ? (
                    <div className={theme.arrowContainer()} onClick={scrollRight}>
                        <FontIcon className={theme.arrow()}>keyboard_arrow_left</FontIcon>
                    </div>
                ) : null}
                <div ref={navigationNode} className={theme.navigation()} role="tablist">
                    {useMemo(
                        () =>
                            c.headers.map((item, i) =>
                                cloneElement(item, {
                                    children: null,
                                    key: i,
                                    index: i,
                                    theme,
                                    active: index === i,
                                    onClick: (event: MouseEvent<HTMLDivElement>, idx: number) => {
                                        onChange?.(idx);
                                        if (item.props.onClick) {
                                            item.props.onClick(event, idx);
                                        }
                                    }
                                })
                            ),
                        [c.headers, index, onChange, theme]
                    )}
                    <span className={theme.pointer()} style={pointer} />
                </div>
                {arrows.right ? (
                    <div className={theme.arrowContainer()} onClick={scrollLeft}>
                        <FontIcon className={theme.arrow()}>keyboard_arrow_right</FontIcon>
                    </div>
                ) : null}
            </div>
            {useMemo(() => {
                const contentElements = c.contents.map((item, idx) =>
                    cloneElement(item, {
                        key: idx,
                        theme,
                        active: index === idx,
                        hidden: index !== idx && hideMode === "display",
                        tabIndex: idx
                    })
                );

                return hideMode === "display" ? contentElements : contentElements.filter((_, idx) => idx === index);
            }, [c.contents, index, theme])}
        </div>
    );
}
