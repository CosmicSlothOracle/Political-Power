import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

interface SliderProps {
    min: number;
    max: number;
    step?: number;
    value: number[];
    onValueChange?: (value: number[]) => void;
    disabled?: boolean;
    id?: string;
}

const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 20px;
  touch-action: none;
`;

const SliderTrack = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 4px;
  background-color: #e2e8f0;
  border-radius: 2px;
`;

const SliderRange = styled.div<{ left: number; width: number; disabled?: boolean }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 4px;
  background-color: ${ props => props.disabled ? '#a0aec0' : '#4a69bd' };
  border-radius: 2px;
  left: ${ props => props.left }%;
  width: ${ props => props.width }%;
`;

const SliderThumb = styled.div<{ left: number; disabled?: boolean }>`
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background-color: white;
  border: 2px solid ${ props => props.disabled ? '#a0aec0' : '#4a69bd' };
  border-radius: 50%;
  cursor: ${ props => props.disabled ? 'not-allowed' : 'pointer' };
  left: ${ props => props.left }%;
  transition: box-shadow 0.2s;

  &:focus, &:hover {
    outline: none;
    box-shadow: 0 0 0 3px rgba(74, 105, 189, 0.15);
  }
`;

export const Slider: React.FC<SliderProps> = ({
    min,
    max,
    step = 1,
    value = [0],
    onValueChange,
    disabled = false,
    id,
}) => {
    const [dragging, setDragging] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);

    // Convert value to percentage
    const valueToPercent = (val: number) => {
        return ((val - min) / (max - min)) * 100;
    };

    // Convert percentage to value
    const percentToValue = (percent: number) => {
        const rawValue = min + ((max - min) * percent) / 100;
        const steppedValue = Math.round(rawValue / step) * step;
        return Math.min(max, Math.max(min, steppedValue));
    };

    // Calculate thumb position
    const thumbLeft = valueToPercent(value[0]);

    // Handle click on track
    const handleTrackClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (disabled || !trackRef.current) return;

        const rect = trackRef.current.getBoundingClientRect();
        const percent = ((event.clientX - rect.left) / rect.width) * 100;
        const newValue = percentToValue(percent);

        if (onValueChange) {
            onValueChange([newValue]);
        }
    };

    // Handle mouse/touch events for dragging
    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;
        setDragging(true);
    };

    useEffect(() => {
        if (!dragging) return;

        const handleMouseMove = (event: MouseEvent) => {
            if (!trackRef.current) return;

            const rect = trackRef.current.getBoundingClientRect();
            const percent = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
            const newValue = percentToValue(percent);

            if (onValueChange) {
                onValueChange([newValue]);
            }
        };

        const handleMouseUp = () => {
            setDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, min, max, step, onValueChange]);

    return (
        <SliderContainer id={id}>
            <SliderTrack ref={trackRef} onClick={handleTrackClick} />
            <SliderRange left={0} width={thumbLeft} disabled={disabled} />
            <SliderThumb
                left={thumbLeft}
                disabled={disabled}
                onMouseDown={handleMouseDown}
                tabIndex={disabled ? -1 : 0}
            />
        </SliderContainer>
    );
};