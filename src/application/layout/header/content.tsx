import {observer} from "mobx-react";
import * as React from "react";

/** Props du contenu du header. */
export interface HeaderContentProps {
    /** Composant de cartridge */
    cartridge: React.ReactElement<any>;
    /** Classe CSS. */
    className: string;
    /** Marge à gauche, calculée à partir de la taille du menu. */
    marginLeft: number;
}

/** Contenu du header. Affiche le `cartridge` si déplié. */
export const HeaderContent = observer<HeaderContentProps>(({cartridge, className, marginLeft}) => (
    <div className={className} style={{marginLeft}}>
        {cartridge}
    </div>
));
