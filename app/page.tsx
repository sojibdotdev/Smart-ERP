"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import {
  Download,
  FileText,
  Plus,
  Printer,
  RefreshCw,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";

interface RequisitionItem {
  _id: string; // Updated to use MongoDB's _id
  selected: boolean;
  highlighted: boolean;
  slNo: number;
  partNo: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  stock: number;
}

export default function PartsCorner() {
  const [items, setItems] = useState<RequisitionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedItems, setSelectedItems] = useState<RequisitionItem[]>([]);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    partNo: "",
    qty: "",
    unitPrice: "",
    stock: "",
  });

  // Fetch items from API
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/items");
      const data = await response.json();
      setItems(data);
      toast({
        title: "Data loaded successfully",
        description: `${data.length} items retrieved from database`,
      });
    } catch (error) {
      console.error("Error fetching items:", error);
      toast({
        title: "Error loading data",
        description: "Could not retrieve items from the server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const toggleHighlight = async (_id: string) => {
    try {
      const item = items.find((item) => item._id === _id);
      if (!item) return;

      const response = await fetch(`/api/items/${_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ highlighted: !item.highlighted }),
      });

      if (response.ok) {
        setItems(
          items.map((item) =>
            item._id === _id
              ? { ...item, highlighted: !item.highlighted }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error updating item",
        description: "Could not update the item status",
        variant: "destructive",
      });
    }
  };

  const toggleSelect = (_id: string) => {
    const updatedItems = items.map((item) =>
      item._id === _id ? { ...item, selected: !item.selected } : item
    );
    setItems(updatedItems);

    // Update selected items for invoice
    const newSelectedItems = updatedItems.filter((item) => item.selected);
    setSelectedItems(newSelectedItems);
  };

  const handleAddItem = async () => {
    if (newItem.partNo && newItem.qty && newItem.unitPrice && newItem.stock) {
      const qty = Number.parseInt(newItem.qty);
      const unitPrice = Number.parseFloat(newItem.unitPrice);
      const stock = Number.parseInt(newItem.stock);

      try {
        const response = await fetch("/api/items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            partNo: newItem.partNo,
            qty: qty,
            unitPrice: unitPrice,
            stock: stock,
            highlighted: false,
          }),
        });

        if (response.ok) {
          const newItemData = await response.json();
          setItems([...items, newItemData]);
          setNewItem({
            partNo: "",
            qty: "",
            unitPrice: "",
            stock: "",
          });
          toast({
            title: "Item added successfully",
            description: `Part No: ${newItemData.partNo} has been added to inventory`,
          });
        }
      } catch (error) {
        console.error("Error adding item:", error);
        toast({
          title: "Error adding item",
          description: "Could not add the new item to inventory",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (_id: string) => {
    try {
      const response = await fetch(`/api/items/${_id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems(items.filter((item) => item._id !== _id));
        toast({
          title: "Item deleted successfully",
          description: "The item has been removed from inventory",
        });
      } else {
        // Handle non-OK responses (e.g., 404 Not Found)
        const errorData = await response.json();
        toast({
          title: "Error deleting item",
          description: errorData.error || "Failed to delete the item",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error deleting item",
        description: "Could not delete the item",
        variant: "destructive",
      });
    }
  };

  const generateInvoice = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to generate an invoice",
        variant: "destructive",
      });
      console.log(" no item select");
      return;
    }

    try {
      const response = await fetch("/api/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [...selectedItems],
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `parts-corner-invoice-${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);

        toast({
          title: "Invoice generated successfully",
          description: "Your invoice has been downloaded",
        });

        // Clear selections after generating invoice
        setItems(items.map((item) => ({ ...item, selected: false })));
        setSelectedItems([]);
        setInvoiceOpen(false);
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast({
        title: "Error generating invoice",
        description: "Could not generate the invoice",
        variant: "destructive",
      });
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.partNo
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (filterType === "all") return matchesSearch;
    if (filterType === "highlighted") return matchesSearch && item.highlighted;
    if (filterType === "selected") return matchesSearch && item.selected;

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left Section */}
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-blue-600">
              Parts Corner
            </h1>
            <Badge variant="outline" className="hidden md:inline-flex ml-2">
              Inventory Management
            </Badge>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={fetchItems}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            {/* Generate Invoice Button */}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setInvoiceOpen(true)}
              disabled={selectedItems.length === 0}
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Generate Invoice</span>
            </Button>

            {/* Date */}
            <div className="text-sm text-muted-foreground hidden sm:block">
              Date: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Search Section */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-muted-foreground" />
                Search Items
              </CardTitle>
              <CardDescription>Find parts by part number</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Search by part number"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="highlighted">
                        Highlighted Only
                      </SelectItem>
                      <SelectItem value="selected">Selected Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Item Section */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-muted-foreground" />
                Add New Item
              </CardTitle>
              <CardDescription>Add a new part to the inventory</CardDescription>
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
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    value={newItem.qty}
                    onChange={(e) =>
                      setNewItem({ ...newItem, qty: e.target.value })
                    }
                    className="mt-1 border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Unit Price</label>
                  <Input
                    type="number"
                    value={newItem.unitPrice}
                    onChange={(e) =>
                      setNewItem({ ...newItem, unitPrice: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Stock</label>
                  <Input
                    type="number"
                    value={newItem.stock}
                    onChange={(e) =>
                      setNewItem({ ...newItem, stock: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <Button onClick={handleAddItem} className="mt-4">
                Add Item
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Requisition Table */}
        <Card className="mt-8">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle>Inventory Items</CardTitle>
              <div className="flex items-center gap-4">
                <Badge variant="outline">{filteredItems.length} Items</Badge>
                <Badge variant="secondary">
                  {selectedItems.length} Selected
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">SL</TableHead>
                      <TableHead>Part No</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No items found. Try adjusting your search or add new
                          items.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item, index) => (
                        <TableRow
                          key={item._id}
                          className={`cursor-pointer ${
                            item.highlighted ? "bg-blue-100" : ""
                          } ${item.selected ? "bg-green-100" : ""}`}
                          onClick={() => toggleSelect(item._id)}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.partNo}</TableCell>
                          <TableCell className="text-right">
                            {item.qty}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.unitPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.stock}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleHighlight(item._id);
                                }}
                              >
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">Highlight</span>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="lucide lucide-trash-2"
                                    >
                                      <path d="M3 6h18" />
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                      <line x1="10" x2="10" y1="11" y2="17" />
                                      <line x1="14" x2="14" y1="11" y2="17" />
                                    </svg>
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the item from
                                      your inventory.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteItem(item._id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                * Click on a row to select it for invoice, use the highlight
                button to mark important items
              </p>
              <p className="mt-2">
                Total Items: {filteredItems.length} | Total Value:{" "}
                {filteredItems
                  .reduce((sum, item) => sum + item.totalPrice, 0)
                  .toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Invoice Dialog */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>
              Review the selected items before generating the invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part No</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedItems.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.partNo}</TableCell>
                    <TableCell className="text-right">{item.qty}</TableCell>
                    <TableCell className="text-right">
                      {item.unitPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.totalPrice.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <p className="text-sm font-medium">
                Total Items: {selectedItems.length}
              </p>
              <p className="text-lg font-bold">
                Total: ₹
                {selectedItems
                  .reduce((sum, item) => sum + item.totalPrice, 0)
                  .toFixed(2)}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInvoiceOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={generateInvoice}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Generate Invoice
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
