import {isFunction} from "lodash";
import {comparer, computed, extendObservable, observable} from "mobx";

import {DisplayProps, InputProps, LabelProps} from "../../components";

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
    T extends StoreType | undefined,
    ICProps extends {theme?: {}} = InputProps,
    DCProps extends {theme?: {}} = DisplayProps,
    LCProps = LabelProps
>(
    value: () => T,
    $field?: $Field<T, ICProps, DCProps, LCProps> | (() => $Field<T, ICProps, DCProps, LCProps>),
    setter?: (value: T) => void,
    isEdit?: boolean | (() => boolean)
): EntityField<FieldEntry<NonNullable<T>, ICProps, DCProps, LCProps>>;
/**
 * Construit un `EntityField` à partir d'une valeur quelconque.
 * @param value La valeur.
 * @param $field Les métadonnées pour le champ à créer.
 */
export function makeField<
    T extends StoreType | undefined,
    ICProps extends {theme?: {}} = InputProps,
    DCProps extends {theme?: {}} = DisplayProps,
    LCProps = LabelProps
>(
    value: T,
    $field?: $Field<T, ICProps, DCProps, LCProps> | (() => $Field<T, ICProps, DCProps, LCProps>)
): EntityField<FieldEntry<NonNullable<T>, ICProps, DCProps, LCProps>>;
export function makeField<
    T extends StoreType | undefined,
    ICProps extends {theme?: {}} = InputProps,
    DCProps extends {theme?: {}} = DisplayProps,
    LCProps = LabelProps
>(value: T | (() => T), $field: $Field<T, ICProps, DCProps, LCProps> | (() => $Field<T, ICProps, DCProps, LCProps>) = {}, setter: Function = () => null, isEdit?: any) {

    const field = extendObservable(
        new$field({domain: {}, isRequired: false, label: "", name: "", type: "field" as "field", fieldType: {} as NonNullable<T>}, $field),
        isFunction(value) ? {
            get value() { return (value as () => T)() as NonNullable<T>; },
            set value(v) { setter(v); }
        } : {value}
    ) as EntityField;

    if (isEdit !== undefined) {
        field.isEdit = isEdit;
    }

    return field;
}

/**
 * Crée un nouvel `EntityField` à partir d'un existant, pour modifier ses métadonnées (inclus tout ce qui est définit dans le domaine).
 * @param field Le champ.
 * @param $field Les métadonnées à remplacer.
 */
export function fromField<
    T extends StoreType | undefined,
    ICDomainProps extends {theme?: {}} = InputProps,
    DCDomainProps extends {theme?: {}} = DisplayProps,
    LCDomainProps = LabelProps,
    ICProps extends {theme?: {}} = ICDomainProps,
    DCProps extends {theme?: {}} = DCDomainProps,
    LCProps = LCDomainProps
>(
    field: EntityField<FieldEntry<NonNullable<T>, ICDomainProps, DCDomainProps, LCDomainProps>>,
    $field: $Field<T, ICProps, DCProps, LCProps> | (() => $Field<T, ICProps, DCProps, LCProps>)
): EntityField<FieldEntry<NonNullable<T>, ICProps, DCProps, LCProps>> {
    return extendObservable(new$field(field.$field, $field), {value: field.value}) as any;
}

/**
 * Patche un `EntityField` pour modifier ses métadonnées (inclus tout ce qui est définit dans le domaine). Cette fonction **MODIFIE** le champ donné.
 * @param field Le champ.
 * @param $field Les métadonnées à remplacer.
 * @param isEdit L'état initial ou la condition d'édition.
 */
export function patchField<
    T extends StoreType | undefined,
    ICDomainProps = InputProps,
    DCDomainProps = DisplayProps,
    LCDomainProps = LabelProps,
    ICProps = ICDomainProps,
    DCProps = DCDomainProps,
    LCProps = LCDomainProps
>(
    field: EntityField<FieldEntry<NonNullable<T>, ICDomainProps, DCDomainProps, LCDomainProps>>,
    $field: $Field<T, ICProps, DCProps, LCProps> | (() => $Field<T, ICProps, DCProps, LCProps>),
    isEdit?: boolean | (() => boolean)
) {
    const next$field = new$field(field.$field, $field);
    if (isFunction($field)) {
        delete (field as any).$field;
        extendObservable(field, { get $field() { return next$field.$field; }});
    } else {
        (field.$field as any) = next$field.$field;
    }

    if (isEdit !== undefined) {
        field.isEdit = isEdit as any;
    }
}

function new$field<T extends FieldEntry<any, any, any, any>>(old$field: T, $field: $Field | (() => $Field)) {
    if (isFunction($field)) {
        return observable({
            get $field() {
                return new$fieldCore(old$field, ($field as () => T)());
            }
        }, {
            $field: computed({equals: comparer.structural})
        });
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
