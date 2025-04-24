import { useRouter } from "expo-router"
import { useEffect } from "react"
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
import { observer } from "mobx-react-lite"
import { useStores } from "@/stores/storeContext"
import { useAuth } from "@/hooks/useAuth"

const SearchScreen = () => {
    const { searchStore } = useStores()
    const router = useRouter()
    const { user } = useAuth()

    useEffect(() => {
        searchStore.fetchImages(user, searchStore.searchText)
    }, [user])

    useEffect(() => {
        return () => {
            searchStore.reset()
        }
    }, [])

    const loadMore = () => {
        searchStore.fetchImages(user, searchStore.searchText)
    }

    if (!searchStore.loading && searchStore.images.length === 0) {
        return (
            <View style={styles.emptyWrapper}>
                <MaterialCommunityIcons name="magnify-close" size={64} color="#ccc" />
            </View>
        )
    }

    const onSelectImage = (imageUrl: string) => {
        searchStore.setImageUrl(imageUrl)
        router.push("/create");
    }

    return (
        <FlatList
            data={searchStore.images}
            keyExtractor={(item, index) => `${item}-${index}`}
            numColumns={2}
            contentContainerStyle={styles.container}
            columnWrapperStyle={styles.row}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
                searchStore.loading ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null
            }
            renderItem={({ item }) => (
                <TouchableOpacity
                    onPress={() => onSelectImage(item)}
                    style={styles.card}
                >
                    <Image source={{ uri: item }} style={styles.image} />
                    <Text style={styles.caption}>{searchStore.searchText}</Text>
                </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
        />
    )
}

export default observer(SearchScreen)

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
