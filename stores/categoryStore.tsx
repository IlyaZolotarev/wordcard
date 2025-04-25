import { makeAutoObservable, runInAction } from "mobx"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

export interface ICategory {
    id: string,
    name: string
}

export interface ICard {
    id: string,
    word: string
    trans_word: string
    image_url: string
}
const CARDS_PER_PAGE = 15
export class CategoryStore {
    cards: ICard[] = []
    categories: ICategory[] = []
    selectedCategory: ICategory | null = null
    fetchCategoriesLoading = false
    createCategoriesLoading = false
    updateCategoryLoading = false
    deleteCategoryLoading = false
    fetchImageByLoading = false
    hasMore = true
    page = 0

    constructor() {
        makeAutoObservable(this)
    }

    resetCards = () => {
        runInAction(() => {
            this.cards = []
            this.hasMore = true
            this.page = 0
        })
    }

    fetchCardsById = async (user: User | null, categoryId: string) => {
        if (!user || this.fetchImageByLoading || !this.hasMore) return;

        runInAction(() => {
            this.fetchImageByLoading = true;
        })

        const from = this.page * CARDS_PER_PAGE;
        const to = from + CARDS_PER_PAGE;

        const { data, error } = await supabase
            .from("cards")
            .select("id, word, trans_word, image_url")
            .eq("category_id", categoryId)
            .range(from, to);

        runInAction(() => {
            this.fetchImageByLoading = false;
        })

        if (!error && data) {
            if (data.length < CARDS_PER_PAGE) {
                runInAction(() => {
                    this.hasMore = false;
                })
            }
            runInAction(() => {
                this.cards = [...this.cards, ...data];
                this.page = this.page + 1;
            })
        }
    }

    fetchCategories = async (user: User | null) => {
        if (!user) return

        runInAction(() => {
            this.fetchCategoriesLoading = true
        })

        const { data, error } = await supabase
            .from("categories")
            .select("id, name")
            .eq("user_id", user.id)

        runInAction(() => {
            if (!error && data) {
                this.categories = data
                this.selectedCategory = data[0] || null
            }
            this.fetchCategoriesLoading = false
        })
    }

    setSelectedCategory = (cat: ICategory) => {
        this.selectedCategory = cat
    }

    createCategory = async (name: string, user: User | null) => {
        if (!user) return

        runInAction(() => {
            this.createCategoriesLoading = true
        })

        const { data, error } = await supabase
            .from("categories")
            .insert({ name, user_id: user.id })
            .select("id, name")
            .single()

        runInAction(() => {
            this.createCategoriesLoading = false
        })

        if (!error && data) {
            await this.fetchCategories(user)
            runInAction(() => {
                this.selectedCategory = data
            })
        }
    }

    updateCategory = async (user: User | null, categoryId: string, categoryName: string, callback?: () => void) => {
        if (!user) return
        runInAction(() => {
            this.updateCategoryLoading = true
        })

        const { error } = await supabase
            .from("categories")
            .update({ name: categoryName })
            .eq("id", categoryId)

        runInAction(() => {
            this.updateCategoryLoading = false
        })

        if (!error) {
            if (typeof callback === 'function') {
                callback()
            }
            await this.fetchCategories(user)
        }
    }

    deleteCategory = async (user: User | null, categoryId: string, callback?: () => void) => {
        if (!user) return

        runInAction(() => {
            this.deleteCategoryLoading = true
        })
        await supabase.from("cards").delete().eq("category_id", categoryId);

        const { error } = await supabase
            .from("categories")
            .delete()
            .eq("id", categoryId);

        runInAction(() => {
            this.deleteCategoryLoading = false
        })

        if (!error) {
            if (typeof callback === 'function') {
                callback()
            }
            await this.fetchCategories(user)
        }
    };
}

export const categoryStore = () => new CategoryStore()
