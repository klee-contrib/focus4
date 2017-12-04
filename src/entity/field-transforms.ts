import {isFunction} from "lodash";
import {computed, observable} from "mobx";
import {InputProps} from "react-toolbox/lib/input";

import {DisplayProps, LabelProps} from "../components";
import {Domain, DomainNoDefault, EntityField, FieldEntry} from "./types";

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
    $field: Partial<FieldEntry<Domain<ICProps, DCProps, LCProps>> & Domain<ICProps, DCProps, LCProps>>,
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
    $field?: Partial<FieldEntry<Domain<ICProps, DCProps, LCProps>> & Domain<ICProps, DCProps, LCProps>>
): EntityField<T, Domain<ICProps, DCProps, LCProps>>;
export function makeField(value: any, $field: Partial<FieldEntry & Domain> = {}, setter: Function = () => null) {
    return fromField({
        $field: {domain: {}, isRequired: false, label: "", name: "", type: "field" as "field"},
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
    $field: Partial<FieldEntry<Domain<ICProps, DCProps, LCProps>> & Domain<ICProps, DCProps, LCProps>>
) {

    return observable({
        $field: new$field(field, $field),
        value: field.value
    }) as EntityField<T, Domain<ICProps, DCProps, LCProps>>;
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
    $field: Partial<FieldEntry<Domain<ICProps, DCProps, LCProps>> & Domain<ICProps, DCProps, LCProps>>
) {
    (field as any).$field = new$field(field, $field);
    return field as any as EntityField<T, Domain<ICProps, DCProps, LCProps>>;
}

function new$field<T>(field: EntityField<T>, $field: Partial<FieldEntry & DomainNoDefault>) {
    const {
        domain = field.$field.domain,
        isRequired = field.$field.isRequired,
        label = field.$field.label,
        name = field.$field.name,
        type = field.$field.type,
        ...domainOverrides
    } = $field;
    return {
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
