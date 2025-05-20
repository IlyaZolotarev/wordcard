import { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import { observer } from "mobx-react-lite";
import { router } from "expo-router";
import * as FileSystem from "expo-file-system";
import CreateCategoryModal from "@/components/modals/createCategoryModal";
import CameraModal from "@/components/cameraModal";
import MainHeader from "@/components/mainHeader"
import CategorySelector from "./components/categorySelector";
import WordInputs from "./components/wordInputs";
import SaveButton from "./components/saveButton";

import { useAuth } from "@/hooks/useAuth";
import { compressImage, IMAGE_MODE } from "@/lib/upload";
import { useStores } from "@/stores/storeContext";

const CreateScreen = () => {
    const { createStore, categoryStore, searchStore } = useStores();
    const { user } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [savingPreloader, setSavingPreloader] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const addCategoryButtonRef = useRef<{ addCategoryButtonShake: () => void }>(
        null
    );
    const wordInputsRef = useRef<{
        shakeWord: () => void;
        shakeTransWord: () => void;
    }>(null);

    const handleSave = async () => {
        if (!createStore.word.trim()) {
            wordInputsRef.current?.shakeWord();
            return;
        }

        if (!createStore.transWord.trim()) {
            wordInputsRef.current?.shakeTransWord();
            return;
        }

        if (!categoryStore.selectedCategory) {
            addCategoryButtonRef.current?.addCategoryButtonShake();
            return;
        }

        setSavingPreloader(true);

        const imageUri = searchStore.selectedImageUrl;
        const categoryId = categoryStore.selectedCategory.id;

        if (imageUri.startsWith("file://")) {
            if (user) {
                const result = await compressImage(imageUri, IMAGE_MODE.UPLOAD, user.id);

                if (typeof result !== "string" && result?.fileName && result?.arrayBuffer) {
                    await createStore.saveCardWithImageStore(user, result.fileName, result.arrayBuffer, categoryId);
                    deleteTempPhoto();
                }
            } else {
                const localResult = await compressImage(imageUri, IMAGE_MODE.LOCAL);
                if (typeof localResult === "string") {
                    await createStore.saveCard(null, localResult, categoryId);
                    deleteTempPhoto();
                }
            }
        } else {
            await createStore.saveCard(user, imageUri, categoryId);
        }

        router.replace("/homeScreen");
    };

    const handleCreateCategory = (name: string) => {
        categoryStore.createCategory(name, user);
    };

    const deleteTempPhoto = () => {
        if (searchStore.selectedImageUrl.startsWith("file://")) {
            FileSystem.deleteAsync(searchStore.selectedImageUrl, { idempotent: true })
                .catch((err) => console.warn("Ошибка при удалении старого фото:", err));
        }
    }

    const onTakePicture = (imageUrl: string) => {
        deleteTempPhoto()
        searchStore.setImageUrl(imageUrl);
        setModalVisible(false)
    };

    useEffect(() => {
        return () => {
            deleteTempPhoto()
        };
    }, []);

    return (
        <Pressable
            style={styles.container}
            onPress={() => dropdownVisible && setDropdownVisible(false)}
        >
            <View style={styles.header}>
                <MainHeader />
            </View>
            <View style={styles.wordInputsWrapper}>
                <WordInputs ref={wordInputsRef} />
            </View>
            <Pressable style={styles.imageWrapper} onPress={() => setIsModalVisible(true)}>
                <Image
                    source={{ uri: searchStore.selectedImageUrl }}
                    style={styles.image}
                />
            </Pressable>
            <View style={styles.categoriesWrapper}>
                <CategorySelector visible={dropdownVisible} setVisible={setDropdownVisible} />
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
                onTakePicture={onTakePicture}
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
    header: {
        marginBottom: 24,
    },
    wordInputsWrapper: {
        marginTop: 12,
        marginBottom: 24,
    },
    categoriesWrapper: {
        marginBottom: 12,
    },
    imageWrapper: {
        marginBottom: 24,
    },
    image: {
        width: "100%",
        height: 200,
        borderRadius: 16,
        backgroundPosition: 'center'
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
