import { createStore as createCreateStore } from "./createStore";
import { categoryStore as createCategoryStore } from "./categoryStore";
import { searchStore as createSearchStore } from "./searchStore";
import { cardStore as createCardStore } from "./cardStore";
import { trainStore as createTrainStore } from "./trainStore";
import { userStore as createUserStore, UserStore } from "./userStore";
import { authStore as createAuthStore, AuthStore } from "./authStore";

export const initRootStore = () => {
  const auth: AuthStore = createAuthStore();
  const user: UserStore = createUserStore(auth);
  auth.setUserStore(user);

  const category = createCategoryStore(auth);
  const card = createCardStore(category, auth);
  const create = createCreateStore(user, auth);
  const train = createTrainStore(auth);
  const search = createSearchStore();

  return {
    createStore: create,
    categoryStore: category,
    searchStore: search,
    cardStore: card,
    trainStore: train,
    userStore: user,
    authStore: auth,
  };
};

export const rootStore = initRootStore();
