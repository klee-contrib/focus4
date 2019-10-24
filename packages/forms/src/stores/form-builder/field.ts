import {
    $Field,
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    Domain,
    EntityField,
    FieldEntry,
    FieldType
} from "@focus4/stores";
import {extendObservable} from "mobx";
import {ComponentType} from "react";

import {makeField, patchField} from "../transforms";

type DomainType<F extends FieldEntry> = F["domain"] extends Domain<infer T> ? T : never;
type ComponentPropsType<C extends ComponentType | undefined> = C extends ComponentType<infer P> ? P : never;

export class FormEntityFieldBuilder<F extends FieldEntry> {
    /** @internal */
    field: EntityField<F>;

    constructor(field?: EntityField<F>) {
        this.field = field || (makeField(null) as any);
    }

    /**
     * Initialise l'état d'édition du FormEntityField.
     * @param value Etat d'édition initial.
     */
    edit(value: boolean): FormEntityFieldBuilder<F>;
    /**
     * Force l'état d'édition du FormEntityField.
     * @param value Condition d'édition.
     */
    edit(value: () => boolean): FormEntityFieldBuilder<F>;
    edit(value: boolean | (() => boolean)): FormEntityFieldBuilder<F> {
        // @ts-ignore
        this.field.isEdit = value;
        return this;
    }
    /**
     * Modifie les métadonnées du FormEntityField.
     * @param $field Métadonnées du champ à remplacer;
     */
    metadata<
        ICProps extends BaseInputProps = ComponentPropsType<F["domain"]["InputComponent"]>,
        SCProps extends BaseSelectProps = ComponentPropsType<F["domain"]["SelectComponent"]>,
        ACProps extends BaseAutocompleteProps = ComponentPropsType<F["domain"]["AutocompleteComponent"]>,
        DCProps extends BaseDisplayProps = ComponentPropsType<F["domain"]["DisplayComponent"]>,
        LCProps extends BaseLabelProps = ComponentPropsType<F["domain"]["LabelComponent"]>
    >(
        $field:
            | $Field<DomainType<F>, F["fieldType"], ICProps, SCProps, ACProps, DCProps, LCProps>
            | (() => $Field<DomainType<F>, F["fieldType"], ICProps, SCProps, ACProps, DCProps, LCProps>)
    ): FormEntityFieldBuilder<FieldEntry<DomainType<F>, F["fieldType"], ICProps, SCProps, ACProps, DCProps, LCProps>> {
        patchField(this.field, $field);
        // @ts-ignore
        return this;
    }

    /**
     * Remplace la valeur d'un champ par un getter (et un setter).
     * @param get Getter.
     * @param set Setter (optionnel).
     */
    value(
        get: () => FieldType<F["fieldType"]> | undefined,
        set: (value: FieldType<F["fieldType"]> | undefined) => void = () => {
            /**/
        }
    ) {
        delete this.field.value;
        extendObservable(this.field, {
            get value() {
                return get();
            },
            set value(v) {
                set(v);
            }
        });
        return this;
    }

    /** @internal */
    collect() {
        return this.field;
    }
}
