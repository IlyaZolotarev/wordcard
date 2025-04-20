import * as Haptics from "expo-haptics"
import { Animated } from "react-native"

export const triggerShake = (ref: any) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    Animated.sequence([
        Animated.timing(ref, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(ref, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(ref, { toValue: 6, duration: 50, useNativeDriver: true }),
        Animated.timing(ref, { toValue: -6, duration: 50, useNativeDriver: true }),
        Animated.timing(ref, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start()
}