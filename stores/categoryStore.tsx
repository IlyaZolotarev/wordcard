import { makeAutoObservable, runInAction } from "mobx";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { ICard } from "@/stores/cardStore";

export interface ICategory {
    id: string,
    name: string
}


const CARDS_PER_PAGE = 20;

export class CategoryStore {
    cards: ICard[] = [];
    categories: ICategory[] = [];
    selectedCategory: ICategory | null = null;
    fetchCategoriesLoading = false;
    createCategoriesLoading = false;
    updateCategoryLoading = false;
    deleteCategoryLoading = false;
    fetchCardsLoading = false;
    hasMore = true;
    page = 0;
    searchText = ""
    isSearchMode = false
    totalCardCount = 0

    constructor() {
        makeAutoObservable(this);
    }

    resetCards = () => {
        runInAction(() => {
            this.cards = [];
            this.hasMore = true;
            this.page = 0;
            this.totalCardCount = 0
        });
    }

    setSearchText = (text: string) => {
        runInAction(() => {
            this.searchText = text;
        });
    }

    fetchCardsByCategoryId = async (user: User | null, categoryId: string) => {
        if (!user || this.fetchCardsLoading || !this.hasMore) return;

        runInAction(() => {
            this.fetchCardsLoading = true;
            this.isSearchMode = false;
        });

        const from = this.page * CARDS_PER_PAGE;
        const to = from + CARDS_PER_PAGE - 1;

        const [cardsRes, countRes] = await Promise.all([
            supabase
                .from("cards")
                .select("*")
                .eq("category_id", categoryId)
                .range(from, to),
            supabase
                .from("cards")
                .select("*", { count: "exact", head: true })
                .eq("category_id", categoryId),
        ]);

        runInAction(() => {
            this.fetchCardsLoading = false;
        });

        if (!cardsRes.error && cardsRes.data) {
            if (cardsRes.data.length < CARDS_PER_PAGE) {
                runInAction(() => {
                    this.hasMore = false;
                });
            }

            runInAction(() => {
                this.cards = [...this.cards, ...cardsRes.data];
                this.page += 1;
            });
        }

        if (!countRes.error && typeof countRes.count === "number") {
            runInAction(() => {
                this.totalCardCount = countRes.count as number;
            });
        }
    };


    searchCardsByWord = async (user: User | null, categoryId: string) => {
        if (!user || !this.searchText.trim() || this.fetchCardsLoading || !this.hasMore) return;

        runInAction(() => {
            this.fetchCardsLoading = true;
            this.isSearchMode = true;
        });

        const from = this.page * CARDS_PER_PAGE;
        const to = from + CARDS_PER_PAGE - 1;

        const { data, error } = await supabase
            .from("cards")
            .select("*")
            .eq("category_id", categoryId)
            .or(`word.ilike.%${this.searchText}%,trans_word.ilike.%${this.searchText}%`)
            .range(from, to);

        runInAction(() => {
            this.fetchCardsLoading = false;
        });

        if (!error && data) {
            if (data.length < CARDS_PER_PAGE) {
                runInAction(() => {
                    this.hasMore = false;
                });
            }
            runInAction(() => {
                if (this.page === 0) {
                    this.cards = data;
                } else {
                    this.cards = [...this.cards, ...data];
                }
                this.page += 1;
            });
        }
    }

    fetchCategories = async (user: User | null) => {
        if (!user) return;

        runInAction(() => {
            this.fetchCategoriesLoading = true;
        });

        const { data, error } = await supabase
            .from("categories")
            .select("id, name")
            .eq("user_id", user.id);

        runInAction(() => {
            if (!error && data) {
                this.categories = data;
                this.selectedCategory = data[0] || null;
            }
            this.fetchCategoriesLoading = false;
        });
    }

    setSelectedCategory = (cat: ICategory) => {
        this.selectedCategory = cat;
    }

    createCategory = async (name: string, user: User | null) => {
        if (!user) return;

        runInAction(() => {
            this.createCategoriesLoading = true;
        });

        const { data, error } = await supabase
            .from("categories")
            .insert({ name, user_id: user.id })
            .select("id, name")
            .single();

        runInAction(() => {
            this.createCategoriesLoading = false;
        });

        if (!error && data) {
            await this.fetchCategories(user);
            runInAction(() => {
                this.selectedCategory = data;
            });
        }
    }

    updateCategory = async (user: User | null, categoryId: string, categoryName: string, callback?: () => void) => {
        if (!user) return;

        runInAction(() => {
            this.updateCategoryLoading = true;
        });

        const { error } = await supabase
            .from("categories")
            .update({ name: categoryName })
            .eq("id", categoryId);

        runInAction(() => {
            this.updateCategoryLoading = false;
        });

        if (!error) {
            if (typeof callback === 'function') {
                callback();
            }
            await this.fetchCategories(user);
        }
    }

    deleteCategory = async (user: User | null, categoryId: string, callback?: () => void) => {
        if (!user) return;

        runInAction(() => {
            this.deleteCategoryLoading = true;
        });

        try {
            const { data: cards, error: fetchError } = await supabase
                .from("cards")
                .select("image_url")
                .eq("category_id", categoryId);

            if (fetchError) {
                console.error("Ошибка при получении карточек:", fetchError);
                return;
            }

            const filesToDelete = (cards || [])
                .map((card: any) => {
                    if (!card.image_url) return null;
                    const parts = card.image_url.split("/storage/v1/object/sign/cards/");
                    if (!parts[1]) return null;

                    const [pathWithoutToken] = parts[1].split("?");
                    return pathWithoutToken;
                })
                .filter((path) => !!path);

            if (filesToDelete.length > 0) {
                const { error: deleteFilesError } = await supabase
                    .storage
                    .from("cards")
                    .remove(filesToDelete);

                if (deleteFilesError) {
                    console.error("Ошибка при удалении файлов:", deleteFilesError);
                }
            }

            const { error: deleteCardsError } = await supabase
                .from("cards")
                .delete()
                .eq("category_id", categoryId);

            if (deleteCardsError) {
                console.error("Ошибка при удалении карточек:", deleteCardsError);
                return;
            }

            const { error: deleteCategoryError } = await supabase
                .from("categories")
                .delete()
                .eq("id", categoryId);

            if (deleteCategoryError) {
                console.error("Ошибка при удалении категории:", deleteCategoryError);
                return;
            }

            if (typeof callback === 'function') {
                callback();
            }

            await this.fetchCategories(user);

        } catch (err) {
            console.error("Ошибка при удалении категории:", err);
        } finally {
            runInAction(() => {
                this.deleteCategoryLoading = false;
            });
        }
    };
}

export const categoryStore = () => new CategoryStore();
