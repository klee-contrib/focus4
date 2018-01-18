import {isFunction} from "lodash";
import {computed, extendObservable} from "mobx";
import {InputProps} from "react-toolbox/lib/input";

import {DisplayProps, LabelProps} from "../../components";
import {Domain, EntityField, FieldEntry} from "../types";

export type $Field<ICProps = any, DCProps = any, LCProps = any> = Partial<FieldEntry<Domain<ICProps, DCProps, LCProps>> & Domain<ICProps, DCProps, LCProps>> & {isEdit?: boolean};

/**
 * Construit un `EntityField` à partir d'un champ calculé.
 * @param value La valeur.
 * @param $field Les métadonnées pour le champ à créer.
 */
export function makeField<
    T,
    ICProps = InputProps,
    DCProps = DisplayProps,
    LCProps = LabelProps
    >(
    value: () => T,
    $field?: $Field<ICProps, DCProps, LCProps> | (() => $Field<ICProps, DCProps, LCProps>),
    setter?: (value: T) => void
): EntityField<T, Domain<ICProps, DCProps, LCProps>>;
/**
 * Construit un `EntityField` à partir d'une valeur quelconque.
 * @param value La valeur.
 * @param $field Les métadonnées pour le champ à créer.
 */
export function makeField<
    T,
    ICProps = InputProps,
    DCProps = DisplayProps,
    LCProps = LabelProps
>(
    value: T,
    $field?: $Field<ICProps, DCProps, LCProps> | (() => $Field<ICProps, DCProps, LCProps>)
): EntityField<T, Domain<ICProps, DCProps, LCProps>>;
export function makeField(value: any, $field: $Field | (() => $Field) = {}, setter: Function = () => null) {
    return fromField({
        $field: {domain: {}, isRequired: false, label: "", name: "", type: "field"},
        value: isFunction(value) ? computed(value, setter) : value
    }, $field);
}

/**
 * Crée un nouvel `EntityField` à partir d'un existant, pour modifier ses métadonnées (inclus tout ce qui est définit dans le domaine).
 * @param field Le champ.
 * @param $field Les métadonnées à remplacer.
 */
export function fromField<
    T,
    ICDomainProps = InputProps,
    DCDomainProps = DisplayProps,
    LCDomainProps = LabelProps,
    ICProps = ICDomainProps,
    DCProps = DCDomainProps,
    LCProps = LCDomainProps
>(
    field: EntityField<T, Domain<ICDomainProps, DCDomainProps, LCDomainProps>>,
    $field: $Field<ICProps, DCProps, LCProps> | (() => $Field<ICProps, DCProps, LCProps>)
): EntityField<T, Domain<ICProps, DCProps, LCProps>> {
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
 */
export function patchField<
    T,
    ICDomainProps = InputProps,
    DCDomainProps = DisplayProps,
    LCDomainProps = LabelProps,
    ICProps = ICDomainProps,
    DCProps = DCDomainProps,
    LCProps = LCDomainProps
>(
    field: EntityField<T, Domain<ICDomainProps, DCDomainProps, LCDomainProps>>,
    $field: $Field<ICProps, DCProps, LCProps> | (() => $Field<ICProps, DCProps, LCProps>),
) {
    const next$field = new$field(field, $field);
    if (isFunction($field)) {
        extendObservable(field, {$field: next$field});
    } else {
        (field.$field as any) = next$field;
    }
}

function new$field<T>(field: EntityField<T>, $field: $Field | (() => $Field)) {
    const {$field: old$field} = field;
    if (isFunction($field)) {
        return computed(() => new$fieldCore(old$field, $field()), {compareStructural: true});
    } else {
        return new$fieldCore(old$field, $field);
    }
}

function new$fieldCore(old$field: FieldEntry, $field: $Field) {
    const {
        isEdit,
        domain = old$field.domain,
        isRequired = old$field.isRequired,
        label = old$field.label,
        name = old$field.name,
        type = old$field.type,
        ...domainOverrides
    } = $field;
    return {
        isEdit,
        isRequired,
        label,
        name,
        type,
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
