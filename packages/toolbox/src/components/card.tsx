import * as React from "react";
import {Card as RTCard, CardProps, CardTheme} from "react-toolbox/lib/card/Card";
import {CardActions as RTCardActions, CardActionsProps, CardActionsTheme} from "react-toolbox/lib/card/CardActions";
import {CardMedia as RTCardMedia, CardMediaProps, CardMediaTheme} from "react-toolbox/lib/card/CardMedia";
import {CardText as RTCardText, CardTextProps, CardTextTheme} from "react-toolbox/lib/card/CardText";
import {
    CardTitle as CardTitleType,
    cardTitleFactory,
    CardTitleProps,
    CardTitleTheme
} from "react-toolbox/lib/card/CardTitle";
import {CARD} from "react-toolbox/lib/identifiers";

import {fromBem, useTheme} from "@focus4/styling";
import rtCardTheme from "react-toolbox/components/card/theme.css";
const cardTheme: CardTheme = rtCardTheme;
export {cardTheme};

import {Avatar} from "./avatar";

export const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<RTCard>> = React.forwardRef(
    (props, ref) => {
        const theme = useTheme(CARD, cardTheme, props.theme);
        return <RTCard ref={ref} {...props} theme={fromBem(theme)} />;
    }
);

export const CardActions: React.ForwardRefExoticComponent<
    CardActionsProps & React.RefAttributes<RTCardActions>
> = React.forwardRef((props, ref) => {
    const theme = useTheme(CARD, cardTheme as CardActionsTheme, props.theme);
    return <RTCardActions ref={ref} {...props} theme={fromBem(theme)} />;
});

export const CardMedia: React.ForwardRefExoticComponent<
    CardMediaProps & React.RefAttributes<RTCardMedia>
> = React.forwardRef((props, ref) => {
    const theme = useTheme(CARD, cardTheme as CardMediaTheme, props.theme);
    return <RTCardMedia ref={ref} {...props} theme={fromBem(theme)} />;
});

export const CardText: React.ForwardRefExoticComponent<
    CardTextProps & React.RefAttributes<RTCardText>
> = React.forwardRef((props, ref) => {
    const theme = useTheme(CARD, cardTheme as CardTextTheme, props.theme);
    return <RTCardText ref={ref} {...props} theme={fromBem(theme)} />;
});

const RTCardTitle = cardTitleFactory(Avatar);
export const CardTitle = React.forwardRef<CardTitleType, CardTitleProps>((props, ref) => {
    const theme = useTheme(CARD, cardTheme as CardTitleTheme, props.theme);
    return <RTCardTitle ref={ref} {...props} theme={fromBem(theme)} />;
});

export {
    CardProps,
    CardTheme,
    CardActionsProps,
    CardActionsTheme,
    CardMediaProps,
    CardMediaTheme,
    CardTextProps,
    CardTextTheme,
    CardTitleProps,
    CardTitleTheme
};
