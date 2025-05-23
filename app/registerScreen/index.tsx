import { Text, TouchableOpacity } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { Redirect, useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { useAuth } from "@/hooks/useAuth";
import { useStores } from "@/stores/storeContext";

function RegisterScreen() {
    const { authStore } = useStores();
    const { user } = useAuth();
    const router = useRouter();

    if (user) return <Redirect href="/homeScreen" />;

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
            <TextInput
                label="Повторите пароль"
                mode="outlined"
                value={authStore.confirmPassword}
                onChangeText={authStore.setConfirmPassword}
                secureTextEntry
                style={{ marginBottom: 12 }}
            />
            {authStore.error ? (
                <Text style={{ color: "red", marginBottom: 12 }}>
                    {authStore.error}
                </Text>
            ) : null}
            <Button
                mode="contained"
                onPress={authStore.register}
                loading={authStore.loading}
                disabled={authStore.loading}
                style={{ marginBottom: 20 }}
            >
                Зарегистрироваться
            </Button>

            <TouchableOpacity
                onPress={() => {
                    authStore.reset();
                    router.push("/loginScreen");
                }}
            >
                <Text style={{ textAlign: "center", color: "#4E9EFF" }}>
                    Авторизация
                </Text>
            </TouchableOpacity>
        </>
    );
}

export default observer(RegisterScreen);
