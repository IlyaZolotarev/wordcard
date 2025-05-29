import { useEffect, useState } from "react";
import { TrainStore } from "@/stores/trainStore";

export const useTrainingSession = (
    store: TrainStore,
    categoryId: string,
    cardsCount: string
) => {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            if (categoryId) {
                await store.fetchTrainCards(categoryId, cardsCount);
                if (isMounted) setReady(true);
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, [categoryId]);

    const current = store.currentTask;
    const next = () => store.goToNextTask();
    const submit = (isCorrect: boolean, usedHint = false) =>
        store.submitAnswer(categoryId, current?.card.id || "", isCorrect, usedHint);

    return {
        ready,
        loading: store.loading,
        currentTask: current,
        nextTask: next,
        submitAnswer: submit,
        isFinished: current === null,
    };
};
