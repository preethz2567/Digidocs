import React from 'react';
import './FormLabel.css';

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  isRequired?: boolean;
}

export const FormLabel: React.FC<FormLabelProps> = ({ children, isRequired, className = '', ...props }) => {
  return (
    <label className={`form-label ${isRequired ? 'required' : ''} ${className}`} {...props}>
      {children}
    </label>
  );
};
