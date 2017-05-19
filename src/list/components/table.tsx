import {autobind} from "core-decorators";
import i18n from "i18next";
import {values} from "lodash";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {LineWrapper} from "./line";
import {ListBase, ListBaseProps} from "./list-base";

import * as styles from "./__style__/list.css";

const TABLE_CSS_CLASS = "mdl-data-table mdl-js-data-table mdl-shadow--2dp ";
export const TABLE_CELL_CLASS = "mdl-data-table__cell--non-numeric";

/** Props du tableau de base. */
export interface TableProps<T, P extends {data?: T}> extends ListBaseProps<T, P> {
    /** La description des colonnes du tableau avec leur libellés. */
    columns: {[field: string]: string};
    /** Les données. */
    data?: T[];
    /** Le composant de ligne. */
    RowComponent: React.ComponentClass<P> | React.SFC<P>;
}

/** Tableau standard, sans CSS, pour l'héritage avec StoreTable. */
@autobind
@observer
export class TableWithoutStyle<T, P extends {data?: T}, AP> extends ListBase<T, TableProps<T, P> & AP> {

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
                        <th className={TABLE_CELL_CLASS} key={col}>{i18n.t(col)}</th>
                    ))}
                </tr>
            </thead>
        );
    }

    /** Affiche le corps du tableau. */
    private renderTableBody() {
        const {lineTheme, itemKey, RowComponent, lineProps} = this.props;
        const Line = LineWrapper as new() => LineWrapper<T, P>;

        return (
            <tbody>
                {this.displayedData.map((item, idx) => (
                    <Line
                        key={itemKey && item[itemKey] && (item[itemKey] as any).value || itemKey && item[itemKey] || idx}
                        theme={lineTheme}
                        data={item}
                        LineComponent={RowComponent}
                        lineProps={lineProps}
                        type="table"
                    />
                ))}
            </tbody>
        );
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

/** Composant de tableau standard. */
export const Table = themr("list", styles)(TableWithoutStyle);

/**
 * Crée un composant de tableau standard.
 * @param props Les props du tableau.
 */
export function tableFor<T, P extends {data?: T}>(props: TableProps<T, P>) {
    const Table2 = Table as any;
    return <Table2 {...props} />;
}
