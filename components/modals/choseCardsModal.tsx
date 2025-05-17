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
    onSubmit: (modeOrCount: number | "selection") => void;
};

const MIN_SLIDER_VALUE = 4;

const ChoseCardsModalComponent = ({ visible, onClose, onSubmit }: Props) => {
    const { cardStore, categoryStore } = useStores();

    const max = categoryStore.totalCardCount;
    const [count, setCount] = useState(max);
    const [activeTab, setActiveTab] = useState<0 | 1>(0);

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
            setActiveTab(0)
        };
    }, [visible]);

    const handleStart = () => {
        onSubmit(activeTab === 0 ? count : "selection");
        onClose();
    };

    const toggleSelectionMode = () => {
        onClose();
        cardStore.toggleSelectionMode(true);
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
                        <View style={styles.tabs}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 0 && styles.tabActive]}
                                onPress={() => setActiveTab(0)}
                            >
                                <MaterialCommunityIcons
                                    name="view-grid-outline"
                                    size={24}
                                    color="#333"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 1 && styles.tabActive]}
                                onPress={() => setActiveTab(1)}
                            >
                                <MaterialCommunityIcons
                                    name="pencil-outline"
                                    size={24}
                                    color="#333"
                                />
                            </TouchableOpacity>
                        </View>

                        {activeTab === 0 ? (
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
                        ) : (
                            <Pressable onPress={toggleSelectionMode} style={styles.content}>
                                <MaterialCommunityIcons name="pencil" size={32} color="#333" />
                            </Pressable>
                        )}

                        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                            <MaterialCommunityIcons
                                name="play-circle-outline"
                                size={32}
                                color="#fff"
                            />
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
    tabs: {
        flexDirection: "row",
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    tabActive: {
        borderBottomColor: "#3b82f6",
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
        backgroundColor: "#333",
        padding: 12,
        borderRadius: 50,
    },
});
