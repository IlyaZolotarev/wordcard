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
import { compressImage } from "@/lib/upload";
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
        if (!user) return;

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

        if (searchStore.selectedImageUrl.startsWith("file://")) {
            const compressedImage = await compressImage(
                searchStore.selectedImageUrl,
                user.id
            );
            if (compressedImage?.fileName && compressedImage.fileName) {
                await createStore.saveCardWithImageStore(
                    user,
                    compressedImage.fileName,
                    compressedImage.arrayBuffer,
                    categoryStore.selectedCategory.id
                );
                await FileSystem.deleteAsync(searchStore.selectedImageUrl, {
                    idempotent: true,
                });
            }
        } else {
            await createStore.saveCard(user, searchStore.selectedImageUrl, categoryStore.selectedCategory.id)
        }
        router.replace("/homeScreen");
    };

    const handleCreateCategory = (name: string) => {
        categoryStore.createCategory(name, user);
    };

    const onTakePicture = (imageUrl: string) => {
        searchStore.setImageUrl(imageUrl);
        setModalVisible(false)
    };

    useEffect(() => {
        return () => {
            if (searchStore.selectedImageUrl.startsWith("file://")) {
                FileSystem.deleteAsync(searchStore.selectedImageUrl, { idempotent: true })
                    .catch((err) => console.warn("Ошибка при очистке временного файла:", err));
            }
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
            <Pressable onPress={() => setIsModalVisible(true)}>
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
        marginBottom: 24,
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
