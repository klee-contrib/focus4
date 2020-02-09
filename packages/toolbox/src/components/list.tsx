import * as React from "react";
import {LIST} from "react-toolbox/lib/identifiers";
import {List as ListType, listFactory, ListProps as RTListProps, ListTheme} from "react-toolbox/lib/list/List";
import {
    ListCheckbox as ListCheckboxType,
    listCheckboxFactory,
    ListCheckboxProps as RTListCheckboxProps,
    ListCheckboxTheme
} from "react-toolbox/lib/list/ListCheckbox";
import {
    ListDivider as RTListDivider,
    ListDividerProps as RTListDividerProps,
    ListDividerTheme
} from "react-toolbox/lib/list/ListDivider";
import {
    ListItem as ListItemType,
    listItemFactory,
    ListItemProps as RTListItemProps,
    ListItemTheme
} from "react-toolbox/lib/list/ListItem";
import {
    ListItemAction as RTListItemAction,
    ListItemActionProps as RTListItemActionProps,
    ListItemActionTheme
} from "react-toolbox/lib/list/ListItemAction";
import {
    ListItemActions as ListItemActionsType,
    listItemActionsFactory,
    ListItemActionsProps as RTListItemActionsProps,
    ListItemActionsTheme
} from "react-toolbox/lib/list/ListItemActions";
import {
    ListItemContent as ListItemContentType,
    listItemContentFactory,
    ListItemContentProps as RTListItemContentProps,
    ListItemContentTheme
} from "react-toolbox/lib/list/ListItemContent";
import {
    ListItemLayout as ListItemLayoutType,
    listItemLayoutFactory,
    ListItemLayoutProps as RTListItemLayoutProps,
    ListItemLayoutTheme
} from "react-toolbox/lib/list/ListItemLayout";
import {
    ListItemText as RTListItemText,
    ListItemTextProps as RTListItemTextProps,
    ListItemTextTheme
} from "react-toolbox/lib/list/ListItemText";
import {
    ListSubHeader as RTListSubHeader,
    ListSubHeaderProps as RTListSubHeaderProps,
    ListSubHeaderTheme
} from "react-toolbox/lib/list/ListSubHeader";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import rtListTheme from "react-toolbox/components/list/theme.css";
const listTheme: ListTheme = rtListTheme;
export {listTheme};

import {Avatar} from "./avatar";
import {Checkbox} from "./checkbox";
import {rippleFactory} from "./ripple";

type ListItemActionProps = Omit<RTListItemActionProps, "theme"> & {theme?: CSSProp<ListItemActionTheme>};
export const ListItemAction = React.forwardRef<RTListItemAction, ListItemActionProps>((props, ref) => {
    const theme = useTheme(LIST, listTheme as ListItemActionTheme, props.theme);
    return <RTListItemAction ref={ref} {...props} theme={fromBem(theme)} />;
});

type ListSubHeaderProps = Omit<RTListSubHeaderProps, "theme"> & {theme?: CSSProp<ListSubHeaderTheme>};
export const ListSubHeader = React.forwardRef<RTListSubHeader, ListSubHeaderProps>((props, ref) => {
    const theme = useTheme(LIST, listTheme as ListSubHeaderTheme, props.theme);
    return <RTListSubHeader ref={ref} {...props} theme={fromBem(theme)} />;
});

type ListItemTextProps = Omit<RTListItemTextProps, "theme"> & {theme?: CSSProp<ListItemTextTheme>};
export const ListItemText: React.ForwardRefExoticComponent<
    ListItemTextProps & React.RefAttributes<RTListItemText>
> = React.forwardRef((props, ref) => {
    const theme = useTheme(LIST, listTheme as ListItemTextTheme, props.theme);
    return <RTListItemText ref={ref} {...props} theme={fromBem(theme)} />;
});

