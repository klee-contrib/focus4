import {
    $Field,
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    EntityField,
    FieldEntry,
    FieldType,
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
    T extends FieldType<FT>,
    FT = "string",
    ICProps extends BaseInputProps = InputProps<FT extends "number" ? "number" : "string">,
    SCProps extends BaseSelectProps = SelectProps<FT extends "number" ? "number" : "string">,
    ACProps extends BaseAutocompleteProps = AutocompleteProps<FT extends "number" ? "number" : "string">,
    DCProps extends BaseDisplayProps = DisplayProps,
    LCProps extends BaseLabelProps = LabelProps
>(
    value: () => T | undefined,
    $field?:
        | $Field<FT, ICProps, SCProps, ACProps, DCProps, LCProps>
        | (() => $Field<FT, ICProps, SCProps, ACProps, DCProps, LCProps>),
    setter?: (value: T | undefined) => void,
    isEdit?: boolean | (() => boolean)
): EntityField<FieldEntry<FT, ICProps, SCProps, ACProps, DCProps, LCProps>> & {isEdit?: boolean};
/**
 * Construit un `EntityField` à partir d'une valeur quelconque.
 * @param value La valeur.
 * @param $field Les métadonnées pour le champ à créer.
 */
export function makeField<
    T extends FieldType<FT>,
    FT = "string",
    ICProps extends BaseInputProps = InputProps<FT extends "number" ? "number" : "string">,
    SCProps extends BaseSelectProps = SelectProps<FT extends "number" ? "number" : "string">,
    ACProps extends BaseAutocompleteProps = AutocompleteProps<FT extends "number" ? "number" : "string">,
    DCProps extends BaseDisplayProps = DisplayProps,
    LCProps extends BaseLabelProps = LabelProps
>(
    value: T | undefined,
    $field?:
        | $Field<FT, ICProps, SCProps, ACProps, DCProps, LCProps>
        | (() => $Field<FT, ICProps, SCProps, ACProps, DCProps, LCProps>)
): EntityField<FieldEntry<FT, ICProps, SCProps, ACProps, DCProps, LCProps>>;
export function makeField<
    T extends FieldType<FT>,
    FT = "string",
    ICProps extends BaseInputProps = InputProps<FT extends "number" ? "number" : "string">,
    SCProps extends BaseSelectProps = SelectProps<FT extends "number" ? "number" : "string">,
    ACProps extends BaseAutocompleteProps = AutocompleteProps<FT extends "number" ? "number" : "string">,
    DCProps extends BaseDisplayProps = DisplayProps,
    LCProps extends BaseLabelProps = LabelProps
>(
    value: T | undefined | (() => T | undefined),
    $field:
        | $Field<FT, ICProps, SCProps, ACProps, DCProps, LCProps>
        | (() => $Field<FT, ICProps, SCProps, ACProps, DCProps, LCProps>) = {},
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
    FT,
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
    field: EntityField<FieldEntry<FT, ICDProps, SCDProps, ACDProps, DCDProps, LCDProps>>,
    $field:
        | $Field<FT, ICProps, SCProps, ACProps, DCProps, LCProps>
        | (() => $Field<FT, ICProps, SCProps, ACProps, DCProps, LCProps>)
): EntityField<FieldEntry<FT, ICProps, SCProps, ACProps, DCProps, LCProps>> {
    return fromFieldCore(field, $field);
}

/**
 * Patche un `EntityField` pour modifier ses métadonnées (inclus tout ce qui est définit dans le domaine). Cette fonction **MODIFIE** le champ donné.
 * @param field Le champ.
 * @param $field Les métadonnées à remplacer.
 * @param isEdit Etat d'édition initial ou getter vers un état d'édition externe.
 */
export function patchField<
    FT,
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
    field: EntityField<FieldEntry<FT, ICDProps, SCDProps, ACDProps, DCDProps, LCDProps>>,
    $field:
        | $Field<FT, ICProps, SCProps, ACProps, DCProps, LCProps>
        | (() => $Field<FT, ICProps, SCProps, ACProps, DCProps, LCProps>),
    isEdit?: boolean | (() => boolean)
) {
    patchFieldCore(field, $field, isEdit);
}
