import React from 'react';
import styled from 'styled-components';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const SwitchContainer = styled.button<{ checked: boolean; disabled?: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 42px;
  height: 24px;
  border-radius: 12px;
  background-color: ${ props => props.checked ? '#4a69bd' : '#e2e8f0' };
  cursor: ${ props => props.disabled ? 'not-allowed' : 'pointer' };
  border: none;
  padding: 0;
  opacity: ${ props => props.disabled ? 0.5 : 1 };
  transition: background-color 0.2s;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(74, 105, 189, 0.15);
  }
`;

const SwitchThumb = styled.span<{ checked: boolean }>`
  position: absolute;
  top: 3px;
  left: ${ props => props.checked ? 'calc(100% - 21px)' : '3px' };
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: white;
  transition: left 0.2s;
`;

const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ checked = false, onCheckedChange, disabled, id, ...props }, ref) => {
        const handleClick = () => {
            if (!disabled && onCheckedChange) {
                onCheckedChange(!checked);
            }
        };

        const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
            if (!disabled && onCheckedChange && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                onCheckedChange(!checked);
            }
        };

        return (
            <>
                <SwitchContainer
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    disabled={disabled}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                    tabIndex={disabled ? -1 : 0}
                >
                    <SwitchThumb checked={checked} />
                </SwitchContainer>
                <HiddenInput
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={() => { }}
                    disabled={disabled}
                    ref={ref}
                    {...props}
                />
            </>
        );
    }
);

Switch.displayName = 'Switch';