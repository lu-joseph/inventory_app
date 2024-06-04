import { combineReducers } from "redux";

import cartReducer from "./cartSlice.js";

const rootReducer = combineReducers({
  cart: cartReducer,
});

export default rootReducer;
