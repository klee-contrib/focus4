import {isFunction} from "lodash";
import {comparer, computed, extendObservable, observable} from "mobx";

import {themeable} from "@focus4/core";

import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    Domain,
    EntityField,
    FieldEntry,
    FieldEntryType
} from "./types";

export type $Field<
    DT = any,
    FT extends FieldEntryType<DT> = FieldEntryType<DT>,
    ICProps extends BaseInputProps = any,
    SCProps extends BaseSelectProps = any,
    ACProps extends BaseAutocompleteProps = any,
    DCProps extends BaseDisplayProps = any,
    LCProps extends BaseLabelProps = any
> = Partial<
    FieldEntry<DT, FT, ICProps, SCProps, ACProps, DCProps, LCProps> &
        Domain<DT, ICProps, SCProps, ACProps, DCProps, LCProps>
>;

/**
 * Construit un `EntityField` à partir d'un champ calculé.
 * @param value La valeur.
 * @param $field Les métadonnées pour le champ à créer.
 * @param setter Le setter, si besoin.
 * @param isEdit Etat d'édition initial ou getter vers un état d'édition externe.
 */
export function makeFieldCore<
    T,
    FT extends FieldEntryType<T>,
    ICProps extends BaseInputProps,
    SCProps extends BaseSelectProps,
    ACProps extends BaseAutocompleteProps,
    DCProps extends BaseDisplayProps,
    LCProps extends BaseLabelProps
>(
    value: T | undefined | (() => T | undefined),
    $field:
        | $Field<T, FT, ICProps, SCProps, ACProps, DCProps, LCProps>
        | (() => $Field<T, FT, ICProps, SCProps, ACProps, DCProps, LCProps>) = {},
    setter: (value: T | undefined) => void = () => null,
    isEdit?: boolean | (() => boolean)
) {
    const field = extendObservable(
        new$field(
            {
                domain: {},
                isRequired: false,
                label: "",
                name: "",
                type: "field",
                fieldType: typeof (isFunction(value) ? value() : value) === "number" ? "number" : {}
            },
            $field
        ),
        isFunction(value)
            ? {
                  get value() {
                      return (value as () => T)();
                  },
                  set value(v) {
                      setter(v);
                  }
              }
            : {value}
    ) as EntityField<FieldEntry<FT>>;

    if (isEdit !== undefined) {
        (field as any).isEdit = isEdit;
    }

    return field;
}

/**
 * Clone un `EntityField` pour y ajouter ou remplacer un état d'édition. Le champ cloné utilise l'état (getter/setter) du champ source.
 * @param field Le champ.
 * @param isEdit L'état d'édition du champ ainsi cloné.
 */
export function cloneField<F extends FieldEntry>(field: EntityField<F>, isEdit?: boolean) {
    return makeFieldCore(() => field.value, field.$field, value => (field.value = value), isEdit) as EntityField<F> & {
        isEdit?: boolean;
    };
}

/**
 * Crée un nouvel `EntityField` à partir d'un existant, pour modifier ses métadonnées (inclus tout ce qui est définit dans le domaine).
 * @param field Le champ.
 * @param $field Les métadonnées à remplacer.
 */
export function fromFieldCore<
    DT,
    FT extends FieldEntryType<DT>,
    ICDProps extends BaseInputProps,
    SCDProps extends BaseSelectProps,
    ACDProps extends BaseAutocompleteProps,
    DCDProps extends BaseDisplayProps,
    LCDProps extends BaseLabelProps,
    ICProps extends BaseInputProps = ICDProps,
    SCProps extends BaseSelectProps = SCDProps,
    ACProps extends BaseAutocompleteProps = ACDProps,
    DCProps extends BaseDisplayProps = DCDProps,
    LCProps extends BaseLabelProps = LCDProps
>(
    field: EntityField<FieldEntry<DT, FT, ICDProps, SCDProps, ACDProps, DCDProps, LCDProps>>,
    $field:
        | $Field<DT, FT, ICProps, SCProps, ACProps, DCProps, LCProps>
        | (() => $Field<DT, FT, ICProps, SCProps, ACProps, DCProps, LCProps>)
): EntityField<FieldEntry<DT, FT, ICProps, SCProps, ACProps, DCProps, LCProps>> {
    return extendObservable(new$field(field.$field, $field), {value: field.value}) as any;
}

/**
 * Patche un `EntityField` pour modifier ses métadonnées (inclus tout ce qui est définit dans le domaine). Cette fonction **MODIFIE** le champ donné.
 * @param field Le champ.
 * @param $field Les métadonnées à remplacer.
 * @param isEdit Etat d'édition initial ou getter vers un état d'édition externe.
 */
export function patchFieldCore<
    DT,
    FT extends FieldEntryType<DT>,
    ICDProps extends BaseInputProps,
    SCDProps extends BaseSelectProps,
    ACDProps extends BaseAutocompleteProps,
    DCDProps extends BaseDisplayProps,
    LCDProps extends BaseLabelProps,
    ICProps extends BaseInputProps = ICDProps,
    SCProps extends BaseSelectProps = SCDProps,
    ACProps extends BaseAutocompleteProps = ACDProps,
    DCProps extends BaseDisplayProps = DCDProps,
    LCProps extends BaseLabelProps = LCDProps
>(
    field: EntityField<FieldEntry<DT, FT, ICDProps, SCDProps, ACDProps, DCDProps, LCDProps>>,
    $field:
        | $Field<DT, FT, ICProps, SCProps, ACProps, DCProps, LCProps>
        | (() => $Field<DT, FT, ICProps, SCProps, ACProps, DCProps, LCProps>),
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

function new$field<F extends FieldEntry>(old$field: F, $field: $Field | (() => $Field)) {
    if (isFunction($field)) {
        return observable(
            {
                get $field() {
                    return new$fieldCore(old$field, ($field as () => F)());
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
            validator: !domain.validator
                ? domainOverrides.validator
                : !domainOverrides.validator
                ? domain.validator
                : [
                      ...(Array.isArray(domain.validator) ? domain.validator : [domain.validator]),
                      ...(Array.isArray(domainOverrides.validator)
                          ? domainOverrides.validator
                          : [domainOverrides.validator])
                  ],
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
