import { createContext, useContext } from "react"
import { rootStore } from "./rootStore"

export const StoreContext = createContext(rootStore)

export const useStores = () => useContext(StoreContext)