import {
    FlatList,
    StyleSheet,
    View,
    BackHandler,
    ActivityIndicator,
    TouchableOpacity
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useStores } from "@/stores/storeContext";
import { observer } from "mobx-react-lite";
import { useEffect, useState, useRef, createRef } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CategoryHeader from "@/components/categoryHeader";
import Card from "@/components/card";
import CardTemplate from "@/components/cardTemplate";
import { ICard } from '@/stores/cardStore';

type CardOrTemplate = ICard | { id: string };

const CategoryScreen = () => {
    const { categoryStore, cardStore } = useStores();
    const { user } = useAuth();
    const { id } = useLocalSearchParams();
    const [trainingMode, setTrainingMode] = useState(false);
    const templateRefs = useRef<React.RefObject<{ cardTemplateShake: () => void }>[]>([]);

    useEffect(() => {
        if (id) {
            categoryStore.fetchCardsByCategoryId(user, id as string);
        }
        return () => {
            categoryStore.resetCards();
            cardStore.resetSelection();
        };
    }, [user]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            if (cardStore.selectionMode) {
                cardStore.resetSelection();
                return true;
            }
            return false;
        });

        return () => backHandler.remove();
    }, [cardStore.selectionMode]);

    const loadMore = () => {
        if (!categoryStore.fetchCardsLoading && categoryStore.hasMore) {
            categoryStore.fetchCardsByCategoryId(user, id as string);
        }
    };

    const onTrainHandler = () => {
        if (trainingMode) {
            templateRefs.current[0]?.current?.cardTemplateShake();
        }
        setTrainingMode(true)
    }

    const renderContent = () => {
        const cards = categoryStore.cards;
        const MIN_CARDS = 4;
        const neededTemplates = Math.max(0, MIN_CARDS - cards.length);

        const templates: { id: string }[] =
            trainingMode && neededTemplates > 0
                ? Array.from({ length: neededTemplates }).map((_, i) => ({
                    id: `template-${i}`,
                }))
                : [];

        const combined: CardOrTemplate[] = [...cards, ...templates];

        if (!categoryStore.fetchCardsLoading && cards.length === 0 && !trainingMode) {
            return (
                <View style={styles.emptyWrapper}>
                    <MaterialCommunityIcons
                        name={categoryStore.isSearchMode ? "magnify-close" : "folder-open-outline"}
                        size={64}
                        color="#ccc"
                    />
                </View>
            );
        }

        return (
            <FlatList
                data={combined}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.cardListWrapper}
                columnWrapperStyle={styles.row}
                onEndReached={loadMore}
                onEndReachedThreshold={0.4}
                ListFooterComponent={
                    categoryStore.fetchCardsLoading ? (
                        <ActivityIndicator style={{ marginVertical: 20 }} />
                    ) : null
                }
                renderItem={({ item }) =>
                    "word" in item ? (
                        <Card card={item as ICard} />
                    ) : (
                        (() => {
                            const index = templates.findIndex((t) => t.id === item.id);
                            if (!templateRefs.current[index]) {
                                templateRefs.current[index] = createRef();
                            }
                            return (
                                <CardTemplate
                                    ref={templateRefs.current[index]}
                                    onPress={() => { }}
                                />
                            );
                        })()
                    )
                }
                showsVerticalScrollIndicator={false}
            />
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <CategoryHeader />
            </View>
            {renderContent()}
            <TouchableOpacity
                style={styles.trainButton}
                onPress={onTrainHandler}
            >
                <MaterialCommunityIcons name="school" size={24} color="#000" />
            </TouchableOpacity>
        </View>
    );
};

export default observer(CategoryScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        marginBottom: 24,
    },
    cardListWrapper: {
        paddingBottom: 24,
    },
    row: {
        justifyContent: "space-between",
        marginBottom: 12,
        marginHorizontal: 12,
    },
    emptyWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 60,
    },
    trainButton: {
        width: 80,
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
});
