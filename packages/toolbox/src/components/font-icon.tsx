import classnames from "classnames";

export interface FontIconProps {
    /** Alt text for the icon. */
    alt?: string;
    className?: string;
    /** Children to pass through the component. */
    children?: React.ReactNode;
    /**The key string for the icon you want be displayed. */
    value?: React.ReactNode;
}

export function FontIcon({alt = "", className = "", children, value}: FontIconProps) {
    return (
        <span
            data-react-toolbox="font-icon"
            aria-label={alt}
            className={classnames(
                {"material-icons": typeof value === "string" || typeof children === "string"},
                className
            )}
        >
            {value}
            {children}
        </span>
    );
}
