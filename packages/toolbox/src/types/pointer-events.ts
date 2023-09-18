import {PointerEvent} from "react";

export interface PointerEvents<T extends HTMLElement> {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event) */
    onPointerDown?: (e: PointerEvent<T>) => void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) */
    onPointerEnter?: (e: PointerEvent<T>) => void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) */
    onPointerLeave?: (e: PointerEvent<T>) => void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event) */
    onPointerUp?: (e: PointerEvent<T>) => void;
}
