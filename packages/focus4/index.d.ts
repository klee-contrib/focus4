import {translation as ct} from "@focus4/collections";
import {translation as ft} from "@focus4/forms";
import {translation as lt} from "@focus4/layout";

export const translation: typeof ct.fr & typeof ft.fr & {icons: typeof ct.icons & typeof ft.icons & typeof lt.icons};
