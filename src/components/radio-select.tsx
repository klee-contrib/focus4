// Libs
import i18n from "i18next";
import React from "react";

// Components
import { RadioButton, RadioGroup } from "react-toolbox/lib/radio";

// Styles
import "./__style__/radio-select.scss";

/** Props for RadioSelect */
export interface RadioSelectProps {
  /** Disabled radio-select, default to: false */
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
  onChange: (value: string | number | undefined) => void;
  /** Value. */
  value?: string | number | undefined;
  /** Name of field for key. */
  valueKey: string;
  /** Values. */
  values: {}[];
  /** If has undefined, default to: false */
  hasUndefined?: boolean;
  /** Undefined label */
  undefinedLabel?: string;
  /** Undefined position, default to: bottom */
  undefinedPosition?: "top" | "bottom";
}

/** RadioSelect component */
export function RadioSelect({
  disabled = false,
  error,
  label,
  labelKey,
  name,
  onChange,
  value,
  valueKey,
  values,
  hasUndefined = false,
  undefinedLabel = "focus.select.none",
  undefinedPosition = "bottom"
}: RadioSelectProps) {
  let definitiveValues = values;
  if (hasUndefined && undefinedPosition === "bottom") {
    definitiveValues = [
      ...values,
      { [valueKey]: undefined, [labelKey]: undefinedLabel }
    ];
  }
  if (hasUndefined && undefinedPosition === "top") {
    definitiveValues = [
      { [valueKey]: undefined, [labelKey]: undefinedLabel },
      ...values
    ];
  }

  return (
    <div className="c-radio-select">
      {label && <h5 className="c-radio-select__title">{i18n.t(label)}</h5>}
      <RadioGroup
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        {definitiveValues.map(option => {
          const optVal = (option as any)[valueKey];
          const optLabel = (option as any)[labelKey];

          return (
            <RadioButton
              key={optVal || "undefined"}
              label={i18n.t(optLabel)}
              value={optVal}
              theme={{ field: "c-radio-select__option" }}
            />
          );
        })}
      </RadioGroup>
      {error ? <div>{error}</div> : null}
    </div>
  );
}
