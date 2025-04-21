import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../components/Button';

const HeroSection = styled.div`
  text-align: center;
  padding: 80px 20px;
  background-color: #2c3e50;
  color: white;
  border-radius: 8px;
  margin-bottom: 40px;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 20px;

  span {
    color: #3498db;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  max-width: 800px;
  margin: 0 auto 40px;
  opacity: 0.9;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const FeaturesSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin: 60px 0;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-10px);
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #2c3e50;
`;

const FeatureDescription = styled.p`
  color: #7f8c8d;
`;

const Home = () => {
    const { isAuthenticated } = useSelector(state => state.auth);

    return (
        <>
            <HeroSection>
                <HeroTitle>
                    Welcome to <span>Political Card Game</span>
                </HeroTitle>
                <HeroSubtitle>
                    A web-based multiplayer card game where strategy, influence, and coalition-building
                    determine who seizes political power.
                </HeroSubtitle>
                <ButtonGroup>
                    {isAuthenticated ? (
                        <>
                            <Button as={Link} to="/games" size="large">
                                Play Now
                            </Button>
                            <Button as={Link} to="/decks" size="large" variant="secondary">
                                Manage Decks
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button as={Link} to="/register" size="large">
                                Sign Up
                            </Button>
                            <Button as={Link} to="/login" size="large" variant="secondary">
                                Login
                            </Button>
                        </>
                    )}
                </ButtonGroup>
            </HeroSection>

            <FeaturesSection>
                <FeatureCard>
                    <FeatureTitle>Strategic Deckbuilding</FeatureTitle>
                    <FeatureDescription>
                        Create custom decks with 30 cards consisting of politicians, events, and special abilities.
                        Each card brings unique advantages to your political strategy.
                    </FeatureDescription>
                </FeatureCard>

                <FeatureCard>
                    <FeatureTitle>Dynamic Gameplay</FeatureTitle>
                    <FeatureDescription>
                        Experience politics as a game with influence points, momentum swings, and temporary
                        coalitions that can shift the balance of power.
                    </FeatureDescription>
                </FeatureCard>

                <FeatureCard>
                    <FeatureTitle>Multiplayer Battles</FeatureTitle>
                    <FeatureDescription>
                        Challenge other players in real-time, 2-player or 4-player matches. Form coalitions to gain
                        advantages over your opponents.
                    </FeatureDescription>
                </FeatureCard>
            </FeaturesSection>
        </>
    );
};

export default Home;