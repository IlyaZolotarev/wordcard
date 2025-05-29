import { useEffect } from "react"
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { observer } from "mobx-react-lite"
import { useStores } from "@/stores/storeContext"
import { ICategory } from "@/stores/categoryStore"

type Props = {
    visible: boolean,
    setVisible: (isVisible: boolean) => void
}

const CategorySelector = ({ visible, setVisible }: Props) => {
    const { categoryStore } = useStores()

    useEffect(() => {
        categoryStore.fetchCategories()
    }, [])

    const onSelectCategory = (category: ICategory) => {
        categoryStore.setSelectedCategory(category)
        setVisible(false)
    }

    return (
        <View
            style={styles.base}
        >
            <TouchableOpacity
                style={[
                    styles.dropdown,
                    !categoryStore.categories.length && styles.dropdownDisabled,
                ]}
                onPress={() =>
                    categoryStore.categories.length && setVisible(!visible)
                }
                disabled={categoryStore.fetchCategoriesLoading || !categoryStore.categories.length}
            >
                {categoryStore.fetchCategoriesLoading ? (
                    <ActivityIndicator size="small" color="#aaa" />
                ) : categoryStore.categories.length ? (
                    <Text style={styles.dropdownText}>
                        {categoryStore.selectedCategory?.name}
                    </Text>
                ) : (
                    <Ionicons name="alert-circle-outline" size={20} color="#aaa" />
                )}
            </TouchableOpacity>

            {visible && categoryStore.categories.length > 0 && (
                <View style={styles.dropdownOverlay}>
                    <View style={styles.dropdownMenu}>
                        {categoryStore.categories.map((cat: ICategory) => (
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
