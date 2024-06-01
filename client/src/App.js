import "./App.css";
import Button from "react-bootstrap/Button";
import { useState, useEffect } from "react";

const defaultHeader = { "Content-Type": "application/json" };

// Card: {id: number, numItems: number, costPerItem: number}

// props: {type: string, cards: [Card], setCards: () => void}
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
  }, []);

  return (
    <>
      <div className="row m-4">
        <Button onClick={() => setShowGroup(!showGroup)}>
          <h1>{props.type}</h1>
        </Button>
      </div>
      {/* {showGroup && } */}
      <div
        className="row row-cols-auto m-4"
        style={{ display: showGroup ? "block" : "none" }}
      >
        {productIDs.map((x) => {
          return (
            <ProductCard
              id={x}
              cards={props.cards}
              setCards={props.setCards}
              type={props.type}
            />
          );
        })}
      </div>
    </>
  );
}

function ProductCard(props) {
  // props: {id: number, type: string, cards: [Card], setCards: () => void}
  const [defaultCost, setDefaultCost] = useState(0);
  const [product, setProduct] = useState(null);
  const [cost, setCost] = useState(0);
  const [numSelected, setNumSelected] = useState(0);

  useEffect(() => {
    fetch("/products/id/" + props.id, {
      method: "GET",
      headers: defaultHeader,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.results.length === 1) {
          setProduct(data.results[0].properties);
          setDefaultCost(data.results[0].properties.Price.number);
          setCost(data.results[0].properties.Price.number);
        }
      });
  }, []);

  useEffect(() => {
    if (props.cards && props.cards.length === 0) {
      setNumSelected(0);
      setCost(defaultCost);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.cards]);

  const setCards = props.setCards;

  useEffect(() => {
    if (props.cards) {
      setCards(
        props.cards
          .filter((val) => val.id !== props.id)
          .concat([{ id: props.id, numItems: numSelected, costPerItem: cost }])
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cost, numSelected]);

  return (
    <div className="col-sm align-middle">
      <div className="product-card">
        <div className="input-group mb-3">
          <span className="input-group-text">$</span>
          <input
            type="text"
            className="form-control"
            aria-label="Dollar amount (with dot and two decimal places)"
            value={cost}
            onChange={(e) => {
              setCost(
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
      </div>
    </div>
  );
}

function App() {
  const [selectedItems, setSelectedItems] = useState([]);
  return (
    <div className="App">
      <div className="container">
        <Group type="Tote Bag" />
        <Group type="Memopad" />
        <Group type="Stickersheet" />
        <Group type="Print" />
        <Group type="Keychain" />
        <div className="row">
          <div className="col">
            <Button
              onClick={() => {
                console.log(selectedItems);
                fetch("/purchase", {
                  method: "PUT",
                  headers: defaultHeader,
                  body: JSON.stringify({ items: selectedItems }),
                }).then((resp) => {
                  console.log("response:");
                  console.log(resp);
                  setSelectedItems([]);
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
