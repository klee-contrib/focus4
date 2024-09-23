export interface InputSelection {
    start: number;
    end: number;
}

export function getInputSelection(el: HTMLInputElement | HTMLTextAreaElement): InputSelection {
    return {
        start: el.selectionStart ?? 0,
        end: el.selectionEnd ?? 0
    };
}

let pendingAnimationFrame = false;

export function setInputSelection(el: HTMLInputElement | HTMLTextAreaElement, selection: InputSelection) {
    if (pendingAnimationFrame) {
        return;
    }

    pendingAnimationFrame = true;

    window.requestAnimationFrame(() => {
        try {
            if (el.selectionStart !== undefined) {
                el.setSelectionRange(selection.start, selection.end);
            } else {
                const rangeEl = (el as any).createTextRange();
                rangeEl.collapse(true);
                rangeEl.moveStart("character", selection.start);
                rangeEl.moveEnd("character", selection.end - selection.start);
                rangeEl.select();
            }
        } catch (e: unknown) {
            /* Not focused or not visible */
        }

        pendingAnimationFrame = false;
    });
}
