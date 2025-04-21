import React from 'react';
import styled from 'styled-components';

const StyledLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 0.5rem;
  cursor: pointer;
`;

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    // Additional props can be added here
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
    ({ className, ...props }, ref) => {
        return (
            <StyledLabel
                className={className}
                ref={ref}
                {...props}
            />
        );
    }
);

Label.displayName = 'Label';