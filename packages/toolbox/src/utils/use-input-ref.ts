import {MouseEvent, PointerEvent, useCallback, useEffect, useRef, useState} from "react";

import {PointerEvents} from "./pointer-events";

export function useInputRef<TElement extends HTMLElement, TEvent extends HTMLElement>({
    disabled,
    onChange,
    onPointerLeave,
    onPointerUp,
    value
}: PointerEvents<TEvent> & {
    disabled?: boolean;
    onChange?: (value: any, e: MouseEvent<TElement>) => void;
    value?: any;
}) {
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

    const handleOnClick = useCallback(
        (event: MouseEvent<TElement>) => {
            if (event.pageX !== 0 && event.pageY !== 0) {
                ref.current?.blur();
            }
            if (!disabled && onChange) {
                onChange(!value, event);
            }
        },
        [disabled, onChange, value]
    );

    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        if (value !== undefined) {
            setLoaded(true);
        }
    }, [value, disabled]);

    return {handleOnClick, handlePointerLeave, handlePointerUp, loaded, ref};
}
