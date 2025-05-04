import {
    View,
    StyleSheet,
    Pressable,
    Animated,
    Easing,
} from "react-native";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { triggerShake } from '@/lib/utils';

interface Props {
    onPress?: () => void;
}

const CardTemplate = forwardRef(({ onPress }: Props, ref) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.9)).current;
    const cardShake = useRef(new Animated.Value(0)).current;

    useImperativeHandle(ref, () => ({
        cardTemplateShake: () => triggerShake(cardShake),
    }))

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                friction: 6,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View style={[styles.animated, { opacity, transform: [{ scale }, { translateX: cardShake }] }]}>
            <Pressable style={styles.card} onPress={onPress}>
                <View style={styles.imagePlaceholder}>
                    <MaterialCommunityIcons name="plus" size={32} color="#999" style={styles.plusIcon} />
                </View>
                <View style={styles.infoWrapper}>
                    <View style={[styles.info, styles.firstChildInfo]}>
                        <View style={styles.flagPlaceholder} />
                        <View style={styles.wordPlaceholder} />
                    </View>
                    <View style={styles.info}>
                        <View style={styles.flagPlaceholder} />
                        <View style={styles.wordPlaceholder} />
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    );
})

export default CardTemplate;

const styles = StyleSheet.create({
    animated: {
        width: "48%",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        position: "relative",
    },
    imagePlaceholder: {
        width: "100%",
        height: 120,
        backgroundColor: "#ebebeb",
        justifyContent: "center",
        alignItems: "center",
    },
    plusIcon: {
        zIndex: 1,
    },
    infoWrapper: {
        justifyContent: "center",
        padding: 8,
    },
    info: {
        alignItems: "center",
        flexDirection: "row",
    },
    firstChildInfo: {
        marginBottom: 8,
    },
    flagPlaceholder: {
        width: 16,
        height: 16,
        backgroundColor: "#ebebeb",
        borderRadius: 8,
        marginRight: 6,
    },
    wordPlaceholder: {
        flex: 1,
        height: 16,
        backgroundColor: "#ebebeb",
        borderRadius: 4,
    },
    hintText: {
        marginTop: 8,
        fontSize: 13,
        color: "#ebebeb",
        textAlign: "center",
    },
});
