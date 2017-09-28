import styles from "./__style__/header.css";
export type HeaderStyle = Partial<typeof styles>;
export {styles};

export interface HeaderProps {
    children?: React.ReactNode;
    theme?: HeaderStyle;
}
