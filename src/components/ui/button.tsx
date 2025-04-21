import React from 'react';
import styled from 'styled-components';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  /* Size variations */
  font-size: ${ props => props.size === 'sm' ? '0.875rem' : props.size === 'lg' ? '1.125rem' : '1rem' };
  padding: ${ props => props.size === 'sm' ? '0.375rem 0.75rem' : props.size === 'lg' ? '0.75rem 1.5rem' : '0.5rem 1rem' };

  /* Variant styling */
  ${ props => {
        switch (props.variant) {
            case 'outline':
                return `
          background: transparent;
          border: 1px solid #e2e8f0;
          color: #4a5568;

          &:hover:not(:disabled) {
            background: #f7fafc;
            border-color: #cbd5e0;
          }
        `;
            case 'ghost':
                return `
          background: transparent;
          border: none;
          color: #4a5568;

          &:hover:not(:disabled) {
            background: #f7fafc;
          }
        `;
            default:
                return `
          background: #4a69bd;
          border: 1px solid #4a69bd;
          color: white;

          &:hover:not(:disabled) {
            background: #3c5aa8;
            border-color: #3c5aa8;
          }
        `;
        }
    } }

  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'default',
    size = 'md',
    ...props
}) => {
    return (
        <StyledButton variant={variant} size={size} {...props}>
            {children}
        </StyledButton>
    );
};