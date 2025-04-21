import React from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

const CardContainer = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  position: relative;

  ${ props => props.hoverable && css`
    &:hover {
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
      transform: translateY(-5px);
    }
  `}

  ${ props => props.flat && css`
    box-shadow: none;
    border: 1px solid #e0e0e0;
  `}

  ${ props => props.variant === 'elevated' && css`
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  `}

  ${ props => props.variant === 'outlined' && css`
    box-shadow: none;
    border: 1px solid #dadce0;
  `}

  ${ props => props.fullWidth && css`
    width: 100%;
  `}
`;

const CardHeader = styled.div`
  padding: 16px 20px;
  border-bottom: ${ props => props.divider ? '1px solid #e0e0e0' : 'none' };
  background-color: ${ props => props.background || 'transparent' };
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #202124;
`;

const CardSubtitle = styled.p`
  margin: 4px 0 0;
  font-size: 0.875rem;
  color: #5f6368;
`;

const CardContent = styled.div`
  padding: ${ props => props.padding || '20px' };
`;

const CardActions = styled.div`
  padding: 8px 16px;
  display: flex;
  align-items: center;
  border-top: ${ props => props.divider ? '1px solid #e0e0e0' : 'none' };
  justify-content: ${ props => props.position === 'right' ? 'flex-end' :
    props.position === 'center' ? 'center' :
      props.position === 'space-between' ? 'space-between' : 'flex-start' };
`;

const Card = ({
  children,
  className,
  hoverable = false,
  flat = false,
  variant = 'default',
  fullWidth = false,
  ...rest
}) => {
  return (
    <CardContainer
      className={className}
      hoverable={hoverable}
      flat={flat}
      variant={variant}
      fullWidth={fullWidth}
      {...rest}
    >
      {children}
    </CardContainer>
  );
};

Card.Header = ({ children, divider = false, background, title, subtitle, ...rest }) => {
  return (
    <CardHeader divider={divider} background={background} {...rest}>
      {(title || subtitle) ? (
        <div>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
        </div>
      ) : null}
      {children}
    </CardHeader>
  );
};

Card.Content = ({ children, padding, ...rest }) => {
  return (
    <CardContent padding={padding} {...rest}>
      {children}
    </CardContent>
  );
};

Card.Actions = ({ children, divider = false, position = 'left', ...rest }) => {
  return (
    <CardActions divider={divider} position={position} {...rest}>
      {children}
    </CardActions>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  hoverable: PropTypes.bool,
  flat: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'elevated', 'outlined']),
  fullWidth: PropTypes.bool
};

Card.Header.propTypes = {
  children: PropTypes.node,
  divider: PropTypes.bool,
  background: PropTypes.string,
  title: PropTypes.node,
  subtitle: PropTypes.node
};

Card.Content.propTypes = {
  children: PropTypes.node,
  padding: PropTypes.string
};

Card.Actions.propTypes = {
  children: PropTypes.node,
  divider: PropTypes.bool,
  position: PropTypes.oneOf(['left', 'center', 'right', 'space-between'])
};

export default Card;