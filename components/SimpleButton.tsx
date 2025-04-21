import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
    children: React.ReactNode;
    color?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
    onClick?: () => void;
    disabled?: boolean;
    fullWidth?: boolean;
    size?: 'small' | 'medium' | 'large';
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    icon?: React.ReactNode;
}

// Using $-prefixed transient props to avoid DOM attribute warnings
const StyledButton = styled.button<{
    $color?: string;
    $fullWidth?: boolean;
    $size?: string;
}>`
  border: none;
  border-radius: 4px;
  cursor: ${ props => (props.disabled ? 'not-allowed' : 'pointer') };
  font-weight: 600;
  opacity: ${ props => (props.disabled ? 0.5 : 1) };
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: ${ props => {
        switch (props.$size) {
            case 'small': return '0.5rem 1rem';
            case 'large': return '1rem 2rem';
            default: return '0.75rem 1.5rem';
        }
    } };
  font-size: ${ props => {
        switch (props.$size) {
            case 'small': return '0.85rem';
            case 'large': return '1.1rem';
            default: return '1rem';
        }
    } };
  width: ${ props => (props.$fullWidth ? '100%' : 'auto') };

  ${ props => {
        switch (props.$color) {
            case 'primary':
                return `
          background-color: #1a73e8;
          color: white;
          &:hover { background-color: #0d62d1; }
        `;
            case 'secondary':
                return `
          background-color: #5f6368;
          color: white;
          &:hover { background-color: #494c50; }
        `;
            case 'warning':
                return `
          background-color: #f9a825;
          color: white;
          &:hover { background-color: #e69c00; }
        `;
            case 'danger':
                return `
          background-color: #d93025;
          color: white;
          &:hover { background-color: #c5221f; }
        `;
            case 'success':
                return `
          background-color: #0f9d58;
          color: white;
          &:hover { background-color: #0c8043; }
        `;
            default:
                return `
          background-color: #1a73e8;
          color: white;
          &:hover { background-color: #0d62d1; }
        `;
        }
    } }
`;

export const SimpleButton: React.FC<ButtonProps> = ({
    children,
    color = 'primary',
    onClick,
    disabled = false,
    fullWidth = false,
    size = 'medium',
    type = 'button',
    className = '',
    icon,
}) => {
    return (
        <StyledButton
            type={type}
            $color={color}
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            $fullWidth={fullWidth}
            $size={size}
            className={className}
        >
            {icon && <span className="button-icon">{icon}</span>}
            {children}
        </StyledButton>
    );
};

// Also add a default export for backwards compatibility
export default SimpleButton;