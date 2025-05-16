import {
    StyleSheet,
    View,
    BackHandler,
    TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useStores } from "@/stores/storeContext";
import { useAuth } from "@/hooks/useAuth";
import CategoryHeader from "@/components/categoryHeader";
import ChoseCardsModal from "@/components/modals/choseCardsModal";
import ObservedCardList from "@/components/observedCardList";
import { useEffect, useState, useRef, useCallback } from "react";

const MIN_CARDS = 4;

const CategoryScreen = () => {
    const { categoryStore, cardStore } = useStores();
    const { user } = useAuth();
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [isTemplates, showTemplates] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const templateRefs = useRef<React.RefObject<{ cardTemplateShake: () => void }>[]>(
        []
    );

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
    }, []);

    const navigateToTrainScreen = useCallback(() => {
        router.push({
            pathname: "/trainScreen",
            params: { categoryId: id },
        });
    }, [id]);

    const onTrainHandler = () => {
        const cards = categoryStore.cards;
        const neededTemplates = Math.max(0, MIN_CARDS - cards.length);

        if (categoryStore.fetchCardsLoading) return;

        if (!isTemplates && neededTemplates > 0) {
            showTemplates(true);
            return;
        }

        if (isTemplates) {
            templateRefs.current[0]?.current?.cardTemplateShake();
            return;
        }

        if (!showModal && cardStore.selectedCards.length === 0) {
            setShowModal(true);
            return;
        }

        navigateToTrainScreen();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <CategoryHeader />
            </View>

            <ObservedCardList
                isTemplates={isTemplates}
                templateRefs={templateRefs}
            />

            <TouchableOpacity style={styles.trainButton} onPress={onTrainHandler}>
                <MaterialCommunityIcons name="school" size={24} color="#000" />
            </TouchableOpacity>

            <ChoseCardsModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={navigateToTrainScreen}
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
