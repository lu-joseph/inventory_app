import "./App.css";
import Button from "react-bootstrap/Button";
import { useState, useEffect } from "react";

const defaultHeader = { "Content-Type": "application/json" };

// Card: {name: string, numItems: number, costPerItem: number}

function ProductCard(props) {
  // props: {name: string, cards: [Card], setCards: () => void}
  const [cost, setCost] = useState(0);
  const [numSelected, setNumSelected] = useState(0);
  useEffect(() => {
    fetch("/cost/" + props.name, {
      method: "GET",
      headers: defaultHeader,
    })
      .then((res) => res.json())
      .then((data) => {
        setCost(data.price);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props.cards.length === 0) {
      console.log("resetting");
      setNumSelected(0);
      fetch("/cost/" + props.name, {
        method: "GET",
        headers: defaultHeader,
      })
        .then((res) => res.json())
        .then((data) => {
          setCost(data.price);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.cards]);

  const setCards = props.setCards;

  useEffect(() => {
    setCards(
      props.cards
        .filter((val) => val.name !== props.name)
        .concat([
          { name: props.name, numItems: numSelected, costPerItem: cost },
        ])
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cost, numSelected]);

  return (
    <div className="col-sm">
      <div className="product-card">
        {/* <h3>Cost: ${cost}</h3> */}
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
                  .join("")
              );
            }}
          />
        </div>
        <h3>
          {props.name.replaceAll("_", " ")} {props.type}
        </h3>
        <div className="container">
          <div className="row">
            <div className="col">
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
      </div>
    </div>
  );
}

function App() {
  const [selectedItems, setSelectedItems] = useState([]);
  return (
    <div className="App">
      <div className="container">
        <div className="row">
          <h1>Totes</h1>
        </div>
      </div>
      <div className="container">
        <div className="row">
          <ProductCard
            name="Rockstar_tour"
            type="tote"
            cards={selectedItems}
            setCards={setSelectedItems}
          ></ProductCard>
          <ProductCard
            name="Star_girls"
            type="tote"
            cards={selectedItems}
            setCards={setSelectedItems}
          ></ProductCard>
          <ProductCard
            name="Digital_nostalgia"
            type="tote"
            cards={selectedItems}
            setCards={setSelectedItems}
          ></ProductCard>
          <ProductCard
            name="Angel_bathtub"
            type="tote"
            cards={selectedItems}
            setCards={setSelectedItems}
          ></ProductCard>
          <ProductCard
            name="Roommates"
            type="tote"
            cards={selectedItems}
            setCards={setSelectedItems}
          ></ProductCard>
          <ProductCard
            name="Mona_pals"
            type="tote"
            cards={selectedItems}
            setCards={setSelectedItems}
          ></ProductCard>
        </div>
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
