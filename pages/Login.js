import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { login, clearError } from '../redux/authSlice';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const LoginContainer = styled.div`
  max-width: 500px;
  margin: 60px auto;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const LoginTitle = styled.h2`
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  background-color: #fceae9;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const LinkContainer = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 14px;

  a {
    color: #3498db;
    margin-left: 5px;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isAuthenticated, isLoading, error } = useSelector(state => state.auth);

    useEffect(() => {
        // Clear any previous errors
        dispatch(clearError());

        // Redirect if already authenticated
        if (isAuthenticated) {
            navigate('/');
        }
    }, [dispatch, isAuthenticated, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate form
        if (!credentials.username || !credentials.password) {
            toast.error('Please fill in all fields');
            return;
        }

        // Dispatch login action
        dispatch(login(credentials))
            .unwrap()
            .then(() => {
                toast.success('Login successful');
                navigate('/');
            })
            .catch((err) => {
                // Error is handled by the reducer
                console.error('Login failed:', err);
            });
    };

    return (
        <LoginContainer>
            <LoginTitle>Login to Your Account</LoginTitle>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <Form onSubmit={handleSubmit}>
                <FormInput
                    label="Username"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    required
                />

                <FormInput
                    label="Password"
                    name="password"
                    type="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                />

                <Button
                    type="submit"
                    fullWidth
                    disabled={isLoading}
                >
                    {isLoading ? <LoadingSpinner size="small" showText={false} /> : 'Login'}
                </Button>
            </Form>

            <LinkContainer>
                Don't have an account?
                <Link to="/register">Register now</Link>
            </LinkContainer>
        </LoginContainer>
    );
};

export default Login;