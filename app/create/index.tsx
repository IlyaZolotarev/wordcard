import { useState, useRef } from "react";
import {
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Pressable,
    Animated,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import CreateCategoryModal from "@/components/modals/createCategoryModal";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import * as Haptics from "expo-haptics";
import { compressAndUploadImage } from "@/lib/upload";
import * as FileSystem from "expo-file-system";
import { triggerShake } from "@/lib/utils";
import WordInputs from "./components/wordInputs";
import CategorySelector from "./components/categorySelector";
import { useStores } from "@/stores/storeContext";
import { observer } from "mobx-react-lite"

const CreateScreen = () => {
    const { createStore } = useStores();
    const { image } = useLocalSearchParams();
    const { user } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [savingPreloader, setSavingPreloader] = useState(false);
    const imageUri = Array.isArray(image) ? image[0] : image;
    const editModalIconShake = useRef(new Animated.Value(0)).current;
    const wordInputsRef = useRef<{ shakeWord: () => void; shakeTransWord: () => void }>(null)

    const handleSave = async () => {
        if (!imageUri || !user) {
            return;
        }

        if (!createStore.word) {
            wordInputsRef.current?.shakeWord()
            return;
        }

        if (!createStore.transWord) {
            wordInputsRef.current?.shakeTransWord()
            return;
        }

        if (!createStore.selectedCategory) {
            triggerShake(editModalIconShake);
            return;
        }

        setSavingPreloader(true);

        let finalImageUrl = imageUri;

        if (imageUri.startsWith("file://")) {
            try {
                const uploadedUrl = await compressAndUploadImage(imageUri, user.id);
                if (uploadedUrl) {
                    finalImageUrl = uploadedUrl;
                    await FileSystem.deleteAsync(imageUri, { idempotent: true });
                } else {
                    throw new Error("Не удалось загрузить изображение.");
                }
            } catch (err) {
                console.error("Ошибка при загрузке изображения:", err);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setSavingPreloader(false);
                return;
            }
        }

        const { error } = await supabase.from("cards").insert({
            word: createStore.word,
            transWord: createStore.transWord, //TODO: Add to table
            image_url: finalImageUrl,
            category_id: createStore.selectedCategory.id,
            user_id: user.id,
        });

        setSavingPreloader(false);

        if (error) {
            console.error("Ошибка при сохранении карточки:", error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        router.replace("/home");
    };

    const handleCreateCategory = (name: string) => {
        createStore.createCategory(name, user);
    };

    return (
        <Pressable
            style={styles.container}
            onPress={() => dropdownVisible && setDropdownVisible(false)}
        >
            <View style={styles.wordInputsWrapper}>
                <WordInputs hasError={false} ref={wordInputsRef} />
            </View>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <View style={styles.categoriesWrapper}>
                {/* TODO: Add shaking */}
                <CategorySelector />
            </View>
            <View style={styles.saveButtonWrapper}>
                <Animated.View
                    style={{ transform: [{ translateX: editModalIconShake }] }}
                >
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => setModalVisible(true)}
                    >
                        <Ionicons name="add-circle-outline" size={24} color="#333" />
                    </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSave}
                    disabled={savingPreloader}
                >
                    {savingPreloader ? (
                        <ActivityIndicator size={38} color="#fff" />
                    ) : (
                        <MaterialCommunityIcons name="check" size={38} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
            {/* TODO: Add shaking */}
            <CreateCategoryModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleCreateCategory}
                loading={createStore.createCategoriesLoading}
            />
        </Pressable>
    );
}

export default observer(CreateScreen)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    wordInputsWrapper: {
        marginBottom: 16,
    },
    categoriesWrapper: {
        marginBottom: 12,
    },
    image: {
        width: "100%",
        height: 200,
        borderRadius: 16,
        marginBottom: 24,
    },
    addBtn: {
        alignItems: "center",
        marginTop: 8,
    },
    saveButtonWrapper: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    saveBtn: {
        alignSelf: "center",
        marginTop: 24,
        borderRadius: 40,
        backgroundColor: "#74bd94",
        padding: 6,
    },
});
