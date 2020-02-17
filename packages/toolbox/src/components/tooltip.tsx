import classnames from "classnames";
import * as React from "react";
import ReactToolbox from "react-toolbox/lib";
import {TOOLTIP} from "react-toolbox/lib/identifiers";
import events from "react-toolbox/lib/utils/events";
import {getViewport} from "react-toolbox/lib/utils/utils";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import {createPortal} from "react-dom";
import rtTooltipTheme from "react-toolbox/components/tooltip/theme.css";
const tooltipTheme: TooltipTheme = rtTooltipTheme;
export {tooltipTheme};

const POSITION = {
    BOTTOM: "bottom",
    HORIZONTAL: "horizontal",
    LEFT: "left",
    RIGHT: "right",
    TOP: "top",
    VERTICAL: "vertical"
} as const;

export interface TooltipTheme {
    tooltip?: string;
    tooltipActive?: string;
    tooltipInner?: string;
    tooltipWrapper?: string;
}

export interface TooltipOptions {
    className?: string;
    tooltipDelay?: number;
    tooltipHideOnClick?: boolean;
    tooltipPassthrough?: boolean;
    tooltipPosition?: "bottom" | "top" | "left" | "right" | "horizontal" | "vertical";
    tooltipShowOnClick?: boolean;
    theme?: TooltipTheme;
}

export interface TooltipProps extends ReactToolbox.Props, Omit<TooltipOptions, "theme"> {
    children?: React.ReactNode;
    tooltip?: React.ReactNode;
}

export function tooltipFactory({
    className = "",
    tooltipDelay = 0,
    tooltipHideOnClick = true,
    tooltipPassthrough = true,
    tooltipPosition = POSITION.VERTICAL,
    tooltipShowOnClick = false,
    theme = {}
}: TooltipOptions = {}) {
    return function Tooltip<P>(ComposedComponent: React.ComponentType<P> | string) {
        return React.forwardRef<
            TooltippedComponent<P>,
            P & Omit<TooltipProps, "theme"> & {theme?: CSSProp<TooltipTheme>}
        >((p, ref) => {
            const finalTheme = fromBem(useTheme(TOOLTIP, tooltipTheme, p.theme, theme));
            return (
                <TooltippedComponent
                    ref={ref}
                    className={className}
                    tooltipDelay={tooltipDelay}
                    tooltipHideOnClick={tooltipHideOnClick}
                    tooltipPassthrough={tooltipPassthrough}
                    tooltipPosition={tooltipPosition}
                    tooltipShowOnClick={tooltipShowOnClick}
                    {...p}
                    theme={finalTheme}
                    ComposedComponent={ComposedComponent}
                />
            );
        });
    };
}

class TooltippedComponent<P> extends React.Component<
    TooltipProps & {theme: TooltipTheme} & {ComposedComponent: React.ComponentType<P> | string}
