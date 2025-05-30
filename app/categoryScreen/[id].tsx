import { StyleSheet, View, BackHandler, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useStores } from "@/stores/storeContext";
import CategoryHeader from "@/components/categoryHeader";
import TrainModal from "@/components/modals/trainModal";
import ImageSearchModal from "@/components/modals/imageSearchModal";
import ObservedCardList from "@/components/observedCardList";
import { useEffect, useState, useRef, useCallback } from "react";

const MIN_CARDS = 4;

const CategoryScreen = () => {
    const { categoryStore, cardStore } = useStores();
    const { id: categoryId } = useLocalSearchParams();
    const router = useRouter();

    const [isTemplates, showTemplates] = useState(false);
    const [showTrainModal, setTrainModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);

    const templateRefs = useRef<
        React.RefObject<{ cardTemplateShake: () => void }>[]
    >([]);

    useEffect(() => {
        if (categoryId) {
            categoryStore.fetchCardsByCategoryId(categoryId as string);
        }
        return () => {
            categoryStore.resetCards();
            cardStore.resetSelection();
        };
    }, []);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                if (cardStore.selectionMode) {
                    cardStore.resetSelection();
                    return true;
                }
                return false;
            }
        );
        return () => backHandler.remove();
    }, []);

    const navigateToTrainScreen = useCallback(
        (cardsCount?: number) => {
            router.push({
                pathname: "/trainScreen",
                params: { categoryId, cardsCount },
            });
        },
        [categoryId]
    );

    const onTrainHandler = () => {
        if (categoryStore.fetchCardsLoading) return;

        // if (cardStore.selectionMode && cardStore.selectedCards.length === 0) {
        //     cardStore.toggleSelectionMode(false)
        // } // TODO: Finish selected card train

        const cards = categoryStore.cards;
        const neededTemplates = Math.max(0, MIN_CARDS - cards.length);

        if (!isTemplates && neededTemplates > 0) {
            showTemplates(true);
            return;
        }

        if (isTemplates) {
            templateRefs.current[0]?.current?.cardTemplateShake();
            return;
        }

        if (!showTrainModal) {
            setTrainModal(true);
            return;
        }

        navigateToTrainScreen();
    };

    const onSearchImage = () => {
        router.push({
            pathname: "/searchScreen",
            params: { fromCategory: "1" },
        });
        setShowSearchModal(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <CategoryHeader />
            </View>
            <ObservedCardList onClickTemplate={() => setShowSearchModal(true)} isTemplates={isTemplates} templateRefs={templateRefs} />
            <TouchableOpacity style={styles.trainButton} onPress={onTrainHandler}>
                <MaterialCommunityIcons name="school" size={24} color="#000" />
            </TouchableOpacity>
            <TrainModal
                visible={showTrainModal}
                onClose={() => setTrainModal(false)}
                onSubmit={navigateToTrainScreen}
            />
            <ImageSearchModal
                visible={showSearchModal}
                onClose={() => setShowSearchModal(false)}
                onSubmit={onSearchImage}
            />
        </View>
    );
};

export default CategoryScreen;

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { marginBottom: 24 },
    trainButton: {
        width: 80,
        position: "absolute",
        justifyContent: "center",
        bottom: 12,
        alignSelf: "center",
        paddingVertical: 12,
        paddingHorizontal: 24,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        borderColor: "#b6b6b6",
        borderWidth: 1,
    },
});
