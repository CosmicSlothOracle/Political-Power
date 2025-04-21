import React from 'react';
import styles from './Card.module.css';

export interface CardData {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
}

interface CardProps {
    data: CardData;
    isSelected: boolean;
    onClick: (id: string) => void;
}

export const Card: React.FC<CardProps> = ({ data, isSelected, onClick }) => {
    const handleClick = () => {
        onClick(data.id);
    };

    return (
        <div
            className={`${ styles.card } ${ isSelected ? styles.selected : '' }`}
            onClick={handleClick}
        >
            <div className={styles.imageContainer}>
                <img src={data.imageUrl} alt={data.title} className={styles.image} />
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{data.title}</h3>
                <p className={styles.description}>{data.description}</p>
            </div>
        </div>
    );
};