import {RefObject, useLayoutEffect} from "react";

/** Calcule le `clip` nécessaire sur l'élément passé en ref pour qu'il se coupe une fois qu'il passe l'élément sticky juste avant lui. */
export function useStickyClip(ref: RefObject<HTMLElement>) {
    useLayoutEffect(() => {
        const stickyElement = ref.current?.previousElementSibling as HTMLElement;

        function onScroll() {
            if (ref.current && stickyElement) {
                ref.current.style.clipPath = `inset(${Math.max(
                    0,
                    stickyElement.offsetTop + stickyElement.clientHeight - ref.current.offsetTop
                )}px 0 0)`;
            }
        }

        if (ref.current && stickyElement && window.getComputedStyle(stickyElement).position === "sticky") {
            const scrollableParent = getScrollableParent(ref.current);
            scrollableParent.addEventListener("scroll", onScroll);
            return () => scrollableParent.removeEventListener("scroll", onScroll);
        }
    }, []);
}

function isScrollable(ele: HTMLElement) {
    const overflowYStyle = window.getComputedStyle(ele).overflowY;
    return overflowYStyle === "scroll" || overflowYStyle === "auto";
}

function getScrollableParent(ele: HTMLElement): HTMLElement {
    return !ele || ele === document.body
        ? (window as unknown as HTMLElement)
        : isScrollable(ele)
        ? ele
        : getScrollableParent(ele.parentNode as HTMLElement);
}
