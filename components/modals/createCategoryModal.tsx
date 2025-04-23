import {
    Modal,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    BackHandler,
    Pressable,
    ActivityIndicator,
    Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState, useRef } from "react";
import { triggerShake } from "@/lib/utils";

type Props = {
    visible: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
    loading: boolean;
};

export default function CreateCategoryModal({
    visible,
    onClose,
    onSubmit,
    loading,
}: Props) {
    const [name, setName] = useState("");
    const inputRef = useRef<TextInput>(null);
    const inputShake = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const backAction = () => {
            if (visible && !loading) {
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
    }, [visible, loading]);

    useEffect(() => {
        if (visible) {
            setName("");
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [visible]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            triggerShake(inputShake);
            return;
        }
        onSubmit(name);
        setName("");
        onClose();
    };

    const onChangeInput = (text: string) => {
        setName(text);
    };

    return (
        <Modal
            onRequestClose={onClose}
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <Pressable
                onPress={!loading ? onClose : undefined}
                style={styles.overlay}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.modalWrapper}
                >
                    <Pressable style={styles.modal}>
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
                                value={name}
                                onChangeText={onChangeInput}
                                placeholder="..."
                                placeholderTextColor="#aaa"
                                editable={!loading}
                            />
                        </Animated.View>
                        {loading ? (
                            <ActivityIndicator
                                size="small"
                                color="#333"
                                style={{ marginTop: 12 }}
                            />
                        ) : (
                            <View style={styles.actions}>
                                <TouchableOpacity onPress={onClose}>
                                    <MaterialCommunityIcons name="close" size={28} color="#333" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSubmit}>
                                    <MaterialCommunityIcons name="check" size={28} color="#333" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </Pressable>
                </KeyboardAvoidingView>
            </Pressable>
        </Modal>
    );
}

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
        justifyContent: "space-between",
        flexDirection: "row",
        paddingLeft: 24,
        paddingRight: 24,
        width: "100%",
        marginTop: 12,
    },
});
