import {autobind} from "core-decorators";
import i18next from "i18next";
import {values} from "lodash";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {ReactComponent} from "../../config";

import {LineProps, LineWrapper} from "./line";
import {ListBase, ListBaseProps} from "./list-base";

import * as styles from "./__style__/list.css";

/** Props du tableau de base. */
export interface TableProps<T> extends ListBaseProps<T> {
    /** La description des colonnes du tableau avec leur libellés. */
    columns: {[field: string]: string};
    /** Les données. */
    data?: T[];
    /** Le composant de ligne. */
    RowComponent: ReactComponent<LineProps<T>>;
}

/** Tableau standard */
@autobind
@observer
export class Table<T, P> extends ListBase<T, TableProps<T> & P> {

    /** Les données. */
    protected get data() {
        return this.props.data || [];
    }

    /** Affiche le header du tableau. */
    protected renderTableHeader() {
        return (
            <thead>
                <tr>
                    {values(this.props.columns).map(col => (
                        <th key={col}>{i18next.t(col)}</th>
                    ))}
                </tr>
            </thead>
        );
    }

    /** Affiche le corps du tableau. */
    private renderTableBody() {
        const {lineTheme, itemKey, RowComponent} = this.props;
        const Line = LineWrapper as new() => LineWrapper<T>;

        return (
            <tbody>
                {this.displayedData.map((item, idx) => (
                    <Line
                        key={itemKey && item[itemKey] && (item[itemKey] as any).value || itemKey && item[itemKey] || idx}
                        theme={lineTheme}
                        data={item}
                        LineComponent={RowComponent}
                        type="table"
                    />
                ))}
            </tbody>
        );
    }

    render() {
        return (
            <div>
                <table className={this.props.theme!.table}>
                    {this.renderTableHeader()}
                    {this.renderTableBody()}
                </table>
                {this.renderBottomRow()}
            </div>
        );
    }
}

const ThemedTable = themr("list", styles)(Table);
export default ThemedTable;

/**
 * Crée un composant de tableau standard.
 * @param props Les props du tableau.
 */
export function tableFor<T>(props: TableProps<T>) {
    const Table2 = ThemedTable as any;
    return <Table2 {...props} />;
}
