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
} from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import * as Haptics from "expo-haptics"

interface Props {
    visible: boolean
    onClose: () => void
    categoryId: string
    initialName: string
    onUpdated: () => void
}

export default function EditCategoryModal({
    visible,
    onClose,
    categoryId,
    initialName,
    onUpdated,
}: Props) {
    const inputRef = useRef<TextInput>(null)
    const [name, setName] = useState(initialName)
    const [loading, setLoading] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)

    useEffect(() => {
        if (visible) {
            setName(initialName)
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [visible, initialName])

    useEffect(() => {
        const backAction = () => {
            if (visible) {
                onClose()
                return true
            }
            return false
        }

        const sub = BackHandler.addEventListener("hardwareBackPress", backAction)
        return () => {
            sub.remove()
            setHasError(false)
        }
    }, [visible])

    const handleUpdate = async () => {
        if (!name.trim()) {
            setHasError(true)
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
            return
        }

        setLoading(true)
        const { error } = await supabase
            .from("categories")
            .update({ name })
            .eq("id", categoryId)

        setLoading(false)

        if (!error) {
            onUpdated()
            onClose()
        } else {
            setHasError(true)
        }
    }

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true)
            setTimeout(() => setConfirmDelete(false), 2000)
            return
        }

        setLoading(true)

        await supabase.from("cards").delete().eq("category_id", categoryId)

        const { error } = await supabase
            .from("categories")
            .delete()
            .eq("id", categoryId)

        setLoading(false)

        if (!error) {
            onUpdated()
            onClose()
        } else {
            setHasError(true)
        }
    }

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
            <Pressable style={styles.overlay} onPress={onClose}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.modalWrapper}
                >
                    <Pressable style={styles.modal} onPress={() => { }}>
                        <MaterialCommunityIcons name="folder-outline" size={48} color="#666" />
                        <TextInput
                            ref={inputRef}
                            value={name}
                            onChangeText={(text) => {
                                setName(text)
                                if (hasError && text.trim()) setHasError(false)
                            }}
                            placeholder="..."
                            placeholderTextColor="#aaa"
                            style={[styles.input, hasError && styles.inputError]}
                        />

                        <View style={styles.actions}>
                            <TouchableOpacity onPress={onClose} disabled={loading}>
                                <MaterialCommunityIcons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                            {loading ? (
                                <ActivityIndicator />
                            ) : (
                                <TouchableOpacity onPress={handleUpdate}>
                                    <MaterialCommunityIcons name="check" size={28} color="#333" />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={handleDelete}>
                                <MaterialCommunityIcons
                                    name={confirmDelete ? "alert-outline" : "trash-can-outline"}
                                    size={28}
                                    color={confirmDelete ? "orange" : "red"}
                                />
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </KeyboardAvoidingView>
            </Pressable>
        </Modal>
    )
}

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
    inputError: {
        borderColor: "red",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingTop: 8,
        paddingHorizontal: 24,
    },
})
