import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { register, clearError } from '../redux/authSlice';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const RegisterContainer = styled.div`
  max-width: 500px;
  margin: 60px auto;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const RegisterTitle = styled.h2`
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

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [formErrors, setFormErrors] = useState({});

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

    const validateForm = () => {
        const errors = {};

        if (!formData.username || formData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }

        if (!formData.password || formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field if it exists
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        // Dispatch register action
        dispatch(register({
            username: formData.username,
            password: formData.password
        }))
            .unwrap()
            .then(() => {
                toast.success('Registration successful');
                navigate('/');
            })
            .catch((err) => {
                // Error is handled by the reducer
                console.error('Registration failed:', err);
            });
    };

    return (
        <RegisterContainer>
            <RegisterTitle>Create New Account</RegisterTitle>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <Form onSubmit={handleSubmit}>
                <FormInput
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
                    error={formErrors.username}
                    required
                />

                <FormInput
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    error={formErrors.password}
                    required
                />

                <FormInput
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    error={formErrors.confirmPassword}
                    required
                />

                <Button
                    type="submit"
                    fullWidth
                    disabled={isLoading}
                >
                    {isLoading ? <LoadingSpinner size="small" showText={false} /> : 'Register'}
                </Button>
            </Form>

            <LinkContainer>
                Already have an account?
                <Link to="/login">Login</Link>
            </LinkContainer>
        </RegisterContainer>
    );
};

export default Register;