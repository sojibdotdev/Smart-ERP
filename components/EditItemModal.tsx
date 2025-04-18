"use client ";
import { useState } from "react";

import { X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";

interface EditItemModalProps {
  handleEditItem: (item: any) => void;
  item: {
    _id: string; // Updated to use MongoDB's _id
    selected: boolean;
    highlighted: boolean;
    slNo: number;
    partNo: string;
    qty: number;
    unitPrice: number;
    totalPrice: number;
    productName: string;
    boxNo: string;
  };
  setShowEditModal: (value: boolean) => void;
}

const EditItemModal = ({
  handleEditItem,
  item,
  setShowEditModal,
}: EditItemModalProps) => {
  const [newItem, setNewItem] = useState({
    ...item,
  });
  const handleUpdateItem = async () => {
    handleEditItem(newItem);
    setShowEditModal(false);
  };

  return (
    <>
      <Card className="md:col-span-2 w-full md:mx-10 m-5 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            {" "}
            <span>Update Item</span>{" "}
            <button
              onClick={() => setShowEditModal(false)}
              className=" bg-gray-200 p-1 rounded"
            >
              <X />
            </button>
          </CardTitle>
          <CardDescription>Update a new part to the inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium">Part No</label>
              <Input
                value={newItem.partNo}
                onChange={(e) =>
                  setNewItem({ ...newItem, partNo: e.target.value })
                }
                className="mt-1 border-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Product Name</label>
              <Input
                value={newItem.productName}
                onChange={(e) =>
                  setNewItem({ ...newItem, productName: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                value={newItem.qty}
                onChange={(e) =>
                  setNewItem({ ...newItem, qty: Number(e.target.value) })
                }
                className="mt-1 border-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Price</label>
              <Input
                type="number"
                value={newItem.unitPrice}
                onChange={(e) =>
                  setNewItem({ ...newItem, unitPrice: Number(e.target.value) })
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Box No</label>
              <Input
                value={newItem.boxNo}
                onChange={(e) =>
                  setNewItem({ ...newItem, boxNo: e.target.value })
                }
                className="mt-1 border-blue-500"
              />
            </div>
          </div>
          <Button onClick={handleUpdateItem} className="mt-4">
            Update Item
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default EditItemModal;
