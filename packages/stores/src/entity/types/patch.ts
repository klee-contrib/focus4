import {FieldEntry, ListEntry, ObjectEntry} from "@focus4/entities";

import {BaseAutocompleteProps, BaseDisplayProps, BaseInputProps, BaseLabelProps, BaseSelectProps} from "./components";
import {FormListNode, FormNode} from "./form";

/**
 * Patche le type d'une entité pour ajouter, remplacer ou retirer des entrées.
 *
 * Exemple : `Patch<MyEntity, {nouveauChamp: FieldEntry<ZodString, champExistant: FieldEntry2<typeof DO_NEW_DOMAIN}>}`
 *
 * Le troisième paramètre peut être utilisé pour lister les champs à retirer, sous la forme `"champ1" | "champ2"`.
 */
export type Patch<
    E,
    P extends Record<number | string | symbol, FieldEntry | ListEntry | ObjectEntry>,
    R extends string = never
> = Omit<E, keyof P | R> & {[K in keyof P]: P[K]};

/**
 * Patche le type d'un `FormNode` pour ajouter, remplacer ou retirer des entrées à son entité.
 *
 * Exemple : `PatchedFormNode<MyEntity, {nouveauChamp: FieldEntry<ZodString>, champExistant: FieldEntry2<typeof DO_NEW_DOMAIN}>}`
 *
 * Le troisième paramètre peut être utilisé pour lister les champs à retirer, sous la forme `"champ1" | "champ2"`.
 */
export type PatchedFormNode<
    E,
    P extends Record<number | string | symbol, FieldEntry | ListEntry | ObjectEntry>,
    R extends string = never
> = FormNode<Patch<E, P, R>, E>;

/**
 * Patche le type d'un `FormListNode` pour ajouter, remplacer ou retirer des entrées à son entité.
 *
 * Exemple : `PatchedFormListNode<MyEntity, {nouveauChamp: FieldEntry<ZodString>, champExistant: FieldEntry2<typeof DO_NEW_DOMAIN}>}`
 *
 * Le troisième paramètre peut être utilisé pour lister les champs à retirer, sous la forme `"champ1" | "champ2"`.
 */
export type PatchedFormListNode<
    E,
    P extends Record<number | string | symbol, FieldEntry | ListEntry | ObjectEntry>,
    R extends string = never
> = FormListNode<Patch<E, P, R>, E>;

/**
 * Patche le type du composant de saisie simple d'un champ (via le type des props de son `InputComponent`).
 *
 * Exemple : `PatchInput<MyFieldEntry, MyInputComponentProps>`
 */
export type PatchInput<F extends FieldEntry, ICProps extends BaseInputProps<F["domain"]["schema"]>> =
    F["domain"] extends Domain<
        infer S,
        infer _,
        infer SCProps,
        infer ACProps,
        infer DCProps,
        infer LCProps,
        infer FCProps
    >
        ? FieldEntry<Domain<S, ICProps, SCProps, ACProps, DCProps, LCProps, FCProps>, NonNullable<F["fieldType"]>>
        : never;

/**
 * Patche le type du composant de saisie via liste de réference d'un champ (via le type des props de son `SelectComponent`).
 *
 * Exemple : `PatchSelect<MyFieldEntry, MySelectComponentProps>`
 */
export type PatchSelect<F extends FieldEntry, SCProps extends BaseSelectProps<F["domain"]["schema"]>> =
    F["domain"] extends Domain<
        infer S,
        infer ICProps,
        infer _,
        infer ACProps,
        infer DCProps,
        infer LCProps,
        infer FCProps
    >
        ? FieldEntry<Domain<S, ICProps, SCProps, ACProps, DCProps, LCProps, FCProps>, NonNullable<F["fieldType"]>>
        : never;

/**
 * Patche le type du composant de saisie en autocomplétion d'un champ (via le type des props de son `AutocompleteComponent`).
 *
 * Exemple : `PatchAutocomplete<MyFieldEntry, MyAutocompleteComponentProps>`
 */
export type PatchAutocomplete<F extends FieldEntry, ACProps extends BaseAutocompleteProps<F["domain"]["schema"]>> =
    F["domain"] extends Domain<
        infer S,
        infer ICProps,
        infer SCProps,
        infer _,
        infer DCProps,
        infer LCProps,
        infer FCProps
    >
        ? FieldEntry<Domain<S, ICProps, SCProps, ACProps, DCProps, LCProps, FCProps>, NonNullable<F["fieldType"]>>
        : never;

/**
 * Patche le type du composant d'affichage d'un champ (via le type des props de son `DisplayComponent`).
 *
 * Exemple : `PatchDisplay<MyFieldEntry, MyDisplayComponentProps>`
 */
export type PatchDisplay<F extends FieldEntry, DCProps extends BaseDisplayProps<F["domain"]["schema"]>> =
    F["domain"] extends Domain<
        infer S,
        infer ICProps,
        infer SCProps,
        infer ACProps,
        infer _,
        infer LCProps,
        infer FCProps
    >
        ? FieldEntry<Domain<S, ICProps, SCProps, ACProps, DCProps, LCProps, FCProps>, NonNullable<F["fieldType"]>>
        : never;

/**
 * Patche le type du composant de libellé d'un champ (via le type des props de son `LabelComponent`).
 *
 * Exemple : `PatchLabel<MyFieldEntry, MyLabelComponentProps>`
 */
export type PatchLabel<F extends FieldEntry, LCProps extends BaseLabelProps> =
    F["domain"] extends Domain<
        infer S,
        infer ICProps,
        infer SCProps,
        infer ACProps,
        infer DCProps,
        infer _,
        infer FCProps
    >
        ? FieldEntry<Domain<S, ICProps, SCProps, ACProps, DCProps, LCProps, FCProps>, NonNullable<F["fieldType"]>>
        : never;
