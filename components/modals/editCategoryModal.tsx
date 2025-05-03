import {
    Modal,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ActivityIndicator,
    BackHandler,
    Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState, useRef } from "react";
import { triggerShake } from "@/lib/utils";
import { useStores } from "@/stores/storeContext";
import { useAuth } from "@/hooks/useAuth";
import { observer } from "mobx-react-lite";

interface Props {
    visible: boolean;
    onClose: () => void;
    categoryId: string;
}

const EditCategoryModal = ({ visible, onClose, categoryId }: Props) => {
    const { categoryStore } = useStores();
    const inputRef = useRef<TextInput>(null);
    const inputShake = useRef(new Animated.Value(0)).current;
    const currentCategory = categoryStore.categories.find(
        (category) => category.id === categoryId
    );
    const [categoryName, setCategoryName] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);
    const { user } = useAuth();
    const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (currentCategory) {
            setCategoryName(currentCategory.name);
        }
    }, [currentCategory]);

    useEffect(() => {
        const backAction = () => {
            if (visible) {
                onClose();
                return true;
            }
            return false;
        };

        const sub = BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => {
            sub.remove();
            if (deleteTimeoutRef.current) {
                setConfirmDelete(false);
                clearTimeout(deleteTimeoutRef.current);
            }
        };
    }, [visible]);

    const handleUpdate = () => {
        if (!categoryName.trim() || currentCategory?.name === categoryName) {
            triggerShake(inputShake);
            return;
        }

        categoryStore.updateCategory(user, categoryId, categoryName.trim(), onClose);
    };

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            deleteTimeoutRef.current = setTimeout(() => {
                setConfirmDelete(false);
            }, 2000);
            return;
        }

        categoryStore.deleteCategory(user, categoryId, onClose);
    };

    const onChangeInput = (text: string) => {
        setCategoryName(text);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.modalWrapper}
                >
                    <View style={styles.modal}>
                        <MaterialCommunityIcons
                            name="folder-outline"
                            size={48}
                            color="#666"
                        />
                        <Animated.View
                            style={[
                                styles.input,
                                { transform: [{ translateX: inputShake }] },
                            ]}
                        >
                            <TextInput
                                ref={inputRef}
                                value={categoryName}
                                onChangeText={onChangeInput}
                                placeholder="..."
                                placeholderTextColor="#aaa"
                            />
                        </Animated.View>
                        <View style={styles.actions}>
                            <TouchableOpacity
                                onPress={onClose}
                                disabled={
                                    categoryStore.updateCategoryLoading ||
                                    categoryStore.deleteCategoryLoading
                                }
                            >
                                <MaterialCommunityIcons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                            {categoryStore.updateCategoryLoading ? (
                                <ActivityIndicator />
                            ) : (
                                <TouchableOpacity
                                    onPress={handleUpdate}
                                    disabled={
                                        categoryStore.updateCategoryLoading ||
                                        categoryStore.deleteCategoryLoading
                                    }
                                >
                                    <MaterialCommunityIcons name="check" size={28} color="#333" />
                                </TouchableOpacity>
                            )}
                            {categoryStore.deleteCategoryLoading ? (
                                <ActivityIndicator />
                            ) : (
                                <TouchableOpacity
                                    onPress={handleDelete}
                                    disabled={
                                        categoryStore.updateCategoryLoading ||
                                        categoryStore.deleteCategoryLoading
                                    }
                                >
                                    <MaterialCommunityIcons
                                        name={confirmDelete ? "alert-outline" : "trash-can-outline"}
                                        color={confirmDelete ? "orange" : "red"}
                                        size={28}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Pressable>
        </Modal>
    );
};

export default observer(EditCategoryModal);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "#00000088",
        justifyContent: "center",
        alignItems: "center",
    },
    modalWrapper: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    modal: {
        width: 260,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
    },
    input: {
        width: "100%",
        borderBottomWidth: 1,
        borderColor: "#ddd",
        marginVertical: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        fontSize: 16,
        color: "#000",
        textAlign: "left",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingTop: 8,
        paddingHorizontal: 24,
    },
});
