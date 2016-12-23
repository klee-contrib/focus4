import {autobind} from "core-decorators";
import * as i18n from "i18next";
import {values} from "lodash";
import {observer} from "mobx-react";
import * as React from "react";

import {injectStyle, StyleInjector} from "../../theming";

import {LineProps} from "./line";
import {ListBase, ListBaseProps} from "./list-base";

const TABLE_CSS_CLASS = "mdl-data-table mdl-js-data-table mdl-shadow--2dp ";
export const TABLE_CELL_CLASS = "mdl-data-table__cell--non-numeric";

export interface TableProps<T, P extends LineProps<T>> extends ListBaseProps<T, P> {
    columns: {[field: string]: string};
    data?: T[];
}

@autobind
@observer
export class TableWithoutStyle<T, P extends LineProps<T>, AP> extends ListBase<T, TableProps<T, P> & AP> {

    protected get data() {
        return this.props.data || [];
    }

    protected renderTableHeader() {
        return (
            <thead>
                <tr>
                    {values(this.props.columns).map(col => (
                        <th className={TABLE_CELL_CLASS} key={col}>{i18n.t(col)}</th>
                    ))}
                </tr>
            </thead>
        );
    }

    private renderTableBody() {
        const {LineComponent, lineProps} = this.props;
        return (
            <tbody>
                {this.displayedData.map((item, idx) => (
                    <LineComponent
                        data={item}
                        key={idx}
                        {...lineProps}
                    />
                ))}
            </tbody>
        );
    }

    render() {
        return (
            <table className={TABLE_CSS_CLASS}>
                {this.renderTableHeader()}
                {this.renderTableBody()}
                {this.renderManualFetch()}
            </table>
        );
    }
}

export const Table: StyleInjector<TableWithoutStyle<{}, LineProps<{}>, {}>> = injectStyle("list", TableWithoutStyle) as any;

export function tableFor<T, P extends LineProps<T>>(props: TableProps<T, P>) {
    const List = Table as any;
    return <List {...props} />;
};
