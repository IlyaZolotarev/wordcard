import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
    StyleSheet,
    ActivityIndicator,
    View,
    Image,
    Text,
    FlatList,
    TouchableOpacity,
} from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

const API_KEY = "jo6QkOv9KAgbbrMpbtZtmMkBxPRlM2PbjOVJKoJYXXwJNp2KmLo3G8bt"
const PEXELS_URL = "https://api.pexels.com/v1/search"
const PER_PAGE = 20

export default function SearchScreen() {
    const { q } = useLocalSearchParams()
    const router = useRouter()
    const [images, setImages] = useState<string[]>([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    const fetchImages = async (pageToLoad: number) => {
        if (!q || loading || !hasMore) return
        setLoading(true)

        try {
            const res = await fetch(`${PEXELS_URL}?query=${q}&per_page=${PER_PAGE}&page=${pageToLoad}`, {
                headers: { Authorization: API_KEY },
            })
            const data = await res.json()
            const urls = data.photos.map((p: any) => p.src.medium)

            setImages(prev => [...prev, ...urls])
            if (urls.length < PER_PAGE) setHasMore(false)
        } catch (error) {
            console.error("Ошибка при загрузке изображений:", error)
        }

        setLoading(false)
    }

    useEffect(() => {
        setImages([])
        setPage(1)
        setHasMore(true)
        fetchImages(1)
    }, [q])

    const loadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1
            setPage(nextPage)
            fetchImages(nextPage)
        }
    }

    if (!loading && images.length === 0) {
        return (
            <View style={styles.emptyWrapper}>
                <MaterialCommunityIcons name="magnify-close" size={64} color="#ccc" />
            </View>
        )
    }

    return (
        <FlatList
            data={images}
            keyExtractor={(item, index) => `${item}-${index}`}
            numColumns={2}
            contentContainerStyle={styles.container}
            columnWrapperStyle={styles.row}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
                loading ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null
            }
            renderItem={({ item }) => (
                <TouchableOpacity
                    onPress={() => router.push({
                        pathname: "/create",
                        params: { image: item, word: String(q) }
                    })}
                    style={styles.card}
                >
                    <Image source={{ uri: item }} style={styles.image} />
                    <Text style={styles.caption}>{q}</Text>
                </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
        />
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        paddingTop: 16,
        paddingBottom: 24,
    },
    row: {
        justifyContent: "space-between",
        marginBottom: 12,
    },
    card: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    image: {
        width: '100%',
        height: 120,
    },
    caption: {
        padding: 8,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    emptyWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 60,
    },
})
