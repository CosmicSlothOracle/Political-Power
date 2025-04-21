'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import PoliticalCard from './PoliticalCard';
import { Card, CardType, CardRarity } from '../interfaces/Card';
import SimpleButton from './SimpleButton';
import { FaSearch, FaTimes, FaFilter } from 'react-icons/fa';

// Interfaces
interface CardGridProps {
  cards: Card[];
  selectedCards?: Card[];
  onCardClick?: (card: Card) => void;
  maxCards?: number;
  showFilters?: boolean;
  showBudget?: boolean;
  isLoading?: boolean;
  campaignBudget?: number;
  title?: string;
  filterType?: string;
}

// Styled components
const GridContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const GridHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
`;

const GridTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  color: #2c3e50;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  display: flex;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #3498db;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #95a5a6;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #e74c3c;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const FilterLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
`;

const FilterButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  border: 1px solid ${ props => props.active ? '#3498db' : '#ddd' };
  background-color: ${ props => props.active ? '#3498db' : 'white' };
  color: ${ props => props.active ? 'white' : '#2c3e50' };
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${ props => props.active ? '#2980b9' : '#f1f1f1' };
  }
`;

const CardsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const BudgetContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

const BudgetLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
`;

const BudgetValue = styled.div<{ isOverBudget: boolean }>`
  font-size: 16px;
  font-weight: 700;
  color: ${ props => props.isOverBudget ? '#e74c3c' : '#2ecc71' };
`;

const BudgetProgress = styled.div`
  flex: 1;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
`;

const BudgetBar = styled.div<{ percentage: number; isOverBudget: boolean }>`
  height: 100%;
  width: ${ props => Math.min(100, props.percentage) }%;
  background-color: ${ props => props.isOverBudget ? '#e74c3c' : '#2ecc71' };
  transition: width 0.3s ease;
`;

const NoResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: center;
`;

const NoResultsText = styled.p`
  font-size: 18px;
  color: #7f8c8d;
  margin-bottom: 15px;
`;

const ResetFiltersButton = styled(SimpleButton)`
  max-width: 200px;
`;

const LoadingContainer = styled.div`
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
  color: #6c757d;
  text-align: center;

  h3 {
    margin-bottom: 10px;
  }
