'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'
import { SimpleButton } from '../../components/SimpleButton'
import { validateTestUser } from '../../util/testHelpers'
import { useGameController } from '../../hooks/useGameController'
import GameDebugPanel from '../../components/GameDebugPanel'

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f5f5f5;
  min-height: 100vh;
`

const Header = styled.header`
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ddd;
`

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
`

const SubTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #34495e;
`

const StatusBox = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const StatusItem = styled.div`
  margin-bottom: 0.75rem;
  display: flex;

  &:last-child {
    margin-bottom: 0;
  }
`

const StatusLabel = styled.span`
  font-weight: 600;
  min-width: 150px;
  color: #7f8c8d;
`

const StatusValue = styled.span<{ success?: boolean; warning?: boolean }>`
  color: ${ props => props.success ? '#27ae60' : props.warning ? '#f39c12' : '#2c3e50' };
  font-weight: ${ props => (props.success || props.warning) ? '600' : 'normal' };
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`

const ActionButton = styled(SimpleButton)`
  min-width: 150px;
`

const TestingSteps = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const StepList = styled.ol`
  padding-left: 1.5rem;
  margin-top: 1rem;
`

const Step = styled.li`
  margin-bottom: 0.75rem;
  line-height: 1.5;
`

export default function TestPage() {
    const router = useRouter()
    const [testUserId, setTestUserId] = useState<string>('')
    const [mockMode, setMockMode] = useState<boolean>(false)
    const [lastGameId, setLastGameId] = useState<string | null>(null)

    // Get userId for testing
    useEffect(() => {
        const id = validateTestUser()
        setTestUserId(id)

        // Check if mock mode is enabled
        if (typeof window !== 'undefined') {
            const useMock = localStorage.getItem('useMockSocket') === 'true'
            setMockMode(useMock)

            // Check for last created game ID
            const storedGameId = localStorage.getItem('testGameId')
            if (storedGameId) {
                setLastGameId(storedGameId)
            }
        }
    }, [])

    // Game controller for test operations
    const {
        gameState,
        gamePhase,
        gameStatus,
        createGame,
        processCurrentPhase,
        isLoading,
        error
    } = useGameController(testUserId)

    // Create a new test game
    const handleCreateTestGame = async () => {
        try {
            if (!testUserId) {
                alert('No test user ID found. Please refresh the page.')
                return
            }

            // Create a test game and navigate to it
            const controller = useGameController(testUserId)
            const newGame = await controller.createTestGame(testUserId, `Tester ${ Date.now() }`)

            if (newGame && newGame.gameId) {
                router.push(`/game/${ newGame.gameId }`)
            } else {
                alert('Failed to create test game')
            }
        } catch (err) {
            console.error('Failed to create test game:', err)
            alert('Error creating test game')
        }
    }

    // Go to the last created game
    const handleGoToLastGame = () => {
        if (lastGameId) {
            router.push(`/game/${ lastGameId }`)
        } else {
            alert('No recent game found. Create a new test game first.')
        }
    }

    // Reset test user
    const handleResetTestUser = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('testUserId')
            localStorage.removeItem('testGameId')
            window.location.reload()
        }
    }

    return (
        <Container>
            <Header>
                <Title>Test Environment</Title>
                <SubTitle>Game Loop Implementation Testing</SubTitle>
            </Header>

            <StatusBox>
                <h3>Environment Status</h3>
                <StatusItem>
                    <StatusLabel>Status:</StatusLabel>
                    <StatusValue success>Ready</StatusValue>
                </StatusItem>

                <StatusItem>
                    <StatusLabel>Test User ID:</StatusLabel>
                    <StatusValue>{testUserId}</StatusValue>
                </StatusItem>

                <StatusItem>
                    <StatusLabel>Status:</StatusLabel>
                    <StatusValue success={!!testUserId} warning={!testUserId}>
                        {testUserId ? '✅ Valid' : '❌ Not Found'}
                    </StatusValue>
                </StatusItem>

                <StatusItem>
                    <StatusLabel>Mock Mode:</StatusLabel>
                    <StatusValue>{mockMode ? 'Enabled' : 'Disabled'}</StatusValue>
                </StatusItem>

                <StatusItem>
                    <StatusLabel>Status:</StatusLabel>
                    <StatusValue success={mockMode} warning={!mockMode}>
                        {mockMode ? '✅ Configured' : '⚠️ Socket Connection Required'}
                    </StatusValue>
                </StatusItem>

                <StatusItem>
                    <StatusLabel>localStorage:</StatusLabel>
                    <StatusValue success>Available</StatusValue>
                </StatusItem>

                <StatusItem>
                    <StatusLabel>Status:</StatusLabel>
                    <StatusValue success>✅ Working</StatusValue>
                </StatusItem>

                <StatusItem>
                    <StatusLabel>Last Game ID:</StatusLabel>
                    <StatusValue>{lastGameId || 'None'}</StatusValue>
                </StatusItem>

                <StatusItem>
                    <StatusLabel>Status:</StatusLabel>
                    <StatusValue success={!!lastGameId} warning={!lastGameId}>
                        {lastGameId ? '✅ Available' : '⚠️ No Recent Game'}
                    </StatusValue>
                </StatusItem>
            </StatusBox>

            <h3>Actions</h3>
            <ButtonGroup>
                <ActionButton color="primary" onClick={handleCreateTestGame}>
                    Create New Test Game
                </ActionButton>

                <ActionButton
                    color="secondary"
                    onClick={handleGoToLastGame}
                    disabled={!lastGameId}
                >
                    Go to Last Game
                </ActionButton>

                <ActionButton color="danger" onClick={handleResetTestUser}>
                    Reset Test User
                </ActionButton>
            </ButtonGroup>

            <SimpleButton color="secondary" onClick={() => router.push('/')}>
                Return to Home
            </SimpleButton>

            <TestingSteps>
                <h3>Testing Steps</h3>
                <StepList>
                    <Step>Click "Create New Test Game" to go to the game creation form</Step>
                    <Step>Fill in the form with a name and configure game settings</Step>
                    <Step>Submit the form to create a new game</Step>
                    <Step>Verify that you're redirected to the game page</Step>
                    <Step>Check that the game state shows up in the debug panel</Step>
                    <Step>Return here and click "Go to Last Game" to verify persistence</Step>
                </StepList>
                <p>All actions will be performed with your test user ID: {testUserId}</p>
            </TestingSteps>

            {gameState && (
                <GameDebugPanel
                    gameState={gameState}
                    gamePhase={gamePhase}
                    gameStatus={gameStatus}
                />
            )}
        </Container>
    )
}