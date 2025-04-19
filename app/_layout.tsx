import { useEffect } from "react"
import { SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform, View } from "react-native"
import { Slot } from "expo-router"
import { PaperProvider, MD3LightTheme } from "react-native-paper"
import BottomNavigation from "@/components/bottomNavigation"
import { Camera } from "expo-camera"
import { StrictMode } from 'react';
import Header from '@/components/header'
import { useAuth } from "@/hooks/useAuth"
const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        background: "#ffffff",
        surface: "#ffffff",
    },
}

export default function Layout() {
    const { user } = useAuth()

    useEffect(() => {
        (async () => {
            await Camera.requestCameraPermissionsAsync()
        })()
    }, [])

    return (
        <StrictMode>
            <PaperProvider theme={theme}>
                <SafeAreaView testID="SafeAreaView" style={styles.safe}>
                    <KeyboardAvoidingView
                        testID="KeyboardAvoidingView"
                        style={styles.keyboardAvoiding}
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
                    >
                        <View testID="KeyboardAvoidingView" style={styles.container}>
                            <View style={styles.header}>
                                <Header />
                            </View>
                            <Slot />
                        </View>
                    </KeyboardAvoidingView>
                    {user && <BottomNavigation />}
                </SafeAreaView>
            </PaperProvider>
        </StrictMode>

    )
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 24,
    },
    safe: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    keyboardAvoiding: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
    },
})
