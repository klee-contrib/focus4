import {isFunction} from "lodash";
import {comparer, computed, extendObservable, observable} from "mobx";
import {themeable} from "react-css-themr";

import {Autocomplete, Display, Input, Label, Select} from "../../components";

import {BaseAutocompleteProps, BaseSelectProps, Domain, EntityField, FieldEntry} from "../types";

export type $Field<
    T = any,
    IComp = any,
    SComp extends React.ComponentType<BaseSelectProps> = any,
    AComp extends React.ComponentType<BaseAutocompleteProps> = any,
    DComp = any,
    LComp = any
> = Partial<FieldEntry<T, IComp, SComp, AComp, DComp, LComp> & Domain<IComp, SComp, AComp, DComp, LComp>>;

/**
 * Construit un `EntityField` à partir d'un champ calculé.
 * @param value La valeur.
 * @param $field Les métadonnées pour le champ à créer.
 * @param setter Le setter, si besoin.
 * @param isEdit L'état initial ou la condition d'édition.
 */
export function makeField<
    T,
    IComp = typeof Input,
    SComp extends React.ComponentType<BaseSelectProps> = typeof Select,
    AComp extends React.ComponentType<BaseAutocompleteProps> = typeof Autocomplete,
    DComp = typeof Display,
    LComp = typeof Label
>(
    value: () => T,
    $field?: $Field<T, IComp, SComp, AComp, DComp, LComp> | (() => $Field<T, IComp, SComp, AComp, DComp, LComp>),
    setter?: (value: T) => void,
    isEdit?: boolean | (() => boolean)
): EntityField<FieldEntry<NonNullable<T>, IComp, SComp, AComp, DComp, LComp>>;
/**
 * Construit un `EntityField` à partir d'une valeur quelconque.
 * @param value La valeur.
 * @param $field Les métadonnées pour le champ à créer.
 */
export function makeField<
    T,
    IComp = typeof Input,
    SComp extends React.ComponentType<BaseSelectProps> = typeof Select,
    AComp extends React.ComponentType<BaseAutocompleteProps> = typeof Autocomplete,
    DComp = typeof Display,
    LComp = typeof Label
>(
    value: T,
    $field?: $Field<T, IComp, SComp, AComp, DComp, LComp> | (() => $Field<T, IComp, SComp, AComp, DComp, LComp>)
): EntityField<FieldEntry<NonNullable<T>, IComp, SComp, AComp, DComp, LComp>>;
export function makeField<
    T,
    IComp = typeof Input,
    SComp extends React.ComponentType<BaseSelectProps> = typeof Select,
    AComp extends React.ComponentType<BaseAutocompleteProps> = typeof Autocomplete,
    DComp = typeof Display,
    LComp = typeof Label
>(
    value: T | (() => T),
    $field: $Field<T, IComp, SComp, AComp, DComp, LComp> | (() => $Field<T, IComp, SComp, AComp, DComp, LComp>) = {},
    setter: Function = () => null,
    isEdit?: any
) {
    const field = extendObservable(
        new$field(
            {
                domain: {},
                isRequired: false,
                label: "",
                name: "",
                type: "field" as "field",
                fieldType: {} as NonNullable<T>
            },
            $field
        ),
        isFunction(value)
            ? {
                  get value() {
                      return (value as () => T)() as NonNullable<T>;
                  },
                  set value(v) {
                      setter(v);
                  }
              }
            : {value}
    ) as EntityField;

    if (isEdit !== undefined) {
        (field as any).isEdit = isEdit;
    }

    return field;
}

/**
 * Crée un nouvel `EntityField` à partir d'un existant, pour modifier ses métadonnées (inclus tout ce qui est définit dans le domaine).
 * @param field Le champ.
 * @param $field Les métadonnées à remplacer.
 */
export function fromField<
    T,
    IDComp = typeof Input,
    SDComp extends React.ComponentType<BaseSelectProps> = typeof Select,
    ADComp extends React.ComponentType<BaseAutocompleteProps> = typeof Autocomplete,
    DDComp = typeof Display,
    LDComp = typeof Label,
    IComp = IDComp,
    SComp extends React.ComponentType<BaseSelectProps> = SDComp,
    AComp extends React.ComponentType<BaseAutocompleteProps> = ADComp,
    DComp = DDComp,
    LComp = LDComp
