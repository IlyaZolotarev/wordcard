import { makeAutoObservable, runInAction } from "mobx";
import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import { UserStore } from "@/stores/userStore";
import { AuthStore } from "@/stores/authStore";

export class CreateStore {
    word = "";
    transWord = "";
    userStore: UserStore
    authStore: AuthStore

    constructor(userStore: UserStore, authStore: AuthStore) {
        this.userStore = userStore
        this.authStore = authStore
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

    swapWords = () => {
        const temp = this.word;
        runInAction(() => {
            this.word = this.transWord;
            this.transWord = temp;
        });
    };

    saveCard = async (
        imageUrl: string,
        categoryId: string
    ) => {
        const commonData = {
            word: this.word.trim(),
            trans_word: this.transWord.trim(),
            image_url: imageUrl,
            category_id: categoryId,
            word_lang_code: this.userStore.nativeLangCode,
            trans_word_lang_code: this.userStore.learnLangCode,
        };

        if (!this.authStore.session) {
            const cardWithId = {
                id: uuid.v4(),
                ...commonData,
            };

            const stored = await AsyncStorage.getItem(`local_cards_${categoryId}`);
            const existing = stored ? JSON.parse(stored) : [];

            const updated = [...existing, cardWithId];
            await AsyncStorage.setItem(`local_cards_${categoryId}`, JSON.stringify(updated));
            return;
        }

        const { error } = await supabase.from("cards").insert({
            ...commonData,
            user_id: this.authStore.session.user.id,
        });

        if (error) {
            console.error("Ошибка при сохранении карточки:", error);
        }
    }


    saveCardWithImageStore = async (
        fileName: string,
        arrayBuffer: ArrayBuffer,
        categoryId: string
    ) => {
        if (!this.authStore.session) return

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
            await this.saveCard(signed.signedUrl, categoryId);
        }
    };
}

export const createStore = (userStore: UserStore, authStore: AuthStore) => new CreateStore(userStore, authStore);
