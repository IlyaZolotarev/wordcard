import {
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import EditCategoryModal from "@/components/modals/editCategoryModal";
import { useStores } from "@/stores/storeContext";
import { observer } from "mobx-react-lite";

const CategoryList = () => {
    const { categoryStore } = useStores();
    const { user } = useAuth();
    const router = useRouter();

    const [categoryId, setCategoryId] = useState<string | null>(null);

    useEffect(() => {
        categoryStore.fetchCategories(user);
    }, [user]);

    if (categoryStore.fetchCategoriesLoading)
        return <ActivityIndicator style={{ marginTop: 20 }} />;

    if (
        !categoryStore.fetchCategoriesLoading &&
        categoryStore.categories.length === 0
    ) {
        return (
            <View style={styles.emptyWrapper}>
                <View style={styles.emptyCategoryList}>
                    <MaterialCommunityIcons
                        name="folder-outline"
                        size={48}
                        color="#ccc"
                    />
                </View>
            </View>
        );
    }

    return (
        <>
            <FlatList
                data={categoryStore.categories}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.categoryList}
                columnWrapperStyle={styles.row}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.push(`/categoryScreen/${item.id}`)}
                        style={styles.categoryWrapper}
                    >
                        <View style={styles.category}>
                            <View
                                style={styles.categoryTitleWrapper}

                            >
                                <Text style={styles.title}>{item.name}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    setCategoryId(item.id);
                                }}
                                style={styles.editIconBtn}
                                hitSlop={10}
                            >
                                <MaterialCommunityIcons
                                    name="pencil-outline"
                                    size={20}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity >
                )}
            />
            < EditCategoryModal
                visible={!!categoryId}
                onClose={() => setCategoryId(null)}
                categoryId={categoryId || ""}
            />
        </>
    );
};

export default observer(CategoryList);

const styles = StyleSheet.create({
    categoryList: {
        paddingVertical: 12,
    },
    row: {
        justifyContent: "space-between",
        paddingHorizontal: 8,
        marginBottom: 12,
    },
    categoryWrapper: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 12,
        marginHorizontal: 4,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 2,
    },
    category: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    categoryTitleWrapper: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
    editIconBtn: {
        padding: 4,
    },
    errorText: {
        color: "red",
        textAlign: "center",
    },
    emptyWrapper: {
        alignItems: "center",
        justifyContent: "center",
    },
    emptyCategoryList: {
        width: 140,
        height: 100,
        backgroundColor: "#F4F4F4",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
});
