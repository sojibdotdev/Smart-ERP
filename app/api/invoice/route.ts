import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(request: Request) {
  try {
    const { items } = await request.json();
    console.log("items from route", items);
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

    // Get fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Set some constants for positioning
    const margin = 50;
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    let currentY = pageHeight - margin;

    // Draw header
    page.drawText("PARTS CORNER", {
      x: margin,
      y: currentY,
      size: 24,
      font: helveticaBold,
      color: rgb(0, 0.3, 0.6),
    });

    currentY -= 20;

    page.drawText("Invoice", {
      x: margin,
      y: currentY,
      size: 16,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    // Draw invoice details
    currentY -= 30;

    const today = new Date();
    const invoiceNumber = `INV-${today.getFullYear()}${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${today
      .getDate()
      .toString()
      .padStart(2, "0")}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;

    page.drawText(`Invoice Number: ${invoiceNumber}`, {
      x: margin,
      y: currentY,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    currentY -= 15;

    page.drawText(`Date: ${today.toLocaleDateString()}`, {
      x: margin,
      y: currentY,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    // Draw company details
    const rightColumnX = pageWidth - margin - 200;

    page.drawText("Parts Corner Pvt. Ltd.", {
      x: rightColumnX,
      y: pageHeight - margin,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    page.drawText("Beside Sanabil Supar Market, Gangachara, Rangpur 5410", {
      x: rightColumnX,
      y: pageHeight - margin - 15,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    page.drawText("md.utshab85696@amail.com | 01792-703854", {
      x: rightColumnX,
      y: pageHeight - margin - 30,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    // Draw table header
    currentY -= 40;

    const colWidths = [200, 60, 80, 100];
    const colPositions = [
      margin,
      margin + colWidths[0],
      margin + colWidths[0] + colWidths[1],
      margin + colWidths[0] + colWidths[1] + colWidths[2],
    ];

    // Draw table header background
    page.drawRectangle({
      x: margin,
      y: currentY - 15,
      width: pageWidth - margin * 2,
      height: 20,
      color: rgb(0.9, 0.9, 0.9),
    });

    // Draw table headers
    page.drawText("Part No", {
      x: colPositions[0] + 5,
      y: currentY - 10,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    page.drawText("Quantity", {
      x: colPositions[1] + 5,
      y: currentY - 10,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    page.drawText("Price", {
      x: colPositions[2] + 5,
      y: currentY - 10,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    page.drawText("Total", {
      x: colPositions[3] + 5,
      y: currentY - 10,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    // Draw horizontal line
    page.drawLine({
      start: { x: margin, y: currentY - 15 },
      end: { x: pageWidth - margin, y: currentY - 15 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    // Draw items
    currentY -= 30;
    let totalAmount = 0;

    for (const item of items) {
      // Check if we need a new page
      if (currentY < margin + 100) {
        // Add a new page
        const page = pdfDoc.addPage([595.28, 841.89]);
        currentY = pageHeight - margin;

        // Draw table header on new page
        page.drawRectangle({
          x: margin,
          y: currentY - 15,
          width: pageWidth - margin * 2,
          height: 20,
          color: rgb(0.9, 0.9, 0.9),
        });

        page.drawText("Part No", {
          x: colPositions[0] + 5,
          y: currentY - 10,
          size: 10,
          font: helveticaBold,
          color: rgb(0, 0, 0),
        });

        page.drawText("Quantity", {
          x: colPositions[1] + 5,
          y: currentY - 10,
          size: 10,
          font: helveticaBold,
          color: rgb(0, 0, 0),
        });

        page.drawText("Price", {
          x: colPositions[2] + 5,
          y: currentY - 10,
          size: 10,
          font: helveticaBold,
          color: rgb(0, 0, 0),
        });

        page.drawText("Total", {
          x: colPositions[3] + 5,
          y: currentY - 10,
          size: 10,
          font: helveticaBold,
          color: rgb(0, 0, 0),
        });

        page.drawLine({
          start: { x: margin, y: currentY - 15 },
          end: { x: pageWidth - margin, y: currentY - 15 },
          thickness: 1,
          color: rgb(0, 0, 0),
        });

        currentY -= 30;
      }

      // Draw item details
      page.drawText(item.partNo, {
        x: colPositions[0] + 5,
        y: currentY,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });

      page.drawText(item.qty.toString(), {
        x: colPositions[1] + 5,
        y: currentY,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });

      page.drawText(`${item.unitPrice.toFixed(2)}`, {
        x: colPositions[2] + 5,
        y: currentY,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });

      page.drawText(`${item.totalPrice.toFixed(2)}`, {
        x: colPositions[3] + 5,
        y: currentY,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });

      totalAmount += item.totalPrice;
      currentY -= 20;

      // Draw light separator line
      page.drawLine({
        start: { x: margin, y: currentY + 10 },
        end: { x: pageWidth - margin, y: currentY + 10 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
    }

    // Draw total
    currentY -= 20;

    page.drawLine({
      start: { x: margin, y: currentY + 10 },
      end: { x: pageWidth - margin, y: currentY + 10 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    page.drawText("Total Amount:", {
      x: colPositions[2] + 5,
      y: currentY - 10,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    page.drawText(`${totalAmount.toFixed(2)}`, {
      x: colPositions[3] + 5,
      y: currentY - 10,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    // Draw footer
    currentY = margin + 50;

    page.drawText("Thank you for your business!", {
      x: margin,
      y: currentY,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    currentY -= 15;

    page.drawText("Payment Terms: Net 30 days", {
      x: margin,
      y: currentY,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    // Return the PDF as a response
    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="parts-corner-invoice-${today
          .toISOString()
          .slice(0, 10)}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
