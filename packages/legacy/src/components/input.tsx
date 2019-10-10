import InputMask, {InputMaskFormatOptions, InputMaskSelection} from "inputmask-core";
import {action} from "mobx";
import * as React from "react";

import {Input as RTInput, InputProps as RTInputProps} from "@focus4/toolbox";

/** Définition d'un masque de saisie. */
export interface MaskDefinition {
    /** Formatters personnalisés par caractère. */
    formatCharacters?: {[key: string]: InputMaskFormatOptions};
    /** Affiche le masque au fur et à mesure de la saisie. */
    isRevealingMask?: boolean;
    /** Le masque de saisie */
    pattern: string;
    /** Caractère utilisé pour les caractères manquant. Par défaut : "_". */
    placeholderChar?: string;
}

export interface InputProps extends RTInputProps {
    mask?: MaskDefinition;
    onChange?: (value: any) => void;
}

export class Input extends React.Component<InputProps> {
    protected inputElement!: HTMLInputElement;
    protected mask?: InputMask;

    componentWillMount() {
        const {mask, value} = this.props;
        if (mask) {
            this.mask = new InputMask({...mask, value});
        }
    }

    componentWillReceiveProps({mask, value}: InputProps) {
        // Mets à jour le pattern et la valeur du masque, si applicable.
        if (this.mask && mask && this.props.mask) {
            if (this.props.mask.pattern !== mask.pattern && this.props.value !== value) {
                if (this.mask.getValue() === this.mask.emptyValue) {
                    this.mask.setPattern(mask.pattern, {value});
                } else {
                    this.mask.setPattern(mask.pattern, {value: this.mask.getRawValue()});
                }
            } else if (this.props.mask.pattern !== mask.pattern) {
                this.mask.setPattern(mask.pattern, {value: this.mask.getRawValue()});
            } else if (this.props.value !== value) {
                this.mask.setValue(value);
            }
        }
    }

    componentWillUpdate({mask}: InputProps) {
        if (this.mask && mask && this.props.mask && mask.pattern !== this.props.mask.pattern) {
            this.mask.setPattern(mask.pattern, {
                value: this.mask.getRawValue(),
                selection: getSelection(this.inputElement)
            });
        }
    }

    componentDidUpdate() {
        if (this.mask && this.mask.selection.start) {
            this.updateInputSelection();
        }
    }

    @action.bound
    updateMaskSelection() {
        if (this.mask) {
            this.mask.selection = getSelection(this.inputElement);
        }
    }

    @action.bound
    updateInputSelection() {
        if (this.mask) {
            setSelection(this.inputElement, this.mask.selection);
        }
    }

    @action.bound
    onKeyDown(e: KeyboardEvent) {
        const {onChange, value} = this.props;
        if (this.mask) {
            if (isUndo(e)) {
                e.preventDefault();
                if (this.mask.undo()) {
                    this.updateInputSelection();

                    if (onChange && this.value !== value) {
                        onChange(this.value);
                    }
                }
                return;
            } else if (isRedo(e)) {
                e.preventDefault();
                if (this.mask.redo()) {
                    this.updateInputSelection();

                    if (onChange && this.value !== value) {
                        onChange(this.value);
                    }
                }
                return;
            } else if (e.key === "Backspace") {
                e.preventDefault();
                this.updateMaskSelection();
                if (this.mask.backspace()) {
                    if (this.value) {
                        this.updateInputSelection();
                    }

                    if (onChange && this.value !== value) {
                        onChange(this.value);
                    }
                }
            } else if (e.key === "Delete") {
                e.preventDefault();
                const {start, end} = getSelection(this.inputElement);
                setSelection(this.inputElement, {start: start + 1, end: end + 1});
                this.updateMaskSelection();
                if (this.mask.backspace()) {
                    if (this.value) {
                        this.updateInputSelection();
                    }

                    if (onChange && this.value !== value) {
                        onChange(this.value);
                    }
                }
            }
        }

        if (this.props.onKeyDown) {
            this.props.onKeyDown(e);
        }
    }

    @action.bound
    onKeyPress(e: KeyboardEvent) {
        if (this.mask) {
            if (e.metaKey || e.altKey || e.ctrlKey || e.key === "Enter") {
                return;
            }

            e.preventDefault();
            this.updateMaskSelection();
            if (this.mask.input(e.key || (e as any).data)) {
                this.updateInputSelection();

                const {onChange, value} = this.props;
                if (onChange && this.value !== value) {
                    onChange(this.value);
                }
            }
        }

        if (this.props.onKeyPress) {
            this.props.onKeyPress(e);
        }
    }

    @action.bound
    onPaste(e: ClipboardEvent) {
        if (this.mask) {
            e.preventDefault();
            this.updateMaskSelection();
            if (this.mask.paste(e.clipboardData!.getData("Text"))) {
                setTimeout(this.updateInputSelection, 0);

                const {onChange, value} = this.props;
                if (onChange && this.value !== value) {
                    onChange(this.value);
                }
            }
        }
    }

    get value() {
        if (this.mask) {
            const value = this.mask.getValue();
            return value === this.mask.emptyValue || value === undefined ? "" : value;
        } else {
            return this.props.value === undefined ? "" : this.props.value;
        }
    }

    render() {
        return (
            <RTInput
                {...this.props}
                {...{onPaste: this.onPaste}}
                ref={i => (this.inputElement = i && (i as any).inputNode)}
                onKeyDown={this.onKeyDown}
                onKeyPress={this.onKeyPress}
                value={this.value}
            />
        );
    }
}

const KEYCODE_Z = 90;
const KEYCODE_Y = 89;

function isUndo(e: KeyboardEvent) {
    // tslint:disable-next-line: deprecation
    return (e.ctrlKey || e.metaKey) && e.keyCode === (e.shiftKey ? KEYCODE_Y : KEYCODE_Z);
}

function isRedo(e: KeyboardEvent) {
    // tslint:disable-next-line: deprecation
    return (e.ctrlKey || e.metaKey) && e.keyCode === (e.shiftKey ? KEYCODE_Z : KEYCODE_Y);
}

function getSelection(el: HTMLInputElement) {
    let start;
    let end;
    if (el.selectionStart !== undefined) {
        start = el.selectionStart;
        end = el.selectionEnd;
    } else {
        try {
            el.focus();
            const rangeEl = (el as any).createTextRange();
            const clone = rangeEl.duplicate();

            rangeEl.moveToBookmark((document as any).selection.createRange().getBookmark());
            clone.setEndPoint("EndToStart", rangeEl);

            start = clone.text.length;
            end = start + rangeEl.text.length;
        } catch (e) {
            /* not focused or not visible */
        }
    }

    return {start, end};
}

function setSelection(el: HTMLInputElement, selection: InputMaskSelection) {
    try {
        if (el.selectionStart !== undefined) {
            el.setSelectionRange(selection.start!, selection.end!);
        } else {
            const rangeEl = (el as any).createTextRange();
            rangeEl.collapse(true);
            rangeEl.moveStart("character", selection.start);
            rangeEl.moveEnd("character", selection.end! - selection.start!);
            rangeEl.select();
        }
    } catch (e) {
        /* not focused or not visible */
    }
}
