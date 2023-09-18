import {PointerEvent, useCallback, useRef} from "react";

import {PointerEvents} from "./pointer-events";

export function useFixedBlurRef<T extends HTMLElement>({onPointerLeave, onPointerUp}: PointerEvents<T>) {
    const ref = useRef<T | null>(null);

    const handlePointerUp = useCallback(
        (event: PointerEvent<T>) => {
            ref.current?.blur();
            onPointerUp?.(event);
        },
        [onPointerUp]
    );

    const handlePointerLeave = useCallback(
        (event: PointerEvent<T>) => {
            ref.current?.blur();
            onPointerLeave?.(event);
        },
        [onPointerLeave]
    );

    return {ref, handlePointerLeave, handlePointerUp};
}
