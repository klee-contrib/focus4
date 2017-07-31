import {observer} from "mobx-react";
import * as React from "react";

import {applicationStore} from "../../store";
import HeaderActions from "./actions";
import HeaderContent from "./content";
import HeaderScrolling from "./scrolling";
import HeaderTopRow, {HeaderBarLeft, HeaderBarRight, HeaderSummary} from "./top-row";

export {HeaderActions, HeaderBarLeft, HeaderBarRight, HeaderContent, HeaderScrolling, HeaderSummary, HeaderTopRow};
export {HeaderStyle} from "./types";

/** Le header, posé par défaut par le Layout. */
export const Header = observer(() => (
    <HeaderScrolling canDeploy={applicationStore.canDeploy}>
        <HeaderTopRow>
            <HeaderBarLeft>
                {applicationStore.barLeft}
            </HeaderBarLeft>
            <HeaderBarRight>
                {applicationStore.barRight}
            </HeaderBarRight>
            <HeaderSummary>
                {applicationStore.summary}
            </HeaderSummary>
        </HeaderTopRow>
        <HeaderContent>
            {applicationStore.cartridge}
        </HeaderContent>
        <HeaderActions
            primary={applicationStore.actions.primary}
            secondary={applicationStore.actions.secondary}
        />
    </HeaderScrolling>
));

export default Header;
