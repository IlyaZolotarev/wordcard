import {
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image
} from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useStores } from "@/stores/storeContext";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

const CategoryScreen = () => {
    const { categoryStore } = useStores();
    const { user } = useAuth();
    const { id } = useLocalSearchParams();

    useEffect(() => {
        if (id) {
            categoryStore.fetchCardsById(user, id as string);
        }

        return () => {
            categoryStore.resetCards()
        }
    }, [user]);

    const loadMore = () => {
        if (!categoryStore.fetchImageByLoading && categoryStore.hasMore) {
            categoryStore.fetchCardsById(user, id as string);
        }
    };

    return (
        <FlatList
            data={categoryStore.cards}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.container}
            columnWrapperStyle={styles.row}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
                categoryStore.fetchImageByLoading
                    ? <ActivityIndicator style={{ marginVertical: 20 }} />
                    : null
            }
            renderItem={({ item }) => (
                <TouchableOpacity style={styles.card}>
                    <Image source={{ uri: item.image_url }} style={styles.image} />
                    <Text style={styles.caption}>{item.word}</Text>
                </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
        />
    );
};

export default observer(CategoryScreen);

const styles = StyleSheet.create({
    container: {
        paddingBottom: 40,
    },
    row: {
        justifyContent: "space-between",
        marginBottom: 12,
    },
    card: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    image: {
        width: "100%",
        height: 120,
    },
    caption: {
        padding: 8,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
});
