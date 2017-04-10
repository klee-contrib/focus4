import {autobind} from "core-decorators";
import i18n from "i18next";
import {values} from "lodash";
import {observer} from "mobx-react";
import * as React from "react";

import {injectStyle, StyleInjector} from "../../theming";

import {LineWrapper} from "./line";
import {ListBase, ListBaseProps} from "./list-base";

const TABLE_CSS_CLASS = "mdl-data-table mdl-js-data-table mdl-shadow--2dp ";
export const TABLE_CELL_CLASS = "mdl-data-table__cell--non-numeric";

export interface TableProps<T, P extends {data?: T}> extends ListBaseProps<T, P> {
    columns: {[field: string]: string};
    data?: T[];
    RowComponent: ReactComponent<P>;
}

@autobind
@observer
export class TableWithoutStyle<T, P extends {data?: T}, AP> extends ListBase<T, TableProps<T, P> & AP> {

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
        const {lineClassNames, itemKey, RowComponent, lineProps} = this.props;
        const Line = LineWrapper as new() => LineWrapper<T, P>;

        return this.displayedData.map((item, idx) => (
            <Line
                key={itemKey && item[itemKey] && (item[itemKey] as any).value || itemKey && item[itemKey] || idx}
                classNames={lineClassNames}
                data={item}
                LineComponent={RowComponent}
                lineProps={lineProps}
                type="table"
            />
        ));
    }

    render() {
        return (
            <div>
                <table className={TABLE_CSS_CLASS}>
                    {this.renderTableHeader()}
                    {this.renderTableBody()}
                </table>
                {this.renderBottomRow()}
            </div>
        );
    }
}

export const Table: StyleInjector<TableWithoutStyle<{}, {data?: {}}, {}>> = injectStyle("list", TableWithoutStyle) as any;

export function tableFor<T, P extends {data?: T}>(props: TableProps<T, P>) {
    const Table2 = Table as any;
    return <Table2 {...props} />;
}