`;

const CardTypeFilter = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const typeFilters = [
  { id: 'all', label: 'Alle' },
  { id: 'charakterkarte', label: 'Charakterkarten' },
  { id: 'fallenkarte', label: 'Fallenkarten' },
  { id: 'spezialkarte', label: 'Spezialkarten' }
];

const CardGrid: React.FC<CardGridProps> = ({
  cards = [],
  selectedCards = [],
  onCardClick,
  maxCards = Infinity,
  showFilters = true,
  showBudget = true,
  isLoading = false,
  campaignBudget = 5000,
  title = "Available Cards",
  filterType
}) => {
  // Make sure we have valid arrays for cards and selectedCards
  const safeCards = Array.isArray(cards) ? cards : [];
  const safeSelectedCards = Array.isArray(selectedCards) ? selectedCards : [];

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedEras, setSelectedEras] = useState<string[]>([]);
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');

  // Collect all available types, rarities, countries, and eras for filtering
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    safeCards.forEach(card => {
      if (card?.type) {
        // Normalize the type to handle case inconsistencies
        const normalizedType = typeof card.type === 'string'
          ? card.type.toLowerCase()
          : String(card.type);

        // Group similar types
        if (normalizedType === 'politician' || normalizedType === 'ally') {
          types.add('ally');
        } else if (normalizedType === 'event' || normalizedType === 'action') {
          types.add('action');
        } else if (normalizedType === 'special' || normalizedType === 'plot') {
          types.add('plot');
        } else {
          types.add(normalizedType);
        }
      }
    });
    return Array.from(types);
  }, [safeCards]);

  const availableRarities = useMemo(() => {
    const rarities = new Set<string>();
    safeCards.forEach(card => {
      if (card?.rarity) {
        rarities.add(card.rarity.toLowerCase());
      }
    });
    return Array.from(rarities);
  }, [safeCards]);

  const availableCountries = useMemo(() => {
    const countries = new Set<string>();
    safeCards.forEach(card => {
      if (card?.country) {
        countries.add(card.country);
      }
    });
    return Array.from(countries);
  }, [safeCards]);

  const availableEras = useMemo(() => {
    const eras = new Set<string>();
    safeCards.forEach(card => {
      if (card?.era) {
        eras.add(card.era);
      }
    });
    return Array.from(eras);
  }, [safeCards]);

  // Calculate the current campaign value
  const currentCampaignValue = useMemo(() => {
    return safeSelectedCards.reduce((total, card) => {
      return total + (card?.campaignValue || 0);
    }, 0);
  }, [safeSelectedCards]);

  const budgetUsedPercentage = (currentCampaignValue / campaignBudget) * 100;
  const isOverBudget = currentCampaignValue > campaignBudget;
  const isDeckFull = safeSelectedCards.length >= maxCards;

  // Filter the cards based on search term and filters
  const filteredCards = useMemo(() => {
    return safeCards.filter(card => {
      if (!card) return false;

      // Search term filtering
      const cardName = card.name?.toLowerCase() || '';
      const cardDescription = card.description?.toLowerCase() || '';
      const searchTermLower = searchTerm.toLowerCase();

      const matchesSearchTerm = searchTerm === '' ||
        cardName.includes(searchTermLower) ||
        cardDescription.includes(searchTermLower);

      // Type filtering
      let matchesType = true;
      if (selectedTypes.length > 0) {
        const normalizedType = typeof card.type === 'string'
          ? card.type.toLowerCase()
          : String(card.type);

        let groupedType = normalizedType;
        if (normalizedType === 'politician') groupedType = 'ally';
        if (normalizedType === 'event') groupedType = 'action';
        if (normalizedType === 'special') groupedType = 'plot';

        matchesType = selectedTypes.includes(groupedType);
      }

      // Rarity filtering
      const matchesRarity = selectedRarities.length === 0 ||
        (card.rarity && selectedRarities.includes(card.rarity.toLowerCase()));

      // Country filtering
      const matchesCountry = selectedCountries.length === 0 ||
        (card.country && selectedCountries.includes(card.country));

      // Era filtering
      const matchesEra = selectedEras.length === 0 ||
        (card.era && selectedEras.includes(card.era));

      return matchesSearchTerm && matchesType && matchesRarity && matchesCountry && matchesEra;
    });
  }, [safeCards, searchTerm, selectedTypes, selectedRarities, selectedCountries, selectedEras]);

  // Handler functions
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleTypeFilter = (type: string) => {
    if (type === 'all') {
      setSelectedTypes(availableTypes);
    } else {
      setSelectedTypes(prev => [...prev, type]);
    }
    setActiveTypeFilter(type);
  };

  const handleRarityFilter = (rarity: string) => {
    setSelectedRarities(prev =>
      prev.includes(rarity)
        ? prev.filter(r => r !== rarity)
        : [...prev, rarity]
    );
  };

  const handleCountryFilter = (country: string) => {
    setSelectedCountries(prev =>
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const handleEraFilter = (era: string) => {
    setSelectedEras(prev =>
      prev.includes(era)
        ? prev.filter(e => e !== era)
        : [...prev, era]
    );
  };

  const handleCardClick = useCallback((card: Card) => {
    if (onCardClick && card) {
      onCardClick(card);
    }
  }, [onCardClick]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setSelectedRarities([]);
    setSelectedCountries([]);
    setSelectedEras([]);
  };

  const isCardSelected = useCallback((cardId: number | string) => {
    return safeSelectedCards.some(card => card?.id === cardId);
  }, [safeSelectedCards]);

  const isCardDisabled = useCallback((card: Card) => {
    if (!card) return true;

    // Card is disabled if:
    // 1. It's not in deck AND deck is full
    // 2. It's not in deck AND adding it would exceed budget
    const isSelected = isCardSelected(card.id);

    if (isSelected) return false; // Selected cards are never disabled

    if (isDeckFull) return true; // Deck is full

    // Check if adding this card would exceed budget
    if (showBudget) {
      return currentCampaignValue + (card.campaignValue || 0) > campaignBudget;
    }

    return false;
  }, [isCardSelected, isDeckFull, showBudget, currentCampaignValue, campaignBudget]);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle loading state
  if (isLoading) {
    return (
      <LoadingContainer>
        <p>Loading cards...</p>
      </LoadingContainer>
    );
  }

  // Handle empty cards array
  if (!cards || cards.length === 0) {
    return (
      <EmptyContainer>
        <h3>No cards found</h3>
        <p>
          {filterType
            ? `There are no ${ filterType } cards available.`
            : 'There are no cards available.'}
        </p>
      </EmptyContainer>
    );
  }

  return (
    <GridContainer>
      <GridHeader>
        <GridTitle>{title}</GridTitle>
        <SearchContainer>
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search cards..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <ClearButton onClick={clearSearch}>
              <FaTimes />
            </ClearButton>
          )}
        </SearchContainer>
      </GridHeader>

      {showBudget && (
        <BudgetContainer>
          <BudgetLabel>Campaign Budget:</BudgetLabel>
          <BudgetValue isOverBudget={isOverBudget}>
            {formatCurrency(currentCampaignValue)} / {formatCurrency(campaignBudget)}
          </BudgetValue>
          <BudgetProgress>
            <BudgetBar
              percentage={budgetUsedPercentage}
              isOverBudget={isOverBudget}
            />
          </BudgetProgress>
        </BudgetContainer>
      )}

      {showFilters && (
        <FiltersContainer>
          <CardTypeFilter>
            {typeFilters.map(filter => (
              <FilterButton
                key={filter.id}
                active={selectedTypes.includes(filter.id)}
                onClick={() => handleTypeFilter(filter.id)}
              >
                {filter.label}
              </FilterButton>
            ))}
          </CardTypeFilter>

          {availableRarities.length > 0 && (
            <FilterGroup>
              <FilterLabel>Rarity</FilterLabel>
              <FilterButtonsContainer>
                {availableRarities.map(rarity => (
                  <FilterButton
                    key={`rarity-${ rarity }`}
                    active={selectedRarities.includes(rarity)}
                    onClick={() => handleRarityFilter(rarity)}
                  >
                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </FilterButton>
                ))}
              </FilterButtonsContainer>
            </FilterGroup>
          )}

          {availableCountries.length > 0 && (
            <FilterGroup>
              <FilterLabel>Country</FilterLabel>
              <FilterButtonsContainer>
                {availableCountries.map(country => (
                  <FilterButton
                    key={`country-${ country }`}
                    active={selectedCountries.includes(country)}
                    onClick={() => handleCountryFilter(country)}
                  >
                    {country}
                  </FilterButton>
                ))}
              </FilterButtonsContainer>
            </FilterGroup>
          )}

          {availableEras.length > 0 && (
            <FilterGroup>
              <FilterLabel>Era</FilterLabel>
              <FilterButtonsContainer>
                {availableEras.map(era => (
                  <FilterButton
                    key={`era-${ era }`}
                    active={selectedEras.includes(era)}
                    onClick={() => handleEraFilter(era)}
                  >
                    {era}
                  </FilterButton>
                ))}
              </FilterButtonsContainer>
            </FilterGroup>
          )}
        </FiltersContainer>
      )}

      {filteredCards.length > 0 ? (
        <CardsList>
          {filteredCards.map(card => (
            <PoliticalCard
              key={`card-${ card?.id || Math.random().toString(36) }`}
              card={card}
              isInDeck={isCardSelected(card?.id || 0)}
              onClick={() => handleCardClick(card)}
              disabled={isCardDisabled(card)}
            />
          ))}
        </CardsList>
      ) : (
        <NoResultsContainer>
          <NoResultsText>No cards found matching your criteria.</NoResultsText>
          <ResetFiltersButton onClick={resetFilters}>
            Reset Filters
          </ResetFiltersButton>
        </NoResultsContainer>
      )}
    </GridContainer>
  );
};

export default CardGrid;