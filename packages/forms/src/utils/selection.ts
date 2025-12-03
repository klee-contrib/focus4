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

    globalThis.requestAnimationFrame(() => {
        try {
            if (el.selectionStart === undefined) {
                const rangeEl = (el as any).createTextRange();
                rangeEl.collapse(true);
                rangeEl.moveStart("character", selection.start);
                rangeEl.moveEnd("character", selection.end - selection.start);
                rangeEl.select();
            } else {
                el.setSelectionRange(selection.start, selection.end);
            }
        } catch {
            /* Not focused or not visible */
        }

        pendingAnimationFrame = false;
    });
}
