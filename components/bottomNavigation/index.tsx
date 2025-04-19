import { useRouter, usePathname } from "expo-router"
import { View, TouchableOpacity, StyleSheet } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function BottomNavigation() {
    const router = useRouter()
    const pathname = usePathname()
    const insets = useSafeAreaInsets()

    const routes = [
        { key: "home", icon: "home-outline" },
        { key: "profile", icon: "account-outline" },
    ] as const

    return (
        <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
            {routes.map((route) => {
                const isActive =
                    pathname.includes(route.key) || (route.key === "home" && pathname.includes("search"))
                return (
                    <TouchableOpacity
                        key={route.key}
                        onPress={() => router.push(`/${route.key}`)}
                        style={styles.tab}
                    >
                        <MaterialCommunityIcons
                            name={route.icon}
                            size={24}
                            color={isActive ? "#6200ee" : "#000"}
                        />
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        height: 56,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        backgroundColor: "#fff",
    },
    tab: {
        alignItems: "center",
        justifyContent: "center",
    },
})
