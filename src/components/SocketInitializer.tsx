'use client'

import { FC, ReactNode, useEffect, useState } from 'react'
import socketService from '../services/socketService'
import LoadingSpinner from './LoadingSpinner'
import styled from 'styled-components'

const ConnectionError = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #fff3f3;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  margin: 2rem auto;
  max-width: 500px;
  text-align: center;
`;

const RetryButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: #4a69bd;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;

  &:hover {
    background-color: #3d5aa9;
  }
`;

interface SocketInitializerProps {
    children: ReactNode
    useMock?: boolean
}

export const SocketInitializer: FC<SocketInitializerProps> = ({
    children,
    useMock = false
}) => {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isConnecting, setIsConnecting] = useState<boolean>(true);
    const [connectionFailed, setConnectionFailed] = useState<boolean>(false);
    const [attemptCount, setAttemptCount] = useState<number>(0);

    const connectToSocket = async () => {
        setIsConnecting(true);

        // Force-use the environment variable value first, fall back to prop
        const shouldUseMock = process.env.NEXT_PUBLIC_USE_MOCK_SOCKET === 'true' || useMock;

        console.log('[SocketInitializer] Initializing socket connection, mock mode:', shouldUseMock);

        try {
            const connected = await socketService.connect({
                url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
                useMock: shouldUseMock,
                reconnectAttempts: 3,
                reconnectDelay: 2000,
                timeout: 8000 // Reduced timeout for faster feedback
            });

            if (connected) {
                console.log('[SocketInitializer] Socket connected successfully');
                setIsConnected(true);
                setConnectionFailed(false);
            } else {
                console.error('[SocketInitializer] Failed to connect to socket');
                handleConnectionFailure();
            }
        } catch (err) {
            console.error('[SocketInitializer] Error during socket initialization:', err);
            handleConnectionFailure();
        } finally {
            setIsConnecting(false);
        }
    };

    const handleConnectionFailure = () => {
        setConnectionFailed(true);

        // In development mode, we'll show the error but continue with the app
        if (process.env.NODE_ENV === 'development') {
            console.warn('[SocketInitializer] In development mode - continuing despite connection failure');

            // Enable mock mode automatically after failed connection
            if (attemptCount > 0) {
                console.log('[SocketInitializer] Falling back to mock mode');
                socketService.connect({
                    url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
                    useMock: true
                });
                setIsConnected(true);
            }
        }

        setAttemptCount(prev => prev + 1);
    };

    useEffect(() => {
        let mounted = true;
        let connectionTimeoutId: NodeJS.Timeout | null = null;

        // Setup connection timeout
        connectionTimeoutId = setTimeout(() => {
            if (mounted && !socketService.isConnected() && isConnecting) {
                console.warn('[SocketInitializer] Connection attempt timed out');
                setIsConnecting(false);
                handleConnectionFailure();
            }
        }, 10000); // 10 second timeout

        connectToSocket();

        return () => {
            mounted = false;

            if (connectionTimeoutId) {
                clearTimeout(connectionTimeoutId);
            }

            // Don't disconnect on unmount - socket should persist across navigation
            // But do clean up event listeners
        };
    }, [useMock, attemptCount]); // eslint-disable-line react-hooks/exhaustive-deps

    // Show loading state while connecting on first attempt
    if (isConnecting && attemptCount === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-6">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600">Connecting to game server...</p>
            </div>
        );
    }

    // If connection failed and we're not in development mode, or it's our first attempt
    if (connectionFailed && (process.env.NODE_ENV !== 'development' || attemptCount === 1)) {
        return (
            <ConnectionError>
                <h3>Connection Error</h3>
                <p>Failed to connect to the game server. Please check your connection and try again.</p>
                <p>
                    <small>
                        Make sure both the frontend and backend servers are running.
                        Backend should be on port 3001.
                    </small>
                </p>
                <RetryButton onClick={() => {
                    setIsConnecting(true);
                    setConnectionFailed(false);
                    setAttemptCount(prev => prev + 1);
                }}>
                    Retry Connection
                </RetryButton>
            </ConnectionError>
        );
    }

    // If we're connected or in development mode with fallback
    return <>{children}</>;
};

export default SocketInitializer;