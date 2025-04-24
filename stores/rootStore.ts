import { createStore } from "./createStore";
import { categoryStore } from "./categoryStore";
import { searchStore } from "./searchStore";

export const rootStore = {
  createStore: createStore(),
  categoryStore: categoryStore(),
  searchStore: searchStore(),
};
