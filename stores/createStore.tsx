import { makeAutoObservable, runInAction } from "mobx"
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js"

export class CreateStore {
    word = ""
    transWord = ""

    constructor() {
        makeAutoObservable(this)
    }

    reset = () => {
        runInAction(() => {
            this.word = ""
            this.transWord = ""
        })
    }

    setWord = (value: string) => {
        runInAction(() => {
            this.word = value
        })
    }

    setTransWord = (value: string) => {
        runInAction(() => {
            this.transWord = value
        })
    }

    swapWords = () => {
        const temp = this.word
        runInAction(() => {
            this.word = this.transWord
            this.transWord = temp
        })
    }

    saveCard = async (user: User | null, imageUrl: string, categoryId: string) => {
        if (!user) return

        const { error } = await supabase.from("cards").insert({
            word: this.word,
            trans_word: this.transWord,
            image_url: imageUrl,
            category_id: categoryId,
            user_id: user.id,
        });

        if (error) {
            console.error("Ошибка при сохранении карточки:", error);
        }
    }

    saveCardWithImageStore = async (user: User | null, fileName: string, arrayBuffer: ArrayBuffer, categoryId: string) => {
        if (!user) return

        const { error } = await supabase.storage
            .from("cards")
            .upload(fileName, arrayBuffer, {
                contentType: "image/jpeg",
                upsert: false,
            });

        if (error) {
            console.error("Ошибка при сохранении карточки в стор:", error);
            return
        }

        const { data: signed } = await supabase.storage
            .from("cards")
            .createSignedUrl(fileName, 60 * 60 * 24 * 7);

        if (signed?.signedUrl) {
            await this.saveCard(user, signed.signedUrl, categoryId)
        }
    }
}

export const createStore = () => new CreateStore()
