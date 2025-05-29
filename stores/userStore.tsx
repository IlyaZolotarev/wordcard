import { makeAutoObservable, runInAction } from "mobx"
import { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { AuthStore } from "@/stores/authStore";

export class UserStore {
    nativeLangCode = ""
    learnLangCode = ""
    loading = false
    authStore: AuthStore

    constructor(authStore: AuthStore) {
        this.authStore = authStore
        makeAutoObservable(this)
    }

    setLangCodes(native: string, learn: string) {
        runInAction(() => {
            this.nativeLangCode = native
            this.learnLangCode = learn
        });
    }

    fetchLangCode = async () => {
        runInAction(() => {
            this.loading = true
        })

        try {
            if (!this.authStore.session) {
                const [native, learn] = await Promise.all([
                    AsyncStorage.getItem("native_lang"),
                    AsyncStorage.getItem("learn_lang")
                ])

                runInAction(() => {
                    this.nativeLangCode = native ?? "UA"
                    this.learnLangCode = learn ?? "EN"
                })
            } else {
                const { data, error } = await supabase
                    .from("users")
                    .select("native_lang, learn_lang")
                    .eq("id", this.authStore.session.user.id)
                    .single()

                if (error) {
                    console.error("Ошибка при получении языков пользователя:", error)
                } else {
                    runInAction(() => {
                        this.nativeLangCode = data.native_lang ?? "UA"
                        this.learnLangCode = data.learn_lang ?? "EN"
                    })
                }
            }
        } catch (err) {
            console.error("Ошибка в fetchLangCode:", err)
        } finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }
}

export const userStore = (authStore: AuthStore) => new UserStore(authStore)
