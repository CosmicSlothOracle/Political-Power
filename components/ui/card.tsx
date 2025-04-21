import React from 'react';
import styled from 'styled-components';

// Base Card component
const CardWrapper = styled.div`
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

// Card Header
const HeaderWrapper = styled.div`
  padding: 1.25rem 1.25rem 0;
  display: flex;
  flex-direction: column;
`;

// Card Title
const TitleWrapper = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: #2d3748;
`;

// Card Description
const DescriptionWrapper = styled.p`
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
`;

// Card Content
const ContentWrapper = styled.div`
  padding: 1.25rem;
  flex: 1;
`;

// Card Footer
const FooterWrapper = styled.div`
  padding: 1.25rem;
  background-color: #f7fafc;
  border-top: 1px solid #e2e8f0;
`;

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <CardWrapper className={className} {...props}>
      {children}
    </CardWrapper>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <HeaderWrapper className={className} {...props}>
      {children}
    </HeaderWrapper>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <TitleWrapper className={className} {...props}>
      {children}
    </TitleWrapper>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <DescriptionWrapper className={className} {...props}>
      {children}
    </DescriptionWrapper>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <ContentWrapper className={className} {...props}>
      {children}
    </ContentWrapper>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <FooterWrapper className={className} {...props}>
      {children}
    </FooterWrapper>
  );
};