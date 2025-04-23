import { makeAutoObservable, runInAction } from "mobx"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

export interface ICategory {
    id: string,
    name: string
}

export class CategoryStore {
    categories: ICategory[] = []
    selectedCategory: ICategory | null = null
    fetchCategoriesLoading = false
    createCategoriesLoading = false
    updateCategoryLoading = false
    deleteCategoryLoading = false

    constructor() {
        makeAutoObservable(this)
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

    updateCategory = async (user: User, categoryId: string, categoryName: string, callback?: () => void) => {
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

    deleteCategory = async (user: User, categoryId: string, callback?: () => void) => {
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
