import {Domain as TrueDomain} from "@focus4/stores";

export interface Domain<ICProps, DCProps, LCProps> extends TrueDomain<any, ICProps, any, any, DCProps, LCProps> {
    /** Formatteur pour l'affichage du champ en consulation. */
    displayFormatter?: (value: any) => string;

    /** Formatteur pour l'affichage du champ en édition. */
    inputFormatter?: (value: any) => string;

    /** Formatteur inverse pour convertir l'affichage du champ en la valeur (édition uniquement) */
    unformatter?: (text: string) => any;
}
