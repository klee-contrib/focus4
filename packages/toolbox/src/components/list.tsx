import * as React from "react";
import {LIST} from "react-toolbox/lib/identifiers";
import {List as ListType, listFactory, ListProps, ListTheme} from "react-toolbox/lib/list/List";
import {
    ListCheckbox as ListCheckboxType,
    listCheckboxFactory,
    ListCheckboxProps,
    ListCheckboxTheme
} from "react-toolbox/lib/list/ListCheckbox";
import {ListDivider as RTListDivider, ListDividerProps, ListDividerTheme} from "react-toolbox/lib/list/ListDivider";
import {ListItem as ListItemType, listItemFactory, ListItemProps, ListItemTheme} from "react-toolbox/lib/list/ListItem";
import {
    ListItemAction as RTListItemAction,
    ListItemActionProps,
    ListItemActionTheme
} from "react-toolbox/lib/list/ListItemAction";
import {
    ListItemActions as ListItemActionsType,
    listItemActionsFactory,
    ListItemActionsProps,
    ListItemActionsTheme
} from "react-toolbox/lib/list/ListItemActions";
import {
    ListItemContent as ListItemContentType,
    listItemContentFactory,
    ListItemContentProps,
    ListItemContentTheme
} from "react-toolbox/lib/list/ListItemContent";
import {
    ListItemLayout as ListItemLayoutType,
    listItemLayoutFactory,
    ListItemLayoutProps,
    ListItemLayoutTheme
} from "react-toolbox/lib/list/ListItemLayout";
import {
    ListItemText as RTListItemText,
    ListItemTextProps,
    ListItemTextTheme
} from "react-toolbox/lib/list/ListItemText";
import {
    ListSubHeader as RTListSubHeader,
    ListSubHeaderProps,
    ListSubHeaderTheme
} from "react-toolbox/lib/list/ListSubHeader";

import {useTheme} from "@focus4/styling";
import rtListTheme from "react-toolbox/components/list/theme.css";
const listTheme: ListTheme = rtListTheme;
export {listTheme};

import {Avatar} from "./avatar";
import {Checkbox} from "./checkbox";
import {rippleFactory} from "./ripple";

export const ListItemAction = React.forwardRef<RTListItemAction, ListItemActionProps>((props, ref) => {
    const theme = useTheme(LIST, listTheme as ListItemActionTheme, props.theme);
    return <RTListItemAction ref={ref} {...props} theme={theme} />;
});

export const ListSubHeader = React.forwardRef<RTListSubHeader, ListSubHeaderProps>((props, ref) => {
    const theme = useTheme(LIST, listTheme as ListSubHeaderTheme, props.theme);
    return <RTListSubHeader ref={ref} {...props} theme={theme} />;
});

export const ListItemText: React.ForwardRefExoticComponent<
    ListItemTextProps & React.RefAttributes<RTListItemText>
> = React.forwardRef((props, ref) => {
    const theme = useTheme(LIST, listTheme as ListItemTextTheme, props.theme);
    return <RTListItemText ref={ref} {...props} theme={theme} />;
});

export const ListDivider = React.forwardRef<RTListDivider, ListDividerProps>((props, ref) => {
    const theme = useTheme(LIST, listTheme as ListDividerTheme, props.theme);
    return <RTListDivider ref={ref} {...props} theme={theme} />;
});

const RTListItemContent = listItemContentFactory(ListItemText);
export const ListItemContent = React.forwardRef<ListItemContentType, ListItemContentProps>((props, ref) => {
    const theme = useTheme(LIST, listTheme as ListItemContentTheme, props.theme);
    return <RTListItemContent ref={ref} {...props} theme={theme} />;
});

const RTListItemActions = listItemActionsFactory(ListItemAction);
export const ListItemActions = React.forwardRef<ListItemActionsType, ListItemActionsProps>((props, ref) => {
    const theme = useTheme(LIST, listTheme as ListItemActionsTheme, props.theme);
    return <RTListItemActions ref={ref} {...props} theme={theme} />;
});

const RTListItemLayout = listItemLayoutFactory(Avatar, ListItemContent, ListItemActions);
export const ListItemLayout = React.forwardRef<ListItemLayoutType, ListItemLayoutProps>((props, ref) => {
    const theme = useTheme(LIST, listTheme as ListItemLayoutTheme, props.theme);
    return <RTListItemLayout ref={ref} {...props} theme={theme} />;
});

const RTListCheckbox = listCheckboxFactory(Checkbox, ListItemContent);
export const ListCheckbox = React.forwardRef<ListCheckboxType, ListCheckboxProps>((props, ref) => {
    const theme = useTheme(LIST, listTheme as ListCheckboxTheme, props.theme);
    return <RTListCheckbox ref={ref} {...props} theme={theme} />;
});

const RTListItem = listItemFactory(rippleFactory({rippleCentered: false}), ListItemLayout, ListItemContent);
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
    return <RTListItem ref={ref} {...props} theme={theme} />;
});

const RTList = listFactory(ListItem);
export const List = React.forwardRef<ListType, ListProps>((props, ref) => {
    const theme = useTheme(LIST, listTheme, props.theme);
    return <RTList ref={ref} {...props} theme={theme} />;
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
