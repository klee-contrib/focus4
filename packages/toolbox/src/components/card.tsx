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

import {useTheme} from "@focus4/styling";
import rtCardTheme from "react-toolbox/components/card/theme.css";
const cardTheme: CardTheme = rtCardTheme;
export {cardTheme};

import {Avatar} from "./avatar";

export const Card = React.forwardRef<RTCard, CardProps>((props, ref) => {
    const theme = useTheme(CARD, cardTheme, props.theme);
    return <RTCard ref={ref} {...props} theme={theme} />;
});

export const CardActions = React.forwardRef<RTCardActions, CardActionsProps>((props, ref) => {
    const theme = useTheme(CARD, cardTheme as CardActionsTheme, props.theme);
    return <RTCardActions ref={ref} {...props} theme={theme} />;
});

export const CardMedia = React.forwardRef<RTCardMedia, CardMediaProps>((props, ref) => {
    const theme = useTheme(CARD, cardTheme as CardMediaTheme, props.theme);
    return <RTCardMedia ref={ref} {...props} theme={theme} />;
});

export const CardText = React.forwardRef<RTCardText, CardTextProps>((props, ref) => {
    const theme = useTheme(CARD, cardTheme as CardTextTheme, props.theme);
    return <RTCardText ref={ref} {...props} theme={theme} />;
});

const RTCardTitle = cardTitleFactory(Avatar);
export const CardTitle = React.forwardRef<CardTitleType, CardTitleProps>((props, ref) => {
    const theme = useTheme(CARD, cardTheme as CardTitleTheme, props.theme);
    return <RTCardTitle ref={ref} {...props} theme={theme} />;
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
