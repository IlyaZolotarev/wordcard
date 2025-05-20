import React, { useState, useEffect } from "react";
import {
    Modal,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    BackHandler,
    Pressable,
    View,
    TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useStores } from "@/stores/storeContext";
import SimpleSlider from "@/components/simpleSlider";

type Props = {
    visible: boolean;
    onClose: () => void;
    onSubmit: (number: number) => void;
};

const MIN_SLIDER_VALUE = 4;

const ChoseCardsModalComponent = ({ visible, onClose, onSubmit }: Props) => {
    const { categoryStore } = useStores();

    const max = categoryStore.totalCardCount;
    const [count, setCount] = useState(max);

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
            subscription.remove()
        };
    }, [visible]);

    const handleStart = () => {
        onSubmit(count);
        onClose();
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
                        <View style={styles.content}>
                            <MaterialCommunityIcons
                                name="cards-outline"
                                size={32}
                                color="#333"
                                style={{ marginBottom: 16 }}
                            />
                            <SimpleSlider
                                min={MIN_SLIDER_VALUE}
                                max={max}
                                defaultValue={max}
                                onChange={setCount}
                            />
                        </View>
                        <TouchableOpacity onPress={handleStart} style={styles.startButton}>
                            <MaterialCommunityIcons name="play-circle-outline" size={32} color="#fff" />
                        </TouchableOpacity>
                    </Pressable>
                </KeyboardAvoidingView>
            </Pressable>
        </Modal>
    );
};

export default ChoseCardsModalComponent;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalWrapper: {
        width: "100%",
        flex: 1,
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
    content: {
        alignItems: "center",
        marginBottom: 20,
    },
    slider: {
        width: 200,
        height: 40,
    },
    startButton: {
        borderRadius: 40,
        backgroundColor: "#74bd94",
        padding: 6,
    },
});
