import { useState } from "react"
import CameraPreviewButton from "@/components/сameraPreviewButton"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import CategoryList from "@/components/categoryList"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import CreateCategoryModal from "@/components/modals/createCategoryModal"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { router } from "expo-router"

export default function Home() {
    const [showModal, setShowModal] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const { user } = useAuth()

    const handleCreateCategory = async (name: string) => {
        if (!user) return

        const { error } = await supabase
            .from("categories")
            .insert({ name, user_id: user.id })

        if (error) {
            console.error("Ошибка при создании категории:", error.message)
        } else {
            setRefreshTrigger(prev => prev + 1)
        }
    }

    const handlePhotoTaken = (uri: string) => {
        if (!user) return

        router.push({
            pathname: "/create",
            params: { image: uri },
        })
    }

    return (
        <View style={styles.content}>
            <View style={styles.previewCameraWrapper}>
                <CameraPreviewButton onPhoto={handlePhotoTaken} />
            </View>
            <CategoryList refreshTrigger={refreshTrigger} />
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
            />
        </View>
    )
}

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
