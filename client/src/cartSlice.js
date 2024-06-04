import { createSlice } from "@reduxjs/toolkit";

// cart items: {id, name, quantity, pricePerItem, totalPrice}

const initialState = {
  cart: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    append: (state, action) => {
      state.cart.push(action.payload);
    },
    remove: (state, action) => {
      state.cart.splice(action.payload, 1);
    },
    clear: (state) => {
      state.cart = [];
    },
    changeQuantity: (state, action) => {
      const { id, newQuantity } = action.payload;
      const item = state.cart.find((x) => x.id === id);
      if (item) {
        item.quantity = newQuantity;
      }
    },
    changePricePerItem: (state, action) => {
      const { id, newPricePerItem } = action.payload;
      const item = state.cart.find((x) => x.id === id);
      if (item) {
        item.pricePerItem = newPricePerItem;
      }
    },
    changeTotalPrice: (state, action) => {
      const { id, newTotalPrice } = action.payload;
      const item = state.cart.find((x) => x.id === id);
      if (item) {
        item.totalPrice = newTotalPrice;
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  append,
  clear,
  changeQuantity,
  changePricePerItem,
  changeTotalPrice,
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectCart = (state) => state.cart;
