'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import styled from 'styled-components'

const NavContainer = styled(motion.nav)`
  position: fixed;
  width: 100%;
  z-index: 50;
  transition: all 0.3s ease;
  padding: ${ props => props.isScrolled ? '0.75rem 0' : '1.25rem 0' };
  background-color: ${ props => props.isScrolled ? 'rgba(44, 62, 80, 0.9)' : 'transparent' };
  backdrop-filter: ${ props => props.isScrolled ? 'blur(8px)' : 'none' };
`

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;

  span {
    color: #3498db;
  }
`

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;

  @media (max-width: 768px) {
    display: none;
  }
`

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: #3498db;
  }
`

export default function MainNavigation() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <NavContainer
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${ isScrolled ? 'bg-dark/80 backdrop-blur-md py-4' : 'bg-transparent py-6' }`}
      data-scrolled={isScrolled}
    >
      <NavContent>
        <Logo href="/">
          Political <span>Power</span>
        </Logo>

        <NavLinks>
          <NavLink href="/">Home</NavLink>
          <NavLink href="/decks">Decks</NavLink>
          <NavLink href="/cards">Card Library</NavLink>
        </NavLinks>
      </NavContent>
    </NavContainer>
  )
}