// oxlint-disable no-empty-function
// Polyfill Web Animations API for JSDOM: SVG/HTML elements don't implement `animate`.
if (typeof Element.prototype.animate !== "function") {
    Element.prototype.animate = function animate(): Animation {
        return {
            cancel() {},
            finish() {},
            pause() {},
            play() {},
            reverse() {},
            addEventListener() {},
            removeEventListener() {},
            dispatchEvent: () => true
        } as unknown as Animation;
    };
}
