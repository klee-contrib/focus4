import {extendObservable} from "mobx";
import {ComponentType} from "react";

import {isFunction} from "lodash";
import {$Field, makeField, new$field} from "../../transforms";
import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    DomainType,
    EntityField,
    FieldEntry,
    FieldEntryType
} from "../../types";

type ComponentPropsType<C extends ComponentType | undefined> = C extends ComponentType<infer P> ? P : never;
type NewType<DT extends "string" | "number" | "boolean" | "object", T> = T extends DomainType<DT> ? T : DomainType<DT>;

export class FormEntityFieldBuilder<F extends FieldEntry> {
    /** @internal */
    field: EntityField<F>;

    constructor(field?: EntityField<F>) {
        this.field = field || (makeField(undefined) as any);
    }

    /**
     * Initialise l'état d'édition du champ.
     * @param value Etat d'édition initial.
     */
    edit(value: boolean): FormEntityFieldBuilder<F>;
    /**
     * Force l'état d'édition du champ.
     * @param value Condition d'édition.
     */
    edit(value: () => boolean): FormEntityFieldBuilder<F>;
    edit(value: boolean | (() => boolean)): FormEntityFieldBuilder<F> {
        // @ts-ignore
        this.field.isEdit = value;
        return this;
    }
    /**
     * Modifie les métadonnées du champ.
     * @param $field Métadonnées du champ à remplacer;
     */
    metadata<
        DT extends "string" | "number" | "boolean" | "object" = F["domain"]["type"],
        ICProps extends BaseInputProps = ComponentPropsType<F["domain"]["InputComponent"]>,
        SCProps extends BaseSelectProps = ComponentPropsType<F["domain"]["SelectComponent"]>,
        ACProps extends BaseAutocompleteProps = ComponentPropsType<F["domain"]["AutocompleteComponent"]>,
        DCProps extends BaseDisplayProps = ComponentPropsType<F["domain"]["DisplayComponent"]>,
        LCProps extends BaseLabelProps = ComponentPropsType<F["domain"]["LabelComponent"]>
    >(
        $field:
            | $Field<DT, NewType<DT, FieldEntryType<F>>, ICProps, SCProps, ACProps, DCProps, LCProps>
            | (() => $Field<DT, NewType<DT, FieldEntryType<F>>, ICProps, SCProps, ACProps, DCProps, LCProps>)
    ): FormEntityFieldBuilder<
        FieldEntry<DT, NewType<DT, FieldEntryType<F>>, ICProps, SCProps, ACProps, DCProps, LCProps>
    > {
        const next$field = new$field(this.field.$field, $field);
        if (isFunction($field)) {
            // @ts-ignore
            delete this.field.$field;
            extendObservable(this.field, {
                get $field() {
                    return next$field.$field;
                }
            });
        } else {
            // @ts-ignore
            this.field.$field = next$field.$field;
        }
        // @ts-ignore
        return this;
    }

    /**
     * Remplace la valeur d'un champ par un getter (et un setter).
     * @param get Getter.
     * @param set Setter (optionnel).
     */
    value<T extends DomainType<F["domain"]["type"]>>(
        get: () => T | undefined,
        set: (value: T | undefined) => void = () => {
            /**/
        }
    ): FormEntityFieldBuilder<
        DomainType<F["domain"]["type"]> extends T
            ? F
            : FieldEntry<
                  F["domain"]["type"],
                  T,
                  ComponentPropsType<F["domain"]["InputComponent"]>,
                  ComponentPropsType<F["domain"]["SelectComponent"]>,
                  ComponentPropsType<F["domain"]["AutocompleteComponent"]>,
                  ComponentPropsType<F["domain"]["DisplayComponent"]>,
                  ComponentPropsType<F["domain"]["LabelComponent"]>
              >
    > {
        delete this.field.value;
        extendObservable(this.field, {
            get value() {
                return get();
            },
            set value(v) {
                set(v);
            }
        });
        // @ts-ignore
        return this;
    }

    /** @internal */
    collect() {
        return this.field;
    }
}
