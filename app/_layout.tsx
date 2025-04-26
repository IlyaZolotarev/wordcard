import { useEffect } from "react";
import {
    SafeAreaView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    View,
} from "react-native";
import { Slot, usePathname } from "expo-router";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import BottomNavigation from "@/components/bottomNavigation";
import { Camera } from "expo-camera";
import { useAuth } from "@/hooks/useAuth";
import { Buffer } from "buffer";
import { StoreContext } from "@/stores/storeContext";
import { rootStore } from "@/stores/rootStore";

global.Buffer = Buffer;
const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        background: "#ffffff",
        surface: "#ffffff",
    },
};

export default function Layout() {
    const { user } = useAuth();
    const pathname = usePathname()
    const isCameraScreen = pathname === "/cameraScreen"

    useEffect(() => {
        (async () => {
            await Camera.requestCameraPermissionsAsync();
        })();
    }, []);

    return (
        <StoreContext.Provider value={rootStore}>
            <PaperProvider theme={theme}>
                <SafeAreaView testID="SafeAreaView" style={styles.safe}>
                    <KeyboardAvoidingView
                        testID="KeyboardAvoidingView"
                        style={styles.keyboardAvoiding}
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
                    >
                        <View testID="KeyboardAvoidingView" style={[styles.container, isCameraScreen && styles.noPadding]}>
                            <Slot />
                        </View>
                    </KeyboardAvoidingView>
                    {user && !isCameraScreen && <BottomNavigation />}
                </SafeAreaView>
            </PaperProvider>
        </StoreContext.Provider>
    );
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
    noPadding: {
        paddingHorizontal: 0,
        paddingTop: 0,
        paddingBottom: 0,
    },
});
