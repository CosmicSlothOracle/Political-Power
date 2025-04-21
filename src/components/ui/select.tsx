import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaChevronDown } from 'react-icons/fa';

// Container for the select component
const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

// Trigger button for the select dropdown
const StyledTrigger = styled.button<{ open?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #2d3748;
  cursor: pointer;
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

  svg {
    transition: transform 0.2s;
    transform: rotate(${ props => props.open ? '180deg' : '0deg' });
  }
`;

// Content container for the dropdown
const StyledContent = styled.div<{ open: boolean }>`
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  display: ${ props => props.open ? 'block' : 'none' };
`;

// Value display
const StyledValue = styled.span`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Individual select item
const StyledItem = styled.div<{ active?: boolean }>`
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  color: #2d3748;
  background-color: ${ props => props.active ? '#f7fafc' : 'transparent' };

  &:hover {
    background-color: #f7fafc;
  }
`;

// Select component types
interface SelectProps {
    children: React.ReactNode;
    disabled?: boolean;
    value?: string;
    onValueChange?: (value: string) => void;
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    id?: string;
}

interface SelectValueProps {
    children: React.ReactNode;
    placeholder?: string;
}

interface SelectContentProps {
    children: React.ReactNode;
}

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    value: string;
}

// Context to share state between components
interface SelectContextValue {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    value: string;
    onValueChange: (value: string) => void;
    disabled: boolean;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

// Hook to use the select context
const useSelectContext = () => {
    const context = React.useContext(SelectContext);
    if (!context) {
        throw new Error('Select components must be used within a Select component');
    }
    return context;
};

// Main Select component
export const Select: React.FC<SelectProps> = ({
    children,
    disabled = false,
    value = '',
    onValueChange = () => { }
}) => {
    const [open, setOpen] = useState(false);

    return (
        <SelectContext.Provider value={{ open, setOpen, value, onValueChange, disabled }}>
            <SelectContainer>
                {children}
            </SelectContainer>
        </SelectContext.Provider>
    );
};

// Trigger component to open/close the dropdown
export const SelectTrigger: React.FC<SelectTriggerProps> = ({
    children,
    id,
    ...props
}) => {
    const { open, setOpen, disabled } = useSelectContext();

    return (
        <StyledTrigger
            id={id}
            type="button"
            onClick={() => !disabled && setOpen(!open)}
            disabled={disabled}
            open={open}
            {...props}
        >
            {children}
            <FaChevronDown size={12} />
        </StyledTrigger>
    );
};

// Value display component
export const SelectValue: React.FC<SelectValueProps> = ({
    children,
    placeholder
}) => {
    const { value } = useSelectContext();

    return (
        <StyledValue>
            {value || children || placeholder}
        </StyledValue>
    );
};

// Content container for the dropdown items
export const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
    const { open, setOpen } = useSelectContext();
    const ref = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open, setOpen]);

    return (
        <StyledContent open={open} ref={ref}>
            {children}
        </StyledContent>
    );
};

// Individual select item
export const SelectItem: React.FC<SelectItemProps> = ({
    children,
    value,
    ...props
}) => {
    const { value: selectedValue, onValueChange, setOpen } = useSelectContext();
    const isActive = selectedValue === value;

    const handleSelect = () => {
        onValueChange(value);
        setOpen(false);
    };

    return (
        <StyledItem
            active={isActive}
            onClick={handleSelect}
            {...props}
        >
            {children}
        </StyledItem>
    );
};