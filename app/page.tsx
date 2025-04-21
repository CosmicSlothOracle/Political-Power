'use client'

import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { SimpleButton } from '../components/SimpleButton'
import MainNavigation from '../components/MainNavigation'

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;

  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`

const ContentBox = styled(motion.div)`
  max-width: 800px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 20px;
  color: #1a2a6c;
`

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: #555;
  line-height: 1.6;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 20px;

  @media (max-width: 500px) {
    flex-direction: column;
  }
`

const ComingSoonWrapper = styled.div`
  position: relative;
  display: inline-block;

  &:hover::after {
    content: "Coming Soon!";
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 12px;
    white-space: nowrap;
  }
`

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin: 40px 0;
`

const FeatureCard = styled(motion.div)`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: left;
`

const FeatureIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 15px;
  color: #1a2a6c;
`

const DeveloperLink = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  a {
    color: white;
    text-decoration: none;
    font-size: 14px;
    background: rgba(0, 0, 0, 0.3);
    padding: 5px 10px;
    border-radius: 4px;
  }
`;

const AudioControl = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 8px 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 30px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  svg {
    margin-right: 8px;
  }
`;

export default function Home(): JSX.Element {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Initialize audio when component mounts
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // Set to 30% volume
      audioRef.current.loop = true;

      // Manual play on first user interaction
      const handleUserInteraction = () => {
        if (audioRef.current) {
          audioRef.current.play().catch(error => {
            console.log("Playback failed:", error);
          });
          // Remove listeners after successful play
          document.removeEventListener('click', handleUserInteraction);
          document.removeEventListener('keydown', handleUserInteraction);
        }
      };

      // Add listeners for user interaction
      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('keydown', handleUserInteraction);

      return () => {
        // Clean up listeners if component unmounts
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
      };
    }
  }, []);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play();
        setIsMuted(false);
      } else {
        audioRef.current.pause();
        setIsMuted(true);
      }
    }
  };

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <MainNavigation />
      <HomeContainer>
        {/* Background Music */}
        <audio ref={audioRef} src="/assets/background-music.wav" />

        {/* Audio Control Button */}
        <AudioControl onClick={toggleAudio}>
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zm7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z" />
              <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z" />
              <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z" />
            </svg>
          )}
          {isMuted ? 'Unmute' : 'Mute'} Music
        </AudioControl>

        <ContentBox
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          id="main-content"
        >
          <Title>Political Power</Title>
          <Subtitle>
            A strategic multiplayer card game where you build coalitions, deploy tactics,
            and outsmart your opponents to gain political influence and mandates.
          </Subtitle>

          <FeatureGrid>
            <FeatureCard whileHover={{ y: -5 }}>
              <FeatureIcon aria-hidden="true">🏛️</FeatureIcon>
              <h3>Strategic Gameplay</h3>
              <p>Build coalitions, play political cards, and outmaneuver your opponents.</p>
            </FeatureCard>
            <FeatureCard whileHover={{ y: -5 }}>
              <FeatureIcon aria-hidden="true">🃏</FeatureIcon>
              <h3>Custom Decks</h3>
              <p>Create and customize your decks with politicians, events, and special cards.</p>
            </FeatureCard>
            <FeatureCard whileHover={{ y: -5 }}>
              <FeatureIcon aria-hidden="true">👥</FeatureIcon>
              <h3>Multiplayer</h3>
              <p>Challenge friends or random opponents in real-time political battles.</p>
            </FeatureCard>
          </FeatureGrid>

          <ButtonGroup>
            <Link href="/games" passHref legacyBehavior>
              <SimpleButton color="primary">Play Now</SimpleButton>
            </Link>
            <Link href="/decks" passHref legacyBehavior>
              <SimpleButton color="secondary">Build Decks</SimpleButton>
            </Link>
            <SimpleButton color="warning">Play Against AI</SimpleButton>
          </ButtonGroup>
        </ContentBox>

        {isDevelopment && (
          <DeveloperLink>
            <Link href="/test">
              Test Environment
            </Link>
          </DeveloperLink>
        )}
      </HomeContainer>
    </>
  )
}