import { makeAutoObservable, runInAction } from "mobx";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { ICard } from "@/stores/cardStore";
import uuid from "react-native-uuid";


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

    constructor() {
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

    async fetchTrainCards(user: User, categoryId: string, cardsCount: string) {
        if (!user) return;

        runInAction(() => {
            this.loading = true;
            this.resetTraining();
        });

        let hasError = false;
        let cards: ICard[] = [];
        const now = new Date().toISOString();

        const { data: primary, error: err1 } = await supabase
            .from("cards")
            .select("*")
            .eq("category_id", categoryId)
            .or(`cooldown_until.is.null,cooldown_until.lt.${now}`)
            .order("accuracy", { ascending: true })
            .order("last_shown_at", { ascending: true })
            .limit(Number(cardsCount));

        if (err1) {
            console.error("Ошибка при получении карточек для тренировки:", err1);
            hasError = true;
        } else {
            cards = (primary as ICard[]) || [];
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

    selectAnswer(taskId: string, selectedCardId: string) {
        const task = this.tasks.find(t => t.taskId === taskId);
        if (!task || task.selectedCardId !== undefined) return;

        const answer = task.answers.find(a => a.cardId === selectedCardId);
        if (!answer) return;

        const isCorrect = answer.isCorrect;

        runInAction(() => {
            task.selectedCardId = selectedCardId;
        });

        this.submitAnswer(task.card.id, isCorrect, task.usedHint ?? false);
    }

    async submitAnswer(
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

            const applyCooldown =
                success_count + fail_count >= 3 &&
                success_count / (success_count + fail_count) > 0.85 &&
                streak >= 3 &&
                !usedHint;

            const cooldownUntil = applyCooldown
                ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
                : null;

            const { error } = await supabase
                .from("cards")
                .update({
                    success_count,
                    streak,
                    accuracy: success_count / (success_count + fail_count),
                    last_shown_at: now,
                    cooldown_until: cooldownUntil,
                })
                .eq("id", cardId);

            if (error) console.error("Ошибка при обновлении карточки:", error);
        } else {
            fail_count++;
            streak = 0;

            const { error } = await supabase
                .from("cards")
                .update({
                    fail_count,
                    streak,
                    accuracy: success_count / (success_count + fail_count),
                    last_shown_at: now,
                    cooldown_until: null,
                })
                .eq("id", cardId);

            if (error) console.error("Ошибка при обновлении карточки:", error);
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

export const trainStore = () => new TrainStore();
