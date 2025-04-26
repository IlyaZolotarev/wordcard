import {
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    View,
    BackHandler,
} from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useStores } from "@/stores/storeContext";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import CategoryHeader from "@/components/categoryHeader";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const CategoryScreen = () => {
    const { categoryStore } = useStores();
    const { user } = useAuth();
    const { id } = useLocalSearchParams();
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const [selectionMode, setSelectionMode] = useState(false);

    useEffect(() => {
        if (id) {
            categoryStore.fetchCardsById(user, id as string);
        }
        return () => {
            categoryStore.resetCards();
        };
    }, [user]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            if (selectionMode) {
                setSelectionMode(false);
                setSelectedCards([]);
                return true;
            }
            return false;
        });

        return () => backHandler.remove();
    }, [selectionMode]);

    const loadMore = () => {
        if (!categoryStore.fetchCardsLoading && categoryStore.hasMore) {
            categoryStore.fetchCardsById(user, id as string);
        }
    };

    const handleLongPress = (cardId: string) => {
        if (!selectionMode) {
            setSelectionMode(true);
            setSelectedCards([cardId]);
        }
    };

    const handlePress = (cardId: string) => {
        if (selectionMode) {
            setSelectedCards((prev) => {
                const newSelected = prev.includes(cardId)
                    ? prev.filter((id) => id !== cardId)
                    : [...prev, cardId];

                if (newSelected.length === 0) {
                    setSelectionMode(false);
                }

                return newSelected;
            });
        }
    };

    const isSelected = (cardId: string) => selectedCards.includes(cardId);

    const renderContent = () => {
        if (!categoryStore.fetchCardsLoading && categoryStore.cards.length === 0) {
            return (
                <View style={styles.emptyWrapper}>
                    <MaterialCommunityIcons
                        name={categoryStore.isSearchMode ? "magnify-close" : "folder-open-outline"}
                        size={64}
                        color="#ccc"
                    />
                </View>
            );
        }

        return (
            <FlatList
                data={categoryStore.cards}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.cardListWrapper}
                columnWrapperStyle={styles.row}
                onEndReached={loadMore}
                onEndReachedThreshold={0.4}
                ListFooterComponent={
                    categoryStore.fetchCardsLoading ? (
                        <ActivityIndicator style={{ marginVertical: 20 }} />
                    ) : null
                }
                renderItem={({ item }) => {
                    const selected = isSelected(item.id);
                    return (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => handlePress(item.id)}
                            onLongPress={() => handleLongPress(item.id)}
                            activeOpacity={0.8}
                        >
                            <View style={{ opacity: selectionMode && !selected ? 0.4 : 1 }}>
                                <Image source={{ uri: item.image_url }} style={styles.image} />
                                <Text style={styles.caption}>{item.word}</Text>
                            </View>
                            {selected && (
                                <View style={styles.checkIconWrapper}>
                                    <MaterialCommunityIcons
                                        name="check-circle"
                                        size={24}
                                        color="#4caf50"
                                    />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                }}
                showsVerticalScrollIndicator={false}
            />
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <CategoryHeader />
            </View>
            {renderContent()}
        </View>
    );
};

export default observer(CategoryScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        marginBottom: 24,
    },
    cardListWrapper: {
        paddingBottom: 24,
    },
    row: {
        justifyContent: "space-between",
        marginBottom: 12,
    },
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
    caption: {
        padding: 8,
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
    },
    emptyWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 60,
    },
});
