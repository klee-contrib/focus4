import classNames from "classnames";
import {MouseEventHandler} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../types/pointer-events";

import chipCss, {ChipCss} from "./__style__/chip.css";
export {chipCss, ChipCss};

export interface ChipProps extends PointerEvents<HTMLSpanElement> {
    className?: string;
    /** Children to pass through the component. */
    children?: React.ReactNode;
    /** If true, the chip will be rendered with a delete icon. */
    deletable?: boolean;
    /** Callback to be invoked when the delete icon is clicked. */
    onDeleteClick?: MouseEventHandler<HTMLSpanElement>;
    /** Classnames object defining the component style. */
    theme?: CSSProp<ChipCss>;
}

/**
 * Affiche un chip pour représenter un élément sélectionné, qui peut avoir une action de suppression.
 */
export function Chip({
    className = "",
    children,
    deletable,
    onDeleteClick,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    theme: pTheme
}: ChipProps) {
    const theme = useTheme("RTChip", chipCss, pTheme);

    return (
        <div
            className={classNames(theme.chip({deletable}), className)}
            data-react-toolbox="chip"
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onPointerUp={onPointerUp}
        >
            {typeof children === "string" ? <span>{children}</span> : children}
            {deletable ? (
                <span className={theme.delete()} onClick={onDeleteClick}>
                    <svg className={theme.deleteIcon()} viewBox="0 0 40 40">
                        <path className={theme.deleteX()} d="M 12,12 L 28,28 M 28,12 L 12,28" />
                    </svg>
                </span>
            ) : null}
        </div>
    );
}
