import {extendObservable} from "mobx";

import {isFunction} from "lodash";
import {makeField, Metadata, new$field} from "../../transforms";
import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    Domain,
    DomainType,
    EntityField,
    FieldEntry,
    FieldEntryType
} from "../../types";

type DomainInputProps<D> = D extends Domain<infer _, infer ICProps> ? ICProps : never;
type DomainSelectProps<D> = D extends Domain<infer _, infer __, infer SCProps> ? SCProps : never;
type DomainAutocompleteProps<D> = D extends Domain<infer _, infer __, infer ___, infer ACProps> ? ACProps : never;
type DomainDisplayProps<D> = D extends Domain<infer _, infer __, infer ___, infer ____, infer DCProps>
    ? DCProps
    : never;
type DomainLabelProps<D> = D extends Domain<infer _, infer __, infer ___, infer ____, infer _____, infer LCProps>
    ? LCProps
    : never;

export class FormEntityFieldBuilder<F extends FieldEntry> {
    /** @internal */
    field: EntityField<F>;

    constructor(field?: EntityField<F>) {
        this.field = field || (makeField(undefined) as any);
    }

    /**
     * Initialise l'état d'édition du champ.
     * @param value Etat d'édition initial.
     */
    edit(value: boolean): FormEntityFieldBuilder<F>;
    /**
     * Force l'état d'édition du champ.
     * @param value Condition d'édition.
     */
    edit(value: () => boolean): FormEntityFieldBuilder<F>;
    edit(value: boolean | (() => boolean)): FormEntityFieldBuilder<F> {
        // @ts-ignore
        this.field.isEdit = value;
        return this;
    }

    /**
     * Modifie le domaine du champ.
     * @param domain Le domaine.
     */
    domain<D extends Domain>(
        domain: D
    ): FormEntityFieldBuilder<
        FieldEntry<
            D["type"],
            DomainType<D["type"]>,
            DomainInputProps<D>,
            DomainSelectProps<D>,
            DomainAutocompleteProps<D>,
            DomainDisplayProps<D>,
            DomainLabelProps<D>
        >
    > {
        // @ts-ignore
        this.field.$field = {...this.field.$field, domain};
        // @ts-ignore
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
            | Metadata<FieldEntryType<F>, ICProps, SCProps, ACProps, DCProps, LCProps>
            | (() => Metadata<FieldEntryType<F>, ICProps, SCProps, ACProps, DCProps, LCProps>)
    ): FormEntityFieldBuilder<
        FieldEntry<F["domain"]["type"], F["fieldType"], ICProps, SCProps, ACProps, DCProps, LCProps>
    > {
        const next$field = new$field(this.field.$field, $field);
        if (isFunction($field)) {
            // @ts-ignore
            delete this.field.$field;
            extendObservable(this.field, {
                get $field() {
                    return next$field.$field;
                }
            });
        } else {
            // @ts-ignore
            this.field.$field = next$field.$field;
        }
        // @ts-ignore
        return this;
    }

    /**
     * Remplace la valeur d'un champ par un getter (et un setter).
     * @param get Getter.
     * @param set Setter (optionnel).
     */
    value<T extends DomainType<F["domain"]["type"]>>(
        get: () => T | undefined,
        set: (value: T | undefined) => void = () => {
            /**/
        }
    ): FormEntityFieldBuilder<
        DomainType<F["domain"]["type"]> extends T
            ? F
            : FieldEntry<
                  F["domain"]["type"],
                  T,
                  DomainInputProps<F["domain"]>,
                  DomainSelectProps<F["domain"]>,
                  DomainAutocompleteProps<F["domain"]>,
                  DomainDisplayProps<F["domain"]>,
                  DomainLabelProps<F["domain"]>
              >
    > {
        delete this.field.value;
        extendObservable(this.field, {
            get value() {
                return get();
            },
            set value(v) {
                set(v);
            }
        });
        // @ts-ignore
        return this;
    }

    /** @internal */
    collect() {
        return this.field;
    }
}
