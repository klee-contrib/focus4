import {AnimationDef} from "popmotion-pose/lib/types";
import "./style/global.css";

const {animationDelay, animationDuration, animationTimingFunction} = window.getComputedStyle(document.body);

export const delay = toMs(animationDelay);
export const duration = toMs(animationDuration);
export const ease = animationTimingFunction.startsWith("cubic-bezier")
    ? animationTimingFunction
          .substring(13)
          .split(",")
          .map(parseFloat)
    : undefined;

export const defaultPose = {
    delay,
    transition: {type: "tween", duration, ease} as AnimationDef
};

export const springPose = {
    transition: {type: "spring", stiffness: 170, damping: 26, restDelta: 1, restSpeed: 1000} as AnimationDef
};

export function cssTransitionProps(theme: {enter: string; exit: string}) {
    return {
        timeout: delay + duration,
        classNames: {
            enter: theme.exit,
            enterActive: theme.enter,
            exitActive: theme.exit
        }
    };
}

function toMs(d: string) {
    if (d.endsWith("s")) {
        return +d.substring(0, d.length - 1) * 1000;
    } else {
        return +d.substring(0, d.length - 2);
    }
}
