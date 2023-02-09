function get() {
    const {animationDelay, animationDuration, animationTimingFunction} = window.getComputedStyle(document.body);

    const delay = toMs(animationDelay);
    const duration = toMs(animationDuration);
    const ease = animationTimingFunction.startsWith("cubic-bezier")
        ? animationTimingFunction.substring(13).split(",").map(parseFloat)
        : undefined;

    return {delay, duration, ease};
}

export function getDefaultTransition() {
    const {delay, duration, ease} = get();
    return {
        delay: delay / 1000,
        duration: duration / 1000,
        ease
    } as const;
}

export const springTransition = {
    type: "spring",
    stiffness: 170,
    damping: 26,
    restDelta: 1,
    restSpeed: 1000
} as const;

export function cssTransitionProps({
    enter,
    enterActive,
    exit,
    exitActive
}: {
    enter: string;
    enterActive: string;
    exit: string;
    exitActive: string;
}) {
    const {delay, duration} = get();
    return {
        timeout: delay + duration,
        classNames: {
            enter,
            enterActive,
            exit,
            exitActive
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
