import { makeAutoObservable, runInAction } from "mobx";
import { supabase } from "@/lib/supabase";
import { ICard } from "@/stores/cardStore";
import AsyncStorage from "@react-native-async-storage/async-storage"
import { AuthStore } from "@/stores/authStore";

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
    authStore: AuthStore;

    constructor(authStore: AuthStore) {
        this.authStore = authStore;
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

    fetchCardsByCategoryId = async (categoryId: string) => {
        if (this.fetchCardsLoading || !this.hasMore) return;

        runInAction(() => {
            this.fetchCardsLoading = true;
            this.isSearchMode = false;
        });

        try {
            if (!this.authStore.session) {
                const stored = await AsyncStorage.getItem(`local_cards_${categoryId}`);
                const allCards = stored ? JSON.parse(stored) : [];

                const from = this.page * CARDS_PER_PAGE;
                const to = from + CARDS_PER_PAGE;

                const sliced = allCards.slice(from, to);

                runInAction(() => {
                    this.cards = [...this.cards, ...sliced];
                    this.page += 1;
                    this.totalCardCount = allCards.length;
                    this.hasMore = to < allCards.length;
                });

                return;
            }

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
        } catch (err) {
            console.error("Ошибка при загрузке карточек:", err);
        } finally {
            runInAction(() => {
                this.fetchCardsLoading = false;
            });
        }
    }


    searchCardsByWord = async (categoryId: string) => {
        if (!this.searchText.trim() || this.fetchCardsLoading || !this.hasMore) return;

        runInAction(() => {
            this.fetchCardsLoading = true;
            this.isSearchMode = true;
        });

        try {
            const from = this.page * CARDS_PER_PAGE;
            const to = from + CARDS_PER_PAGE;

            if (!this.authStore.session) {
                const stored = await AsyncStorage.getItem(`local_cards_${categoryId}`);
                const allCards = stored ? JSON.parse(stored) : [];

                const search = this.searchText.toLowerCase();
                const filtered = allCards.filter((card: any) =>
                    card.word?.toLowerCase().includes(search) ||
                    card.trans_word?.toLowerCase().includes(search)
                );

                const sliced = filtered.slice(from, to);

                runInAction(() => {
                    if (sliced.length < CARDS_PER_PAGE) this.hasMore = false;

                    this.cards = this.page === 0 ? sliced : [...this.cards, ...sliced];
                    this.page += 1;
                });

                return;
            }

            const { data, error } = await supabase
                .from("cards")
                .select("*")
                .eq("category_id", categoryId)
                .or(`word.ilike.%${this.searchText}%,trans_word.ilike.%${this.searchText}%`)
                .range(from, to - 1);

            if (!error && data) {
                if (data.length < CARDS_PER_PAGE) {
                    runInAction(() => {
                        this.hasMore = false;
                    });
                }

                runInAction(() => {
                    this.cards = this.page === 0 ? data : [...this.cards, ...data];
                    this.page += 1;
                });
            }
        } catch (err) {
            console.error("Ошибка при поиске карточек:", err);
        } finally {
            runInAction(() => {
                this.fetchCardsLoading = false;
            });
        }
    }

    fetchCategories = async () => {
        runInAction(() => {
            this.fetchCategoriesLoading = true;
        });

        if (!this.authStore.session) {
            const stored = await AsyncStorage.getItem("local_categories");
            const data = stored ? JSON.parse(stored) : [];

            runInAction(() => {
                this.categories = data;
                this.selectedCategory = data[0] || null;
                this.fetchCategoriesLoading = false;
            });

            return;
        }

        const { data, error } = await supabase
            .from("categories")
            .select("id, name")
            .eq("user_id", this.authStore.session.user.id);

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

    createCategory = async (name: string) => {
        runInAction(() => {
            this.createCategoriesLoading = true;
        });

        if (!this.authStore.session) {
            const localId = Date.now().toString();
            const category = { id: localId, name };

            const existingRaw = await AsyncStorage.getItem("local_categories");
            const existing = existingRaw ? JSON.parse(existingRaw) : [];
            const updated = [...existing, category];
            await AsyncStorage.setItem("local_categories", JSON.stringify(updated));

            runInAction(() => {
                this.createCategoriesLoading = false;
                this.selectedCategory = category;
            });
            await this.fetchCategories();
            return;
        }

        const { data, error } = await supabase
            .from("categories")
            .insert({ name, user_id: this.authStore.session.user.id })
            .select("id, name")
            .single();

        runInAction(() => {
            this.createCategoriesLoading = false;
        });

        if (!error && data) {
            await this.fetchCategories();
            runInAction(() => {
                this.selectedCategory = data;
            });
        }
    }

    updateCategory = async (
        categoryId: string,
        categoryName: string,
        callback?: () => void
    ) => {
        runInAction(() => {
            this.updateCategoryLoading = true;
        });

        try {
            if (!this.authStore.session) {
                const stored = await AsyncStorage.getItem("local_categories");
                const categories = stored ? JSON.parse(stored) : [];

                const updated = categories.map((cat: any) =>
                    cat.id === categoryId ? { ...cat, name: categoryName } : cat
                );

                await AsyncStorage.setItem("local_categories", JSON.stringify(updated));

                if (typeof callback === "function") {
                    callback();
                }

                await this.fetchCategories();
                return;
            }

            const { error } = await supabase
                .from("categories")
                .update({ name: categoryName })
                .eq("id", categoryId);

            if (!error) {
                if (typeof callback === "function") {
                    callback();
                }

                await this.fetchCategories();
            }
        } catch (err) {
            console.error("Ошибка при обновлении категории:", err);
        } finally {
            runInAction(() => {
                this.updateCategoryLoading = false;
            });
        }
    }

    deleteCategory = async (categoryId: string, callback?: () => void) => {
        runInAction(() => {
            this.deleteCategoryLoading = true;
        });

        try {
            if (!this.authStore.session) {
                const storedCategories = await AsyncStorage.getItem("local_categories");
                const categories = storedCategories ? JSON.parse(storedCategories) : [];

                const updatedCategories = categories.filter((cat: any) => cat.id !== categoryId);
                await AsyncStorage.setItem("local_categories", JSON.stringify(updatedCategories));

                await AsyncStorage.removeItem(`local_cards_${categoryId}`);

                if (typeof callback === "function") {
                    callback();
                }

                await this.fetchCategories();
                return;
            }

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

            if (typeof callback === "function") {
                callback();
            }

            await this.fetchCategories();

        } catch (err) {
            console.error("Ошибка при удалении категории:", err);
        } finally {
            runInAction(() => {
                this.deleteCategoryLoading = false;
            });
        }
    }

}

export const categoryStore = (authStore: AuthStore) => new CategoryStore(authStore);
