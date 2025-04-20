import { useEffect, useState, useRef, useCallback } from "react"
import {
    View,
    StyleSheet,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Pressable,
    Animated,
} from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import CreateCategoryModal from "@/components/modals/createCategoryModal"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import * as Haptics from "expo-haptics"
import { compressAndUploadImage } from "@/lib/upload"
import * as FileSystem from "expo-file-system"
import { triggerShake } from '@/lib/utils';

export default function CreateScreen() {
    const { image, word: rawWord } = useLocalSearchParams()
    const initialWord = Array.isArray(rawWord) ? rawWord[0] : rawWord ?? ""
    const { user } = useAuth()
    const [word, setWord] = useState(initialWord || "")
    const [modalVisible, setModalVisible] = useState(false)
    const [dropdownVisible, setDropdownVisible] = useState(false)
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
    const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null)
    const [loadingCategories, setLoadingCategories] = useState(true)
    const [savingPreloader, setSavingPreloader] = useState(false)
    const imageUri = Array.isArray(image) ? image[0] : image
    const inputWordShake = useRef(new Animated.Value(0)).current
    const editModalIconShake = useRef(new Animated.Value(0)).current
    const [hasError, setHasError] = useState(false)

    const fetchCategories = useCallback(async () => {
        if (!user) return
        setLoadingCategories(true)
        const { data, error } = await supabase
            .from("categories")
            .select("id, name")
            .eq("user_id", user.id)

        if (!error && data) {
            setCategories(data)
            setSelectedCategory(data[0] || null)
        }
        setLoadingCategories(false)
    }, [user])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    const handleSave = async () => {
        if (!imageUri || !user) {
            return
        }

        if (!word.trim()) {
            triggerShake(inputWordShake)
            setHasError(true)
            return
        }

        if (!selectedCategory) {
            triggerShake(editModalIconShake)
            return
        }

        setSavingPreloader(true)

        let finalImageUrl = imageUri

        if (imageUri.startsWith("file://")) {
            try {
                const uploadedUrl = await compressAndUploadImage(imageUri, user.id)
                if (uploadedUrl) {
                    finalImageUrl = uploadedUrl
                    await FileSystem.deleteAsync(imageUri, { idempotent: true })
                } else {
                    throw new Error("Не удалось загрузить изображение.")
                }
            } catch (err) {
                console.error("Ошибка при загрузке изображения:", err)
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
                setSavingPreloader(false)
                return
            }
        }

        const { error } = await supabase.from("cards").insert({
            word,
            image_url: finalImageUrl,
            category_id: selectedCategory.id,
            user_id: user.id,
        })

        setSavingPreloader(false)

        if (error) {
            console.error("Ошибка при сохранении карточки:", error)
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
            return
        }

        router.replace("/home")
    }

    const handleCreateCategory = async (name: string) => {
        if (!user) return
        const { data, error } = await supabase
            .from("categories")
            .insert({ name, user_id: user.id })
            .select("id, name")
            .single()

        if (!error && data) {
            await fetchCategories()
            setSelectedCategory(data)
        }
    }

    const handlerChangeWord = (value: string) => {
        setWord(value)
        setHasError(false)
    }

    return (
        <Pressable style={styles.container} onPress={() => dropdownVisible && setDropdownVisible(false)}>
            <Animated.View style={{ transform: [{ translateX: inputWordShake }] }}>
                <TextInput
                    placeholder="..."
                    value={word}
                    onChangeText={handlerChangeWord}
                    style={[styles.input, hasError && styles.inputError]}
                />
            </Animated.View>

            <Image source={{ uri: imageUri }} style={styles.image} />

            <View style={styles.selectorWrapper}>
                <TouchableOpacity
                    style={[styles.dropdown, !categories.length && styles.dropdownDisabled]}
                    onPress={() => categories.length && setDropdownVisible(!dropdownVisible)}
                    disabled={loadingCategories || !categories.length}
                >
                    {loadingCategories ? (
                        <ActivityIndicator size="small" color="#aaa" />
                    ) : categories.length ? (
                        <Text style={styles.dropdownText}>
                            {selectedCategory?.name || "Выбери категорию"}
                        </Text>
                    ) : (
                        <Ionicons name="alert-circle-outline" size={20} color="#aaa" />
                    )}
                </TouchableOpacity>

                {dropdownVisible && categories.length > 0 && (
                    <View style={styles.dropdownOverlay}>
                        <View style={styles.dropdownMenu}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={styles.menuItem}
                                    onPress={() => {
                                        setSelectedCategory(cat)
                                        setDropdownVisible(false)
                                    }}
                                >
                                    <Text style={styles.menuItemText}>{cat.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </View>

            <View style={styles.saveButtonWrapper}>
                <Animated.View style={{ transform: [{ translateX: editModalIconShake }] }}>
                    <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                        <Ionicons name="add-circle-outline" size={24} color="#333" />
                    </TouchableOpacity>
                </Animated.View>


                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={savingPreloader}>
                    {savingPreloader ? (
                        <ActivityIndicator size={38} color="#fff" />
                    ) : (
                        <MaterialCommunityIcons name="check" size={38} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>

            <CreateCategoryModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleCreateCategory}
            />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    input: {
        borderBottomWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "transparent",
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center'
    },
    inputError: {
        borderColor: "red",
    },
    image: {
        width: "100%",
        height: 200,
        borderRadius: 16,
        marginBottom: 24,
    },
    selectorWrapper: {
        position: "relative",
        marginBottom: 12,
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
    addBtn: {
        alignItems: "center",
        marginTop: 8,
    },
    saveButtonWrapper: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    saveBtn: {
        alignSelf: "center",
        marginTop: 24,
        borderRadius: 40,
        backgroundColor: "#74bd94",
        padding: 6,
    },
})
