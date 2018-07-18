// Libs
import i18n from "i18next";
import React from "react";

// Components
import { RadioButton, RadioGroup } from "react-toolbox/lib/radio";

// Styles
import "./__style__/boolean-radio.scss";

export interface BooleanRadioProps {
  /** Disabled radio-select, default to: false */
  disabled?: boolean;
  /** Error message to display. */
  error?: string;
  /** Name for input field. */
  name: string;
  /** Call with each value change. */
  onChange: (value: boolean) => void;
  /** Value. */
  value?: boolean;
}

export function BooleanRadio({
  disabled,
  error,
  name,
  onChange,
  value
}: BooleanRadioProps) {
  return (
    <>
      <RadioGroup
        name={name}
        value={value}
        onChange={onChange}
        className="c-boolean-radio"
      >
        <RadioButton
          label={i18n.t("focus.yes")}
          value={true}
          disabled={disabled}
        />
        <RadioButton
          label={i18n.t("focus.no")}
          value={false}
          disabled={disabled}
        />
      </RadioGroup>
      {error ? <div>{error}</div> : null}
    </>
  );
}
