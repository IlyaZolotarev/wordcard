import { makeAutoObservable, runInAction } from "mobx";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class CreateStore {
    word = "";
    transWord = "";
    wordLangCode = "";
    transWordLangCode = "";

    constructor() {
        makeAutoObservable(this);
    }

    reset = () => {
        runInAction(() => {
            this.word = "";
            this.transWord = "";
        });
    };

    setWord = (value: string) => {
        runInAction(() => {
            this.word = value;
        });
    };

    setTransWord = (value: string) => {
        runInAction(() => {
            this.transWord = value;
        });
    };

    setWordLangCode = (code: string) => {
        runInAction(() => {
            this.wordLangCode = code;
        });
    };

    setTransWordLangCode = (code: string) => {
        runInAction(() => {
            this.transWordLangCode = code;
        });
    };

    swapWords = () => {
        const temp = this.word;
        runInAction(() => {
            this.word = this.transWord;
            this.transWord = temp;
        });
    };

    saveCard = async (
        user: User | null,
        imageUrl: string,
        categoryId: string
    ) => {
        const card = {
            id: Date.now().toString(),
            word: this.word.trim(),
            trans_word: this.transWord.trim(),
            image_url: imageUrl,
            category_id: categoryId,
            word_lang_code: this.wordLangCode,
            trans_word_lang_code: this.transWordLangCode,
        };

        if (!user) {
            const stored = await AsyncStorage.getItem(`local_cards_${categoryId}`);
            const existing = stored ? JSON.parse(stored) : [];

            const updated = [...existing, card];
            await AsyncStorage.setItem(
                `local_cards_${categoryId}`,
                JSON.stringify(updated)
            );

            return;
        }

        const { error } = await supabase.from("cards").insert({
            ...card,
            user_id: user.id,
        });

        if (error) {
            console.error("Ошибка при сохранении карточки:", error);
        }
    };

    saveCardWithImageStore = async (
        user: User | null,
        fileName: string,
        arrayBuffer: ArrayBuffer,
        categoryId: string
    ) => {
        if (!user) return;

        const { error } = await supabase.storage
            .from("cards")
            .upload(fileName, arrayBuffer, {
                contentType: "image/jpeg",
                upsert: false,
            });

        if (error) {
            console.error("Ошибка при сохранении карточки в стор:", error);
            return;
        }

        const { data: signed } = await supabase.storage
            .from("cards")
            .createSignedUrl(fileName, 60 * 60 * 24 * 7);

        if (signed?.signedUrl) {
            await this.saveCard(user, signed.signedUrl, categoryId);
        }
    };
}

export const createStore = () => new CreateStore();
