import { useRef } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Animated,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { forwardRef, useImperativeHandle } from "react"
import { triggerShake } from '@/lib/utils';

type saveButtonProps = {
    setModalVisible: (isVisible: boolean) => void
    onSave: () => void
    loading: boolean
}
const SaveButton = forwardRef(({ setModalVisible, onSave, loading }: saveButtonProps, ref) => {
    const addCategoryButtonShake = useRef(new Animated.Value(0)).current;

    useImperativeHandle(ref, () => ({
        addCategoryButtonShake: () => triggerShake(addCategoryButtonShake),
    }))

    return (
        <View style={styles.base}>
            <Animated.View
                style={{ transform: [{ translateX: addCategoryButtonShake }] }}
            >
                <TouchableOpacity
                    style={styles.addCategoryButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add-circle-outline" size={24} color="#333" />
                </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
                style={styles.saveBtn}
                onPress={onSave}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator size={38} color="#fff" />
                ) : (
                    <MaterialCommunityIcons name="check" size={38} color="#fff" />
                )}
            </TouchableOpacity>
        </View>
    );
})

export default SaveButton;

const styles = StyleSheet.create({
    addCategoryButton: {
        alignItems: "center",
        marginTop: 8,
    },
    base: {
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
