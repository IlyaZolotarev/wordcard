import { View, Text, Pressable, StyleSheet } from "react-native"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useStores } from "@/stores/storeContext";

export default observer(function Profile() {
    const { authStore } = useStores()

    const handleLogout = () => {
        authStore.logout()
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Профиль</Text>

            {authStore.session ? (
                <Pressable style={styles.button} onPress={handleLogout}>
                    <Text style={styles.buttonText}>Выйти</Text>
                </Pressable>
            ) : (
                <Pressable style={styles.button} onPress={() => router.push("/loginScreen")}>
                    <Text style={styles.buttonText}>Войти</Text>
                </Pressable>
            )}
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: "#007AFF",
        borderRadius: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
    },
})
