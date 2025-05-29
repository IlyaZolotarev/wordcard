import { useRouter, useLocalSearchParams } from "expo-router";
import { IconButton } from "react-native-paper";
import {
    View,
    StyleSheet,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
    Animated,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { observer } from "mobx-react-lite";
import { useStores } from "@/stores/storeContext";
import { useRef, useState } from "react";
import { triggerShake } from "@/lib/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";

let debounceTimer: NodeJS.Timeout;

const CategoryHeader = () => {
    const { categoryStore, cardStore } = useStores();
    const router = useRouter();
    const { id: categoryId } = useLocalSearchParams();
    const headerInputShake = useRef(new Animated.Value(0)).current;
    const [confirmDelete, setConfirmDelete] = useState(false);
    const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearch = () => {
        if (!categoryStore.searchText.trim()) {
            triggerShake(headerInputShake);
            return;
        }

        if (categoryId) {
            categoryStore.resetCards();
            categoryStore.searchCardsByWord(categoryId as string);
        }
    };

    const onChangeInput = (text: string) => {
        clearTimeout(debounceTimer);
        categoryStore.setSearchText(text.trim());

        if (!text.trim()) {
            categoryStore.resetCards();
            categoryStore.fetchCardsByCategoryId(categoryId as string);
            return;
        }

        if (categoryId && text.trim()) {
            debounceTimer = setTimeout(() => {
                handleSearch();
            }, 300);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            deleteTimeoutRef.current = setTimeout(() => {
                setConfirmDelete(false);
            }, 2000);
            return;
        }
        cardStore.deleteSelectedCards(categoryId as string);
    };

    if (cardStore.selectedCards.length) {
        return (
            <View style={styles.inner}>
                {cardStore.deleteCardsLoading ? (
                    <ActivityIndicator />
                ) : (
                    <TouchableOpacity
                        onPress={handleDelete}
                        disabled={cardStore.deleteCardsLoading}
                    >
                        <MaterialCommunityIcons
                            name={confirmDelete ? "alert-outline" : "trash-can-outline"}
                            color={confirmDelete ? "orange" : "red"}
                            size={28}
                        />
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return (
        <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
        >
            <View style={styles.inner}>
                <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={() => router.back()}
                    style={styles.arrowIcon}
                />
                <View style={styles.searchContainer}>
                    <Animated.View
                        style={[
                            styles.input,
                            { transform: [{ translateX: headerInputShake }] },
                        ]}
                    >
                        <TextInput
                            value={categoryStore.searchText}
                            onChangeText={onChangeInput}
                            placeholder="A...?"
                            placeholderTextColor="#aaa"
                            onSubmitEditing={handleSearch}
                        />
                    </Animated.View>
                    <IconButton
                        icon="magnify"
                        size={22}
                        onPress={handleSearch}
                        style={styles.searchIcon}
                    />
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

export default observer(CategoryHeader);

const styles = StyleSheet.create({
    inner: {
        flexDirection: 'row',
        height: 44,
        justifyContent: "center",
        alignItems: 'center'
    },
    searchContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    input: {
        borderBottomWidth: 1,
        borderColor: "#ddd",
        flex: 1,
        color: "black",
    },
    searchIcon: {
        margin: 0,
        marginLeft: 4,
    },
    arrowIcon: {
        margin: 0,
        marginRight: 4,
    },
});
