import React from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #34495e;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }

  ${ props => props.error && `
    border-color: #e74c3c;

    &:focus {
      border-color: #e74c3c;
      box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
    }
  `}
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
  margin-bottom: 0;
`;

const FormInput = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    disabled = false,
    required = false,
    ...rest
}) => {
    return (
        <InputContainer>
            {label && (
                <Label htmlFor={name}>
                    {label} {required && <span style={{ color: '#e74c3c' }}>*</span>}
                </Label>
            )}
            <StyledInput
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                error={error}
                {...rest}
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
        </InputContainer>
    );
};

export default FormInput;