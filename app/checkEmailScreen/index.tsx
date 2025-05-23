import { View, StyleSheet, Text } from "react-native"
import { Button } from "react-native-paper"
import { useRouter } from "expo-router"

export default function CheckEmailScreen() {
    const router = useRouter()

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Проверьте почту</Text>
            <Text style={styles.subtitle}>
                Мы отправили ссылку для подтверждения на вашу электронную почту. Перейдите по ней, чтобы завершить регистрацию.
            </Text>

            <Button mode="contained" onPress={() => router.replace("/loginScreen")}>
                Вернуться к входу
            </Button>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 24,
    },
})
