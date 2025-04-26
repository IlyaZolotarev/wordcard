import { useRouter, useLocalSearchParams } from "expo-router";
import { IconButton } from "react-native-paper";
import {
    View,
    StyleSheet,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
    Animated
} from "react-native";
import { observer } from "mobx-react-lite";
import { useStores } from "@/stores/storeContext";
import { useRef } from "react";
import { triggerShake } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

let debounceTimer: NodeJS.Timeout;

const Header = () => {
    const { user } = useAuth();
    const { categoryStore } = useStores();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const headerInputShake = useRef(new Animated.Value(0)).current;

    const handleSearch = () => {
        if (!categoryStore.searchText.trim()) {
            triggerShake(headerInputShake);
            return;
        }

        if (id) {
            categoryStore.resetCards();
            categoryStore.searchCardsByWord(user, id as string);
        }
    };

    const onChangeInput = (text: string) => {
        clearTimeout(debounceTimer);
        categoryStore.setSearchText(text.trim());

        if (!text.trim()) {
            categoryStore.resetCards();
            categoryStore.fetchCardsById(user, id as string)
            return
        }

        if (id && text.trim()) {
            debounceTimer = setTimeout(() => {
                handleSearch();
            }, 300);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.inner}>
                <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={() => router.back()}
                    style={styles.arrowIcon}
                />
                <View style={styles.searchContainer}>
                    <Animated.View style={[styles.input, { transform: [{ translateX: headerInputShake }] }]}>
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

export default observer(Header);

const styles = StyleSheet.create({
    inner: {
        flexDirection: "row",
        alignItems: "center",
        height: 44,
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
        color: 'black',
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
