import "./App.css";
import Button from "react-bootstrap/Button";
import { useState, useEffect } from "react";

const defaultHeader = { "Content-Type": "application/json" };

function ProductCard(props) {
  const [cost, setCost] = useState(0);
  const [numSelected, setNumSelected] = useState(0);
  useEffect(() => {
    fetch("/cost/" + props.name, {
      method: "GET",
      headers: defaultHeader,
    })
      .then((res) => res.json())
      .then((data) => setCost(data.price));
  }, []);
  return (
    <div>
      <h3>Cost: ${cost}</h3>
      <Button
        onClick={() => {
          setNumSelected(0);
          fetch("/purchase/" + props.name + "/" + numSelected, {
            method: "PUT",
            headers: defaultHeader,
          })
            .then((res) => res.json())
            .then((data) => {
              console.log(data);
            });
        }}
      >
        {props.name.replaceAll("_", " ")} {props.type}
      </Button>
      <div className="container">
        <div className="row">
          <div className="col">
            <Button
              onClick={() => setNumSelected(Math.max(numSelected - 1, 0))}
            >
              -
            </Button>
            {numSelected}
            <Button onClick={() => setNumSelected(numSelected + 1)}>+</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <div className="container">
        <div className="row">
          <h1>Totes</h1>
        </div>
      </div>
      <div className="container">
        <div className="row">
          <div className="col">
            <ProductCard name="Rockstar_tour" type="tote"></ProductCard>
          </div>
          <div className="col">
            <ProductCard name="Star_girls" type="tote"></ProductCard>
          </div>
          <div className="col">
            <ProductCard name="Digital_nostalgia" type="tote"></ProductCard>
          </div>
          <div className="col">
            <ProductCard name="Whats_on_your_mind" type="tote"></ProductCard>
          </div>
          <div className="col">
            <ProductCard name="Roommates" type="tote"></ProductCard>
          </div>
          <div className="col">
            <ProductCard name="Mona_plus_pals" type="tote"></ProductCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