type ListDividerProps = Omit<RTListDividerProps, "theme"> & {theme?: CSSProp<ListDividerTheme>};
export const ListDivider = React.forwardRef<RTListDivider, ListDividerProps>((props, ref) => {
    const theme = useTheme(LIST, listTheme as ListDividerTheme, props.theme);
    return <RTListDivider ref={ref} {...props} theme={fromBem(theme)} />;
});

type ListItemContentProps = Omit<RTListItemContentProps, "theme"> & {theme?: CSSProp<ListItemContentTheme>};
const RTListItemContent = listItemContentFactory(ListItemText);
export const ListItemContent = React.forwardRef<ListItemContentType, ListItemContentProps>((props, ref) => {
    const theme = useTheme(LIST, listTheme as ListItemContentTheme, props.theme);
    return <RTListItemContent ref={ref} {...props} theme={fromBem(theme)} />;
});

type ListItemActionsProps = Omit<RTListItemActionsProps, "theme"> & {theme?: CSSProp<ListItemActionsTheme>};
const RTListItemActions = listItemActionsFactory(ListItemAction);
export const ListItemActions = React.forwardRef<ListItemActionsType, ListItemActionsProps>((props, ref) => {
    const theme = useTheme(LIST, listTheme as ListItemActionsTheme, props.theme);
    return <RTListItemActions ref={ref} {...props} theme={fromBem(theme)} />;
});

type ListItemLayoutProps = Omit<RTListItemLayoutProps, "theme"> & {theme?: CSSProp<ListItemLayoutTheme>};
const RTListItemLayout = listItemLayoutFactory(Avatar, ListItemContent, ListItemActions);
export const ListItemLayout = React.forwardRef<ListItemLayoutType, ListItemLayoutProps>((props, ref) => {
    const theme = useTheme(LIST, listTheme as ListItemLayoutTheme, props.theme);
    return <RTListItemLayout ref={ref} {...props} theme={fromBem(theme)} />;
});

type ListCheckboxProps = Omit<RTListCheckboxProps, "theme"> & {theme?: CSSProp<ListCheckboxTheme>};
const RTListCheckbox = listCheckboxFactory(Checkbox as any, ListItemContent);
export const ListCheckbox = React.forwardRef<ListCheckboxType, ListCheckboxProps>((props, ref) => {
    const theme = useTheme(LIST, listTheme as ListCheckboxTheme, props.theme);
    return <RTListCheckbox ref={ref} {...props} theme={fromBem(theme)} />;
});

const RTListItem = listItemFactory(rippleFactory({rippleCentered: false}), ListItemLayout, ListItemContent);
type ListItemProps = RTListItemProps & {
    theme?: CSSProp<
        ListItemTheme & ListItemActionsTheme & ListItemContentTheme & ListItemLayoutTheme & ListItemTextTheme
    >;
};
export const ListItem = React.forwardRef<ListItemType, ListItemProps>((props, ref) => {
    const theme = useTheme(
        LIST,
        listTheme as ListItemTheme &
            ListItemActionsTheme &
            ListItemContentTheme &
            ListItemLayoutTheme &
            ListItemTextTheme,
        props.theme
    );
    return <RTListItem ref={ref} {...props} theme={fromBem(theme)} />;
});

const RTList = listFactory(ListItem);
type ListProps = Omit<RTListProps, "theme"> & {theme?: CSSProp<ListTheme>};
export const List = React.forwardRef<ListType, ListProps>((props, ref) => {
    const theme = useTheme(LIST, listTheme, props.theme);
    return <RTList ref={ref} {...props} theme={fromBem(theme)} />;
});

export {
    ListItemActionProps,
    ListItemActionTheme,
    ListSubHeaderProps,
    ListSubHeaderTheme,
    ListItemTextProps,
    ListItemTextTheme,
    ListDividerProps,
    ListDividerTheme,
    ListItemContentProps,
    ListItemContentTheme,
    ListItemActionsProps,
    ListItemActionsTheme,
    ListItemLayoutProps,
    ListItemLayoutTheme,
    ListCheckboxProps,
    ListCheckboxTheme,
    ListItemProps,
    ListItemTheme,
    ListProps,
    ListTheme
};
