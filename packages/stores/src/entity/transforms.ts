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
    DomainType,
    EntityField,
    FieldEntry
} from "./types";

export type $Field<
    DT extends "string" | "number" | "boolean" | "object" = any,
    T = any,
    ICProps extends BaseInputProps = any,
    SCProps extends BaseSelectProps = any,
    ACProps extends BaseAutocompleteProps = any,
    DCProps extends BaseDisplayProps = any,
    LCProps extends BaseLabelProps = any
> = Partial<
    Omit<FieldEntry<DT, T, ICProps, SCProps, ACProps, DCProps, LCProps>, "type" | "fieldType"> &
        Domain<DT, ICProps, SCProps, ACProps, DCProps, LCProps>
>;

/**
 * Construit un `EntityField` à partir d'un champ calculé.
 * @param value La valeur.
 * @param $field Les métadonnées pour le champ à créer.
 * @param setter Le setter, si besoin.
 * @param isEdit Etat d'édition initial ou getter vers un état d'édition externe.
 */
export function makeField<
    DT extends "string" | "number" | "boolean" | "object" = "string",
    T extends DomainType<DT> = DomainType<DT>,
    ICProps extends BaseInputProps = BaseInputProps,
    SCProps extends BaseSelectProps = BaseSelectProps,
    ACProps extends BaseAutocompleteProps = BaseAutocompleteProps,
    DCProps extends BaseDisplayProps = BaseDisplayProps,
    LCProps extends BaseLabelProps = BaseLabelProps
>(
    value: () => T | undefined,
    $field?: $Field<DT, T, ICProps, SCProps, ACProps, DCProps, LCProps>,
    setter?: (value: T | undefined) => void,
    isEdit?: boolean
): EntityField<FieldEntry<DT, T, ICProps, SCProps, ACProps, DCProps, LCProps>> & {isEdit?: boolean};
/**
 * Construit un `EntityField` à partir d'une valeur quelconque.
 * @param value La valeur.
 * @param $field Les métadonnées pour le champ à créer.
 */
export function makeField<
    DT extends "string" | "number" | "boolean" | "object" = "string",
    T extends DomainType<DT> = DomainType<DT>,
    ICProps extends BaseInputProps = BaseInputProps,
    SCProps extends BaseSelectProps = BaseSelectProps,
    ACProps extends BaseAutocompleteProps = BaseAutocompleteProps,
    DCProps extends BaseDisplayProps = BaseDisplayProps,
    LCProps extends BaseLabelProps = BaseLabelProps
>(
    value: T | undefined,
    $field?: $Field<DT, T, ICProps, SCProps, ACProps, DCProps, LCProps>
): EntityField<FieldEntry<DT, T, ICProps, SCProps, ACProps, DCProps, LCProps>>;
export function makeField<
    DT extends "string" | "number" | "boolean" | "object" = "string",
    T extends DomainType<DT> = DomainType<DT>,
    ICProps extends BaseInputProps = BaseInputProps,
    SCProps extends BaseSelectProps = BaseSelectProps,
    ACProps extends BaseAutocompleteProps = BaseAutocompleteProps,
    DCProps extends BaseDisplayProps = BaseDisplayProps,
    LCProps extends BaseLabelProps = BaseLabelProps
>(
    value: T | undefined | (() => T | undefined),
    $field: $Field<DT, T, ICProps, SCProps, ACProps, DCProps, LCProps> = {},
    setter: (value: T | undefined) => void = () => null,
    isEdit?: boolean
) {
    const field = extendObservable(
        new$field(
            {
                domain: {type: "string"},
                isRequired: false,
                label: "",
                name: "",
                type: "field"
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
    ) as EntityField<FieldEntry<DT, T, ICProps, SCProps, ACProps, DCProps, LCProps>> & {isEdit?: boolean};

    if (isEdit !== undefined) {
        field.isEdit = isEdit;
    }

    return field;
}

/**
 * Clone un `EntityField` pour y ajouter ou remplacer un état d'édition. Le champ cloné utilise l'état (getter/setter) du champ source.
 * @param field Le champ.
 * @param isEdit L'état d'édition du champ ainsi cloné.
 */
export function cloneField<F extends FieldEntry>(field: EntityField<F>, isEdit?: boolean) {
    return makeField(
        () => field.value,
        field.$field,
        value => (field.value = value),
        isEdit
    ) as EntityField<F> & {
        isEdit?: boolean;
    };
}

/**
 * Crée un nouvel `EntityField` à partir d'un existant, pour modifier ses métadonnées (inclus tout ce qui est définit dans le domaine).
 * @param field Le champ.
 * @param $field Les métadonnées à remplacer.
 */
export function fromField<
    DT extends "string" | "number" | "boolean" | "object",
    T extends DomainType<DT>,
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
    field: EntityField<FieldEntry<DT, T, ICDProps, SCDProps, ACDProps, DCDProps, LCDProps>>,
    $field: $Field<DT, T, ICProps, SCProps, ACProps, DCProps, LCProps>
): EntityField<FieldEntry<DT, T, ICProps, SCProps, ACProps, DCProps, LCProps>> {
    return extendObservable(new$field(field.$field, $field), {value: field.value}) as any;
}

/** @internal */
export function new$field<F extends FieldEntry>(old$field: F, $field: $Field | (() => $Field)) {
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
        name,
        comment = old$field.comment,
        ...domainOverrides
    } = $field;
    return {
        isRequired,
        label,
        name: old$field.name || name,
        type: "field",
        comment,
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
