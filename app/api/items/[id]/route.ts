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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const collection = await connectToDB();
    const { id } = await params;
    const item = await collection.findOne({ _id: new ObjectId(id) });

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const collection = await connectToDB(); // Should return a collection, not just client
    const data = await request.json();
    const { id } = await params;

    const item = await collection.findOne({ _id: new ObjectId(id) });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    let updatedItem = { ...item };

    // If quantity is provided, recalculate or assign
    if (data.qty !== undefined) {
      updatedItem.qty = data.qty;
    }

    // If updatedItemData object is provided, merge it into the item
    if (data.updatedItemData) {
      updatedItem = { ...updatedItem, ...data.updatedItemData };
    }

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedItem }
    );

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const collection = await connectToDB();
    const { id } = await params;
    // Delete the item
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

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
