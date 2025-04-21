import { makeAutoObservable } from "mobx"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

export interface ICategory {
    id: string,
    name: string
}

export class CreateStore {
    categories: ICategory[] = []
    selectedCategory: ICategory | null = null
    fetchCategoriesLoading = false
    createCategoriesLoading = false

    word = ""
    transWord = ""

    constructor() {
        makeAutoObservable(this)
    }

    setWord = (value: string) => {
        console.log(value)
        this.word = value
    }

    setTransWord = (value: string) => {
        this.transWord = value
    }

    swapWords = () => {
        const temp = this.word
        this.word = this.transWord
        this.transWord = temp
    }

    fetchCategories = async (user: User | null) => {
        if (!user) return
        this.fetchCategoriesLoading = true

        const { data, error } = await supabase
            .from("categories")
            .select("id, name")
            .eq("user_id", user.id)

        if (!error && data) {
            this.categories = data
            this.selectedCategory = data[0] || null
        }

        this.fetchCategoriesLoading = false
    }

    setSelectedCategory = (cat: ICategory) => {
        this.selectedCategory = cat
    }

    createCategory = async (name: string, user: User | null) => {
        if (!user) return
        this.createCategoriesLoading = true

        const { data, error } = await supabase
            .from("categories")
            .insert({ name, user_id: user.id })
            .select("id, name")
            .single()

        this.createCategoriesLoading = false

        if (!error && data) {
            await this.fetchCategories(user)
            this.selectedCategory = data
        }
    }
}

export const createCreateStore = () => new CreateStore()
