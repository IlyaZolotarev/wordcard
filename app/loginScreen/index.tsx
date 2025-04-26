import { useState } from "react"
import { Text, TouchableOpacity } from "react-native"
import { TextInput, Button } from "react-native-paper"
import { supabase } from "@/lib/supabase"
import { useRouter } from "expo-router"
import { useAuth } from "@/hooks/useAuth"
import { Redirect } from "expo-router"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleLogin = async () => {
        setLoading(true)
        setError("")
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
        } else {
            router.replace("/homeScreen")
        }
        setLoading(false)
    }

    const { user } = useAuth()
    if (user) return <Redirect href="/homeScreen" />

    return (
        <>
            <TextInput
                label="Email"
                mode="outlined"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ marginBottom: 12 }}
            />
            <TextInput
                label="Пароль"
                mode="outlined"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={{ marginBottom: 12 }}
            />
            {error ? <Text style={{ color: "red", marginBottom: 12 }}>{error}</Text> : null}
            <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={{ marginBottom: 20 }}
            >
                Войти
            </Button>

            <TouchableOpacity onPress={() => router.push("/registerScreen")}>
                <Text style={{ textAlign: "center", color: "#4E9EFF" }}>
                    Нет аккаунта? Зарегистрироваться
                </Text>
            </TouchableOpacity>
        </>
    )
}
