import { useRouter, usePathname } from "expo-router"
import { IconButton } from "react-native-paper"
import {
    View,
    StyleSheet,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
    Animated
} from "react-native"
import { observer } from "mobx-react-lite"
import { useStores } from "@/stores/storeContext"
import { useRef } from 'react'
import { triggerShake } from "@/lib/utils";

const MainHeader = () => {
    const { searchStore } = useStores()
    const router = useRouter()
    const pathname = usePathname()
    const goBack = pathname !== "/homeScreen" && pathname !== "/"
    const headerInputShake = useRef(new Animated.Value(0)).current;

    const handleSubmit = () => {
        if (!searchStore.searchText.trim()) {
            triggerShake(headerInputShake)
            return
        }
        router.push("/searchScreen")
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.inner}>
                {goBack && (
                    <IconButton
                        icon="arrow-left"
                        size={24}
                        onPress={() => {
                            if (pathname.includes("searchScreen")) {
                                router.replace("/homeScreen")
                            } else {
                                router.back()
                            }
                        }}
                        style={styles.arrowIcon}
                    />
                )}
                <View style={styles.searchContainer}>
                    <Animated.View style={[styles.input, { transform: [{ translateX: headerInputShake }] }]}>
                        <TextInput
                            value={searchStore.searchText}
                            onChangeText={(text) => searchStore.setSearchText(text)}
                            placeholder="A...?"
                            placeholderTextColor="#aaa"
                            onSubmitEditing={handleSubmit}
                        />
                    </Animated.View>

                    <IconButton
                        icon="magnify"
                        size={22}
                        onPress={handleSubmit}
                        style={styles.searchIcon}
                    />
                </View>
            </View>
        </TouchableWithoutFeedback>
    )
}

export default observer(MainHeader)

const styles = StyleSheet.create({
    inner: {
        flexDirection: "row",
        alignItems: "center",
        height: 44,
    },
    searchContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    input: {
        borderBottomWidth: 1,
        borderColor: "#ddd",
        flex: 1,
        color: 'black'
    },
    searchIcon: {
        margin: 0,
        marginLeft: 4,
    },
    arrowIcon: {
        margin: 0,
        marginRight: 4,
    },
})