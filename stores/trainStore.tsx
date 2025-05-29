import { makeAutoObservable, runInAction } from "mobx";
import { supabase } from "@/lib/supabase";
import { ICard } from "@/stores/cardStore";
import uuid from "react-native-uuid";
import AsyncStorage from "@react-native-async-storage/async-storage"
import { AuthStore } from "@/stores/authStore";

interface TrainingTask {
    taskId: string;
    card: {
        id: string;
        imageUrl: string;
        correctWord: string;
        label: string
    };
    answers: {
        cardId: string;
        label: string;
        isCorrect: boolean;
    }[];
    selectedCardId?: string;
    usedHint?: boolean;
}


export class TrainStore {
    cards: ICard[] = [];
    tasks: TrainingTask[] = [];
    currentTaskIndex = 0;
    loading = false;
    authStore: AuthStore

    constructor(authStore: AuthStore) {
        this.authStore = authStore
        makeAutoObservable(this);
    }

    get currentTask() {
        return this.tasks[this.currentTaskIndex] || null;
    }

    goToNextTask() {
        runInAction(() => {
            this.currentTaskIndex++;
        });
    }

    resetTraining() {
        runInAction(() => {
            this.cards = [];
            this.tasks = [];
            this.currentTaskIndex = 0;
        });
    }

    async fetchTrainCards(categoryId: string, cardsCount: string) {
        runInAction(() => {
            this.loading = true;
            this.resetTraining();
        });

        let hasError = false;
        let cards: ICard[] = [];

        try {
            if (!this.authStore.session) {
                const stored = await AsyncStorage.getItem(`local_cards_${categoryId}`);
                const allCards: ICard[] = stored ? JSON.parse(stored) : [];

                const sorted = allCards
                    .sort((a, b) => {
                        const accA = a.accuracy ?? 0;
                        const accB = b.accuracy ?? 0;
                        if (accA !== accB) return accA - accB;

                        const timeA = a.last_shown_at ? new Date(a.last_shown_at).getTime() : 0;
                        const timeB = b.last_shown_at ? new Date(b.last_shown_at).getTime() : 0;
                        return timeA - timeB;
                    })
                    .slice(0, Number(cardsCount));

                cards = sorted;
            } else {
                const { data: primary, error } = await supabase
                    .from("cards")
                    .select("*")
                    .eq("category_id", categoryId)
                    .order("accuracy", { ascending: true })
                    .order("last_shown_at", { ascending: true })
                    .limit(Number(cardsCount));

                if (error) {
                    console.error("Ошибка при получении карточек для тренировки:", error);
                    hasError = true;
                } else {
                    cards = (primary as ICard[]) || [];
                }
            }
        } catch (err) {
            console.error("Ошибка при получении карточек:", err);
            hasError = true;
        }

        runInAction(() => {
            this.loading = false;
            if (!hasError) {
                this.cards = cards;
                this.tasks = this.buildTrainingTasks(cards);
            }
        });
    }


    buildTrainingTasks(cards: ICard[]): TrainingTask[] {
        const shuffled = [...cards].sort(() => Math.random() - 0.5);

        return shuffled.map((card) => {
            const correctCard = card;

            const distractors = cards
                .filter(c => c.id !== card.id)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);

            const allOptions = [...distractors, correctCard]
                .sort(() => Math.random() - 0.5);

            const answerList = allOptions.map((c) => ({
                cardId: c.id,
                label: c.trans_word,
                isCorrect: c.id === correctCard.id,
            }));

            return {
                taskId: uuid.v4(),
                card: {
                    id: correctCard.id,
                    imageUrl: correctCard.image_url,
                    correctWord: correctCard.trans_word,
                    label: correctCard.word
                },
                answers: answerList,
            };
        });
    }

    selectAnswer(taskId: string, selectedCardId: string, categoryId: string) {
        const task = this.tasks.find(t => t.taskId === taskId);
        if (!task || task.selectedCardId !== undefined) return;

        const answer = task.answers.find(a => a.cardId === selectedCardId);
        if (!answer) return;

        const isCorrect = answer.isCorrect;

        runInAction(() => {
            task.selectedCardId = selectedCardId;
        });

        this.submitAnswer(categoryId, task.card.id, isCorrect, task.usedHint ?? false);
    }

    async submitAnswer(
        categoryId: string,
        cardId: string,
        isCorrect: boolean,
        usedHint: boolean = false
    ) {
        const card = this.cards.find((c) => c.id === cardId);
        if (!card) return;

        const now = new Date().toISOString();
        let { success_count = 0, fail_count = 0, streak = 0 } = card;

        if (isCorrect) {
            success_count++;
            if (!usedHint) streak++;
        } else {
            fail_count++;
            streak = 0;
        }

        const accuracy = success_count + fail_count > 0
            ? success_count / (success_count + fail_count)
            : 0;

        const updatedCard = {
            ...card,
            success_count,
            fail_count,
            streak,
            accuracy,
            last_shown_at: now,
        };

        if (!this.authStore.session) {
            const stored = await AsyncStorage.getItem(`local_cards_${categoryId}`);
            const allCards: ICard[] = stored ? JSON.parse(stored) : [];

            const updated = allCards.map((c) =>
                c.id === cardId ? updatedCard : c
            );

            await AsyncStorage.setItem(`local_cards_${categoryId}`, JSON.stringify(updated));
            return;
        }

        const { error } = await supabase
            .from("cards")
            .update({
                success_count,
                fail_count,
                streak,
                accuracy,
                last_shown_at: now,
            })
            .eq("id", cardId);

        if (error) {
            console.error("Ошибка при обновлении карточки:", error);
        }
    }

    getStats() {
        let correct = 0;
        let incorrect = 0;
        let withHint = 0;

        const tasks = this.tasks.map((t) => {
            if (!t.selectedCardId) return null;

            const selected = t.answers.find((a) => a.cardId === t.selectedCardId);
            const result = t.usedHint
                ? "hint"
                : selected?.isCorrect
                    ? "correct"
                    : "incorrect";

            if (result === "correct") correct++;
            if (result === "incorrect") incorrect++;
            if (result === "hint") withHint++;

            return {
                id: t.taskId,
                word: t.card.correctWord,
                result,
                correctWord: result === "incorrect" ? t.card.correctWord : undefined,
            };
        }).filter(Boolean);

        return {
            total: this.tasks.length,
            correct,
            incorrect,
            withHint,
            tasks,
        };
    }
}

export const trainStore = (authStore: AuthStore) => new TrainStore(authStore);
