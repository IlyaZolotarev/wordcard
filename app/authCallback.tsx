import { useEffect, useState } from "react";
import { useStores } from "@/stores/storeContext";
import { getLastDeepLink } from "@/app/_layout";
import { Text, ScrollView } from "react-native";

export default function AuthCallback() {
    const { authStore } = useStores();
    const [logs, setLogs] = useState<string[]>([]);

    const log = (msg: string) => {
        setLogs((prev) => [...prev, msg]);
    };

    useEffect(() => {
        const url = getLastDeepLink();
        log(`🔗 URL: ${url}`);
        if (!url) {
            log("⚠️ Нет deep link URL");
            return;
        }

        const fixed = url.replace("#", "?");
        log(`🔧 Исправленный URL: ${fixed}`);

        const token = new URL(fixed).searchParams.get("access_token");
        const refresh = new URL(fixed).searchParams.get("refresh_token");
        log(`🔑 Token: ${token}`);
        log(`🔄 Refresh: ${refresh}`);

        if (!token || !refresh) {

            log("❌ Отсутствуют токены");
            return;
        }

        authStore.handleDeepLink(token, refresh);
    }, []);

    return (
        <ScrollView style={{ padding: 16 }}>
            {logs.map((entry, i) => (
                <Text key={i} style={{ marginBottom: 4 }}>
                    {entry}
                </Text>
            ))}
        </ScrollView>
    );
}
