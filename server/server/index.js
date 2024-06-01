const path = require("path");
require("dotenv").config();
const express = require("express");

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

const { Client } = require("@notionhq/client");
const notion = new Client({
  auth: process.env.NOTION_KEY,
});

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, "../../client/build")));

async function getPageByProductId(productId) {
  return await notion.databases.query({
    database_id: process.env.NOTION_PRODUCT_DB_ID,
    filter: {
      property: "ID",
      unique_id: {
        equals: parseInt(productId),
      },
    },
  });
}

app.get("/products/id/:id", async (req, resp) => {
  const id = req.params.id;
  const response = await getPageByProductId(id);
  resp.send(response);
});

app.get("/products/type/:type", async (req, resp) => {
  const type = req.params.type.replaceAll("_", " ");
  const response = await notion.databases.query({
    database_id: process.env.NOTION_PRODUCT_DB_ID,
    filter: {
      property: "Type",
      multi_select: {
        contains: type,
      },
    },
  });
  resp.send(response);
});

app.get("/cost/:product_id", async (req, resp) => {
  const productId = req.params.product_id;
  const searchResults = await getPageByProductId(productId);
  const result = searchResults.results ? searchResults.results[0] : undefined;
  // console.log(result);
  const cost = result ? result.properties["Price"].number : 0;
  resp.send({ price: cost });
});

// body: {items: [Card]}
// Card: {name: string, numItems: number, costPerItem: number}
app.put("/purchase", async (req, resp) => {
  const items = req.body.items;

  const salesCreatePageResponse = await notion.pages.create({
    parent: {
      type: "database_id",
      database_id: process.env.NOTION_SALES_DB_ID,
    },
    properties: {
      "Total number items": {
        type: "number",
        number: items.reduce((acc, cur) => acc + cur.numItems, 0),
      },
      "Total cost": {
        type: "number",
        number: items.reduce(
          (acc, cur) => acc + cur.numItems * cur.costPerItem,
          0
        ),
      },
    },
  });
  const saleId = salesCreatePageResponse.properties["ID"].unique_id.number;
  items.forEach(async (product) => {
    const numSold = parseInt(product.numItems);
    if (numSold > 0) {
      const itemName = product.name;
      const costPerItem = parseInt(product.costPerItem);
      const searchResults = await getPageByProductName(itemName);
      const result = searchResults.results
        ? searchResults.results[0]
        : undefined;
      const pageId = result.id;
      const updateResponse = await notion.pages.update({
        page_id: pageId,
        properties: {
          "Total sold": {
            type: "number",
            number: result.properties["Total sold"].number + numSold,
          },
        },
      });
      console.log(`${itemName}: update response: ${updateResponse}`);
      const createResponse = await notion.pages.create({
        parent: {
          type: "database_id",
          database_id: process.env.NOTION_PRODUCT_SALES_DB_ID,
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
            number: costPerItem,
          },
          "Number items": {
            type: "number",
            number: numSold,
          },
          SaleID: {
            type: "number",
            number: saleId,
          },
          ProductID: {
            type: "number",
            number: result.properties["ID"].unique_id.number,
          },
        },
      });
      console.log(`${itemName}: create response: ${createResponse}`);
    }
  });
  resp.send({ data: "response" });
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
