import { createStore } from "./createStore";
import { categoryStore } from "./categoryStore";

export const rootStore = {
  createStore: createStore(),
  categoryStore: categoryStore(),
};
