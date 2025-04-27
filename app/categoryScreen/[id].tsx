import {
    FlatList,
    StyleSheet,
    View,
    BackHandler,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useStores } from "@/stores/storeContext";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CategoryHeader from "@/components/categoryHeader";
import Card from "@/components/card";

const CategoryScreen = () => {
    const { categoryStore, cardStore } = useStores();
    const { user } = useAuth();
    const { id } = useLocalSearchParams();

    useEffect(() => {
        if (id) {
            categoryStore.fetchCardsByCategoryId(user, id as string);
        }
        return () => {
            categoryStore.resetCards();
            cardStore.resetSelection();
        };
    }, [user]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            if (cardStore.selectionMode) {
                cardStore.resetSelection();
                return true;
            }
            return false;
        });

        return () => backHandler.remove();
    }, [cardStore.selectionMode]);

    const loadMore = () => {
        if (!categoryStore.fetchCardsLoading && categoryStore.hasMore) {
            categoryStore.fetchCardsByCategoryId(user, id as string);
        }
    };

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
                renderItem={({ item }) => <Card card={item} />}
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
    emptyWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 60,
    },
});
