import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

// Path to our JSON file that acts as a simple database
const DB_PATH = path.join(process.cwd(), "data", "items.json");

// Ensure the data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create empty database file if it doesn't exist
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]), "utf8");
  }
};

// Read items from the database
const getItems = () => {
  ensureDataDir();
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading items:", error);
    return [];
  }
};

// Write items to the database
const saveItems = (items: any[]) => {
  ensureDataDir();
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error saving items:", error);
    return false;
  }
};

// GET handler to retrieve all items
export async function GET() {
  const items = getItems();
  return NextResponse.json(items);
}

// POST handler to create a new item
export async function POST(request: Request) {
  try {
    const items = getItems();
    const data = await request.json();

    // Calculate total price
    const qty = Number.parseInt(data.qty);
    const unitPrice = Number.parseFloat(data.unitPrice);
    const totalPrice = qty * unitPrice;
    const stock = Number.parseInt(data.stock);

    // Generate new item
    const newItem = {
      id:
        items.length > 0
          ? Math.max(...items.map((item: any) => item.id)) + 1
          : 1,
      selected: false,
      highlighted: data.highlighted || false,
      slNo: items.length + 1,
      partNo: data.partNo,
      qty: qty,
      unitPrice: unitPrice,
      totalPrice: totalPrice,
      stock: stock,
    };

    items.push(newItem);
    saveItems(items);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
