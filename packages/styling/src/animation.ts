function get() {
    const {animationDelay, animationDuration, animationTimingFunction} = window.getComputedStyle(document.body);

    const delay = toMs(animationDelay);
    const duration = toMs(animationDuration);
    const ease = animationTimingFunction.startsWith("cubic-bezier")
        ? (animationTimingFunction.slice(13).split(",").map(parseFloat) as [number, number, number, number])
        : undefined;

    return {delay, duration, ease};
}

/** Récupère les paramètres de transition par défaut, à partir des variables CSS correspondantes. */
export function getDefaultTransition() {
    const {delay, duration, ease} = get();
    return {
        delay: delay / 1000,
        duration: duration / 1000,
        ease
    } as const;
}

/** Récupère les paramètres de transition "spring" par défaut. */
export function getSpringTransition() {
    return {
        type: "spring",
        bounce: 0,
        duration: get().duration / 1000
    } as const;
}

function toMs(d: string) {
    if (d.endsWith("ms")) {
        return +d.slice(0, -2);
    } else {
        return +d.slice(0, -1) * 1000;
    }
}
