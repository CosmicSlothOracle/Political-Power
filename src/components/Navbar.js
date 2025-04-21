import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { logout } from '../redux/authSlice';
import Button from './Button';

const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: #2c3e50;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: bold;
  text-decoration: none;
  color: white;

  span {
    color: #3498db;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
`;

const NavLink = styled(Link)`
  margin: 0 15px;
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: #3498db;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
`;

const UserInfo = styled.div`
  margin-right: 15px;
  display: flex;
  align-items: center;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #3498db;
  margin-right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: white;
`;

const Username = styled.span`
  font-weight: 500;
`;

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <NavContainer>
            <Logo to="/">
                Political <span>Cards</span>
            </Logo>

            <NavLinks>
                <NavLink to="/">Home</NavLink>
                {isAuthenticated ? (
                    <>
                        <NavLink to="/decks">My Decks</NavLink>
                        <NavLink to="/games">Games</NavLink>
                        <NavLink to="/cards">Card Library</NavLink>

                        <ProfileSection>
                            <UserInfo>
                                <Avatar>{user?.username?.charAt(0)?.toUpperCase()}</Avatar>
                                <Username>{user?.username}</Username>
                            </UserInfo>
                            <Button
                                variant="danger"
                                size="small"
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        </ProfileSection>
                    </>
                ) : (
                    <>
                        <NavLink to="/login">Login</NavLink>
                        <NavLink to="/register">Register</NavLink>
                    </>
                )}
            </NavLinks>
        </NavContainer>
    );
};

export default Navbar;