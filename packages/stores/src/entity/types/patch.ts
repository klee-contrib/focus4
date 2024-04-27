import {BaseAutocompleteProps, BaseDisplayProps, BaseInputProps, BaseLabelProps, BaseSelectProps} from "./components";
import {Domain, FieldEntry, ListEntry, ObjectEntry} from "./entity";
import {FormListNode, FormNode} from "./form";

/**
 * Patche le type d'une entité pour ajouter ou remplacer des entrées.
 *
 * Exemple : `Patch<MyEntity, {nouveauChamp: FieldEntry<"string">, champExistant: FieldEntry2<typeof DO_NEW_DOMAIN}>}`
 */
export type Patch<E, P extends Record<number | string | symbol, FieldEntry | ListEntry | ObjectEntry>> = Omit<
    E,
    keyof P
> & {[K in keyof P]: P[K]};

/**
 * Patche le type d'un `FormNode` pour ajouter ou remplacer des entrées à son entité.
 *
 * Exemple : `PatchedFormNode<MyEntity, {nouveauChamp: FieldEntry<"string">, champExistant: FieldEntry2<typeof DO_NEW_DOMAIN}>}`
 */
export type PatchedFormNode<
    E,
    P extends Record<number | string | symbol, FieldEntry | ListEntry | ObjectEntry>
> = FormNode<Patch<E, P>, E>;

/**
 * Patche le type d'un `FormListNode` pour ajouter ou remplacer des entrées à son entité.
 *
 * Exemple : `PatchedFormListNode<MyEntity, {nouveauChamp: FieldEntry<"string">, champExistant: FieldEntry2<typeof DO_NEW_DOMAIN}>}`
 */
export type PatchedFormListNode<
    E,
    P extends Record<number | string | symbol, FieldEntry | ListEntry | ObjectEntry>
> = FormListNode<Patch<E, P>, E>;

/**
 * Patche le type du composant de saisie simple d'un champ (via le type des props de son `InputComponent`).
 *
 * Exemple : `PatchInput<MyFieldEntry, MyInputComponentProps>`
 */
export type PatchInput<F extends FieldEntry, ICProps extends BaseInputProps> =
    F["domain"] extends Domain<
        infer DT,
        infer _,
        infer SCProps,
        infer ACProps,
        infer DCProps,
        infer LCProps,
        infer FCProps
    >
        ? FieldEntry<DT, NonNullable<F["fieldType"]>, ICProps, SCProps, ACProps, DCProps, LCProps, FCProps>
        : never;

/**
 * Patche le type du composant de saisie via liste de réference d'un champ (via le type des props de son `SelectComponent`).
 *
 * Exemple : `PatchSelect<MyFieldEntry, MySelectComponentProps>`
 */
export type PatchSelect<F extends FieldEntry, SCProps extends BaseSelectProps> =
    F["domain"] extends Domain<
        infer DT,
        infer ICProps,
        infer _,
        infer ACProps,
        infer DCProps,
        infer LCProps,
        infer FCProps
    >
        ? FieldEntry<DT, NonNullable<F["fieldType"]>, ICProps, SCProps, ACProps, DCProps, LCProps, FCProps>
        : never;

/**
 * Patche le type du composant de saisie en autocomplétion d'un champ (via le type des props de son `AutocompleteComponent`).
 *
 * Exemple : `PatchAutocomplete<MyFieldEntry, MyAutocompleteComponentProps>`
 */
export type PatchAutocomplete<F extends FieldEntry, ACProps extends BaseAutocompleteProps> =
    F["domain"] extends Domain<
        infer DT,
        infer ICProps,
        infer SCProps,
        infer _,
        infer DCProps,
        infer LCProps,
        infer FCProps
    >
        ? FieldEntry<DT, NonNullable<F["fieldType"]>, ICProps, SCProps, ACProps, DCProps, LCProps, FCProps>
        : never;

/**
 * Patche le type du composant d'affichage d'un champ (via le type des props de son `DisplayComponent`).
 *
 * Exemple : `PatchDisplay<MyFieldEntry, MyDisplayComponentProps>`
 */
export type PatchDisplay<F extends FieldEntry, DCProps extends BaseDisplayProps> =
    F["domain"] extends Domain<
        infer DT,
        infer ICProps,
        infer SCProps,
        infer ACProps,
        infer _,
        infer LCProps,
        infer FCProps
    >
        ? FieldEntry<DT, NonNullable<F["fieldType"]>, ICProps, SCProps, ACProps, DCProps, LCProps, FCProps>
        : never;

/**
 * Patche le type du composant de libellé d'un champ (via le type des props de son `LabelComponent`).
 *
 * Exemple : `PatchLabel<MyFieldEntry, MyLabelComponentProps>`
 */
export type PatchLabel<F extends FieldEntry, LCProps extends BaseLabelProps> =
    F["domain"] extends Domain<
        infer DT,
        infer ICProps,
        infer SCProps,
        infer ACProps,
        infer DCProps,
        infer _,
        infer FCProps
    >
        ? FieldEntry<DT, NonNullable<F["fieldType"]>, ICProps, SCProps, ACProps, DCProps, LCProps, FCProps>
        : never;
