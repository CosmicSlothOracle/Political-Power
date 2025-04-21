'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import socketService from '../../services/socketService'
import { enableMockMode, disableMockMode, testSocketAndFallback } from '../../services/mockSocketHelper'
import { SimpleButton } from '../../components/SimpleButton'

const TestContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 1.5rem;
`;

const StatusSection = styled.div`
  margin-bottom: 2rem;
`;

const StatusBox = styled.div<{ $isConnected: boolean }>`
  padding: 1rem;
  background-color: ${ props => props.$isConnected ? '#e6ffed' : '#fff3f3' };
  border: 1px solid ${ props => props.$isConnected ? '#a6e9a6' : '#ffcdd2' };
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const LogSection = styled.div`
  margin-top: 2rem;
`;

const LogBox = styled.pre`
  height: 300px;
  overflow-y: auto;
  background-color: #f6f8fa;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-family: monospace;
  font-size: 0.9rem;
`;

const SocketTestPage: React.FC = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isMockMode, setIsMockMode] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Function to add logs
    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${ timestamp }] ${ message }`, ...prev]);
    };

    // Check connection status
    useEffect(() => {
        const checkConnection = () => {
            const connected = socketService.isConnected();
            setIsConnected(connected);
            setIsMockMode(process.env.NEXT_PUBLIC_USE_MOCK_SOCKET === 'true');
            addLog(`Socket connection status: ${ connected ? 'Connected' : 'Disconnected' }`);
        };

        checkConnection();
        const interval = setInterval(checkConnection, 3000);

        return () => clearInterval(interval);
    }, []);

    // Connect to socket server
    const handleConnect = async () => {
        setIsLoading(true);
        addLog('Attempting to connect to socket server...');

        try {
            const connected = await socketService.connect();
            setIsConnected(connected);
            addLog(`Connection ${ connected ? 'successful' : 'failed' }`);
        } catch (error) {
            addLog(`Connection error: ${ error instanceof Error ? error.message : 'Unknown error' }`);
        } finally {
            setIsLoading(false);
        }
    };

    // Disconnect from socket server
    const handleDisconnect = () => {
        addLog('Disconnecting from socket server...');
        socketService.disconnect();
        setIsConnected(false);
        addLog('Disconnected from socket server');
    };

    // Enable mock mode
    const handleEnableMockMode = () => {
        addLog('Enabling mock mode...');
        enableMockMode(true);
        setIsMockMode(true);
        setIsConnected(true);
        addLog('Mock mode enabled');
    };

    // Disable mock mode
    const handleDisableMockMode = async () => {
        setIsLoading(true);
        addLog('Disabling mock mode...');

        try {
            const connected = await disableMockMode();
            setIsMockMode(false);
            setIsConnected(connected);
            addLog(`Mock mode disabled. Connection ${ connected ? 'successful' : 'failed' }`);
        } catch (error) {
            addLog(`Error disabling mock mode: ${ error instanceof Error ? error.message : 'Unknown error' }`);
        } finally {
            setIsLoading(false);
        }
    };

    // Test with fallback
    const handleTestWithFallback = async () => {
        setIsLoading(true);
        addLog('Testing connection with fallback...');

        try {
            const connected = await testSocketAndFallback();
            setIsConnected(true);
            setIsMockMode(!connected);
            addLog(`Test completed. Using ${ connected ? 'real connection' : 'mock mode' }`);
        } catch (error) {
            addLog(`Test error: ${ error instanceof Error ? error.message : 'Unknown error' }`);
            setIsMockMode(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Send a test event
    const handleSendTestEvent = () => {
        addLog('Sending test event...');
        socketService.emit('test-event', { timestamp: new Date().toISOString() });
        addLog('Test event sent');
    };

    return (
        <TestContainer>
            <Title>Socket Connection Test</Title>

            <StatusSection>
                <h2>Connection Status</h2>
                <StatusBox $isConnected={isConnected}>
                    <strong>Status:</strong> {isConnected ? 'Connected' : 'Disconnected'}
                    <br />
                    <strong>Mode:</strong> {isMockMode ? 'Mock' : 'Real'}
                    <br />
                    <strong>URL:</strong> {process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'}
                </StatusBox>
            </StatusSection>

            <ButtonGroup>
                <SimpleButton
                    onClick={handleConnect}
                    disabled={isConnected || isLoading}
                    color="primary"
                >
                    Connect
                </SimpleButton>
                <SimpleButton
                    onClick={handleDisconnect}
                    disabled={!isConnected || isLoading}
                    color="secondary"
                >
                    Disconnect
                </SimpleButton>
            </ButtonGroup>

            <ButtonGroup>
                <SimpleButton
                    onClick={handleEnableMockMode}
                    disabled={isMockMode || isLoading}
                    color="primary"
                >
                    Enable Mock Mode
                </SimpleButton>
                <SimpleButton
                    onClick={handleDisableMockMode}
                    disabled={!isMockMode || isLoading}
                    color="secondary"
                >
                    Disable Mock Mode
                </SimpleButton>
            </ButtonGroup>

            <ButtonGroup>
                <SimpleButton
                    onClick={handleTestWithFallback}
                    disabled={isLoading}
                    color="primary"
                >
                    Test with Fallback
                </SimpleButton>
                <SimpleButton
                    onClick={handleSendTestEvent}
                    disabled={!isConnected || isLoading}
                    color="secondary"
                >
                    Send Test Event
                </SimpleButton>
            </ButtonGroup>

            <LogSection>
                <h2>Event Log</h2>
                <LogBox>
                    {logs.map((log, index) => (
                        <div key={index}>{log}</div>
                    ))}
                </LogBox>
            </LogSection>
        </TestContainer>
    );
};

export default SocketTestPage;