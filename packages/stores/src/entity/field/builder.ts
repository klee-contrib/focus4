import {isFunction} from "es-toolkit";
import {computed, extendObservable, observable, remove} from "mobx";
import {ComponentType, ReactNode} from "react";
import z from "zod";

import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    Domain,
    EntityField,
    FieldComponents,
    FieldEntry,
    FieldEntryType,
    Validator
} from "../types";

import {themeable} from "./themeable";
import {UndefinedComponent} from "./utils";

type DomainInputProps<D> = D extends Domain<infer _0, infer ICProps> ? ICProps : never;
type DomainSelectProps<D> = D extends Domain<infer _0, infer _1, infer SCProps> ? SCProps : never;
type DomainAutocompleteProps<D> = D extends Domain<infer _0, infer _1, infer _2, infer ACProps> ? ACProps : never;
type DomainDisplayProps<D> = D extends Domain<infer _0, infer _1, infer _2, infer _3, infer DCProps> ? DCProps : never;
type DomainLabelProps<D> =
    D extends Domain<infer _0, infer _1, infer _2, infer _3, infer _4, infer LCProps> ? LCProps : never;
type DomainFieldProps<D> =
    D extends Domain<infer _0, infer _1, infer _2, infer _3, infer _4, infer _5, infer FProps> ? FProps : never;

/** Métadonnées surchargeables dans un champ. */
export interface Metadata<
    S extends z.ZodType = any,
    T extends z.output<S> = z.output<S>,
    ICProps extends BaseInputProps<S> = any,
    SCProps extends BaseSelectProps<S> = any,
    ACProps extends BaseAutocompleteProps<S> = any,
    DCProps extends BaseDisplayProps<S> = any,
    LCProps extends BaseLabelProps = any,
    FProps extends {theme?: object} = any
> extends FieldComponents<S, ICProps, SCProps, ACProps, DCProps, LCProps, FProps> {
    /** Classe CSS pour le champ. */
    className?: string;
    /** Commentaire du champ. */
    comment?: ReactNode;
    /** Formatteur pour l'affichage du champ en consulation. */
    displayFormatter?: (value: T | undefined) => string;
    /** Champ obligatoire. */
    isRequired?: boolean;
    /** Libellé du champ. */
    label?: string;
    /**
     * Validateurs.
     *
     * @deprecated Vous n'avez plus besoin de validateurs dédiés, ils peuvent être intégrés au schéma.
     */
    validator?: Validator<T> | Validator<T>[];

    /** Composant personnalisé pour l'autocomplete. */
    AutocompleteComponent?: ComponentType<ACProps>;
    /** Composant personnalisé pour l'affichage. */
    DisplayComponent?: ComponentType<DCProps>;
    /** Composant personnalisé pour le libellé. */
    LabelComponent?: ComponentType<LCProps>;
    /** Composant personnalisé pour l'entrée utilisateur. */
    InputComponent?: ComponentType<ICProps>;
    /** Composant personnalisé pour le select. */
    SelectComponent?: ComponentType<SCProps>;
}

export type BuildingFormEntityField<F extends FieldEntry = any> = EntityField<F> & {
    _added: boolean;
    _domain: Domain;
    _isEdit: boolean | (() => boolean);
    _metadatas: (Metadata | ((metadata?: Metadata) => Metadata))[];
};

export class EntityFieldBuilder<F extends FieldEntry> {
    /** @internal */
    field: BuildingFormEntityField<F>;

    constructor(field: EntityField<F> | string) {
        let source: EntityField<F>;
        if (typeof field === "string") {
            source = {
                $field: {
                    type: "field",
                    domain: {
                        schema: z.string(),
                        AutocompleteComponent: UndefinedComponent,
                        DisplayComponent: UndefinedComponent,
                        LabelComponent: UndefinedComponent,
                        InputComponent: UndefinedComponent,
                        SelectComponent: UndefinedComponent
                    } as Domain,
                    isRequired: false,
                    label: "",
                    name: field
                } as F,
                value: undefined
            };
        } else {
            source = field;
        }

        if ("_domain" in source) {
            this.field = source as BuildingFormEntityField<F>;
            return;
        }

        const {domain, isRequired, label, name, type, comment, defaultValue} = source.$field;
        this.field = observable(
            {
                _added: typeof field === "string",
                _isEdit: true,
                _domain: domain,
                _metadatas: [{comment, isRequired, label}],
                get $field() {
                    return {
                        type,
                        name,
                        ...mergeMetadatas(this._domain, this._metadatas)
                    } as F;
                },
                value: defaultValue
            },
            {
                _metadatas: observable.shallow,
                _domain: observable.ref,
                $field: computed.struct,
                value: observable.ref
            },
            {
                proxy: false
            }
        );
    }

    /**
     * Modifie le domaine du champ.
     * @param domain Le domaine.
     */
    domain<D extends Domain>(
        domain: D
    ): EntityFieldBuilder<
        FieldEntry<
            D["schema"],
            z.output<D["schema"]>,
            DomainInputProps<D>,
            DomainSelectProps<D>,
            DomainAutocompleteProps<D>,
            DomainDisplayProps<D>,
            DomainLabelProps<D>,
            DomainFieldProps<D>
        >
    > {
        this.field._domain = domain;
        return this;
    }

    /**
     * Initialise l'état d'édition du champ.
     * @param value Etat d'édition initial.
     */
    edit(value: boolean): EntityFieldBuilder<F>;
    /**
     * Force l'état d'édition du champ.
     * @param value Condition d'édition.
     */
    edit(value: () => boolean): EntityFieldBuilder<F>;
    edit(value: boolean | (() => boolean)): EntityFieldBuilder<F> {
        this.field._isEdit = value;
        return this;
    }

