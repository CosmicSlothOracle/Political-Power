import React from 'react';
import styled from 'styled-components';
import Navbar from './Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 120px); /* Viewport height minus navbar and footer */
`;

const Footer = styled.footer`
  text-align: center;
  padding: 20px;
  background-color: #2c3e50;
  color: white;
`;

const Layout = ({ children }) => {
    return (
        <>
            <Navbar />
            <Main>{children}</Main>
            <Footer>
                &copy; {new Date().getFullYear()} Political Card Game - All rights reserved
            </Footer>
            <ToastContainer position="bottom-right" />
        </>
    );
};

export default Layout;