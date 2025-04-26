import { useState } from "react"
import { Text, TouchableOpacity } from "react-native"
import { TextInput, Button } from "react-native-paper"
import { supabase } from "@/lib/supabase"
import { useRouter } from "expo-router"
import { useAuth } from "@/hooks/useAuth"
import { Redirect } from "expo-router"

export default function Register() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleRegister = async () => {
        setError("")

        if (password !== confirmPassword) {
            setError("Пароли не совпадают")
            return
        }

        setLoading(true)
        const { error } = await supabase.auth.signUp({
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
            <TextInput
                label="Повторите пароль"
                mode="outlined"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={{ marginBottom: 12 }}
            />
            {error ? <Text style={{ color: "red", marginBottom: 12 }}>{error}</Text> : null}
            <Button
                mode="contained"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                style={{ marginBottom: 20 }}
            >
                Зарегистрироваться
            </Button>

            <TouchableOpacity onPress={() => router.push("/loginScreen")}>
                <Text style={{ textAlign: "center", color: "#4E9EFF" }}>
                    Авторизация
                </Text>
            </TouchableOpacity>
        </>
    )
}
