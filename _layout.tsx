import { useEffect } from "react";
import {
    SafeAreaView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    View,
} from "react-native";
import { Slot, usePathname, router } from "expo-router";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import BottomNavigation from "@/components/bottomNavigation";
import { Camera } from "expo-camera";
import { useAuth } from "@/hooks/useAuth";
import { Buffer } from "buffer";
import { StoreContext } from "@/stores/storeContext";
import { rootStore } from "@/stores/rootStore";
import { useStores } from "@/stores/storeContext";
import * as Linking from "expo-linking";

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
    const { userStore } = useStores();
    const { user } = useAuth();
    const pathname = usePathname();
    const isCameraScreen = pathname === "/cameraScreen";
    const isOnboardingScreen = pathname === "/onboardingScreen";
    const showNavigation = !isCameraScreen && !isOnboardingScreen;

    useEffect(() => {
        (async () => {
            await Camera.requestCameraPermissionsAsync();
        })();
    }, []);

    useEffect(() => {
        if (user) {
            userStore.fetchLangCode(user);
        }
    }, [user?.id]);

    useEffect(() => {
        const handleDeepLink = ({ url }: { url: string }) => {
            const parsed = Linking.parse(url);
            const path = parsed.path;

            if (path?.includes("auth/callback")) {
                router.replace("/homeScreen");
            }
        };

        const subscription = Linking.addEventListener("url", handleDeepLink);

        // Для открытия при старте
        Linking.getInitialURL().then((url) => {
            if (url) handleDeepLink({ url });
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <StoreContext.Provider value={rootStore}>
            <PaperProvider theme={theme}>
                <SafeAreaView style={styles.safe}>
                    <KeyboardAvoidingView
                        style={styles.keyboardAvoiding}
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
                    >
                        <View
                            style={[styles.container, isCameraScreen && styles.noPadding]}
                        >
                            <Slot />
                        </View>
                    </KeyboardAvoidingView>
                    {showNavigation && <BottomNavigation />}
                </SafeAreaView>
            </PaperProvider>
        </StoreContext.Provider>
    );
}

const styles = StyleSheet.create({
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
