import classnames from "classnames";
import {Children, MouseEventHandler} from "react";
import {ChipTheme} from "react-toolbox/lib/chip/Chip";
import {CHIP} from "react-toolbox/lib/identifiers";

import {CSSProp, useTheme} from "@focus4/styling";
import rtChipTheme from "react-toolbox/components/chip/theme.css";
const chipTheme: ChipTheme = rtChipTheme;
export {chipTheme, ChipTheme};

import {Avatar} from "./avatar";

export interface ChipProps {
    className?: string;
    /** Children to pass through the component. */
    children?: React.ReactNode;
    /** If true, the chip will be rendered with a delete icon. */
    deletable?: boolean;
    /** Callback to be invoked when the delete icon is clicked. */
    onDeleteClick?: MouseEventHandler<HTMLSpanElement>;
    /** Classnames object defining the component style. */
    theme?: CSSProp<ChipTheme>;
}

export function Chip({className = "", children, deletable, onDeleteClick, theme: pTheme}: ChipProps) {
    const theme = useTheme(CHIP, chipTheme, pTheme);

    let hasAvatar = false;
    if (Children.count(children)) {
        const flatChildren = Children.toArray(children);
        const firstChild = flatChildren[0];
        hasAvatar = (firstChild as any)?.type === Avatar;
    }

    const classes = classnames(
        theme.chip(),
        {
            [theme.deletable()]: !!deletable,
            [theme.avatar()]: !!hasAvatar
        },
        className
    );

    return (
        <div data-react-toolbox="chip" className={classes}>
            {typeof children === "string" ? <span>{children}</span> : children}
            {deletable ? (
                <span className={theme.delete()} onClick={onDeleteClick}>
                    <svg viewBox="0 0 40 40" className={theme.deleteIcon()}>
                        <path className={theme.deleteX()} d="M 12,12 L 28,28 M 28,12 L 12,28" />
                    </svg>
                </span>
            ) : null}
        </div>
    );
}