> {
    state = {
        active: false,
        position: this.props.tooltipPosition!,
        visible: false,
        left: 0,
        top: 0
    };
    timeout?: number;
    tooltipNode?: HTMLSpanElement | null;

    componentWillUnmount() {
        if (this.tooltipNode) {
            events.removeEventListenerOnTransitionEnded(this.tooltipNode, this.onTransformEnd);
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    onTransformEnd = (e: any) => {
        if (e.propertyName === "transform") {
            events.removeEventListenerOnTransitionEnded(this.tooltipNode, this.onTransformEnd);
            this.setState({visible: false});
        }
    };

    getPosition(element: HTMLElement) {
        const {tooltipPosition} = this.props;
        if (tooltipPosition === POSITION.HORIZONTAL) {
            const origin = element.getBoundingClientRect();
            const {width: ww} = getViewport();
            const toRight = origin.left < ww / 2 - origin.width / 2;
            return toRight ? POSITION.RIGHT : POSITION.LEFT;
        }
        if (tooltipPosition === POSITION.VERTICAL) {
            const origin = element.getBoundingClientRect();
            const {height: wh} = getViewport();
            const toBottom = origin.top < wh / 2 - origin.height / 2;
            return toBottom ? POSITION.BOTTOM : POSITION.TOP;
        }
        return tooltipPosition;
    }

    handleMouseEnter = (event: MouseEvent) => {
        this.activate(this.calculatePosition(event.currentTarget as HTMLElement));
        if (this.props.onMouseEnter) {
            this.props.onMouseEnter(event);
        }
    };

    handleMouseLeave = (event: MouseEvent) => {
        this.deactivate();
        if (this.props.onMouseLeave) {
            this.props.onMouseLeave(event);
        }
    };

    handleClick = (event: MouseEvent) => {
        if (this.props.tooltipHideOnClick && this.state.active) {
            this.deactivate();
        }

        if (this.props.tooltipShowOnClick && !this.state.active) {
            this.activate(this.calculatePosition(event.currentTarget as HTMLElement));
        }

        if (this.props.onClick) {
            this.props.onClick(event);
        }
    };

    activate({top, left, position}: {top?: number; left?: number; position?: string} = {}) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.setState({visible: true, position});
        this.timeout = setTimeout(() => {
            this.setState({active: true, top, left});
        }, this.props.tooltipDelay);
    }

    deactivate() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (this.state.active) {
            events.addEventListenerOnTransitionEnded(this.tooltipNode, this.onTransformEnd);
            this.setState({active: false});
        } else if (this.state.visible) {
            this.setState({visible: false});
        }
    }

    calculatePosition(element: HTMLElement) {
        const position = this.getPosition(element);
        const {top, left, height, width} = element.getBoundingClientRect();
        const xOffset = window.scrollX || window.pageXOffset;
        const yOffset = window.scrollY || window.pageYOffset;
        if (position === POSITION.BOTTOM) {
            return {
                top: top + height + yOffset,
                left: left + width / 2 + xOffset,
                position
            };
        }
        if (position === POSITION.TOP) {
            return {
                top: top + yOffset,
                left: left + width / 2 + xOffset,
                position
            };
        }
        if (position === POSITION.LEFT) {
            return {
                top: top + height / 2 + yOffset,
                left: left + xOffset,
                position
            };
        }
        if (position === POSITION.RIGHT) {
            return {
                top: top + height / 2 + yOffset,
                left: left + width + xOffset,
                position
            };
        }
        return undefined;
    }

    render() {
        const {active, left, top, position, visible} = this.state;
        const positionClass = `tooltip${position.charAt(0).toUpperCase() + position.slice(1)}`;
        const {
            children,
            className,
            theme,
            onClick,
            onMouseEnter,
            onMouseLeave,
            tooltip,
            tooltipDelay,
            tooltipHideOnClick,
            tooltipPassthrough,
            tooltipPosition,
            tooltipShowOnClick,
            ComposedComponent,
            ...other
        } = this.props;

        const _className = classnames(
            theme.tooltip,
            {
                [theme.tooltipActive!]: active
            },
            (theme as any)[positionClass]
        );

        const childProps = {
            ...other,
            className,
            onClick: this.handleClick,
            onMouseEnter: this.handleMouseEnter,
            onMouseLeave: this.handleMouseLeave
        };

        const shouldPass = typeof ComposedComponent !== "string" && tooltipPassthrough;
        const finalProps = shouldPass ? {...childProps, theme} : childProps;

        return (
            <>
                <ComposedComponent {...(finalProps as any)}>{children}</ComposedComponent>
                {visible
                    ? createPortal(
                          <span
                              ref={node => {
                                  this.tooltipNode = node;
                              }}
                              className={_className}
                              data-react-toolbox="tooltip"
                              style={{top, left}}
                          >
                              <span className={theme.tooltipInner}>{tooltip}</span>
                          </span>,
                          document.body
                      )
                    : null}
            </>
        );
    }
}
