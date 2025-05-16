import { createStore } from "./createStore";
import { categoryStore } from "./categoryStore";
import { searchStore } from "./searchStore";
import { cardStore } from "./cardStore";
import { trainStore } from "./trainStore";

const category = categoryStore();
const card = cardStore(category);

export const rootStore = {
  createStore: createStore(),
  categoryStore: category,
  searchStore: searchStore(),
  cardStore: card,
  trainStore: trainStore(),
};
