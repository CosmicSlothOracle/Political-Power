import React from 'react';
import styled, { css } from 'styled-components';

const ButtonStyles = styled.button`
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  ${ props => props.small ? css`
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  ` : css`
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  `}

  ${ props => {
    switch (props.variant) {
      case 'primary':
        return css`
          background-color: #1a73e8;
          color: white;
          &:hover {
            background-color: #0d62d1;
          }
          &:active {
            background-color: #0b57bd;
          }
        `;
      case 'secondary':
        return css`
          background-color: #f1f3f4;
          color: #1a73e8;
          &:hover {
            background-color: #e8eaed;
          }
          &:active {
            background-color: #dadce0;
          }
        `;
      case 'danger':
        return css`
          background-color: #d93025;
          color: white;
          &:hover {
            background-color: #c5221f;
          }
          &:active {
            background-color: #a50e0e;
          }
        `;
      case 'success':
        return css`
          background-color: #0f9d58;
          color: white;
          &:hover {
            background-color: #0c8043;
          }
          &:active {
            background-color: #0a7b3e;
          }
        `;
      case 'outline':
        return css`
          background-color: transparent;
          color: #1a73e8;
          border: 1px solid #1a73e8;
          &:hover {
            background-color: rgba(26, 115, 232, 0.04);
          }
          &:active {
            background-color: rgba(26, 115, 232, 0.08);
          }
        `;
      default:
        return css`
          background-color: #1a73e8;
          color: white;
          &:hover {
            background-color: #0d62d1;
          }
          &:active {
            background-color: #0b57bd;
          }
        `;
    }
  } }

  ${ props => props.fullWidth && css`
    width: 100%;
  `}

  ${ props => props.disabled && css`
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      background-color: ${ props.variant === 'primary' ? '#1a73e8' :
      props.variant === 'secondary' ? '#f1f3f4' :
        props.variant === 'danger' ? '#d93025' :
          props.variant === 'success' ? '#0f9d58' :
            props.variant === 'outline' ? 'transparent' : '#1a73e8' };
    }
  `}

  svg {
    margin-right: ${ props => props.iconOnly ? '0' : '0.5rem' };
  }
`;

interface ButtonProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  small?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  icon?: React.ReactNode;
  iconOnly?: boolean;
  [x: string]: any;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  small = false,
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  icon = null,
  iconOnly = false,
  ...rest
}) => {
  return (
    <ButtonStyles
      type={type}
      variant={variant}
      small={small}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={className}
      iconOnly={iconOnly}
      {...rest}
    >
      {icon && icon}
      {!iconOnly && children}
    </ButtonStyles>
  );
};

export default Button;