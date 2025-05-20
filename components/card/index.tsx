import { observer } from "mobx-react-lite";
import { useStores } from "@/stores/storeContext";
import { TouchableOpacity, View, StyleSheet, Image } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ICard } from "@/stores/cardStore";
import CountryFlag from "react-native-country-flag";

interface CardProps {
    card: ICard;
}

const Card = ({ card }: CardProps) => {
    const { cardStore } = useStores();
    const selected = cardStore.isSelected(card.id);

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => cardStore.handlePress(card)}
            onLongPress={() => cardStore.handleLongPress(card)}
            activeOpacity={0.8}
        >
            <View style={{ opacity: cardStore.selectionMode && !selected ? 0.4 : 1 }}>
                <Image source={{ uri: card.image_url }} style={styles.image} />
                <View style={styles.infoWrapper}>
                    <View style={[styles.info, styles.firstChildInfo]}>
                        <View style={styles.flagWrapper}>
                            <CountryFlag isoCode={card.word_lang_code} size={16} />
                        </View>
                        <View style={styles.wordWrapper}>
                            <Text style={styles.caption}>{card.word}</Text>
                        </View>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.flagWrapper}>
                            <CountryFlag isoCode={card.trans_word_lang_code} size={16} />
                        </View>
                        <View style={styles.wordWrapper}>
                            <Text style={styles.caption}>{card.trans_word}</Text>
                        </View>
                    </View>
                </View>
            </View>
            {cardStore.selectionMode && (
                <View style={styles.checkIconWrapper}>
                    <MaterialCommunityIcons
                        name={selected ? "check-circle" : "checkbox-blank-circle-outline"}
                        size={16}
                        color={selected ? "#4caf50" : "#ccc"}
                    />
                </View>
            )}
        </TouchableOpacity>
    );
};

export default observer(Card);

const styles = StyleSheet.create({
    card: {
        width: "48%",
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
    image: {
        width: "100%",
        height: 120,
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
    flagWrapper: {
        marginRight: 6,
    },
    wordWrapper: {
        flex: 1,
        justifyContent: "center",
    },
    caption: {
        textAlign: "center",
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
    },
    checkIconWrapper: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 1,
    },
});
