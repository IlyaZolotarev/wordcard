import { useState, useRef } from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import { observer } from "mobx-react-lite";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";
import CreateCategoryModal from "@/components/modals/createCategoryModal";
import CameraModal from "@/components/cameraModal";
import CategorySelector from "./components/categorySelector";
import WordInputs from "./components/wordInputs";
import SaveButton from "./components/saveButton";

import { useAuth } from "@/hooks/useAuth";
import { compressAndUploadImage } from "@/lib/upload";
import { useStores } from "@/stores/storeContext";

const CreateScreen = () => {
    const { createStore, categoryStore } = useStores();
    const { image } = useLocalSearchParams();
    const { user } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [savingPreloader, setSavingPreloader] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const imageUri = Array.isArray(image) ? image[0] : image;
    const addCategoryButtonRef = useRef<{ addCategoryButtonShake: () => void }>(
        null
    );
    const wordInputsRef = useRef<{
        shakeWord: () => void;
        shakeTransWord: () => void;
    }>(null);

    const handleSave = async () => {
        if (!imageUri || !user) {
            return;
        }

        if (!createStore.word) {
            wordInputsRef.current?.shakeWord();
            return;
        }

        if (!createStore.transWord) {
            wordInputsRef.current?.shakeTransWord();
            return;
        }

        if (!categoryStore.selectedCategory) {
            addCategoryButtonRef.current?.addCategoryButtonShake();
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
            trans_word: createStore.transWord,
            image_url: finalImageUrl,
            category_id: categoryStore.selectedCategory.id,
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
        categoryStore.createCategory(name, user);
    };


    const handlePhotoTaken = (uri: string) => {
        router.push({
            pathname: "/create",
            params: { image: uri },
        });
    };

    return (
        <Pressable
            style={styles.container}
            onPress={() => dropdownVisible && setDropdownVisible(false)}
        >
            <View style={styles.wordInputsWrapper}>
                <WordInputs ref={wordInputsRef} />
            </View>
            <Pressable onPress={() => setIsModalVisible(true)}>
                <Image source={{ uri: imageUri }} style={styles.image} />
            </Pressable>
            <View style={styles.categoriesWrapper}>
                <CategorySelector />
            </View>
            <SaveButton
                ref={addCategoryButtonRef}
                setModalVisible={setModalVisible}
                onSave={handleSave}
                loading={savingPreloader}
            />
            <CreateCategoryModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleCreateCategory}
                loading={categoryStore.createCategoriesLoading}
            />

            <CameraModal
                visible={isModalVisible}
                onTakePicture={handlePhotoTaken}
                onClose={() => setIsModalVisible(false)}
            />
        </Pressable>
    );
};

export default observer(CreateScreen);

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
    addCategoryButton: {
        alignItems: "center",
        marginTop: 8,
    },
    saveBtn: {
        alignSelf: "center",
        marginTop: 24,
        borderRadius: 40,
        backgroundColor: "#74bd94",
        padding: 6,
    },
});
