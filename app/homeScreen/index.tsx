import { useState, useEffect } from "react"
import CameraPreviewButton from "@/components/cameraPreviewButton"
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native"
import CategoryList from "@/components/categoryList"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import CreateCategoryModal from "@/components/modals/createCategoryModal"
import { useStores } from "@/stores/storeContext"
import { observer } from "mobx-react-lite"
import MainHeader from "@/components/mainHeader"

const HomeScreen = () => {
    const { categoryStore, searchStore, authStore } = useStores()
    const [showModal, setShowModal] = useState(false)

    const handleCreateCategory = (categoryName: string) => {
        categoryStore.createCategory(categoryName);
    };

    useEffect(() => {
        if (searchStore.searchText) {
            searchStore.searchText = ""
            searchStore.reset()
        }
    })

    useEffect(() => {
        if (!authStore.session?.user.id) {
            authStore.init();
        }
    }, []);

    if (authStore.loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <View style={styles.content}>
            <View style={styles.header}>
                <MainHeader />
            </View>
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
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    content: {
        flex: 1,
        position: 'relative',
    },
    header: {
        marginBottom: 24,
    },
    previewCameraWrapper: {
        marginBottom: 32,
    },
    createCategoryBtn: {
        width: 120,
        position: 'absolute',
        justifyContent: 'center',
        bottom: 12,
        alignSelf: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderColor: '#b6b6b6',
        borderWidth: 1,
    },
})

