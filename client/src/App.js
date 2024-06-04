import "./App.css";
import Button from "react-bootstrap/Button";
import { useState, useEffect } from "react";
import store from "./store.js";
import {
  clear,
  changeQuantity,
  changeTotalPrice,
  append,
  selectCart,
} from "./cartSlice.js";
import { useDispatch, useSelector } from "react-redux";
// Import all of Bootstrap's JS
import * as bootstrap from "bootstrap";

const defaultHeader = { "Content-Type": "application/json" };

function Cross() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-x-lg"
      viewBox="0 0 16 16"
    >
      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
    </svg>
  );
}

function filterNumbers(string) {
  const num = parseInt(
    string
      .split("")
      .filter((char) => !isNaN(parseInt(char)))
      .join("")
  );
  return isNaN(num) ? 0 : num;
}

function CartItem(props) {
  // props: id, name, quantity, totalPrice
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(props.quantity);
  const [totalPrice, setTotalPrice] = useState(props.totalPrice);
  const cart = useSelector(selectCart).cart;
  const [item, setItem] = useState({
    quantity: props.quantity,
    totalPrice: props.totalPrice,
  });
  useEffect(() => {
    if (cart) {
      setItem(cart.find((x) => x.id === props.id));
    }
  }, [cart, props.id]);
  return (
    <li className="list-group-item containe cart-item">
      <div className="row">
        <div className="col"></div>
        <div className="col-10">
          <h3>{props.name}</h3>
        </div>
        <div className="col">
          <Cross></Cross>
        </div>
      </div>
      <div className="row">
        <div className="col input-group mb-3">
          <span className="input-group-text">#</span>
          <input
            type="text"
            className="form-control"
            aria-label=""
            value={quantity}
            onChange={(e) => {
              setQuantity(filterNumbers(e.target.value));
            }}
          />
        </div>
        <div className="col input-group mb-3">
          <span className="input-group-text">$</span>
          <input
            type="text"
            className="form-control"
            aria-label=""
            value={totalPrice}
            onChange={(e) => {
              setTotalPrice(filterNumbers(e.target.value));
            }}
          />
        </div>
      </div>
      <div className="row md-4">
        <div className="col">
          <Button
            id={props.id}
            onClick={() => {
              dispatch(changeQuantity({ id: props.id, newQuantity: quantity }));
              dispatch(
                changeTotalPrice({ id: props.id, newTotalPrice: totalPrice })
              );
            }}
            disabled={
              quantity === item.quantity && totalPrice === item.totalPrice
            }
          >
            Update
          </Button>
        </div>
      </div>
    </li>
  );
}

function Cart(props) {
  const cart = useSelector((state) => state.cart.cart);

  return (
    <div
      className="row m-4"
      style={{ display: cart.length > 0 ? "block" : "none" }}
    >
      <ul className="list-group">
        {Array.isArray(cart) &&
          cart.map((x) => {
            return (
              <CartItem
                id={x.id}
                name={x.name}
                quantity={x.quantity}
                totalPrice={x.quantity * x.pricePerItem}
              />
            );
          })}
      </ul>
    </div>
  );
}

// Card: {id: number, name: string, numItems: number, pricePerItem: number}

// props: {type: string, cards: [Card]}
function Group(props) {
  const [productIDs, setProductIDs] = useState([]);
  const [showGroup, setShowGroup] = useState(false);

  useEffect(() => {
    fetch("/products/type/" + props.type.replaceAll(" ", "_"), {
      method: "GET",
      headers: defaultHeader,
    })
      .then((res) => res.json())
      .then((data) => {
        setProductIDs(
          data.results.map((x) => x.properties["ID"].unique_id.number)
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="row m-4">
        <Button onClick={() => setShowGroup(!showGroup)}>
          <h1>{props.type}</h1>
        </Button>
      </div>
      <div
        className="row row-cols-auto m-4"
        style={{ display: showGroup ? "block" : "none" }}
      >
        {productIDs.map((x) => {
          return <ProductCard key={x} id={x} type={props.type} />;
        })}
      </div>
    </>
  );
}

function ProductCard(props) {
  // props: {id: number, type: string}
  const [defaultPrice, setDefaultPrice] = useState(0);
  const [product, setProduct] = useState(null);
  const [price, setPrice] = useState(0);
  const [numSelected, setNumSelected] = useState(0);

  const dispatch = useDispatch();

  useEffect(() => {
    fetch("/products/id/" + props.id, {
      method: "GET",
      headers: defaultHeader,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.results.length === 1) {
          setProduct(data.results[0].properties);
          setDefaultPrice(data.results[0].properties.Price.number);
          setPrice(data.results[0].properties.Price.number);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const cart = useSelector((state) => state.cart);

  return (
    <div className="col-sm align-middle">
      <div className="product-card">
        <div className="input-group mb-3">
          <span className="input-group-text">$</span>
          <input
            type="text"
            className="form-control"
            aria-label="Dollar amount (with dot and two decimal places)"
            value={price}
            onChange={(e) => {
              setPrice(
                e.target.value
                  .split("")
                  .filter((char) => !isNaN(parseInt(char)))
                  .join("") ?? 0
              );
            }}
          />
        </div>
        <h3>
          {product && product["Product name"].title[0].plain_text} {props.type}
        </h3>
        <div className="selection-container">
          <Button
            className="quantity-change"
            onClick={() => setNumSelected(Math.max(numSelected - 1, 0))}
          >
            -
          </Button>
          {numSelected}
          <Button
            className="quantity-change"
            onClick={() => setNumSelected(numSelected + 1)}
          >
            +
          </Button>
        </div>
        <div>
          <Button
            onClick={() => {
              if (numSelected > 0) {
                dispatch(
                  append({
                    id: props.id,
                    name:
                      product["Product name"].title[0].plain_text +
                      " " +
                      props.type,
                    quantity: numSelected,
                    pricePerItem: price,
                    totalPrice: numSelected * price,
                  })
                );
                setPrice(defaultPrice);
              }
              setNumSelected(0);
            }}
            disabled={numSelected === 0}
          >
            Add to cart
          </Button>
        </div>
      </div>
    </div>
  );
}

function App() {
  // const [selectedItems, setSelectedItems] = useState([]);
  const dispatch = useDispatch();
  const state = store.getState();
  return (
    <div className="App">
      <div className="container">
        <Group type="Tote Bag" />
        <Group type="Memopad" />
        <Group type="Stickersheet" />
        <Group type="Print" />
        <Group type="Keychain" />
        <Group type="Sticker" />
        <Group type="Misc" />
        <div className="row m-4">
          <h2>Cart</h2>
        </div>
        <Cart></Cart>
        <div className="row m-4">
          <Button onClick={() => dispatch(clear())}>Clear cart</Button>
        </div>
        <div className="row m-4">
          <div className="col">
            <Button
              onClick={() => {
                fetch("/purchase", {
                  method: "PUT",
                  headers: defaultHeader,
                  body: JSON.stringify({ items: state.cart }),
                }).then((resp) => {
                  console.log("response:");
                  console.log(resp);
                  dispatch(clear());
                });
              }}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
