import { createStore } from "./createStore";
import { categoryStore } from "./categoryStore";
import { searchStore } from "./searchStore";
import { cardStore } from "./cardStore";
import { trainStore } from "./trainStore";
import { userStore } from "./userStore";

const category = categoryStore();
const user = userStore();
const card = cardStore(category);
const create = createStore(user);

export const rootStore = {
  createStore: create,
  categoryStore: category,
  searchStore: searchStore(),
  cardStore: card,
  trainStore: trainStore(),
  userStore: user,
};
