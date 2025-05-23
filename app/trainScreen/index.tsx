import {
    StyleSheet,
    View,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    Image,
} from "react-native";
import { observer } from "mobx-react-lite";
import { useTrainingSession } from "@/hooks/useTrainingSession";
import { useStores } from "@/stores/storeContext";
import { useAuth } from "@/hooks/useAuth";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const TrainScreen = () => {
    const { trainStore } = useStores();
    const { user } = useAuth();
    const { categoryId, cardsCount } = useLocalSearchParams();
    const router = useRouter();

    const { ready, loading, currentTask, isFinished, nextTask } =
        useTrainingSession(trainStore, user, categoryId as string, cardsCount as string);

    useEffect(() => {
        if (user === undefined) return;

        if (ready && isFinished && trainStore.tasks.length > 0) {
            router.push("/finishTrainScreen");
        }
    }, [ready, isFinished, user]);

    if (loading || !ready) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!currentTask) return null;

    const isAnswered = !!currentTask.selectedCardId;

    return (
        <View style={styles.container}>
            <Text style={styles.cardTitle}>{currentTask.card.label}</Text>
            <Image source={{ uri: currentTask.card.imageUrl }} style={styles.image} />

            <View style={styles.optionsWrapper}>
                {currentTask.answers.map((answer) => {
                    const isSelected = currentTask.selectedCardId === answer.cardId;
                    const isCorrect = answer.isCorrect;

                    let bgColor = "#fff";
                    if (isAnswered) {
                        if (isSelected && isCorrect) bgColor = "#d0f0c0";
                        else if (isSelected && !isCorrect) bgColor = "#f8d7da";
                        else if (isCorrect) bgColor = "#d0f0c0";
                    }

                    return (
                        <TouchableOpacity
                            key={answer.cardId}
                            style={[styles.option, { backgroundColor: bgColor }]}
                            onPress={() => {
                                if (!isAnswered) {
                                    trainStore.selectAnswer(user, currentTask.taskId, answer.cardId, categoryId as string);
                                }
                            }}
                            disabled={isAnswered}
                        >
                            <Text style={styles.optionText}>{answer.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {
                isAnswered && (
                    <TouchableOpacity onPress={nextTask} style={styles.nextButton}>
                        <MaterialCommunityIcons name="arrow-right" size={32} color="#fff" />
                    </TouchableOpacity>
                )
            }
        </View >
    );
};

export default observer(TrainScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    cardTitle: {
        marginBottom: 8,
        textAlign: 'center',
        fontSize: 24
    },
    image: {
        width: "100%",
        height: 200,
        borderRadius: 12,
        marginBottom: 24,
        backgroundColor: "#eee",
    },
    optionsWrapper: {
        gap: 12,
        marginBottom: 24,
    },
    option: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 12,
        marginHorizontal: 4,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 2,
    },
    optionText: {
        fontSize: 16,
        color: "#333",
        textAlign: "center",
    },
    nextButton: {
        alignSelf: "flex-end",
        borderRadius: 40,
        backgroundColor: "#74bd94",
        padding: 6,
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
    },
});
