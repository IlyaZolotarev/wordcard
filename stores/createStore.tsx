import { makeAutoObservable, runInAction } from "mobx"

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
}

export const createStore = () => new CreateStore()
