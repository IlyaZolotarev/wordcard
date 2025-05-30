import {
    FlatList,
    View,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { observer } from "mobx-react-lite";
import { useStores } from "@/stores/storeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import Card from "@/components/card";
import CardTemplate from "@/components/cardTemplate";
import { ICard } from "@/stores/cardStore";
import React, { createRef } from "react";

type CardOrTemplate = ICard | { id: string };

type Props = {
    isTemplates: boolean;
    templateRefs: React.MutableRefObject<React.RefObject<any>[]>;
    onClickTemplate: () => void;
};

const ObservedCardList = observer(({ isTemplates, templateRefs, onClickTemplate }: Props) => {
    const { categoryStore } = useStores();
    const { id: categoryId } = useLocalSearchParams();
    const cards = categoryStore.cards;
    const fetchCardsLoading = categoryStore.fetchCardsLoading;
    const hasMore = categoryStore.hasMore;
    const isSearchMode = categoryStore.isSearchMode;

    const MIN_CARDS = 4;
    const neededTemplates = Math.max(0, MIN_CARDS - cards.length);

    const templates: { id: string }[] =
        isTemplates && neededTemplates > 0
            ? Array.from({ length: neededTemplates }).map((_, i) => ({
                id: `template-${i}`,
            }))
            : [];

    const combined: CardOrTemplate[] = [...cards, ...templates];

    const loadMore = () => {
        if (!fetchCardsLoading && hasMore) {
            categoryStore.fetchCardsByCategoryId(categoryId as string);
        }
    };

    if (!fetchCardsLoading && cards.length === 0 && !isTemplates) {
        return (
            <View style={styles.emptyWrapper}>
                <MaterialCommunityIcons
                    name={isSearchMode ? "magnify-close" : "folder-open-outline"}
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
                fetchCardsLoading ? (
                    <ActivityIndicator style={{ marginVertical: 20 }} />
                ) : null
            }
            renderItem={({ item }) =>
                "word" in item ? (
                    <Card card={item} />
                ) : (
                    (() => {
                        const index = templates.findIndex((t) => t.id === item.id);
                        if (!templateRefs.current[index]) {
                            templateRefs.current[index] = createRef();
                        }
                        return (
                            <CardTemplate
                                onClick={onClickTemplate}
                                ref={templateRefs.current[index]}
                            />
                        );
                    })()
                )
            }
            showsVerticalScrollIndicator={false}
        />
    );
});

export default ObservedCardList;

const styles = StyleSheet.create({
    emptyWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 60,
    },
    cardListWrapper: {
        paddingBottom: 24,
    },
    row: {
        justifyContent: "space-between",
        marginBottom: 12,
        marginHorizontal: 12,
    },
});
