import { makeAutoObservable, runInAction } from "mobx";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { CategoryStore } from "@/stores/categoryStore"; // 👈 импортируем

export interface ICard {
    id: string;
    word: string;
    trans_word: string;
    image_url: string;
    word_lang_code: string,
    trans_word_lang_code: string
}

export class CardStore {
    selectedCards: ICard[] = [];
    selectionMode = false;
    deleteCardsLoading = false;
    categoryStore: CategoryStore;

    constructor(categoryStore: CategoryStore) {
        this.categoryStore = categoryStore;
        makeAutoObservable(this);
    }

    toggleSelectionMode = (enabled: boolean) => {
        runInAction(() => {
            this.selectionMode = enabled;
            if (!enabled) {
                this.selectedCards = [];
            }
        });
    };

    handleLongPress = (card: ICard) => {
        runInAction(() => {
            this.selectionMode = true;
            this.selectedCards = [card];
        });
    };

    handlePress = (card: ICard) => {
        if (!this.selectionMode) return;

        runInAction(() => {
            const exists = this.selectedCards.find(c => c.id === card.id);
            if (exists) {
                this.selectedCards = this.selectedCards.filter(c => c.id !== card.id);
            } else {
                this.selectedCards = [...this.selectedCards, card];
            }

            if (this.selectedCards.length === 0) {
                this.selectionMode = false;
            }
        });
    };

    isSelected = (cardId: string) => {
        return this.selectedCards.some(card => card.id === cardId);
    };

    resetSelection = () => {
        runInAction(() => {
            this.selectionMode = false;
            this.selectedCards = [];
        });
    };

    deleteSelectedCards = async (user: User | null, categoryId: string) => {
        if (!user || this.selectedCards.length === 0) return;

        runInAction(() => {
            this.deleteCardsLoading = true;
        });

        try {
            const filesToDelete = this.selectedCards
                .map((card) => {
                    if (!card.image_url) return null;
                    const parts = card.image_url.split("/storage/v1/object/sign/cards/");
                    if (!parts[1]) return null;

                    const [pathWithoutToken] = parts[1].split("?");
                    return pathWithoutToken;
                })
                .filter((path): path is string => !!path);

            if (filesToDelete.length > 0) {
                const { error: deleteFilesError } = await supabase
                    .storage
                    .from("cards")
                    .remove(filesToDelete);

                if (deleteFilesError) {
                    console.error("Ошибка при удалении файлов из storage:", deleteFilesError);
                }
            }

            const cardIdsToDelete = this.selectedCards.map(card => card.id);

            const { error: deleteCardsError } = await supabase
                .from("cards")
                .delete()
                .in("id", cardIdsToDelete);

            if (deleteCardsError) {
                console.error("Ошибка при удалении карточек:", deleteCardsError);
            }

            this.resetSelection();

            this.categoryStore.resetCards();
            this.categoryStore.fetchCardsByCategoryId(user, categoryId);

        } catch (err) {
            console.error("Ошибка при удалении выбранных карточек:", err);
        } finally {
            runInAction(() => {
                this.deleteCardsLoading = false;
            });
        }
    };
}

export const cardStore = (categoryStore: CategoryStore) => new CardStore(categoryStore);
