import styles from "./__style__/layout.css";
export type LayoutStyle = Partial<typeof styles>;
export {styles};

export interface LayoutProps {
    children?: React.ReactNode;
    theme?: LayoutStyle;
}
