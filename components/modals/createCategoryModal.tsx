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
} from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useEffect, useState } from "react"

type Props = {
    visible: boolean
    onClose: () => void
    onSubmit: (name: string) => Promise<void>
}

export default function CreateCategoryModal({ visible, onClose, onSubmit }: Props) {
    const [name, setName] = useState("")
    const [hasError, setHasError] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const backAction = () => {
            if (visible && !loading) {
                onClose()
                return true
            }
            return false
        }

        const subscription = BackHandler.addEventListener("hardwareBackPress", backAction)
        return () => {
            subscription.remove()
            setHasError(false)
        }
    }, [visible, loading])

    const handleSubmit = async () => {
        if (!name.trim()) {
            setHasError(true)
            return
        }
        setLoading(true)
        await onSubmit(name)
        setLoading(false)
        setName("")
        setHasError(false)
        onClose()
    }

    return (
        <Modal
            onRequestClose={onClose}
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <Pressable onPress={!loading ? onClose : undefined} style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.modalWrapper}
                >
                    <Pressable style={styles.modal} onPress={() => { }}>
                        <MaterialCommunityIcons name="folder-outline" size={48} color="#666" />
                        <TextInput
                            value={name}
                            onChangeText={(text) => {
                                setName(text)
                                if (hasError && text.trim()) setHasError(false)
                            }}
                            placeholder="..."
                            style={[styles.input, hasError && styles.inputError]}
                            placeholderTextColor="#aaa"
                            editable={!loading}
                        />
                        {loading ? (
                            <ActivityIndicator size="small" color="#333" style={{ marginTop: 12 }} />
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
    inputError: {
        borderColor: "red",
    },
    actions: {
        justifyContent: 'space-between',
        flexDirection: "row",
        paddingLeft: 24,
        paddingRight: 24,
        width: '100%',
        marginTop: 12,
    },
})
