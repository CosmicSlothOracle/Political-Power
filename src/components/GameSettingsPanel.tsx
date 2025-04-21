import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DEFAULT_GAME_SETTINGS, GameSettings } from '../types/gameTypes';
import { Label } from './ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface GameSettingsPanelProps {
    initialSettings?: Partial<GameSettings>;
    onSettingsChange?: (settings: GameSettings) => void;
    onSave?: (settings: GameSettings) => void;
    readOnly?: boolean;
    className?: string;
}

const StyledCard = styled(Card)`
    width: 100%;
`;

const StyledCardContent = styled(CardContent)`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const Section = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const SettingGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const HelpText = styled.p`
    font-size: 0.875rem;
    color: #718096;
    margin: 0.25rem 0 0 0;
`;

export function GameSettingsPanel({
    initialSettings = {},
    onSettingsChange,
    onSave,
    readOnly = false,
    className,
}: GameSettingsPanelProps) {
    const [settings, setSettings] = useState<GameSettings>({
        ...DEFAULT_GAME_SETTINGS,
        ...initialSettings,
    });

    useEffect(() => {
        onSettingsChange?.(settings);
    }, [settings, onSettingsChange]);

    const updateSetting = <T extends keyof GameSettings>(
        key: T,
        value: GameSettings[T]
    ) => {
        if (readOnly) return;
        setSettings((prev) => {
            const newSettings = { ...prev, [key]: value };
            return newSettings;
        });
    };

    return (
        <StyledCard className={className}>
            <CardHeader>
                <CardTitle>Game Settings</CardTitle>
                <CardDescription>
                    Configure game rules
                </CardDescription>
            </CardHeader>

            <StyledCardContent>
                {/* Game Rules Section */}
                <Section>
                    <SettingGroup>
                        <Label htmlFor="maxPlayers">Maximum Players</Label>
                        <Input
                            id="maxPlayers"
                            type="number"
                            disabled={readOnly}
                            min={3}
                            max={6}
                            value={settings.maxPlayers}
                            onChange={(e) =>
                                updateSetting('maxPlayers', Math.max(3, Math.min(6, parseInt(e.target.value) || 4)))
                            }
                        />
                        <HelpText>
                            How many players can join this game (3-6)
                        </HelpText>
                    </SettingGroup>

                    <SettingGroup>
                        <Label htmlFor="mandateThreshold">Mandates to Win</Label>
                        <Input
                            id="mandateThreshold"
                            type="number"
                            disabled={readOnly}
                            min={1}
                            max={99}
                            value={settings.mandateThreshold}
                            onChange={(e) =>
                                updateSetting('mandateThreshold', Math.max(1, Math.min(99, parseInt(e.target.value) || 12)))
                            }
                        />
                        <HelpText>
                            Number of mandates needed to win (1-99)
                        </HelpText>
                    </SettingGroup>
                </Section>
            </StyledCardContent>

            {onSave && (
                <CardFooter>
                    <Button
                        disabled={readOnly}
                        onClick={() => onSave(settings)}
                    >
                        Save Settings
                    </Button>
                </CardFooter>
            )}
        </StyledCard>
    );
}