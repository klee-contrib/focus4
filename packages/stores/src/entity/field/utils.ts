import {isFunction} from "es-toolkit";
import {extendObservable} from "mobx";
import {ComponentType, ReactNode} from "react";
import z from "zod";

import {FieldEntry, isBooleanSchema, isDateSchema, isDateTimeSchema} from "@focus4/entities";

import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    EntityField
} from "../types";
import {BaseComponents} from "../types/components";

import {BuildingFormEntityField, EntityFieldBuilder} from "./builder";

interface ReadonlyFieldOptions<
    S extends z.ZodType = z.ZodNever,
    T extends z.output<S> = z.output<S>,
    DCDProps extends BaseDisplayProps<S> = BaseDisplayProps<S>,
    LCDProps extends BaseLabelProps = BaseLabelProps,
    DCProps extends BaseDisplayProps<S> = DCDProps,
    LCProps extends BaseLabelProps = LCDProps,
    FProps extends {theme?: object} = {theme?: object}
> extends BaseComponents<S, DCProps, LCProps> {
    className?: string;
    comment?: ReactNode;
    domain?: Domain<S, any, any, any, DCDProps, LCDProps, FProps>;
    displayFormatter?: ((value: T | undefined) => string) | string;
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
    S extends z.ZodType = z.ZodNever,
    T extends z.output<S> = z.output<S>,
    DCDProps extends BaseDisplayProps<S> = BaseDisplayProps<S>,
    LCDProps extends BaseLabelProps = BaseLabelProps,
    DCProps extends BaseDisplayProps<S> = DCDProps,
    LCProps extends BaseLabelProps = LCDProps,
    FProps extends {theme?: object} = {theme?: object}
>(
    field: EntityField<FieldEntry<Domain<S, any, any, any, DCDProps, LCDProps, FProps>, T>>,
    options: ReadonlyFieldOptions<S, T, DCDProps, LCDProps, DCProps, LCProps, FProps> = {}
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
    S extends z.ZodType = z.ZodNever,
    T extends z.output<S> = z.output<S>,
    DCDProps extends BaseDisplayProps<S> = BaseDisplayProps<S>,
    LCDProps extends BaseLabelProps = BaseLabelProps,
    DCProps extends BaseDisplayProps<S> = DCDProps,
    LCProps extends BaseLabelProps = LCDProps,
    FProps extends {theme?: object} = {theme?: object}
>(
    value: T | undefined,
    options?: ReadonlyFieldOptions<S, T, DCDProps, LCDProps, DCProps, LCProps, FProps> & {name?: string}
): EntityField<FieldEntry<Domain<S, any, any, any, DCProps, LCProps, FProps>, T>>;
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
                Domain<
                    z.ZodNever,
                    BaseInputProps<z.ZodNever>,
                    BaseSelectProps<z.ZodNever>,
                    BaseAutocompleteProps<z.ZodNever>,
                    BaseDisplayProps<z.ZodNever>,
                    BaseLabelProps,
                    {theme?: object}
                >
            >
        >
    ) => EntityFieldBuilder<F>
): EntityField<F>;
export function makeField(param1: any, param2: any = {}) {
    if (isFunction(param2)) {
        return withIsEdit((param2(new EntityFieldBuilder(param1)) as EntityFieldBuilder<any>).collect());
    } else {
        const {
            className,
            comment,
            domain = {
                schema: z.never(),
                AutocompleteComponent: UndefinedComponent,
                DisplayComponent: UndefinedComponent,
                LabelComponent: UndefinedComponent,
                InputComponent: UndefinedComponent,
                SelectComponent: UndefinedComponent
            } as Domain,
            DisplayComponent = domain.DisplayComponent,
            displayFormatter = domain.displayFormatter,
            displayProps,
            fieldProps,
            label,
            LabelComponent = domain.LabelComponent,
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
                    displayProps: {...domain.displayProps, ...displayProps},
                    labelProps: {...domain.labelProps, ...labelProps},
                    fieldProps: {...domain.fieldProps, ...fieldProps}
                })
                .value(() => param1)
                .edit(false)
                .collect()
        );
    }
}

/** Composant de domaine/champ non défini (vide). */
export function UndefinedComponent() {
    return null;
}

const toString = (x: any) => `${x}`;

/** Retourne le formatter par défaut pour un schéma donné. */
export function getDefaultFormatter(schema: z.ZodType) {
    return isBooleanSchema(schema)
        ? "focus.boolean"
        : isDateSchema(schema)
          ? "focus.date"
          : isDateTimeSchema(schema)
            ? "focus.datetime"
            : toString;
}

function withIsEdit(field: BuildingFormEntityField) {
    return extendObservable(field, {
        get isEdit() {
            return isFunction(field._isEdit) ? field._isEdit() : field._isEdit;
        }
    });
}
