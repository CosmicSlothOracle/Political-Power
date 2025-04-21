'use client';

import React, { useState } from 'react';
import { Card } from '../../components/Card';
import { CardData } from '../../types/CardData';
import styles from './page.module.css';

const sampleData: CardData[] = [
    {
        id: "1",
        title: "Mountain Adventure",
        description: "Explore the majestic peaks and valleys of the Swiss Alps.",
        imageUrl: "https://source.unsplash.com/800x600/?mountains"
    },
    {
        id: "2",
        title: "Beach Paradise",
        description: "Relax on pristine white sand beaches with crystal clear waters.",
        imageUrl: "https://source.unsplash.com/800x600/?beach"
    },
    {
        id: "3",
        title: "Urban Discovery",
        description: "Experience the vibrant culture and architecture of modern cities.",
        imageUrl: "https://source.unsplash.com/800x600/?city"
    },
    {
        id: "4",
        title: "Forest Retreat",
        description: "Find peace and tranquility in ancient woodland settings.",
        imageUrl: "https://source.unsplash.com/800x600/?forest"
    }
];

export default function DemoPage() {
    const [selectedCard, setSelectedCard] = useState<string | null>(null);

    const handleCardClick = (id: string) => {
        setSelectedCard(selectedCard === id ? null : id);
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Interactive Card Gallery</h1>
            <div className={styles.grid}>
                {sampleData.map((card) => (
                    <div key={card.id} className={styles.cardWrapper}>
                        <Card
                            data={card}
                            isSelected={selectedCard === card.id}
                            onClick={handleCardClick}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}