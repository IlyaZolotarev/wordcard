import { createStore } from "./createStore";
import { categoryStore } from "./categoryStore";
import { searchStore } from "./searchStore";
import { cardStore } from "./cardStore";
import { trainStore } from "./trainStore";
import { userStore } from "./userStore";
import { authStore } from "./authStore";

const auth = authStore();
const user = userStore(auth);
const category = categoryStore(auth);
const card = cardStore(category, auth);
const create = createStore(user, auth);
const train = trainStore(auth);

export const rootStore = {
  createStore: create,
  categoryStore: category,
  searchStore: searchStore(),
  cardStore: card,
  trainStore: train,
  userStore: user,
  authStore: auth,
};
