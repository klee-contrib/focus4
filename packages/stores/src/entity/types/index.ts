import {ComponentType} from "react";
import {output, ZodType} from "zod";

import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    FieldComponents
} from "./components";
import {Validator} from "./validation";

export {
    isAnyFormNode,
    isAnyStoreNode,
    isEntityField,
    isFormEntityField,
    isFormListNode,
    isFormNode,
    isStoreListNode,
    isStoreNode
} from "./utils";

export type {
    AutocompleteComponents,
    BaseAutocompleteProps,
    BaseComponentProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    FieldComponents,
    InputComponents,
    SelectComponents
} from "./components";
export type {FormEntityField, FormListNode, FormNode} from "./form";
export type {
    Patch,
    PatchAutocomplete,
    PatchDisplay,
    PatchedFormListNode,
    PatchedFormNode,
    PatchInput,
    PatchLabel,
    PatchSelect
} from "./patch";
export type {EntityField, StoreListNode, StoreNode} from "./store";
export type {NodeToType, SourceNodeType} from "./utils";
export type {
    DateValidator,
    EmailValidator,
    FunctionValidator,
    NumberValidator,
    RegexValidator,
    StringValidator,
    Validator
} from "./validation";

/** Définition d'un domaine. */
declare global {
    interface Domain<
        S extends ZodType = any,
        ICProps extends BaseInputProps<S> = any,
        SCProps extends BaseSelectProps<S> = any,
        ACProps extends BaseAutocompleteProps<S> = any,
        DCProps extends BaseDisplayProps<S> = any,
        LCProps extends BaseLabelProps = any,
        FProps extends {theme?: object} = any
    > extends FieldComponents<S, ICProps, SCProps, ACProps, DCProps, LCProps, FProps> {
        /** Classe CSS pour le champ. */
        className?: string;
        /**
         * Formatteur pour l'affichage du champ en consulation.
         *
         * Peut être une fonction de la valeur, ou une clé i18n qui sera appelée avec la variable `value`.
         */
        displayFormatter?: ((value: output<S> | undefined) => string) | string;
        /**
         * Liste des validateurs.
         *
         * @deprecated Vous n'avez plus besoin de validateurs dédiés, ils peuvent être intégrés au schéma.
         */
        validator?: Validator<output<S>> | Validator<output<S>>[];

        /** Composant personnalisé pour l'autocomplete. */
        AutocompleteComponent: ComponentType<ACProps>;
        /** Composant personnalisé pour l'affichage. */
        DisplayComponent: ComponentType<DCProps>;
        /** Composant personnalisé pour le libellé. */
        LabelComponent: ComponentType<LCProps>;
        /** Composant personnalisé pour l'entrée utilisateur. */
        InputComponent: ComponentType<ICProps>;
        /** Composant personnalisé pour le select. */
        SelectComponent: ComponentType<SCProps>;
    }
}