    /**
     * Modifie les métadonnées du champ.
     * @param $field Métadonnées du champ à remplacer;
     */
    metadata<
        ICProps extends BaseInputProps<F["domain"]["schema"]> = DomainInputProps<F["domain"]>,
        SCProps extends BaseSelectProps<F["domain"]["schema"]> = DomainSelectProps<F["domain"]>,
        ACProps extends BaseAutocompleteProps<F["domain"]["schema"]> = DomainAutocompleteProps<F["domain"]>,
        DCProps extends BaseDisplayProps<F["domain"]["schema"]> = DomainDisplayProps<F["domain"]>,
        LCProps extends BaseLabelProps = DomainLabelProps<F["domain"]>
    >(
        $field:
            | Metadata<
                  F["domain"]["schema"],
                  // @ts-ignore
                  FieldEntryType<F>,
                  ICProps,
                  SCProps,
                  ACProps,
                  DCProps,
                  LCProps,
                  DomainFieldProps<F["domain"]>
              >
            | (() => Metadata<
                  F["domain"]["schema"],
                  // @ts-ignore
                  FieldEntryType<F>,
                  ICProps,
                  SCProps,
                  ACProps,
                  DCProps,
                  LCProps,
                  DomainFieldProps<F["domain"]>
              >)
    ): EntityFieldBuilder<
        FieldEntry<
            F["domain"]["schema"],
            // @ts-ignore
            FieldEntryType<F>,
            ICProps,
            SCProps,
            ACProps,
            DCProps,
            LCProps,
            DomainFieldProps<F["domain"]>
        >
    > {
        this.field._metadatas.push($field);
        return this;
    }

    /**
     * Initialise la valeur du champ.
     * @param value Valeur initiale.
     */
    value<T extends z.output<F["domain"]["schema"]>>(
        value?: T
    ): EntityFieldBuilder<
        FieldEntry<
            F["domain"]["schema"],
            T,
            DomainInputProps<F["domain"]>,
            DomainSelectProps<F["domain"]>,
            DomainAutocompleteProps<F["domain"]>,
            DomainDisplayProps<F["domain"]>,
            DomainLabelProps<F["domain"]>,
            DomainFieldProps<F["domain"]>
        >
    >;
    /**
     * Remplace la valeur d'un champ par un getter (et un setter).
     * @param get Getter.
     * @param set Setter (optionnel).
     */
    value<T extends z.output<F["domain"]["schema"]>>(
        get: () => T | undefined,
        set?: (value: T | undefined) => void
    ): EntityFieldBuilder<
        FieldEntry<
            F["domain"]["schema"],
            T,
            DomainInputProps<F["domain"]>,
            DomainSelectProps<F["domain"]>,
            DomainAutocompleteProps<F["domain"]>,
            DomainDisplayProps<F["domain"]>,
            DomainLabelProps<F["domain"]>,
            DomainFieldProps<F["domain"]>
        >
    >;
    value<T extends z.output<F["domain"]["schema"]>>(
        getOrValue: T | (() => T),
        set: (value: T | undefined) => void = () => {
            /**/
        }
    ) {
        if (isFunction(getOrValue)) {
            remove(this.field, "value");
            extendObservable(this.field, {
                get value() {
                    return (getOrValue as () => T)();
                },
                set value(v) {
                    set(v);
                }
            });
        } else {
            this.field.value = getOrValue;
        }
        return this;
    }

    /** @internal */
    collect() {
        return this.field;
    }
}

export function mergeMetadatas(domain: Domain, $metadatas: (Metadata | ((metadata?: Metadata) => Metadata))[]) {
    let $metadata = (isFunction($metadatas[0]) ? $metadatas[0]() : $metadatas[0]) as Metadata;
    for (let i = 1; i <= $metadatas.length - 1; i++) {
        const $newMetadata = $metadatas[i];
        [$metadata, domain] = mergeMetadata(
            domain,
            $metadata,
            (isFunction($newMetadata) ? $newMetadata($metadata) : $newMetadata) as Metadata
        );
    }
    return {...$metadata, domain};
}

function mergeMetadata(domain: Domain, targetMetadata: Metadata, newMetadata: Metadata) {
    const {
        comment = targetMetadata.comment,
        isRequired = targetMetadata.isRequired,
        label = targetMetadata.label,
        ...domainOverrides
    } = newMetadata;
    return [
        {
            comment,
            isRequired,
            label
        },
        {
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
                theme: themeable(domain.inputProps?.theme ?? {}, domainOverrides.inputProps?.theme ?? {})
            },
            selectProps: {
                ...domain.selectProps,
                ...domainOverrides.selectProps,
                theme: themeable(domain.selectProps?.theme ?? {}, domainOverrides.selectProps?.theme ?? {})
            },
            autocompleteProps: {
                ...domain.autocompleteProps,
                ...domainOverrides.autocompleteProps,
                theme: themeable(domain.autocompleteProps?.theme ?? {}, domainOverrides.autocompleteProps?.theme ?? {})
            },
            displayProps: {
                ...domain.displayProps,
                ...domainOverrides.displayProps,
                theme: themeable(domain.displayProps?.theme ?? {}, domainOverrides.displayProps?.theme ?? {})
            },
            labelProps: {
                ...domain.labelProps,
                ...domainOverrides.labelProps,
                theme: themeable(domain.labelProps?.theme ?? {}, domainOverrides.labelProps?.theme ?? {})
            },
            fieldProps: {
                ...domain.fieldProps,
                ...domainOverrides.fieldProps,
                theme: themeable(domain.fieldProps?.theme ?? {}, domainOverrides.fieldProps?.theme ?? {})
            }
        }
    ] as const;
}
