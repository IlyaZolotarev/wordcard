import { makeAutoObservable } from "mobx"

export class CreateStore {
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
}

export const createStore = () => new CreateStore()
