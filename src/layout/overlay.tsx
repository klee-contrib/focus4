import {observable} from "mobx";
import React from "react";
import posed from "react-pose";

import {useTheme} from "../theme";

import * as styles from "./__style__/overlay.css";
export type OverlayStyle = Partial<typeof styles>;

export interface OverlayProps {
    onClick?: () => void;
    theme?: OverlayStyle;
}

const overlays = observable<() => void>([]);
function onOverlayClick() {
    overlays[overlays.length - 1]();
}

export const Overlay = posed(
    React.forwardRef<HTMLDivElement, React.PropsWithChildren<OverlayProps>>(
        ({children, onClick, theme: pTheme}, ref) => {
            const theme = useTheme("overlay", styles, pTheme);

            React.useEffect(() => {
                if (onClick) {
                    overlays.push(onClick);
                    return () => {
                        overlays.remove(onClick);
                    };
                }
            }, [onClick]);

            return (
                <div ref={ref} className={theme.overlay} onClick={onOverlayClick}>
                    {children}
                </div>
            );
        }
    )
)({enter: {opacity: 0.6}, exit: {opacity: 0}});
