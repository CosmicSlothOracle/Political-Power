'use client';

import React from 'react';
import styled from 'styled-components';
import { GameLogEntry } from '../types/gameTypes';

interface GameLogProps {
    entries: GameLogEntry[];
    maxHeight?: string;
}

const LogContainer = styled.div<{ maxHeight?: string }>`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  background-color: #f9f9f9;
  max-height: ${ props => props.maxHeight || '300px' };
  overflow-y: auto;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const LogEntry = styled.div<{ type?: string }>`
  padding: 6px 10px;
  border-radius: 6px;
  background-color: ${ props => {
        switch (props.type) {
            case 'info': return '#e6f7ff';
            case 'action': return '#f6ffed';
            case 'system': return '#fff7e6';
            case 'error': return '#fff1f0';
            default: return '#ffffff';
        }
    } };
  border-left: 3px solid ${ props => {
        switch (props.type) {
            case 'info': return '#1890ff';
            case 'action': return '#52c41a';
            case 'system': return '#faad14';
            case 'error': return '#f5222d';
            default: return '#d9d9d9';
        }
    } };
`;

const Timestamp = styled.span`
  font-size: 12px;
  color: #888;
  margin-right: 8px;
`;

const Message = styled.span`
  color: #333;
`;

const EmptyLog = styled.div`
  text-align: center;
  padding: 20px;
  color: #888;
  font-style: italic;
`;

const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${ date.getHours().toString().padStart(2, '0') }:${ date.getMinutes().toString().padStart(2, '0') }:${ date.getSeconds().toString().padStart(2, '0') }`;
};

const GameLog: React.FC<GameLogProps> = ({ entries, maxHeight }) => {
    const logContainerRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new entries are added
    React.useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [entries]);

    if (entries.length === 0) {
        return (
            <LogContainer maxHeight={maxHeight} ref={logContainerRef}>
                <EmptyLog>No game events yet</EmptyLog>
            </LogContainer>
        );
    }

    return (
        <LogContainer maxHeight={maxHeight} ref={logContainerRef}>
            {entries.map((entry, index) => (
                <LogEntry key={index} type={entry.type}>
                    <Timestamp>{formatTimestamp(entry.timestamp)}</Timestamp>
                    <Message>{entry.message}</Message>
                </LogEntry>
            ))}
        </LogContainer>
    );
};

export default GameLog;