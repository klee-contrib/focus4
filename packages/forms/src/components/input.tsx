import InputMask, {InputMaskFormatOptions, InputMaskSelection} from "inputmask-core";
import {range, takeWhile} from "lodash";
import {action, computed, observable} from "mobx";
import {observer} from "mobx-react";
import numeral from "numeral";
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

export interface InputProps<T extends "string" | "number"> extends RTInputProps {
    /** Pour un input de type "number", affiche les séparateurs de milliers. */
    hasThousandsSeparator?: boolean;
    /** Pour un input de type "text", paramètre un masque de saisie. */
    mask?: MaskDefinition;
    /** Pour un input de type "number", le nombre maximal de décimales qu'il est possible de saisir. Par défaut : 10. */
    maxDecimals?: number;
    /** Pour un input de type "number", interdit la saisie de nombres négatifs. */
    noNegativeNumbers?: boolean;
    /** Handler appelé à chaque saisie. Retourne la valeur dans le type de l'input. */
    onChange: (value: (T extends "string" ? string : number) | undefined) => void;
    /** Type de l'input. */
    type: T;
    /** Valeur. */
    value: (T extends "string" ? string : number) | undefined;
}

@observer
export class Input<T extends "string" | "number"> extends React.Component<InputProps<T>> {
    protected inputElement!: HTMLInputElement;
    protected mask?: InputMask;

    @computed
    get numberFormat() {
        const {hasThousandsSeparator, maxDecimals = 10} = this.props;
        return `${hasThousandsSeparator ? "0," : ""}0${
            maxDecimals > 0
                ? `[.][${range(0, maxDecimals)
                      .map(_ => "0")
                      .join("")}]`
                : ""
        }`;
    }

    @observable numberStringValue =
        this.props.type === "number"
            ? this.props.value !== undefined
                ? numeral(this.props.value).format(this.numberFormat)
                : ""
            : undefined;

    componentWillMount() {
        const {mask, type, value} = this.props;
        if (mask && type === "string") {
            this.mask = new InputMask({...mask, value: value as string});
        }
    }

    componentWillReceiveProps({mask, value}: InputProps<T>) {
        // Mets à jour le pattern et la valeur du masque, si applicable.
        if (this.mask && mask && this.props.mask) {
            if (this.props.mask.pattern !== mask.pattern && this.props.value !== value) {
                if (this.mask.getValue() === this.mask.emptyValue) {
                    this.mask.setPattern(mask.pattern, {value: value as string});
                } else {
                    this.mask.setPattern(mask.pattern, {value: this.mask.getRawValue()});
                }
            } else if (this.props.mask.pattern !== mask.pattern) {
                this.mask.setPattern(mask.pattern, {value: this.mask.getRawValue()});
            } else if (this.props.value !== value) {
                this.mask.setValue(value as string);
            }
        }

        if (
            this.props.type === "number" &&
            (!this.numberStringValue || value !== numeral(this.numberStringValue).value())
        ) {
            this.numberStringValue = value !== undefined ? numeral(value).format(this.numberFormat) : "";
        }
    }

    componentWillUpdate({mask}: InputProps<T>) {
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
        if (this.mask) {
            if (isUndo(e)) {
                e.preventDefault();
                if (this.mask.undo()) {
                    this.updateInputSelection();

                    if (this.value !== this.props.value) {
                        this.onChange(this.value);
                    }
                }
                return;
            } else if (isRedo(e)) {
                e.preventDefault();
                if (this.mask.redo()) {
                    this.updateInputSelection();

                    if (this.value !== this.props.value) {
                        this.onChange(this.value);
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

                    if (this.value !== this.props.value) {
                        this.onChange(this.value);
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

                    if (this.value !== this.props.value) {
                        this.onChange(this.value);
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

                if (this.value !== this.props.value) {
                    this.onChange(this.value);
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

                if (this.value !== this.props.value) {
                    this.onChange(this.value);
                }
            }
        }
    }

    private pendingAnimationFrame = false;

    @action.bound
    onChange(value: string) {
        if (this.pendingAnimationFrame) {
            return;
        }

        const {noNegativeNumbers, onChange, maxDecimals = 10, type} = this.props;
        if (type === "string") {
            onChange(value === "" ? undefined : (value as any));
        } else {
            if (value === "") {
                onChange(undefined);
            } else {
                if (numeral.locale() === "fr") {
                    value = value.replace(".", ",");
                }

                let isNegative = false;
                if (value.startsWith("-") && !noNegativeNumbers) {
                    value = value.substring(1);
                    isNegative = true;
                }

                const {decimal, thousands} = numeral.localeData().delimiters;
                const invalidCharRegex = new RegExp(`[^\\d\\${thousands}\\${decimal}]`, "g");
                const digitDecimalRegex = new RegExp(`[\\d\\${decimal}-]`);
                const [left, right, nope] = value.split(decimal);

                if (
                    ((maxDecimals && (right || "").length <= maxDecimals) || right === undefined) &&
                    nope === undefined &&
                    !value.match(invalidCharRegex)
                ) {
                    const newValue =
                        (isNegative ? "-" : "") + // Ajoute le "-" s'il faut.
                        (!left && !right
                            ? ""
                            : // On formatte le nombre avec numeral en gardant tous les "0" de tête.
                              numeral(value).format(
                                  range(0, left.replace(new RegExp(thousands, "g"), "").length - 1)
                                      .map(_ => "0")
                                      .join("") + this.numberFormat
                              )) +
                        (right !== undefined && !+right ? decimal : "") + // Ajoute la virgule si elle était là et a été retirée par le format().
                        (right ? takeWhile(right.split("").reverse(), c => c === "0").join("") : ""); // Ajoute les "0" de fin.
                    const newNumberValue = numeral(newValue).value();

                    if (!newValue.includes("NaN")) {
                        this.numberStringValue = newValue;
                        onChange(newNumberValue || newNumberValue === 0 ? (newNumberValue as any) : undefined);
                    }
                }

                const end = getSelection(this.inputElement).end - (isNegative ? 1 : 0);
                const ajustedEnd =
                    Math.max(
                        0,
                        value.slice(0, end).replace(invalidCharRegex, "").replace(new RegExp(thousands, "g"), "")
                            .length +
                            this.numberStringValue!.split("").filter(c => c === "0").length -
                            value.split("").filter(c => c === "0").length
                    ) + (isNegative ? 1 : 0);

                let charCount = 0;
                const newEnd = this.numberStringValue!.split("").reduce((count, char) => {
                    if (charCount === ajustedEnd) {
                        return count;
                    }
                    if (char.match(digitDecimalRegex)) {
                        charCount++;
                    }
                    return count + 1;
                }, 0);

                this.pendingAnimationFrame = true;
                window.requestAnimationFrame(() => {
                    setSelection(this.inputElement, {
                        start: newEnd,
                        end: newEnd
                    });
                    this.pendingAnimationFrame = false;
                });
            }
        }
    }

    get value() {
        if (this.mask) {
            const value = this.mask.getValue();
            return value === this.mask.emptyValue || value === undefined ? "" : value;
        } else if (this.props.type === "string") {
            return (this.props.value || "") as string;
        } else {
            return this.numberStringValue!;
        }
    }

    render() {
        const {mask, hasThousandsSeparator, maxDecimals, noNegativeNumbers, ...props} = this.props;
        return (
            <RTInput
                {...props}
                {...{
                    onPaste: this.onPaste
                }}
                ref={i => (this.inputElement = i && (i as any).inputNode)}
                onChange={this.onChange}
                onKeyDown={this.onKeyDown}
                onKeyPress={this.onKeyPress}
                type="text"
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
