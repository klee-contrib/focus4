import {isFunction} from "lodash";
import {ComponentType, ReactNode} from "react";

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
} from "../types";
import {BaseComponents} from "../types/components";
import {EntityFieldBuilder} from "./builder";

interface ReadonlyFieldOptions<
    DT extends "string" | "number" | "boolean" | "object" = "string",
    T extends DomainType<DT> = DomainType<DT>,
    DCDProps extends BaseDisplayProps = BaseDisplayProps,
    LCDProps extends BaseLabelProps = BaseLabelProps,
    DCProps extends BaseDisplayProps = DCDProps,
    LCProps extends BaseLabelProps = LCDProps
> extends BaseComponents<DCProps, LCProps> {
    className?: string;
    comment?: ReactNode;
    domain?: Domain<DT, any, any, any, DCDProps, LCDProps>;
    displayFormatter?: (value: T | undefined) => string;
    DisplayComponent?: ComponentType<DCProps>;
    label?: string;
    LabelComponent?: ComponentType<LCProps>;
}

/**
 * Clone un `EntityField` pour y ajouter ou remplacer un état d'édition. Le champ cloné utilise l'état (getter/setter) du champ source.
 * @param field Le champ.
 * @param isEdit L'état d'édition du champ ainsi cloné.
 */
export function cloneField<F extends FieldEntry>(field: EntityField<F>, isEdit: boolean) {
    const {domain, name, ...metadata} = field.$field;
    return new EntityFieldBuilder(name)
        .value(
            () => field.value,
            value => (field.value = value)
        )
        .domain(domain)
        .metadata(metadata)
        .edit(isEdit)
        .collect();
}

/**
 * Crée un nouvel `EntityField` en lecture seule à partir d'un existant, pour modifier ses métadonnées.
 * @param field Le champ.
 * @param builder Builder pour spécifier le domaine et les métadonnées.
 */
export function fromField<
    DT extends "string" | "number" | "boolean" | "object" = "string",
    T extends DomainType<DT> = DomainType<DT>,
    DCDProps extends BaseDisplayProps = BaseDisplayProps,
    LCDProps extends BaseLabelProps = BaseLabelProps,
    DCProps extends BaseDisplayProps = DCDProps,
    LCProps extends BaseLabelProps = LCDProps
>(
    field: EntityField<FieldEntry<DT, T, any, any, any, DCDProps, LCDProps>>,
    options: ReadonlyFieldOptions<DT, T, DCDProps, LCDProps, DCProps, LCProps> = {}
) {
    const {
        className = field.$field.domain.className,
        comment = field.$field.comment,
        domain = field.$field.domain,
        DisplayComponent = (field.$field.domain.DisplayComponent as unknown) as ComponentType<DCProps>,
        displayFormatter = field.$field.domain.displayFormatter,
        displayProps = {},
        label = field.$field.label,
        LabelComponent = (field.$field.domain.LabelComponent as unknown) as ComponentType<LCProps>,
        labelProps = {}
    } = options;
    return makeField(field.value, {
        className,
        comment,
        domain,
        DisplayComponent,
        displayFormatter,
        displayProps,
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
    DT extends "string" | "number" | "boolean" | "object" = "string",
    T extends DomainType<DT> = DomainType<DT>,
    DCDProps extends BaseDisplayProps = BaseDisplayProps,
    LCDProps extends BaseLabelProps = BaseLabelProps,
    DCProps extends BaseDisplayProps = DCDProps,
    LCProps extends BaseLabelProps = LCDProps
>(
    value: T | undefined,
    options?: ReadonlyFieldOptions<DT, T, DCDProps, LCDProps, DCProps, LCProps> & {name?: string}
): EntityField<FieldEntry<DT, T, any, any, any, DCProps, LCProps>>;
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
                BaseLabelProps
            >
        >
    ) => EntityFieldBuilder<F>
): EntityField<F>;
export function makeField(param1: any, param2: any = {}) {
    if (isFunction(param2)) {
        return param2(new EntityFieldBuilder(param1).edit(true)).collect();
    } else {
        const {
            className,
            comment,
            domain,
            DisplayComponent = domain?.DisplayComponent,
            displayFormatter = domain?.displayFormatter,
            displayProps,
            label,
            LabelComponent = domain?.LabelComponent,
            labelProps,
            name = ""
        } = param2;
        return new EntityFieldBuilder(name)
            .domain(domain)
            .metadata({
                className,
                comment,
                displayFormatter,
                label,
                DisplayComponent,
                LabelComponent,
                displayProps: {...(domain?.displayProps ?? {}), ...displayProps},
                labelProps: {...(domain?.labelProps ?? {}), ...labelProps}
            })
            .value(() => param1)
            .collect();
    }
}
