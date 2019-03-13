import {isFunction} from "lodash";
import {comparer, computed, extendObservable, observable} from "mobx";
import {themeable} from "react-css-themr";

import {AutocompleteProps, DisplayProps, InputProps, LabelProps, SelectProps} from "../../components";

import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    Domain,
    EntityField,
    FieldEntry
} from "../types";

export type $Field<
    T = any,
    ICProps extends BaseInputProps = any,
    SCProps extends BaseSelectProps = any,
    ACProps extends BaseAutocompleteProps = any,
    DCProps extends BaseDisplayProps = any,
    LCProps extends BaseLabelProps = any
> = Partial<
    FieldEntry<T, ICProps, SCProps, ACProps, DCProps, LCProps> & Domain<ICProps, SCProps, ACProps, DCProps, LCProps>
>;

/**
 * Construit un `EntityField` à partir d'un champ calculé.
 * @param value La valeur.
 * @param $field Les métadonnées pour le champ à créer.
 * @param setter Le setter, si besoin.
 * @param isEdit Etat d'édition initial ou getter vers un état d'édition externe.
 */
export function makeField<
    T,
    ICProps extends BaseInputProps = InputProps<T extends number ? "number" : "string">,
    SCProps extends BaseSelectProps = SelectProps,
    ACProps extends BaseAutocompleteProps = AutocompleteProps,
    DCProps extends BaseDisplayProps = DisplayProps,
    LCProps extends BaseLabelProps = LabelProps
>(
    value: () => T,
    $field?:
        | $Field<T, ICProps, SCProps, ACProps, DCProps, LCProps>
        | (() => $Field<T, ICProps, SCProps, ACProps, DCProps, LCProps>),
    setter?: (value: T) => void,
    isEdit?: boolean | (() => boolean)
): EntityField<FieldEntry<NonNullable<T>, ICProps, SCProps, ACProps, DCProps, LCProps>> & {isEdit?: boolean};
/**
 * Construit un `EntityField` à partir d'une valeur quelconque.
 * @param value La valeur.
 * @param $field Les métadonnées pour le champ à créer.
 */
export function makeField<
    T,
    ICProps extends BaseInputProps = InputProps<T extends number ? "number" : "string">,
    SCProps extends BaseSelectProps = SelectProps,
    ACProps extends BaseAutocompleteProps = AutocompleteProps,
    DCProps extends BaseDisplayProps = DisplayProps,
    LCProps extends BaseLabelProps = LabelProps
>(
    value: T,
    $field?:
        | $Field<T, ICProps, SCProps, ACProps, DCProps, LCProps>
        | (() => $Field<T, ICProps, SCProps, ACProps, DCProps, LCProps>)
): EntityField<FieldEntry<NonNullable<T>, ICProps, SCProps, ACProps, DCProps, LCProps>>;
export function makeField<
    T,
    ICProps extends BaseInputProps = InputProps<T extends number ? "number" : "string">,
    SCProps extends BaseSelectProps = SelectProps,
    ACProps extends BaseAutocompleteProps = AutocompleteProps,
    DCProps extends BaseDisplayProps = DisplayProps,
    LCProps extends BaseLabelProps = LabelProps
>(
    value: T | (() => T),
    $field:
        | $Field<T, ICProps, SCProps, ACProps, DCProps, LCProps>
        | (() => $Field<T, ICProps, SCProps, ACProps, DCProps, LCProps>) = {},
    setter: Function = () => null,
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
                      return (value as () => T)() as NonNullable<T>;
                  },
                  set value(v) {
                      setter(v);
                  }
              }
            : {value}
    ) as EntityField<FieldEntry<T>>;

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
    return makeField(() => field.value, field.$field, value => (field.value = value), isEdit) as EntityField<F> & {
        isEdit?: boolean;
    };
}

/**
 * Crée un nouvel `EntityField` à partir d'un existant, pour modifier ses métadonnées (inclus tout ce qui est définit dans le domaine).
 * @param field Le champ.
 * @param $field Les métadonnées à remplacer.
 */
export function fromField<
    T,
    ICDProps extends BaseInputProps = InputProps<T extends number ? "number" : "string">,
    SCDProps extends BaseSelectProps = SelectProps,
    ACDProps extends BaseAutocompleteProps = AutocompleteProps,
    DCDProps extends BaseDisplayProps = DisplayProps,
    LCDProps extends BaseLabelProps = LabelProps,
    ICProps extends BaseInputProps = ICDProps,
    SCProps extends BaseSelectProps = SCDProps,
    ACProps extends BaseAutocompleteProps = ACDProps,
    DCProps extends BaseDisplayProps = DCDProps,
    LCProps extends BaseLabelProps = LCDProps
>(
    field: EntityField<FieldEntry<T, ICDProps, SCDProps, ACDProps, DCDProps, LCDProps>>,
    $field:
        | $Field<T, ICProps, SCProps, ACProps, DCProps, LCProps>
        | (() => $Field<T, ICProps, SCProps, ACProps, DCProps, LCProps>)
): EntityField<FieldEntry<T, ICProps, SCProps, ACProps, DCProps, LCProps>> {
    return extendObservable(new$field(field.$field, $field), {value: field.value}) as any;
}

/**
 * Patche un `EntityField` pour modifier ses métadonnées (inclus tout ce qui est définit dans le domaine). Cette fonction **MODIFIE** le champ donné.
 * @param field Le champ.
 * @param $field Les métadonnées à remplacer.
 * @param isEdit Etat d'édition initial ou getter vers un état d'édition externe.
 */
export function patchField<
    T,
    ICDProps extends BaseInputProps = InputProps<T extends number ? "number" : "string">,
    SCDProps extends BaseSelectProps = SelectProps,
    ACDProps extends BaseAutocompleteProps = AutocompleteProps,
    DCDProps extends BaseDisplayProps = DisplayProps,
    LCDProps extends BaseLabelProps = LabelProps,
    ICProps extends BaseInputProps = ICDProps,
    SCProps extends BaseSelectProps = SCDProps,
    ACProps extends BaseAutocompleteProps = ACDProps,
    DCProps extends BaseDisplayProps = DCDProps,
    LCProps extends BaseLabelProps = LCDProps
>(
    field: EntityField<FieldEntry<T, ICDProps, SCDProps, ACDProps, DCDProps, LCDProps>>,
    $field:
        | $Field<T, ICProps, SCProps, ACProps, DCProps, LCProps>
        | (() => $Field<T, ICProps, SCProps, ACProps, DCProps, LCProps>),
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
