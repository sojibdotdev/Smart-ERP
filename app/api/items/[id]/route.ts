import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

// Path to our JSON file that acts as a simple database
const DB_PATH = path.join(process.cwd(), "data", "items.json");

// Read items from the database
const getItems = () => {
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
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error saving items:", error);
    return false;
  }
};

// GET handler to retrieve a specific item
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number.parseInt(params.id);
  const items = getItems();
  const item = items.find((item: any) => item.id === id);

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

// PATCH handler to update a specific item
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number.parseInt(params.id);
    const items = getItems();
    const itemIndex = items.findIndex((item: any) => item.id === id);

    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const data = await request.json();
    const updatedItem = { ...items[itemIndex], ...data };

    // Recalculate total price if quantity or unit price changed
    if (data.qty || data.unitPrice) {
      const qty = data.qty || items[itemIndex].qty;
      const unitPrice = data.unitPrice || items[itemIndex].unitPrice;
      updatedItem.totalPrice = qty * unitPrice;
    }

    items[itemIndex] = updatedItem;
    saveItems(items);

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a specific item
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number.parseInt(params.id);
    const items = getItems();
    const filteredItems = items.filter((item: any) => item.id !== id);

    if (items.length === filteredItems.length) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    saveItems(filteredItems);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
