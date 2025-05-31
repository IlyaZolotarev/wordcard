import {
    Modal,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    BackHandler,
    Pressable,
    Animated,
    View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { triggerShake } from "@/lib/utils";
import { IconButton } from "react-native-paper";
import { useStores } from "@/stores/storeContext";
import { observer } from "mobx-react-lite";

type Props = {
    visible: boolean;
    onClose: () => void;
    onSubmit: () => void;
};

const ImageSearchModal = observer(({ visible, onClose, onSubmit }: Props) => {
    const { searchStore } = useStores();
    const inputShake = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const backAction = () => {
            if (visible) {
                onClose();
                return true;
            }
            return false;
        };

        const subscription = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );
        return () => {
            subscription.remove();
        };
    }, [visible]);

    const handleSubmit = async () => {
        if (!searchStore.searchText.trim()) {
            triggerShake(inputShake);
            return;
        }

        onSubmit();
    };

    return (
        <Modal
            onRequestClose={onClose}
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <Pressable onPress={onClose} style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.modalWrapper}
                >
                    <Pressable style={styles.modal}>
                        <MaterialCommunityIcons name="image" size={36} color="#666" />
                        <View style={styles.content}>
                            <Animated.View
                                style={[
                                    styles.input,
                                    { transform: [{ translateX: inputShake }] },
                                ]}
                            >
                                <TextInput
                                    value={searchStore.searchText}
                                    onChangeText={(text) => searchStore.setSearchText(text)}
                                    placeholder="A...?"
                                    placeholderTextColor="#aaa"
                                    onSubmitEditing={handleSubmit}
                                />
                            </Animated.View>

                            <IconButton
                                icon="magnify"
                                size={22}
                                onPress={handleSubmit}
                                style={styles.searchIcon}
                            />
                        </View>
                    </Pressable>
                </KeyboardAvoidingView>
            </Pressable>
        </Modal>
    );
});

export default ImageSearchModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "#00000088",
        justifyContent: "center",
        alignItems: "center",
    },
    modalWrapper: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
    },
    modal: {
        width: 240,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
    },
    content: {
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
});
