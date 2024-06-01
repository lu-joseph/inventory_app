const path = require("path");
require("dotenv").config();
const express = require("express");

const PORT = process.env.PORT || 3001;

const app = express();

const { Client } = require("@notionhq/client");
const notion = new Client({
  auth: process.env.NOTION_KEY,
});

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, "../../client/build")));

async function getPageByProductName(productName) {
  return await notion.databases.query({
    database_id: process.env.NOTION_PRODUCT_DB_ID,
    filter: {
      property: "Product name",
      rich_text: {
        equals: productName,
      },
    },
  });
}

app.get("/cost/:item_name", async (req, resp) => {
  const itemName = req.params.item_name.replaceAll("_", " ");
  const searchResults = await getPageByProductName(itemName);
  const result = searchResults.results ? searchResults.results[0] : undefined;
  console.log(result);
  const cost = result ? result.properties["Price"].number : 0;
  resp.send({ price: cost });
});

app.put("/purchase/:item_name/:num_sold", async (req, resp) => {
  const numSold = parseInt(req.params.num_sold);
  const itemName = req.params.item_name.replaceAll("_", " ");
  const searchResults = await getPageByProductName(itemName);
  const result = searchResults.results ? searchResults.results[0] : undefined;
  if (result) {
    const response = await notion.pages.update({
      page_id: result.id,
      properties: {
        "Total sold": {
          type: "number",
          number: result.properties["Total sold"].number + numSold,
        },
      },
    });
  }
  const createResponse = await notion.pages.create({
    parent: {
      type: "database_id",
      database_id: process.env.NOTION_SALES_DB_ID,
    },
    properties: {
      "Product name": {
        title: [
          {
            text: {
              content: itemName,
            },
          },
        ],
      },
      "Cost per item": {
        type: "number",
        number: result.properties["Price"].number,
      },
      "Number items": {
        type: "number",
        number: numSold,
      },
    },
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../../client/build", "index.html"));
});

// All other GET requests not handled before will return our React app
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../../client/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
