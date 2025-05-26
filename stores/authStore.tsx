import { makeAutoObservable, runInAction } from "mobx"
import { supabase } from "@/lib/supabase"
import { router } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"

export class AuthStore {
    email = ""
    password = ""
    confirmPassword = ""
    error = ""
    loading = false

    constructor() {
        makeAutoObservable(this)
    }

    setEmail = (val: string) => (this.email = val)
    setPassword = (val: string) => (this.password = val)
    setConfirmPassword = (val: string) => (this.confirmPassword = val)

    reset = () => {
        this.email = ""
        this.password = ""
        this.confirmPassword = ""
        this.error = ""
    }

    validate = () => {
        if (!this.email.trim() || !this.password.trim() || !this.confirmPassword.trim()) {
            this.error = "Пожалуйста, заполните все поля"
            return false
        }

        if (this.password.length < 6) {
            this.error = "Пароль должен быть не менее 6 символов"
            return false
        }

        if (this.password !== this.confirmPassword) {
            this.error = "Пароли не совпадают"
            return false
        }

        return true
    }

    register = async () => {
        this.error = ""
        if (!this.validate()) return

        runInAction(() => {
            this.loading = true
        })

        const { data: signUpData, error } = await supabase.auth.signUp({
            email: this.email,
            password: this.password,
        })

        runInAction(() => {
            this.loading = false
        })

        if (error || !signUpData?.user) {
            runInAction(() => {
                this.error = error?.message || "Ошибка регистрации"
            })
            return
        }

        router.replace("/checkEmailScreen")
    }

    login = async () => {
        this.error = ""

        if (!this.email.trim() || !this.password.trim()) {
            this.error = "Введите email и пароль"
            return
        }

        runInAction(() => {
            this.loading = true
        })

        const { data, error } = await supabase.auth.signInWithPassword({
            email: this.email,
            password: this.password,
        })

        runInAction(() => {
            this.loading = false
        })

        if (error || !data?.user) {
            runInAction(() => {
                this.error = error?.message || "Ошибка входа"
            })
            return
        }

        await this.syncLocalDataToSupabase(data.user.id)

        runInAction(() => {
            this.reset()
        })

        router.replace("/homeScreen")
    }

    handleDeepLink = async (access_token: string, refresh_token: string) => {
        try {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });

            if (error) {
                this.error = error.message || "Ошибка установки сессии";
                return;
            }

            const { data: userData, error: userError } = await supabase.auth.getUser();
            const userId = userData?.user?.id;

            if (userError || !userId) {
                this.error = "Не удалось получить ID пользователя";
                return;
            }

            await this.syncLocalDataToSupabase(userId);
            await AsyncStorage.clear();
            router.replace("/homeScreen");
        } catch (err) {
            console.error("💥 Ошибка в handleDeepLink:", err);
            this.error = "Не удалось авторизоваться";
        }
    };

    private syncLocalDataToSupabase = async (userId: string) => {
        const [nativeLang, learnLang] = await Promise.all([
            AsyncStorage.getItem("native_lang"),
            AsyncStorage.getItem("learn_lang"),
        ])

        if (nativeLang || learnLang) {
            const { error } = await supabase
                .from("users")
                .upsert({
                    id: userId,
                    native_lang: nativeLang,
                    learn_lang: learnLang,
                })
                .select()
                .single();

            if (error) {
                console.error("Ошибка upsert в users", error.message);
            }
        }

        const storedCategories = await AsyncStorage.getItem("local_categories")
        const parsedCategories = storedCategories ? JSON.parse(storedCategories) : []

        for (const cat of parsedCategories) {
            const { data: inserted, error } = await supabase
                .from("categories")
                .insert({ name: cat.name, user_id: userId })
                .select("id")
                .single()

            if (!inserted || error) continue

            const localCardsRaw = await AsyncStorage.getItem(`local_cards_${cat.id}`)
            const localCards = localCardsRaw ? JSON.parse(localCardsRaw) : []

            const cardsToInsert = localCards.map((c: any) => ({
                word: c.word,
                trans_word: c.trans_word,
                image_url: c.image_url,
                category_id: inserted.id,
                user_id: userId,
                word_lang_code: c.word_lang_code,
                trans_word_lang_code: c.trans_word_lang_code,
            }))

            if (cardsToInsert.length > 0) {
                await supabase.from("cards").insert(cardsToInsert)
            }
        }
    }
}

export const authStore = () => new AuthStore()
