import { useEffect, useState } from "react"
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "@/hooks/useAuth"
import { observer } from "mobx-react-lite"
import { useStores } from "@/stores/storeContext"
import { ICategory } from "@/stores/createStore"

function CategorySelector() {
    const { user } = useAuth()
    const { createStore } = useStores()
    const [dropdownVisible, setDropdownVisible] = useState(false)

    useEffect(() => {
        createStore.fetchCategories(user)
    }, [user])

    const onSelectCategory = (category: ICategory) => {
        createStore.setSelectedCategory(category)
        setDropdownVisible(false)
    }

    return (
        <View style={styles.base}>
            <TouchableOpacity
                style={[
                    styles.dropdown,
                    !createStore.categories.length && styles.dropdownDisabled,
                ]}
                onPress={() =>
                    createStore.categories.length && setDropdownVisible(!dropdownVisible)
                }
                disabled={createStore.fetchCategoriesLoading || !createStore.categories.length}
            >
                {createStore.fetchCategoriesLoading ? (
                    <ActivityIndicator size="small" color="#aaa" />
                ) : createStore.categories.length ? (
                    <Text style={styles.dropdownText}>
                        {createStore.selectedCategory?.name}
                    </Text>
                ) : (
                    <Ionicons name="alert-circle-outline" size={20} color="#aaa" />
                )}
            </TouchableOpacity>

            {dropdownVisible && createStore.categories.length > 0 && (
                <View style={styles.dropdownOverlay}>
                    <View style={styles.dropdownMenu}>
                        {createStore.categories.map((cat: ICategory) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={styles.menuItem}
                                onPress={() => onSelectCategory(cat)}
                            >
                                <Text style={styles.menuItemText}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </View>
    )
}

export default observer(CategorySelector)


const styles = StyleSheet.create({
    base: {
        position: "relative"
    },
    dropdown: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#bbb",
        backgroundColor: "#fff",
        alignItems: "center",
    },
    dropdownDisabled: {
        opacity: 0.5,
    },
    dropdownText: {
        fontSize: 16,
        color: "#333",
    },
    dropdownOverlay: {
        position: "absolute",
        top: 50,
        width: "100%",
        zIndex: 10,
    },
    dropdownMenu: {
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#ddd",
        paddingVertical: 8,
    },
    menuItem: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    menuItemText: {
        fontSize: 16,
        color: "#333",
    },
});
