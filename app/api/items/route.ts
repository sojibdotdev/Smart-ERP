import { MongoClient } from "mongodb";
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

// GET handler to retrieve all items
export async function GET() {
  try {
    const collection = await connectToDB();
    const items = await collection.find({}).toArray();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// POST handler to create a new item
export async function POST(request: Request) {
  try {
    const collection = await connectToDB();
    const data = await request.json();

    // Calculate total price
    const qty = Number.parseInt(data.qty);
    const unitPrice = Number.parseFloat(data.unitPrice);
    const totalPrice = qty * unitPrice;
    const stock = Number.parseInt(data.stock);

    // Generate new item
    const newItem = {
      selected: false,
      highlighted: data.highlighted || false,
      slNo: (await collection.countDocuments({})) + 1,
      partNo: data.partNo,
      qty: qty,
      unitPrice: unitPrice,
      totalPrice: totalPrice,
      stock: stock,
    };

    // Insert the new item into the database
    const result = await collection.insertOne(newItem);

    return NextResponse.json(
      { ...newItem, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
