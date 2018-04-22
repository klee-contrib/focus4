import {observer} from "mobx-react";
import * as React from "react";

import {HeaderActions, HeaderBarLeft, HeaderBarRight, HeaderContent, HeaderScrolling, HeaderSummary, HeaderTopRow} from "../layout";

import {applicationStore} from "./store";

/** Le header par défaut. */
export const Header = observer(() => (
    <HeaderScrolling canDeploy={applicationStore.canDeploy}>
        <HeaderTopRow>
            <HeaderBarLeft>
                {applicationStore.barLeft}
            </HeaderBarLeft>
            <HeaderSummary>
                {applicationStore.summary}
            </HeaderSummary>
            <HeaderBarRight>
                {applicationStore.barRight}
            </HeaderBarRight>
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

(Header as any).displayName = "Header";
