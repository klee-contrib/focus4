import "@focus4/collections/lib/focus4.collections.css";
import "@focus4/form-toolbox/lib/focus4.form-toolbox.css";
import "@focus4/forms/lib/focus4.forms.css";
import "@focus4/layout/lib/focus4.layout.css";
import "@focus4/styling/lib/focus4.styling.css";
import "@focus4/toolbox/lib/focus4.toolbox.css";

import {translation as ct} from "@focus4/collections";
import {translation as ft} from "@focus4/form-tooblox";
import {translation as lt} from "@focus4/layout";
import {translation as st} from "@focus4/stores";

export const translation = {
    ...ct.fr,
    ...ft.fr,
    ...st.fr,
    icons: {...ct.icons, ...ft.icons, ...lt.icons}
};
