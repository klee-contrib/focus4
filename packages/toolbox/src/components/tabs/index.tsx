import classnames from "classnames";
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
import {TabsTheme} from "react-toolbox/lib/tabs/Tabs";

import {CSSProp, useTheme} from "@focus4/styling";
import rtTabsTheme from "react-toolbox/components/tabs/theme.css";
const tabsTheme: TabsTheme = rtTabsTheme;
export {tabsTheme};

import {FontIcon} from "../font-icon";
import {TabContent, TabContentProps} from "./content";
import {Tab, TabProps, TabTheme} from "./tab";
export {Tab, TabProps, TabTheme, TabsTheme};

export interface TabsProps {
    /** Children to pass through the component. */
    children?: ReactNode;
    className?: string;
    /** Disable the animation below the active tab. */
    disableAnimatedBottomBorder?: boolean;
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
    theme?: CSSProp<TabsTheme>;
}

export function Tabs({
    children,
    className = "",
    disableAnimatedBottomBorder,
    fixed = false,
    hideMode = "unmounted",
    index = 0,
    inverse = false,
    onChange,
    theme: pTheme
}: TabsProps) {
    const theme = useTheme("RTTabs", tabsTheme, pTheme);
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
        let resizeTimeout: NodeJS.Timeout;
        const handleResize = () => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = setTimeout(() => {
                updatePointer(index);
                updateArrows();
            }, 100);
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

    const classNamePointer = classnames(theme.pointer(), {
        [theme.disableAnimation?.() ?? ""]: disableAnimatedBottomBorder
    });
    const classNames = classnames(theme.tabs(), {[theme.fixed()]: fixed, [theme.inverse()]: inverse}, className);

    return (
        <div data-react-toolbox="tabs" className={classNames}>
            <div className={theme.navigationContainer()}>
                {arrows.left && (
                    <div className={theme.arrowContainer()} onClick={scrollRight}>
                        <FontIcon className={theme.arrow()} value="keyboard_arrow_left" />
                    </div>
                )}
                <div className={theme.navigation()} role="tablist" ref={navigationNode}>
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
                    <span className={classNamePointer} style={pointer} />
                </div>
                {arrows.right && (
                    <div className={theme.arrowContainer()} onClick={scrollLeft}>
                        <FontIcon className={theme.arrow()} value="keyboard_arrow_right" />
                    </div>
                )}
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
