import * as React from "react";
import posed from "react-pose";
import {PoseElementProps} from "react-pose/lib/components/PoseElement/types";

import {ScrollableContext} from "@focus4/components";
import {springPose, useTheme} from "@focus4/styling";

import headerStyles from "./__style__/header.css";
export {headerStyles};
export type HeaderStyle = Partial<typeof headerStyles>;

/** Props du conteneur de header. */
export interface HeaderScrollingProps {
    /** Précise si le header peut se déployer ou non. */
    canDeploy?: boolean;
    children?: React.ReactNode;
    /** Classes CSS. */
    theme?: {
        deployed?: string;
        scrolling?: string;
        undeployed?: string;
        sticky?: string;
    };
}

/** Conteneur du header, gérant en particulier le dépliement et le repliement. */
export function HeaderScrolling({canDeploy, children, theme: pTheme}: HeaderScrollingProps) {
    const context = React.useContext(ScrollableContext);
    const theme = useTheme("header", headerStyles, pTheme);
    const ref = React.useRef<HTMLElement>(null);

    React.useLayoutEffect(
        () =>
            context.registerHeader(
                canDeploy ? Header : FixedHeader,
                {className: `${theme.scrolling} ${theme.sticky}`, children},
                ref.current!,
                canDeploy
            ),
        [canDeploy, children]
    );

    return (
        <header className={`${theme.scrolling} ${canDeploy ? theme.deployed : theme.undeployed}`} ref={ref}>
            {children}
        </header>
    );
}

const Header = posed.header({
    enter: {
        y: "0%",
        ...springPose
    },
    exit: {
        y: "-105%",
        ...springPose
    }
});

const FixedHeader = React.forwardRef<HTMLHeadingElement, PoseElementProps>(
    ({onPoseComplete, initialPose, popFromFlow, ...props}, ref) => {
        React.useLayoutEffect(() => onPoseComplete && onPoseComplete("exit"));
        return <header ref={ref} {...props} />;
    }
);
