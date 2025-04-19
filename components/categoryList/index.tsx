import {
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from "react-native"
import { Text } from "react-native-paper"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { useRouter } from "expo-router"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import EditCategoryModal from "@/components/modals/editCategoryModal"

interface Category {
    id: string
    name: string
    image_url?: string
}

interface Props {
    refreshTrigger?: number
}

export default function CategoryList({ refreshTrigger }: Props) {
    const { user } = useAuth()
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState("")

    const fetchCategories = async () => {
        if (!user) return

        setLoading(true)
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .eq("user_id", user.id)

        if (error) {
            setError(error.message)
        } else {
            setCategories(data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchCategories()
    }, [user, refreshTrigger])

    if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />
    if (error) return <Text style={styles.errorText}>{error}</Text>

    if (categories.length === 0) {
        return (
            <View style={styles.emptyWrapper}>
                <View style={styles.emptyCard}>
                    <MaterialCommunityIcons name="folder-outline" size={48} color="#ccc" />
                </View>
            </View>
        )
    }

    return (
        <>
            <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.list}
                columnWrapperStyle={styles.row}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardContentRow}>
                            <TouchableOpacity
                                style={styles.cardNameArea}
                                activeOpacity={0.7}
                                onPress={() => router.push(`/category/${item.id}`)}
                            >
                                <Text style={styles.title}>{item.name}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setEditingId(item.id)
                                    setEditingName(item.name)
                                }}
                                style={styles.editIconBtn}
                                hitSlop={10}
                            >
                                <MaterialCommunityIcons name="pencil-outline" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <EditCategoryModal
                visible={!!editingId}
                onClose={() => setEditingId(null)}
                categoryId={editingId || ""}
                initialName={editingName}
                onUpdated={fetchCategories}
            />
        </>
    )
}

const styles = StyleSheet.create({
    list: {
        paddingVertical: 12,
    },
    row: {
        justifyContent: "space-between",
        paddingHorizontal: 8,
        marginBottom: 12,
    },
    card: {
        flex: 1,
        backgroundColor: "#F4F4F4",
        padding: 10,
        borderRadius: 12,
        marginHorizontal: 4,
    },
    cardContentRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    cardNameArea: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
    editIconBtn: {
        padding: 4,
    },
    errorText: {
        color: "red",
        textAlign: "center",
    },
    emptyWrapper: {
        alignItems: "center",
        justifyContent: "center",
    },
    emptyCard: {
        width: 140,
        height: 100,
        backgroundColor: "#F4F4F4",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
})
