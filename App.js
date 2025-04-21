import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from './redux/authSlice';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createGlobalStyle } from 'styled-components';
import Dashboard from './pages/Dashboard';

// Components
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Pages (will be created later)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CardLibrary from './pages/CardLibrary';
import DeckBuilder from './pages/DeckBuilder';
import DeckList from './pages/DeckList';
import GameList from './pages/GameList';
import GameLobby from './pages/GameLobby';
import GamePlay from './pages/GamePlay';

// Protected route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useSelector(state => state.auth);

    if (isLoading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children;
};

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Roboto', 'Segoe UI', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #202124;
    background-color: #f8f9fa;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 500;
  }

  a {
    text-decoration: none;
    color: #1a73e8;
  }
`;

const App = () => {
    const dispatch = useDispatch();
    const { token, isLoading } = useSelector(state => state.auth);

    useEffect(() => {
        // Try to load user profile if token exists
        if (token) {
            dispatch(getProfile());
        }
    }, [dispatch, token]);

    if (isLoading && token) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <Router>
                <GlobalStyle />
                <Layout>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected routes */}
                        <Route path="/cards" element={
                            <ProtectedRoute>
                                <CardLibrary />
                            </ProtectedRoute>
                        } />

                        <Route path="/decks" element={
                            <ProtectedRoute>
                                <DeckList />
                            </ProtectedRoute>
                        } />

                        <Route path="/decks/new" element={
                            <ProtectedRoute>
                                <DeckBuilder />
                            </ProtectedRoute>
                        } />

                        <Route path="/decks/:id" element={
                            <ProtectedRoute>
                                <DeckBuilder />
                            </ProtectedRoute>
                        } />

                        <Route path="/games" element={
                            <ProtectedRoute>
                                <GameList />
                            </ProtectedRoute>
                        } />

                        <Route path="/games/new" element={
                            <ProtectedRoute>
                                <GameLobby />
                            </ProtectedRoute>
                        } />

                        <Route path="/games/:id" element={
                            <ProtectedRoute>
                                <GamePlay />
                            </ProtectedRoute>
                        } />

                        {/* 404 catch-all */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Layout>
            </Router>
        </DndProvider>
    );
};

export default App;