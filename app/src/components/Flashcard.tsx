import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { Card } from '../types/card';

interface FlashcardProps {
  card: Card;
  onFlip?: () => void;
}

export function Flashcard({ card, onFlip }: FlashcardProps) {
  const { isDark } = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 1 : 0,
      useNativeDriver: true,
      tension: 10,
      friction: 8,
    }).start();
  }, [isFlipped, flipAnimation]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    onFlip?.();
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <TouchableOpacity
      onPress={handleFlip}
      className={`p-6 rounded-xl mb-4 ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}
      activeOpacity={0.8}
      style={{
        borderWidth: 2,
        borderColor: isFlipped ? '#14b8a6' : 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.2 : 0.1,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      <View className="min-h-[200px] justify-center items-center">
        <Animated.View
          style={{
            position: 'absolute',
            backfaceVisibility: 'hidden',
            transform: [{ rotateY: frontInterpolate }],
          }}
        >
          <View className="items-center">
            <Text className={`text-4xl font-bold mb-4 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
              {card.front}
            </Text>
            {card.pronunciation && (
              <Text className={`text-lg mb-4 ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                {card.pronunciation}
              </Text>
            )}
            <Text className={`mt-4 text-sm ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
              Tap to reveal answer
            </Text>
          </View>
        </Animated.View>
        <Animated.View
          style={{
            position: 'absolute',
            backfaceVisibility: 'hidden',
            transform: [{ rotateY: backInterpolate }],
          }}
        >
          <View className="items-center">
            <Text className={`text-3xl font-semibold mb-4 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
              {card.back}
            </Text>
            {card.example_sentence && (
              <View className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-background-dark' : 'bg-gray-100'}`}>
                <Text className={`text-base text-center ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                  {card.example_sentence}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

