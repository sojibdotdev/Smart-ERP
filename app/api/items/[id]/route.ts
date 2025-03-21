import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// MongoDB connection URI
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectToDB() {
  await client.connect();
  const db = client.db("parts_corner");
  return db.collection("items");
}

// GET handler to retrieve a specific item
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const collection = await connectToDB();
    const item = await collection.findOne({ _id: new ObjectId(params.id) });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// PATCH handler to update a specific item
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const collection = await connectToDB();
    const data = await request.json();

    // Find the item to update
    const item = await collection.findOne({ _id: new ObjectId(params.id) });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Update the item
    const updatedItem = { ...item, ...data };

    // Recalculate total price if quantity or unit price changed
    if (data.qty || data.unitPrice) {
      const qty = data.qty || item.qty;
      const unitPrice = data.unitPrice || item.unitPrice;
      updatedItem.totalPrice = qty * unitPrice;
    }

    // Save the updated item
    await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updatedItem }
    );

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// DELETE handler to remove a specific item
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const collection = await connectToDB();

    // Delete the item
    const result = await collection.deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
