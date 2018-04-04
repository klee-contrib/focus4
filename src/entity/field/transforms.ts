import {isFunction} from "lodash";
import {comparer, computed, extendObservable, set} from "mobx";
import {InputProps} from "react-toolbox/lib/input";

import {DisplayProps, LabelProps} from "../../components";
import {Domain, EntityField, FieldEntry, StoreType} from "../types";

export type $Field<T = any, ICProps = any, DCProps = any, LCProps = any> = Partial<FieldEntry<T, ICProps, DCProps, LCProps> & Domain<ICProps, DCProps, LCProps>>;

/**
 * Construit un `EntityField` à partir d'un champ calculé.
 * @param value La valeur.
 * @param $field Les métadonnées pour le champ à créer.
 * @param setter Le setter, si besoin.
 * @param isEdit L'état initial ou la condition d'édition.
 */
export function makeField<
    T extends StoreType,
    ICProps extends {theme?: {}} = InputProps,
    DCProps extends {theme?: {}} = DisplayProps,
    LCProps = LabelProps
>(
    value: () => T,
    $field?: $Field<T, ICProps, DCProps, LCProps> | (() => $Field<T, ICProps, DCProps, LCProps>),
    setter?: (value: T) => void,
    isEdit?: boolean | (() => boolean)
): EntityField<FieldEntry<T, ICProps, DCProps, LCProps>>;
/**
 * Construit un `EntityField` à partir d'une valeur quelconque.
 * @param value La valeur.
 * @param $field Les métadonnées pour le champ à créer.
 */
export function makeField<
    T extends StoreType,
    ICProps extends {theme?: {}} = InputProps,
    DCProps extends {theme?: {}} = DisplayProps,
    LCProps = LabelProps
>(
    value: T,
    $field?: $Field<T, ICProps, DCProps, LCProps> | (() => $Field<T, ICProps, DCProps, LCProps>)
): EntityField<FieldEntry<T, ICProps, DCProps, LCProps>>;
export function makeField<
    T extends StoreType,
    ICProps extends {theme?: {}} = InputProps,
    DCProps extends {theme?: {}} = DisplayProps,
    LCProps = LabelProps
>(value: T | (() => T), $field: $Field<T, ICProps, DCProps, LCProps> | (() => $Field<T, ICProps, DCProps, LCProps>) = {}, setter: Function = () => null, isEdit?: any) {
    const field =  fromField({
        $field: {domain: {}, isRequired: false, label: "", name: "", type: "field", fieldType: {} as T},
        value: isFunction(value) ? computed(value, setter) as any : value
    }, $field);

    if (isEdit !== undefined) {
        field.isEdit = (isEdit as any);
    }

    return field;
}

/**
 * Crée un nouvel `EntityField` à partir d'un existant, pour modifier ses métadonnées (inclus tout ce qui est définit dans le domaine).
 * @param field Le champ.
 * @param $field Les métadonnées à remplacer.
 */
export function fromField<
    T extends StoreType,
    ICDomainProps extends {theme?: {}} = InputProps,
    DCDomainProps extends {theme?: {}} = DisplayProps,
    LCDomainProps = LabelProps,
    ICProps extends {theme?: {}} = ICDomainProps,
    DCProps extends {theme?: {}} = DCDomainProps,
    LCProps = LCDomainProps
>(
    field: EntityField<FieldEntry<T, ICDomainProps, DCDomainProps, LCDomainProps>>,
    $field: $Field<T, ICProps, DCProps, LCProps> | (() => $Field<T, ICProps, DCProps, LCProps>)
): EntityField<FieldEntry<T, ICProps, DCProps, LCProps>> {
    const valueObj = {value: field.value};
    const $fieldObj = {$field: new$field(field, $field)};
    if (isFunction($field)) {
        return extendObservable({}, {...valueObj, ...$fieldObj}) as any;
    } else {
        return extendObservable($fieldObj, valueObj) as any;
    }
}

/**
 * Patche un `EntityField` pour modifier ses métadonnées (inclus tout ce qui est définit dans le domaine). Cette fonction **MODIFIE** le champ donné.
 * @param field Le champ.
 * @param $field Les métadonnées à remplacer.
 * @param isEdit L'état initial ou la condition d'édition.
 */
export function patchField<
    T extends StoreType,
    ICDomainProps = InputProps,
    DCDomainProps = DisplayProps,
    LCDomainProps = LabelProps,
    ICProps = ICDomainProps,
    DCProps = DCDomainProps,
    LCProps = LCDomainProps
>(
    field: EntityField<FieldEntry<T, ICDomainProps, DCDomainProps, LCDomainProps>>,
    $field: $Field<T, ICProps, DCProps, LCProps> | (() => $Field<T, ICProps, DCProps, LCProps>),
    isEdit?: boolean | (() => boolean)
) {
    const next$field = new$field(field, $field);
    if (isFunction($field)) {
        set(field, {$field: next$field});
    } else {
        (field.$field as any) = next$field;
    }

    if (isEdit !== undefined) {
        field.isEdit = isEdit as any;
    }
}

function new$field<T extends FieldEntry<any, any, any, any>>(field: EntityField<T>, $field: $Field | (() => $Field)) {
    const {$field: old$field} = field;
    if (isFunction($field)) {
        return computed(() => new$fieldCore(old$field, $field()), {equals: comparer.structural});
    } else {
        return new$fieldCore(old$field, $field);
    }
}

function new$fieldCore(old$field: FieldEntry, $field: $Field) {
    const {
        domain = old$field.domain,
        isRequired = old$field.isRequired,
        label = old$field.label,
        name = old$field.name,
        type = old$field.type,
        fieldType = old$field.fieldType,
        ...domainOverrides
    } = $field;
    return {
        isRequired,
        label,
        name,
        type,
        fieldType,
        domain: {
            ...domain,
            ...domainOverrides,
            inputProps: {
                ...(domain.inputProps as any),
                ...(domainOverrides.inputProps as any)
            },
            displayProps: {
                ...(domain.displayProps as any),
                ...(domainOverrides.displayProps as any)
            },
            labelProps: {
                ...(domain.labelProps as any),
                ...(domainOverrides.labelProps as any)
            }
        },
    };
}
