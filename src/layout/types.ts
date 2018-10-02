// @ts-ignore
import {ComponentClass, ReactElement} from "react";
import {themr} from "../theme";

import * as styles from "./__style__/layout.css";
export type LayoutStyle = Partial<typeof styles>;
export const Theme = themr("layout", styles);

export interface LayoutProps {
    children?: React.ReactNode;
    theme?: LayoutStyle;
}
