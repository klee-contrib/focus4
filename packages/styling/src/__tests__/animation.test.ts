import {describe, expect, test} from "vitest";

import {getDefaultTransition, getSpringTransition} from "../animation";

function setAnimationStyles(delay: string, duration: string, timingFunction: string) {
    document.body.style.animationDelay = delay;
    document.body.style.animationDuration = duration;
    document.body.style.animationTimingFunction = timingFunction;
}

describe("Animation helpers", () => {
    test("convertit les délais et durées en millisecondes", () => {
        setAnimationStyles("100ms", "0.5s", "linear");

        expect(getDefaultTransition()).toEqual({delay: 0.1, duration: 0.5, ease: undefined});
    });

    test("récupère les quatre valeurs d'une fonction cubic-bezier", () => {
        setAnimationStyles("0s", "250ms", "cubic-bezier(0.1, 0.2, 0.3, 1)");

        expect(getDefaultTransition()).toEqual({delay: 0, duration: 0.25, ease: [0.1, 0.2, 0.3, 1]});
    });

    test("construit une transition spring à partir de la durée CSS", () => {
        setAnimationStyles("0s", "200ms", "ease-in-out");

        expect(getSpringTransition()).toEqual({type: "spring", bounce: 0, duration: 0.2});
    });
});
