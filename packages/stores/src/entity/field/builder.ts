import {isFunction} from "lodash";
import {extendObservable, observable, remove} from "mobx";
import {ComponentType, ReactNode} from "react";

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
    FieldComponents,
    FieldEntry,
    FieldEntryType,
    Validator,
    WithThemeProps
} from "../types";

type DomainInputProps<D> = D extends Domain<infer _0, infer ICProps> ? ICProps : never;
type DomainSelectProps<D> = D extends Domain<infer _0, infer _1, infer SCProps> ? SCProps : never;
type DomainAutocompleteProps<D> = D extends Domain<infer _0, infer _1, infer _2, infer ACProps> ? ACProps : never;
type DomainDisplayProps<D> = D extends Domain<infer _0, infer _1, infer _2, infer _3, infer DCProps> ? DCProps : never;
type DomainLabelProps<D> = D extends Domain<infer _0, infer _1, infer _2, infer _3, infer _4, infer LCProps>
    ? LCProps
    : never;
type DomainFieldProps<D> = D extends Domain<infer _0, infer _1, infer _2, infer _3, infer _4, infer _5, infer FProps>
    ? FProps
    : never;

/** Métadonnées surchargeables dans un champ. */
export interface Metadata<
    T = any,
    ICProps extends BaseInputProps = any,
    SCProps extends BaseSelectProps = any,
    ACProps extends BaseAutocompleteProps = any,
    DCProps extends BaseDisplayProps = any,
    LCProps extends BaseLabelProps = any,
    FProps extends WithThemeProps = any
> extends FieldComponents<ICProps, SCProps, ACProps, DCProps, LCProps, FProps> {
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
    /** Validateur(s). */
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

export class EntityFieldBuilder<F extends FieldEntry> {
    /** @internal */
    field: EntityField<F> = extendObservable(
        {
            $field: {
                type: "field",
                name: "",
                domain: {type: "string"},
                isRequired: false,
                label: ""
            } as F
        },
        {
            value: undefined
        },
        {value: observable.ref}
    );

    constructor(field: EntityField<F> | string) {
        if (typeof field === "string") {
            // @ts-ignore
            this.field.$field.name = field;
        } else {
            this.field = field;
        }
    }

    /**
     * Modifie le domaine du champ.
     * @param domain Le domaine.
     */
    domain<D extends Domain>(
        domain?: D
    ): EntityFieldBuilder<
        FieldEntry<
            D["type"],
            DomainType<D["type"]>,
            DomainInputProps<D>,
            DomainSelectProps<D>,
            DomainAutocompleteProps<D>,
            DomainDisplayProps<D>,
            DomainLabelProps<D>,
            DomainFieldProps<D>
        >
    > {
        if (domain) {
            // @ts-ignore
            this.field.$field.domain = domain;
        }
        // @ts-ignore
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
        // @ts-ignore
        this.field.isEdit = value;
        return this;
    }

    /**
     * Modifie les métadonnées du champ.
     * @param $field Métadonnées du champ à remplacer;
     */
    metadata<
        ICProps extends BaseInputProps = DomainInputProps<F["domain"]>,
        SCProps extends BaseSelectProps = DomainSelectProps<F["domain"]>,
        ACProps extends BaseAutocompleteProps = DomainAutocompleteProps<F["domain"]>,
        DCProps extends BaseDisplayProps = DomainDisplayProps<F["domain"]>,
        LCProps extends BaseLabelProps = DomainLabelProps<F["domain"]>
    >(
        $field:
            | Metadata<FieldEntryType<F>, ICProps, SCProps, ACProps, DCProps, LCProps, DomainFieldProps<F["domain"]>>
            | (() => Metadata<
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
            F["domain"]["type"],
            FieldEntryType<F>,
            ICProps,
            SCProps,
            ACProps,
            DCProps,
            LCProps,
            DomainFieldProps<F["domain"]>
        >
    > {
        const old$field = this.field.$field;
        if (isFunction($field)) {
            // @ts-ignore
            delete this.field.$field;
            extendObservable(this.field, {
                get $field() {
                    return merge$fields(old$field, ($field as () => F)());
                }
            });
        } else {
            // @ts-ignore
            this.field.$field = merge$fields(this.field.$field, $field);
        }
        // @ts-ignore
        return this;
    }

    /**
     * Initialise la valeur du champ.
     * @param value Valeur initiale.
     */
    value<T extends DomainType<F["domain"]["type"]>>(
        value?: T
    ): EntityFieldBuilder<
        FieldEntry<
            F["domain"]["type"],
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
    value<T extends DomainType<F["domain"]["type"]>>(
        get: () => T | undefined,
        set?: (value: T | undefined) => void
    ): EntityFieldBuilder<
        FieldEntry<
            F["domain"]["type"],
            T,
            DomainInputProps<F["domain"]>,
            DomainSelectProps<F["domain"]>,
            DomainAutocompleteProps<F["domain"]>,
            DomainDisplayProps<F["domain"]>,
            DomainLabelProps<F["domain"]>,
            DomainFieldProps<F["domain"]>
        >
    >;
    value<T extends DomainType<F["domain"]["type"]>>(
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
        // @ts-ignore
        return this;
    }

    /** @internal */
    collect() {
        return this.field;
    }
}

function merge$fields(old$field: FieldEntry, $field: Metadata) {
    const {
        isRequired = old$field.isRequired,
        label = old$field.label,
        comment = old$field.comment,
        ...domainOverrides
    } = $field;
    const {domain} = old$field;
    return {
        type: "field",
        name: old$field.name,
        comment,
        isRequired,
        label,
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
    };
}
