import {isFunction} from "lodash";
import {extendObservable} from "mobx";
import {ComponentType, ReactNode} from "react";

import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    Domain,
    DomainFieldType,
    DomainType,
    EntityField,
    FieldEntry
} from "../types";
import {BaseComponents, WithThemeProps} from "../types/components";

import {BuildingFormEntityField, EntityFieldBuilder} from "./builder";

interface ReadonlyFieldOptions<
    DT extends DomainFieldType = "string",
    T extends DomainType<DT> = DomainType<DT>,
    DCDProps extends BaseDisplayProps = BaseDisplayProps,
    LCDProps extends BaseLabelProps = BaseLabelProps,
    DCProps extends BaseDisplayProps = DCDProps,
    LCProps extends BaseLabelProps = LCDProps,
    FProps extends WithThemeProps = WithThemeProps
> extends BaseComponents<DCProps, LCProps> {
    className?: string;
    comment?: ReactNode;
    domain?: Domain<DT, any, any, any, DCDProps, LCDProps, FProps>;
    displayFormatter?: (value: T | undefined) => string;
    DisplayComponent?: ComponentType<DCProps>;
    label?: string;
    LabelComponent?: ComponentType<LCProps>;
    fieldProps?: FProps;
}

/**
 * Clone un `EntityField` pour y ajouter ou remplacer un état d'édition. Le champ cloné utilise l'état (getter/setter) du champ source.
 * @param field Le champ.
 * @param isEdit L'état d'édition du champ ainsi cloné.
 */
export function cloneField<F extends FieldEntry>(field: EntityField<F>, isEdit: boolean) {
    const {domain, name, ...metadata} = field.$field;
    return withIsEdit(
        new EntityFieldBuilder(name)
            .value(
                () => field.value,
                value => (field.value = value)
            )
            .domain(domain)
            .metadata(metadata)
            .edit(isEdit)
            .collect()
    );
}

/**
 * Crée un nouvel `EntityField` en lecture seule à partir d'un existant, pour modifier ses métadonnées.
 * @param field Le champ.
 * @param builder Builder pour spécifier le domaine et les métadonnées.
 */
export function fromField<
    DT extends DomainFieldType = "string",
    T extends DomainType<DT> = DomainType<DT>,
    DCDProps extends BaseDisplayProps = BaseDisplayProps,
    LCDProps extends BaseLabelProps = BaseLabelProps,
    DCProps extends BaseDisplayProps = DCDProps,
    LCProps extends BaseLabelProps = LCDProps,
    FProps extends WithThemeProps = WithThemeProps
>(
    field: EntityField<FieldEntry<DT, T, any, any, any, DCDProps, LCDProps, FProps>>,
    options: ReadonlyFieldOptions<DT, T, DCDProps, LCDProps, DCProps, LCProps, FProps> = {}
) {
    const {
        className = field.$field.domain.className,
        comment = field.$field.comment,
        domain = field.$field.domain,
        DisplayComponent = field.$field.domain.DisplayComponent as unknown as ComponentType<DCProps>,
        displayFormatter = field.$field.domain.displayFormatter,
        displayProps = {},
        label = field.$field.label,
        LabelComponent = field.$field.domain.LabelComponent as unknown as ComponentType<LCProps>,
        labelProps = {},
        fieldProps = {}
    } = options;
    return makeField(field.value, {
        className,
        comment,
        domain,
        DisplayComponent,
        displayFormatter,
        displayProps,
        fieldProps,
        label,
        LabelComponent,
        labelProps,
        name: field.$field.name
    });
}

/**
 * Crée un champ en lecture seule.
 * @param value Valeur
 * @param options Options (domain, formatter, libellé)
 */
export function makeField<
    DT extends DomainFieldType = "string",
    T extends DomainType<DT> = DomainType<DT>,
    DCDProps extends BaseDisplayProps = BaseDisplayProps,
    LCDProps extends BaseLabelProps = BaseLabelProps,
    DCProps extends BaseDisplayProps = DCDProps,
    LCProps extends BaseLabelProps = LCDProps,
    FProps extends WithThemeProps = WithThemeProps
>(
    value: T | undefined,
    options?: ReadonlyFieldOptions<DT, T, DCDProps, LCDProps, DCProps, LCProps, FProps> & {name?: string}
): EntityField<FieldEntry<DT, T, any, any, any, DCProps, LCProps, FProps>>;
/**
 * Crée un champ éditable.
 * @param name Nom du champ
 * @param options Builder pour le champ.
 */
export function makeField<F extends FieldEntry>(
    name: string,
    builder: (
        f: EntityFieldBuilder<
            FieldEntry<
                "string",
                string,
                BaseInputProps,
                BaseSelectProps,
                BaseAutocompleteProps,
                BaseDisplayProps,
                BaseLabelProps,
                WithThemeProps
            >
        >
    ) => EntityFieldBuilder<F>
): EntityField<F>;
export function makeField(param1: any, param2: any = {}) {
    if (isFunction(param2)) {
        return withIsEdit(param2(new EntityFieldBuilder(param1)).collect());
    } else {
        const {
            className,
            comment,
            domain = {type: "string"},
            DisplayComponent = domain?.DisplayComponent,
            displayFormatter = domain?.displayFormatter,
            displayProps,
            fieldProps,
            label,
            LabelComponent = domain?.LabelComponent,
            labelProps,
            name = ""
        } = param2 as ReadonlyFieldOptions & {name?: string};
        return withIsEdit(
            new EntityFieldBuilder(name)
                .domain(domain)
                .metadata({
                    className,
                    comment,
                    displayFormatter,
                    label,
                    DisplayComponent,
                    LabelComponent,
                    displayProps: {...(domain?.displayProps ?? {}), ...displayProps},
                    labelProps: {...(domain?.labelProps ?? {}), ...labelProps},
                    fieldProps: {...(domain?.fieldProps ?? {}), ...fieldProps}
                })
                .value(() => param1)
                .edit(false)
                .collect()
        );
    }
}

function withIsEdit(field: BuildingFormEntityField) {
    return extendObservable(field, {
        get isEdit() {
            return isFunction(field._isEdit) ? field._isEdit() : field._isEdit;
        }
    });
}
