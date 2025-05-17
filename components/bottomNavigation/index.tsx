import { useRouter, usePathname } from "expo-router";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BottomNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const routes = [
        { key: "homeScreen", icon: "home-outline" },
        { key: "profileScreen", icon: "account-outline" },
    ] as const;

    return (
        <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
            {routes.map((route) => {
                const isActive =
                    pathname.includes(route.key) ||
                    (route.key === "homeScreen" && pathname.includes("searchScreen"));

                return (
                    <TouchableOpacity
                        key={route.key}
                        onPress={() => router.push(`/${route.key}`)}
                        style={styles.tab}
                        hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
                    >
                        <MaterialCommunityIcons
                            name={route.icon}
                            size={24}
                            color="#000"
                        />
                        {isActive && <View style={styles.activeLine} />}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
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
        paddingTop: 8,
    },
    activeLine: {
        marginTop: 4,
        width: 24,
        height: 2,
        backgroundColor: "#000",
        borderRadius: 1,
    },
});
