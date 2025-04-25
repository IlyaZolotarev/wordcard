import { useState, useEffect } from "react"
import CameraPreviewButton from "@/components/cameraPreviewButton"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import CategoryList from "@/components/categoryList"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import CreateCategoryModal from "@/components/modals/createCategoryModal"
import { useAuth } from "@/hooks/useAuth"
import { useStores } from "@/stores/storeContext"
import { observer } from "mobx-react-lite"

const HomeScreen = () => {
    const { categoryStore, searchStore } = useStores()
    const [showModal, setShowModal] = useState(false)
    const { user } = useAuth()

    const handleCreateCategory = (name: string) => {
        categoryStore.createCategory(name, user);
    };

    useEffect(() => {
        if (searchStore.searchText) {
            searchStore.searchText = ""
            searchStore.reset()
        }
    })

    return (
        <View style={styles.content}>
            <View style={styles.previewCameraWrapper}>
                <CameraPreviewButton />
            </View>
            <CategoryList />
            <TouchableOpacity
                style={styles.createCategoryBtn}
                onPress={() => setShowModal(true)}
            >
                <MaterialCommunityIcons name="plus" size={24} color="#000" />
                <MaterialCommunityIcons name="folder-outline" size={24} color="#000" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
            <CreateCategoryModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleCreateCategory}
                loading={categoryStore.createCategoriesLoading}
            />
        </View>
    )
}

export default observer(HomeScreen)

const styles = StyleSheet.create({
    content: {
        flex: 1,
        position: 'relative',
    },
    previewCameraWrapper: {
        marginBottom: 32,
    },
    createCategoryBtn: {
        width: 160,
        position: 'absolute',
        justifyContent: 'center',
        bottom: 12,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
})
