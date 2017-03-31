import {autobind} from "core-decorators";
import {observer} from "mobx-react";
import * as React from "react";

import {injectStyle, StyleInjector} from "../../theming";

import {LineProps} from "./line";
import {ListBase, ListBaseProps} from "./list-base";

import {selection} from "./style/list.css";

export interface ListProps<T, P extends LineProps<T>> extends ListBaseProps<T, P> {
    data?: T[];
}

@autobind
@observer
export class ListWithoutStyle<T, P extends LineProps<T>, AP> extends ListBase<T, ListProps<T, P> & AP> {

    protected get data() {
        return this.props.data || [];
    }

    protected renderLines() {
        const {LineComponent, lineProps} = this.props;
        return this.displayedData.map((item, idx) => (
            <LineComponent
                data={item}
                key={idx}
                {...lineProps}
            />
        ));
    }

    render() {
        const {classNames} = this.props;
        return (
            <div>
                <ul className={`${selection} ${classNames && classNames.selection || ""}`}>
                    {this.renderLines()}
                </ul>
                {this.renderButtons()}
            </div>
        );
    }
}

export const List: StyleInjector<ListWithoutStyle<{}, LineProps<{}>, {}>> = injectStyle("list", ListWithoutStyle) as any;

export function listFor<T, P extends LineProps<T>>(props: ListProps<T, P>) {
    const List2 = List as any;
    return <List2 {...props} />;
};
