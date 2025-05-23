import { useEffect, useState } from "react";
import { TrainStore } from "@/stores/trainStore";
import { User } from "@supabase/supabase-js";

export const useTrainingSession = (
    store: TrainStore,
    user: User | null,
    categoryId: string,
    cardsCount: string
) => {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            if (categoryId) {
                await store.fetchTrainCards(user, categoryId, cardsCount);
                if (isMounted) setReady(true);
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, [user?.id, categoryId]);

    const current = store.currentTask;
    const next = () => store.goToNextTask();
    const submit = (isCorrect: boolean, usedHint = false) =>
        store.submitAnswer(user, categoryId, current?.card.id || "", isCorrect, usedHint);

    return {
        ready,
        loading: store.loading,
        currentTask: current,
        nextTask: next,
        submitAnswer: submit,
        isFinished: current === null,
    };
};
