import { Text, TouchableOpacity } from "react-native"
import { TextInput, Button } from "react-native-paper"
import { Redirect, useRouter } from "expo-router"
import { useAuth } from "@/hooks/useAuth"
import { observer } from "mobx-react-lite"
import { useStores } from "@/stores/storeContext"

function LoginScreen() {
    const { authStore } = useStores()
    const { user } = useAuth()
    const router = useRouter();

    if (user) return <Redirect href="/homeScreen" />

    return (
        <>
            <TextInput
                label="Email"
                mode="outlined"
                value={authStore.email}
                onChangeText={authStore.setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ marginBottom: 12 }}
            />
            <TextInput
                label="Пароль"
                mode="outlined"
                value={authStore.password}
                onChangeText={authStore.setPassword}
                secureTextEntry
                style={{ marginBottom: 12 }}
            />
            {authStore.error ? (
                <Text style={{ color: "red", marginBottom: 12 }}>{authStore.error}</Text>
            ) : null}
            <Button
                mode="contained"
                onPress={authStore.login}
                loading={authStore.loading}
                disabled={authStore.loading}
                style={{ marginBottom: 20 }}
            >
                Войти
            </Button>

            <TouchableOpacity onPress={() => {
                authStore.reset();
                authStore.setConfirmPassword("");
                router.push("/registerScreen");
            }}>
                <Text style={{ textAlign: "center", color: "#4E9EFF" }}>
                    Нет аккаунта? Зарегистрироваться
                </Text>
            </TouchableOpacity>
        </>
    )
}

export default observer(LoginScreen)
