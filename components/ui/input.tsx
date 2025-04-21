import React from 'react';
import styled from 'styled-components';

const StyledInput = styled.input`
  display: flex;
  width: 100%;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background-color: white;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #2d3748;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #4a69bd;
    box-shadow: 0 0 0 3px rgba(74, 105, 189, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #f7fafc;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Additional props can be added here
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <StyledInput
        className={className}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';