import { useEffect } from "react";
import { useStores } from "@/stores/storeContext";
import { getLastDeepLink } from "@/app/_layout";
import { Text, View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { observer } from "mobx-react-lite";
import { SYNC_STATUS, type SyncStatus } from "@/stores/authStore";

export default observer(function AuthCallback() {
    const { authStore } = useStores();

    useEffect(() => {
        const url = getLastDeepLink();
        if (!url) return;

        try {
            const queryString = url.split(/[#?]/)[1] ?? "";
            const params = new URLSearchParams(queryString);
            const token = params.get("access_token");
            const refresh = params.get("refresh_token");

            if (token && refresh) {
                authStore.handleDeepLink(token, refresh);
            } else {
                console.warn("⚠️ Не удалось найти access_token или refresh_token");
            }
        } catch (err) {
            console.error("❌ Ошибка при обработке deeplink:", err);
        }
    }, []);

    const getStatusText = (status: SyncStatus, error?: string) => {
        switch (status) {
            case SYNC_STATUS.IDLE:
                return "Ожидание запуска...";
            case SYNC_STATUS.SETTING_SESSION:
                return "Устанавливаем сессию...";
            case SYNC_STATUS.FETCHING_USER:
                return "Получаем пользователя...";
            case SYNC_STATUS.SYNCING_DATA:
                return "Синхронизация данных...";
            case SYNC_STATUS.DONE:
                return "Готово!";
            case SYNC_STATUS.ERROR:
                return `Ошибка: ${error || "Неизвестная"}`;
            default:
                return "";
        }
    };

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" />
            <Text style={styles.text}>
                {getStatusText(authStore.syncStatus, authStore.error)}
            </Text>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    text: {
        marginTop: 20,
        fontSize: 16,
        textAlign: "center",
    },
});
