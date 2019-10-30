import {
    $Field,
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    EntityField,
    FieldEntry,
    FieldEntryType,
    fromFieldCore,
    makeFieldCore,
    patchFieldCore
} from "@focus4/stores";

import {AutocompleteProps, DisplayProps, InputProps, LabelProps, SelectProps} from "../components";

/**
 * Construit un `EntityField` à partir d'un champ calculé.
 * @param value La valeur.
 * @param $field Les métadonnées pour le champ à créer.
 * @param setter Le setter, si besoin.
 * @param isEdit Etat d'édition initial ou getter vers un état d'édition externe.
 */
export function makeField<
    T,
    FT extends FieldEntryType<T> = FieldEntryType<T>,
    ICProps extends BaseInputProps = InputProps<FT extends "number" ? "number" : "string">,
    SCProps extends BaseSelectProps = SelectProps<FT extends "number" ? "number" : "string">,
    ACProps extends BaseAutocompleteProps = AutocompleteProps<FT extends "number" ? "number" : "string">,
    DCProps extends BaseDisplayProps = DisplayProps,
    LCProps extends BaseLabelProps = LabelProps
>(
    value: () => T | undefined,
    $field?:
        | $Field<T, FT, ICProps, SCProps, ACProps, DCProps, LCProps>
        | (() => $Field<T, FT, ICProps, SCProps, ACProps, DCProps, LCProps>),
    setter?: (value: T | undefined) => void,
    isEdit?: boolean | (() => boolean)
): EntityField<FieldEntry<T, FT, ICProps, SCProps, ACProps, DCProps, LCProps>> & {isEdit?: boolean};
/**
 * Construit un `EntityField` à partir d'une valeur quelconque.
 * @param value La valeur.
 * @param $field Les métadonnées pour le champ à créer.
 */
export function makeField<
    T,
    FT extends FieldEntryType<T> = FieldEntryType<T>,
    ICProps extends BaseInputProps = InputProps<FT extends "number" ? "number" : "string">,
    SCProps extends BaseSelectProps = SelectProps<FT extends "number" ? "number" : "string">,
    ACProps extends BaseAutocompleteProps = AutocompleteProps<FT extends "number" ? "number" : "string">,
    DCProps extends BaseDisplayProps = DisplayProps,
    LCProps extends BaseLabelProps = LabelProps
>(
    value: T | undefined,
    $field?:
        | $Field<T, FT, ICProps, SCProps, ACProps, DCProps, LCProps>
        | (() => $Field<T, FT, ICProps, SCProps, ACProps, DCProps, LCProps>)
): EntityField<FieldEntry<T, FT, ICProps, SCProps, ACProps, DCProps, LCProps>>;
export function makeField<
    T,
    FT extends FieldEntryType<T> = FieldEntryType<T>,
    ICProps extends BaseInputProps = InputProps<FT extends "number" ? "number" : "string">,
    SCProps extends BaseSelectProps = SelectProps<FT extends "number" ? "number" : "string">,
    ACProps extends BaseAutocompleteProps = AutocompleteProps<FT extends "number" ? "number" : "string">,
    DCProps extends BaseDisplayProps = DisplayProps,
    LCProps extends BaseLabelProps = LabelProps
>(
    value: T | undefined | (() => T | undefined),
    $field:
        | $Field<T, FT, ICProps, SCProps, ACProps, DCProps, LCProps>
        | (() => $Field<T, FT, ICProps, SCProps, ACProps, DCProps, LCProps>) = {},
    setter: (value: T | undefined) => void = () => null,
    isEdit?: boolean | (() => boolean)
) {
    return makeFieldCore(value, $field, setter, isEdit);
}

/**
 * Crée un nouvel `EntityField` à partir d'un existant, pour modifier ses métadonnées (inclus tout ce qui est définit dans le domaine).
 * @param field Le champ.
 * @param $field Les métadonnées à remplacer.
 */
export function fromField<
    DT,
    FT extends FieldEntryType<DT> = FieldEntryType<DT>,
    ICDProps extends BaseInputProps = InputProps<FT extends "number" ? "number" : "string">,
    SCDProps extends BaseSelectProps = SelectProps<FT extends "number" ? "number" : "string">,
    ACDProps extends BaseAutocompleteProps = AutocompleteProps<FT extends "number" ? "number" : "string">,
    DCDProps extends BaseDisplayProps = DisplayProps,
    LCDProps extends BaseLabelProps = LabelProps,
    ICProps extends BaseInputProps = ICDProps,
    SCProps extends BaseSelectProps = SCDProps,
    ACProps extends BaseAutocompleteProps = ACDProps,
    DCProps extends BaseDisplayProps = DCDProps,
    LCProps extends BaseLabelProps = LCDProps
>(
    field: EntityField<FieldEntry<DT, FT, ICDProps, SCDProps, ACDProps, DCDProps, LCDProps>>,
    $field:
        | $Field<DT, FT, ICProps, SCProps, ACProps, DCProps, LCProps>
        | (() => $Field<DT, FT, ICProps, SCProps, ACProps, DCProps, LCProps>)
): EntityField<FieldEntry<DT, FT, ICProps, SCProps, ACProps, DCProps, LCProps>> {
    return fromFieldCore(field, $field);
}

/** @deprecated Utiliser `makeFormNode(node).patch() à la place.` */
export function patchField<
    DT,
    FT extends FieldEntryType<DT> = FieldEntryType<DT>,
    ICDProps extends BaseInputProps = InputProps<FT extends "number" ? "number" : "string">,
    SCDProps extends BaseSelectProps = SelectProps<FT extends "number" ? "number" : "string">,
    ACDProps extends BaseAutocompleteProps = AutocompleteProps<FT extends "number" ? "number" : "string">,
    DCDProps extends BaseDisplayProps = DisplayProps,
    LCDProps extends BaseLabelProps = LabelProps,
    ICProps extends BaseInputProps = ICDProps,
    SCProps extends BaseSelectProps = SCDProps,
    ACProps extends BaseAutocompleteProps = ACDProps,
    DCProps extends BaseDisplayProps = DCDProps,
    LCProps extends BaseLabelProps = LCDProps
>(
    field: EntityField<FieldEntry<DT, FT, ICDProps, SCDProps, ACDProps, DCDProps, LCDProps>>,
    $field:
        | $Field<DT, FT, ICProps, SCProps, ACProps, DCProps, LCProps>
        | (() => $Field<DT, FT, ICProps, SCProps, ACProps, DCProps, LCProps>),
    isEdit?: boolean | (() => boolean)
) {
    patchFieldCore(field, $field, isEdit);
}