>(
    field: EntityField<FieldEntry<NonNullable<T>, IDComp, SDComp, ADComp, DDComp, LDComp>>,
    $field: $Field<T, IComp, SComp, AComp, DComp, LComp> | (() => $Field<T, IComp, SComp, AComp, DComp, LComp>)
): EntityField<FieldEntry<NonNullable<T>, IComp, SComp, AComp, DComp, LComp>> {
    return extendObservable(new$field(field.$field, $field), {value: field.value}) as any;
}

/**
 * Patche un `EntityField` pour modifier ses métadonnées (inclus tout ce qui est définit dans le domaine). Cette fonction **MODIFIE** le champ donné.
 * @param field Le champ.
 * @param $field Les métadonnées à remplacer.
 * @param isEdit L'état initial ou la condition d'édition.
 */
export function patchField<
    T,
    IDComp = typeof Input,
    SDComp extends React.ComponentType<BaseSelectProps> = typeof Select,
    ADComp extends React.ComponentType<BaseAutocompleteProps> = typeof Autocomplete,
    DDComp = typeof Display,
    LDComp = typeof Label,
    IComp = IDComp,
    SComp extends React.ComponentType<BaseSelectProps> = SDComp,
    AComp extends React.ComponentType<BaseAutocompleteProps> = ADComp,
    DComp = DDComp,
    LComp = LDComp
>(
    field: EntityField<FieldEntry<NonNullable<T>, IDComp, SDComp, ADComp, DDComp, LDComp>>,
    $field: $Field<T, IComp, SComp, AComp, DComp, LComp> | (() => $Field<T, IComp, SComp, AComp, DComp, LComp>),
    isEdit?: boolean | (() => boolean)
) {
    const next$field = new$field(field.$field, $field);
    if (isFunction($field)) {
        delete (field as any).$field;
        extendObservable(field, {
            get $field() {
                return next$field.$field;
            }
        });
    } else {
        (field.$field as any) = next$field.$field;
    }

    if (isEdit !== undefined) {
        (field as any).isEdit = isEdit;
    }
}

function new$field<T extends FieldEntry>(old$field: T, $field: $Field | (() => $Field)) {
    if (isFunction($field)) {
        return observable(
            {
                get $field() {
                    return new$fieldCore(old$field, ($field as () => T)());
                }
            },
            {
                $field: computed({equals: comparer.structural})
            }
        );
    } else {
        return {
            $field: new$fieldCore(old$field, $field)
        };
    }
}

function new$fieldCore(old$field: FieldEntry, $field: $Field) {
    const {
        domain = old$field.domain,
        isRequired = old$field.isRequired,
        label = old$field.label,
        name = old$field.name,
        type = old$field.type,
        comment = old$field.comment,
        fieldType = old$field.fieldType,
        ...domainOverrides
    } = $field;
    return {
        isRequired,
        label,
        name,
        type,
        comment,
        fieldType,
        domain: {
            ...domain,
            ...domainOverrides,
            inputProps: {
                ...domain.inputProps,
                ...domainOverrides.inputProps,
                theme: themeable((domain.inputProps || {}).theme || {}, (domainOverrides.inputProps || {}).theme || {})
            },
            selectProps: {
                ...domain.selectProps,
                ...domainOverrides.selectProps,
                theme: themeable(
                    (domain.selectProps || {}).theme || {},
                    (domainOverrides.selectProps || {}).theme || {}
                )
            },
            autocompleteProps: {
                ...domain.autocompleteProps,
                ...domainOverrides.autocompleteProps,
                theme: themeable(
                    (domain.autocompleteProps || {}).theme || {},
                    (domainOverrides.autocompleteProps || {}).theme || {}
                )
            },
            displayProps: {
                ...domain.displayProps,
                ...domainOverrides.displayProps,
                theme: themeable(
                    (domain.displayProps || {}).theme || {},
                    (domainOverrides.displayProps || {}).theme || {}
                )
            },
            labelProps: {
                ...domain.labelProps,
                ...domainOverrides.labelProps,
                theme: themeable((domain.labelProps || {}).theme || {}, (domainOverrides.labelProps || {}).theme || {})
            }
        }
    };
}
