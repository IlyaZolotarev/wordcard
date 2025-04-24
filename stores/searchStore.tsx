import { makeAutoObservable, runInAction } from "mobx"
import { User } from "@supabase/supabase-js"

const API_KEY = "jo6QkOv9KAgbbrMpbtZtmMkBxPRlM2PbjOVJKoJYXXwJNp2KmLo3G8bt"
const PEXELS_URL = "https://api.pexels.com/v1/search"
const PER_PAGE = 20

export class SearchStore {
    images: string[] = []
    loading = false
    hasMore = true
    page = 0
    searchText = ""
    selectedImageUrl = ""

    constructor() {
        makeAutoObservable(this)
    }

    setImageUrl = (imageUrl: string) => {
        runInAction(() => {
            this.selectedImageUrl = imageUrl
        })
    }

    setSearchText = (value: string) => {
        runInAction(() => {
            this.searchText = value
        })
    }

    reset = () => {
        runInAction(() => {
            this.images = []
            this.page = 0
            this.hasMore = true
        })
    }

    fetchImages = async (user: User | null, searchText: string) => {
        if (!user || !searchText || this.loading || !this.hasMore) return

        runInAction(() => {
            this.loading = true
            this.page = this.page + 1
        })

        try {
            const res = await fetch(`${PEXELS_URL}?query=${searchText}&per_page=${PER_PAGE}&page=${this.page}`, {
                headers: { Authorization: API_KEY },
            })
            const data = await res.json()
            const urls = data.photos.map((p: any) => p.src.medium)

            this.images = [...this.images, ...urls]

            if (urls.length < PER_PAGE) {
                runInAction(() => {
                    this.hasMore = false
                })
            }
        } catch (error) {
            console.error("Ошибка при загрузке изображений:", error)
        } finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }
}

export const searchStore = () => new SearchStore()
