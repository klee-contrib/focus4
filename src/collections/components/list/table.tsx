import i18next from "i18next";
import {values} from "lodash";
import {observer} from "mobx-react";
import * as React from "react";

import {themr} from "../../../theme";

import {LineProps, LineWrapper} from "./line";
import {ListBase, ListBaseProps} from "./list-base";

import * as styles from "./__style__/list.css";
const Theme = themr("list", styles);

/** Props du tableau de base. */
export interface TableProps<T> extends ListBaseProps<T> {
    /** La description des colonnes du tableau avec leur libellés. */
    columns: {[field: string]: string};
    /** Le composant de ligne. */
    RowComponent: React.ComponentType<LineProps<T>>;
}

/** Tableau standard */
@observer
export class Table<T, P extends TableProps<T> = TableProps<T> & {data: T[]}> extends ListBase<T, P> {
    /** Les données. */
    protected get data() {
        return (this.props as any).data || [];
    }

    /** Affiche le header du tableau. */
    protected renderTableHeader() {
        return (
            <thead>
                <tr>{values(this.props.columns).map(col => <th key={col}>{i18next.t(col)}</th>)}</tr>
            </thead>
        );
    }

    /** Affiche le corps du tableau. */
    private renderTableBody() {
        const {lineTheme, itemKey, RowComponent} = this.props;
        const Line = LineWrapper as new () => LineWrapper<T>;

        return (
            <tbody>
                {this.displayedData.map((item, idx) => (
                    <Line
                        key={
                            (itemKey && item[itemKey] && (item[itemKey] as any).value) ||
                            (itemKey && item[itemKey]) ||
                            idx
                        }
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
            <Theme theme={this.props.theme}>
                {theme => (
                    <>
                        <table className={theme.table}>
                            {this.renderTableHeader()}
                            {this.renderTableBody()}
                        </table>
                        {this.renderBottomRow(theme)}
                    </>
                )}
            </Theme>
        );
    }
}

/**
 * Crée un composant de tableau standard.
 * @param props Les props du tableau.
 */
export function tableFor<T>(props: TableProps<T> & {data: T[]}) {
    const Table2 = Table as any;
    return <Table2 {...props} />;
}
