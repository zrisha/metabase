import React from "react";
import PropTypes from "prop-types";

export const AddRow = ({
  value,
  placeholder,
  onChange,
  children,
}) => (
  <div className="my2 pl1 p1 bordered border-brand rounded relative flex align-center">
    {children}
    <input
      className="input--borderless h3 ml1 flex-full"
      type="text"
      value={value}
      placeholder={placeholder}
      autoFocus
      onChange={onChange}
    />
  </div>
);

AddRow.propTypes = {
  value: PropTypes.string.isRequired,
  isValid: PropTypes.bool.isRequired,
  placeholder: PropTypes.string,
  onKeyDown: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  children: PropTypes.node,
};
