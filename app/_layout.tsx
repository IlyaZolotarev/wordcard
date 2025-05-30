import {
    SafeAreaView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    View,
    ActivityIndicator,
} from "react-native";
import { Slot, usePathname, useRouter } from "expo-router";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import BottomNavigation from "@/components/bottomNavigation";
import { StoreContext } from "@/stores/storeContext";
import { rootStore } from "@/stores/rootStore";
import { Camera } from "expo-camera";
import { useEffect } from "react";
import * as Linking from "expo-linking";
import { useStores } from "@/stores/storeContext";

let lastDeepLinkUrl: string | null = null;
export const getLastDeepLink = () => lastDeepLinkUrl;

const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        background: "#ffffff",
        surface: "#ffffff",
    },
};

const Layout = () => {
    const { authStore } = useStores();
    const router = useRouter();
    const pathname = usePathname();
    const isCameraScreen = pathname === "/cameraScreen";
    const isOnboardingScreen = pathname === "/onboardingScreen";
    const showNavigation = !isCameraScreen && !isOnboardingScreen;

    useEffect(() => {
        (async () => {
            await Camera.requestCameraPermissionsAsync();

            if (pathname !== "/authCallback") {
                await authStore.init();
            }
        })();
    }, []);

    useEffect(() => {
        const sub = Linking.addEventListener("url", ({ url }) => {
            lastDeepLinkUrl = url;

            if (url.includes("authCallback")) {
                router.replace("/authCallback");
            }
        });

        return () => sub.remove();
    }, []);

    if (authStore.loading) {
        return (
            <SafeAreaView style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#000" />
            </SafeAreaView>
        );
    }

    return (
        <StoreContext.Provider value={rootStore}>
            <PaperProvider theme={theme}>
                <SafeAreaView style={styles.safe}>
                    <KeyboardAvoidingView
                        style={styles.keyboardAvoiding}
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
                    >
                        <View style={[styles.container, isCameraScreen && styles.noPadding]}>
                            <Slot />
                        </View>
                    </KeyboardAvoidingView>
                    {showNavigation && <BottomNavigation />}
                </SafeAreaView>
            </PaperProvider>
        </StoreContext.Provider>
    );
};

export default Layout;

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
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
});
