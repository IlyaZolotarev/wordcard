import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useStores } from "@/stores/storeContext";
import { useRouter } from "expo-router";

const TrainResultScreen = () => {
    const { trainStore } = useStores();
    const stats = trainStore.getStats();
    const router = useRouter();

    const getStyle = (result: string) => {
        if (result === "correct") return styles.correct;
        if (result === "incorrect") return styles.incorrect;
        return styles.hint;
    };

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Stat icon="cards-outline" value={stats.total} color="#555" />
                <Stat icon="check-circle" value={stats.correct} color="#4caf50" />
                <Stat icon="close-circle" value={stats.incorrect} color="#f44336" />
                <Stat icon="eye" value={stats.withHint} color="#2196f3" />
            </View>

            <FlatList
                data={stats.tasks.filter(
                    (item): item is NonNullable<typeof item> => item !== null
                )}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.resultRow}>
                        <Text style={[styles.word, getStyle(item.result)]}>
                            {item.word}
                        </Text>
                        {item.result === "incorrect" && (
                            <View style={styles.iconHint}>
                                <MaterialCommunityIcons
                                    name="arrow-right"
                                    size={18}
                                    color="#888"
                                />
                                <Text style={styles.hintText}>{item.correctWord}</Text>
                            </View>
                        )}
                        {item.result === "hint" && (
                            <MaterialCommunityIcons name="eye" size={18} color="#888" />
                        )}
                    </View>
                )}
                style={{ marginTop: 24 }}
            />

            <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                <MaterialCommunityIcons name="refresh" size={22} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const Stat = ({
    icon,
    value,
    color = "#333",
}: {
    icon: any;
    value: number;
    color?: string;
}) => (
    <View style={styles.statBox}>
        <Text style={styles.statValue}>{value}</Text>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
    </View>
);

export default TrainResultScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 36,
        backgroundColor: "#fff",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    statBox: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    resultRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomColor: "#eee",
        borderBottomWidth: 1,
    },
    word: {
        fontSize: 16,
        flex: 1,
    },
    correct: {
        color: "#4caf50",
    },
    incorrect: {
        color: "#f44336",
    },
    hint: {
        color: "#2196f3",
    },
    iconHint: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    hintText: {
        fontSize: 15,
        color: "#888",
        marginLeft: 4,
    },
    button: {
        marginTop: 24,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#333",
        alignItems: "center",
    },
});
