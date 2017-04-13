import {observer} from "mobx-react";
import * as React from "react";

import {applicationStore} from "../../store";

/** Contenu du header. Affiche le `cartridge` si déplié. */
export const HeaderContent = observer<{className: string}>(({className}) => (
    <div className={className}>
        {applicationStore.cartridge}
    </div>
));
