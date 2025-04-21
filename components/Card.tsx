import React from 'react';
import styles from './Card.module.css';
import { Card as CardType } from '../data/sampleCards';

interface CardProps {
    card: CardType;
    onClick?: (card: CardType) => void;
    selected?: boolean;
}

export const Card: React.FC<CardProps> = ({ card, onClick, selected }) => {
    const handleClick = () => {
        if (onClick) {
            onClick(card);
        }
    };

    return (
        <div
            className={`${ styles.card } ${ styles[card.type] } ${ selected ? styles.selected : '' }`}
            onClick={handleClick}
        >
            <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{card.name}</h3>
                <span className={styles.influence}>
                    {card.influence > 0 ? '+' : ''}{card.influence}
                </span>
            </div>

            <div className={styles.cardBody}>
                {card.country && (
                    <div className={styles.country}>{card.country}</div>
                )}
                <p className={styles.effect}>{card.effect}</p>
                <p className={styles.description}>{card.description}</p>
            </div>

            <div className={styles.cardFooter}>
                <div className={styles.campaignValue}>
                    {card.campaignValue.toLocaleString('de-DE')}€
                </div>
                <div className={styles.tags}>
                    {card.tags.map((tag, index) => (
                        <span key={index} className={styles.tag}>{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Card;