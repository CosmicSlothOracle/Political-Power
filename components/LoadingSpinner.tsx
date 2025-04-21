import React from 'react';
import styled from 'styled-components';

// Using $-prefixed props for styled-components to avoid DOM warnings
interface SpinnerContainerProps {
  $fullScreen?: boolean;
}

const SpinnerContainer = styled.div<SpinnerContainerProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  ${ props => props.$fullScreen && `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 1000;
  `}
`;

const Spinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid #ffffff;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// The component properly transfers the fullScreen prop to $fullScreen
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  size = 'md'
}) => {
  return (
    <SpinnerContainer $fullScreen={fullScreen}>
      <Spinner style={{
        width: size === 'sm' ? '24px' : size === 'lg' ? '56px' : '40px',
        height: size === 'sm' ? '24px' : size === 'lg' ? '56px' : '40px',
      }} />
    </SpinnerContainer>
  );
};

export default LoadingSpinner;