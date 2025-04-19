import { useRouter, usePathname } from "expo-router"
import { IconButton } from "react-native-paper"
import {
    View,
    StyleSheet,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
} from "react-native"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"

export default function Header() {
    const router = useRouter()
    const pathname = usePathname()
    const { user } = useAuth()
    const [query, setQuery] = useState("")
    const [hasError, setHasError] = useState(false)
    const showBack = user && pathname !== "/home" && pathname !== "/"

    const handleSubmit = () => {
        if (!query.trim()) {
            setHasError(true)
            return
        }
        router.push({ pathname: "/search", params: { q: query } })
    }

    useEffect(() => {
        const hideError = () => setHasError(false)
        const sub = Keyboard.addListener("keyboardDidHide", hideError)
        return () => sub.remove()
    }, [])

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View>
                <View style={styles.inner}>
                    {showBack && (
                        <IconButton
                            icon="arrow-left"
                            size={24}
                            onPress={() => router.back()}
                        />
                    )}
                    <View style={styles.searchContainer}>
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder="A...?"
                            placeholderTextColor="#aaa"
                            style={[styles.input, hasError && styles.inputError]}
                            onSubmitEditing={handleSubmit}
                        />
                        <IconButton
                            icon="magnify"
                            size={22}
                            onPress={handleSubmit}
                            style={styles.searchIcon}
                        />
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    inner: {
        flexDirection: "row",
        alignItems: "center",
    },
    searchContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    input: {
        borderBottomWidth: 1,
        borderColor: "#ddd",
        flex: 1,
        backgroundColor: "transparent",
        height: 44,
    },
    inputError: {
        borderColor: "red",
    },
    searchIcon: {
        marginLeft: 4,
    },
})
