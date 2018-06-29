// Libs
import React from "react";
import i18n from "i18next";

// Components
import { Checkbox } from "./checkbox";

// Styles
import "./__style__/checkbox-select.scss";

function clickHandlerFactory(
  isSelected: boolean,
  value: string[] | number[] | undefined,
  optVal: string | number,
  onChange: (value: string[] | number[] | undefined) => void
) {
  return (e: React.SyntheticEvent<any>) => {
    e.stopPropagation();
    e.preventDefault();

    if (isSelected) {
      // is selected -> remove it
      onChange(
        value ? (value as any).filter((val: any) => val !== optVal) : undefined
      );
    } else {
      // is not selected -> add it
      onChange((value ? [...value, optVal] : [optVal]) as any);
    }
  };
}

export interface CheckboxSelectProps {
  /** Disabled checkbox-select. */
  disabled?: boolean;
  /** Error message to display. */
  error?: string;
  /** Label to display. */
  label?: string;
  /** Name of field for label. */
  labelKey: string;
  /** Name for input field. */
  name: string;
  /** Call with each value change. */
  onChange: (value: string[] | number[] | undefined) => void;
  /** Value. */
  value?: string[] | number[];
  /** Name of field for key. */
  valueKey: string;
  /** Values. */
  values: {}[];
}

export function CheckboxSelect({
  disabled = false,
  error,
  label,
  labelKey,
  name,
  onChange,
  value,
  valueKey,
  values
}: CheckboxSelectProps) {
  return (
    <div className="c-checkbox-select">
      {label && <h5 className="c-checkbox-select__title">{i18n.t(label)}</h5>}
      <ul>
        {values.map(option => {
          const optVal = (option as any)[valueKey];
          const optLabel = (option as any)[labelKey];

          const isSelected = value
            ? !!(value as any).find((val: any) => optVal === val)
            : false;
          const clickHandler = clickHandlerFactory(
            isSelected,
            value,
            optVal,
            onChange
          );

          return (
            <li
              key={optVal}
              onClick={clickHandler}
              className="c-checkbox-select__option"
            >
              <Checkbox
                name={`${name}-${optVal}`}
                value={isSelected}
                onClick={clickHandler}
                disabled={disabled}
                label={i18n.t(optLabel)}
              />
              {error ? <div>{error}</div> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
