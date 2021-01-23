import {isFunction} from "lodash";
import {forwardRef, HTMLProps, useCallback, useLayoutEffect, useState} from "react";
import posed from "react-pose";
import {PoseElementProps} from "react-pose/lib/components/PoseElement/types";

import {springPose} from "@focus4/styling";

interface BaseHeaderProps extends HTMLProps<HTMLElement> {
    onHeightChange: (height: number) => void;
}

const BaseHeader = forwardRef<HTMLElement, BaseHeaderProps>(({onHeightChange, ...props}, forwardRef) => {
    const [domRef, setDomRef] = useState<HTMLElement | null>(null);
    const setRef = useCallback((ref: HTMLElement | null) => {
        setDomRef(ref);
        if (isFunction(forwardRef)) {
            forwardRef(ref);
        } else if (forwardRef) {
            forwardRef.current = ref;
        }
    }, []);
    useLayoutEffect(() => {
        if (domRef) {
            const marginBottom = window.getComputedStyle(domRef).marginBottom || "0px";
            onHeightChange(domRef.clientHeight + +marginBottom.substring(0, marginBottom.length - 2));
        } else {
            onHeightChange(0);
        }
    });
    return <header ref={setRef} {...props} />;
});

export const AnimatedHeader = posed(BaseHeader)({
    enter: {
        y: "0%",
        ...springPose
    },
    exit: {
        y: "-105%",
        ...springPose
    }
});

export function FixedHeader({onPoseComplete, initialPose, popFromFlow, ...props}: BaseHeaderProps & PoseElementProps) {
    useLayoutEffect(() => onPoseComplete && onPoseComplete("exit"));
    return <BaseHeader {...props} ref={undefined} />;
}
