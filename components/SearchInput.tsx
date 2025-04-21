'use client';

import React from 'react';
import styled from 'styled-components';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 10px 16px 10px 40px;
  font-size: 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }

  &::placeholder {
    color: #bdc3c7;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  pointer-events: none;
  color: #95a5a6;

  svg {
    width: 100%;
    height: 100%;
  }
`;

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder, ...rest }) => {
    return (
        <SearchContainer>
            <SearchIcon>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </SearchIcon>
            <StyledInput
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder || "Search..."}
                {...rest}
            />
        </SearchContainer>
    );
};