import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: string;
}

// Size values in pixels for different spinner sizes
const sizesMap = {
    sm: '16px',
    md: '24px',
    lg: '32px'
};

const SpinnerElement = styled.div<SpinnerProps>`
  width: ${ props => sizesMap[props.size || 'md'] };
  height: ${ props => sizesMap[props.size || 'md'] };
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-left-color: ${ props => props.color || '#3498db' };
  border-radius: 50%;
  animation: ${ spin } 1s linear infinite;
`;

export const Spinner: React.FC<SpinnerProps> = ({
    size = 'md',
    color = '#3498db'
}) => {
    return <SpinnerElement size={size} color={color} />;
};

export default Spinner;