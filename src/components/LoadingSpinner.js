import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Use $-prefixed prop to avoid DOM warnings
const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: ${ props => props.$fullScreen ? '100vh' : '200px' };
  ${ props => props.$fullScreen && `
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    background-color: rgba(0, 0, 0, 0.7);
  `}
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3498db;
  border-radius: 50%;
  width: ${ props => props.size === 'small' ? '30px' : props.size === 'large' ? '60px' : '40px' };
  height: ${ props => props.size === 'small' ? '30px' : props.size === 'large' ? '60px' : '40px' };
  animation: ${ spin } 1s linear infinite;
`;

const Text = styled.p`
  margin-top: 15px;
  font-size: 16px;
  color: #34495e;
`;

const LoadingSpinner = ({
  text = 'Loading...',
  size = 'medium',
  fullScreen = false,
  showText = true
}) => {
  return (
    <SpinnerContainer $fullScreen={fullScreen}>
      <div style={{ textAlign: 'center' }}>
        <Spinner size={size} />
        {showText && <Text>{text}</Text>}
      </div>
    </SpinnerContainer>
  );
};

export default LoadingSpinner;