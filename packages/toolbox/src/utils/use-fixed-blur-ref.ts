import {PointerEvent, useCallback, useRef} from "react";

import {PointerEvents} from "./pointer-events";

export function useFixedBlurRef<TElement extends HTMLElement, TEvent extends HTMLElement>({
    onPointerLeave,
    onPointerUp
}: PointerEvents<TEvent>) {
    const ref = useRef<TElement | null>(null);

    const handlePointerUp = useCallback(
        (event: PointerEvent<TEvent>) => {
            ref.current?.blur();
            onPointerUp?.(event);
        },
        [onPointerUp]
    );

    const handlePointerLeave = useCallback(
        (event: PointerEvent<TEvent>) => {
            ref.current?.blur();
            onPointerLeave?.(event);
        },
        [onPointerLeave]
    );

    return {ref, handlePointerLeave, handlePointerUp};
}
