const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Ensure invoices directory exists
const invoicesDir = path.join(__dirname, "../../data/invoices");
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

// Generate thermal bill (80mm format - quick transactions)
exports.generateThermalBill = (bookingData, outputPath = null) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName =
        outputPath ||
        path.join(
          invoicesDir,
          `thermal_bill_${bookingData.id}_${Date.now()}.pdf`
        );

      const doc = new PDFDocument({
        size: [226.77, 600], // 80mm width in points, flexible height
        margins: 10,
      });

      const stream = fs.createWriteStream(fileName);

      doc.pipe(stream);

      // Header - Studio Name
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("SHINE ART STUDIO", { align: "center" });
      doc.fontSize(8).text("Professional Photography", { align: "center" });
      doc.moveTo(10, doc.y + 5).lineTo(216.77, doc.y + 5).stroke();

      // Bill Details
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(`Bill #${bookingData.id}`, { align: "center" });
      doc
        .fontSize(7)
        .font("Helvetica")
        .text(new Date(bookingData.booking_date).toLocaleString(), {
          align: "center",
        });

      doc.moveTo(10, doc.y + 5).lineTo(216.77, doc.y + 5).stroke();

      // Customer Information
      doc.fontSize(8).font("Helvetica-Bold").text("CUSTOMER DETAILS:");
      doc
        .fontSize(7)
        .font("Helvetica")
        .text(`Name: ${bookingData.customer_name}`, { width: 200 })
        .text(`Mobile: ${bookingData.customer_mobile}`, { width: 200 })
        .text(`Address: ${bookingData.customer_address}`, { width: 200 });

      doc.moveTo(10, doc.y + 5).lineTo(216.77, doc.y + 5).stroke();

      // Event Details
      doc.fontSize(8).font("Helvetica-Bold").text("EVENT DETAILS:");
      doc
        .fontSize(7)
        .font("Helvetica")
        .text(`Date: ${bookingData.event_date}`)
        .text(`Time: ${bookingData.event_time}`)
        .text(`Status: ${bookingData.status}`);

      doc.moveTo(10, doc.y + 5).lineTo(216.77, doc.y + 5).stroke();

      // Amount Details
      doc.fontSize(8).font("Helvetica-Bold").text("AMOUNT DETAILS:");
      doc.fontSize(7).font("Helvetica");

      const totalAmount = parseFloat(bookingData.total_amount);
      const advancePaid = parseFloat(bookingData.advance_paid || 0);
      const balance = totalAmount - advancePaid;

      doc
        .text(`Total Amount: Rs. ${totalAmount.toFixed(2)}`, { align: "right" })
        .text(`Advance Paid: Rs. ${advancePaid.toFixed(2)}`, { align: "right" })
        .text(`Balance Due: Rs. ${balance.toFixed(2)}`, { align: "right" });

      doc.moveTo(10, doc.y + 5).lineTo(216.77, doc.y + 5).stroke();

      // Footer
      doc
        .fontSize(6)
        .font("Helvetica")
        .text("Thank you for your business!", { align: "center" })
        .text("Visit: www.shineartudio.com", { align: "center" })
        .text("Contact: +94-XXXXXXX", { align: "center" });

      doc.end();

      stream.on("finish", () => {
        resolve(fileName);
      });

      stream.on("error", (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};

// Generate A4 invoice (professional layout for bookings)
exports.generateA4Invoice = (bookingData, studioInfo = {}, outputPath = null) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName =
        outputPath ||
        path.join(invoicesDir, `invoice_${bookingData.id}_${Date.now()}.pdf`);

      const doc = new PDFDocument({
        size: "A4",
        margins: 40,
      });

      const stream = fs.createWriteStream(fileName);

      doc.pipe(stream);

      // Header - Studio Branding
      doc
        .fontSize(28)
        .font("Helvetica-Bold")
        .text("SHINE ART STUDIO", { align: "center" });
      doc
        .fontSize(11)
        .font("Helvetica")
        .text("Professional Photography Services", { align: "center" })
        .text("✉ contact@shineartistudio.com | 📞 +94-XXXXXXX", {
          align: "center",
        });

      doc.moveTo(40, doc.y + 10).lineTo(555, doc.y + 10).stroke();

      doc.moveDown();

      // Invoice Title and Details
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("INVOICE", { align: "left" });

      doc.fontSize(10).font("Helvetica");
      const invoiceDate = new Date(bookingData.booking_date);
      doc
        .text(`Invoice #: ${bookingData.id}`, 40, doc.y)
        .text(`Date: ${invoiceDate.toLocaleDateString()}`, 300, doc.y);
      doc.moveDown();

      // Customer Information
      doc.fontSize(11).font("Helvetica-Bold").text("BILL TO:");
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(bookingData.customer_name, { width: 250 });
      doc
        .fontSize(9)
        .text(`Mobile: ${bookingData.customer_mobile}`)
        .text(`Address: ${bookingData.customer_address}`, { width: 250 });

      doc.moveDown();

      // Service Details Table
      doc.fontSize(11).font("Helvetica-Bold").text("SERVICE DETAILS:");
      doc.moveDown(0.3);

      const tableTop = doc.y;
      const col1 = 40;
      const col2 = 250;
      const col3 = 400;
      const col4 = 500;

      // Table Header
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Description", col1, tableTop)
        .text("Date", col2, tableTop)
        .text("Quantity", col3, tableTop)
        .text("Amount", col4, tableTop);

      doc.moveTo(40, doc.y + 2).lineTo(555, doc.y + 2).stroke();

      // Table Row
      doc
        .fontSize(10)
        .font("Helvetica")
        .text("Photography Booking", col1, doc.y + 5)
        .text(bookingData.event_date, col2, doc.y)
        .text("1", col3, doc.y)
        .text(`Rs. ${parseFloat(bookingData.total_amount).toFixed(2)}`, col4, doc.y);

      doc.moveDown();
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();

      // Summary
      doc.moveDown();
      const summaryY = doc.y;
      const subtotal = parseFloat(bookingData.total_amount);
      const advance = parseFloat(bookingData.advance_paid || 0);
      const balance = subtotal - advance;

      doc
        .fontSize(10)
        .font("Helvetica")
        .text("Subtotal:", 350, summaryY)
        .text(`Rs. ${subtotal.toFixed(2)}`, 480, summaryY);

      doc.moveDown();
      doc
        .text("Advance Paid:", 350, doc.y)
        .text(`Rs. ${advance.toFixed(2)}`, 480, doc.y);

      doc.moveTo(350, doc.y + 5).lineTo(555, doc.y + 5).stroke();

      doc.moveDown();
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Balance Due:", 350, doc.y)
        .text(`Rs. ${balance.toFixed(2)}`, 480, doc.y);

      // Event Information
      doc.moveDown(2);
      doc.fontSize(11).font("Helvetica-Bold").text("EVENT INFORMATION:");
      doc.moveDown(0.3);
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Event Date: ${bookingData.event_date}`)
        .text(`Event Time: ${bookingData.event_time}`)
        .text(`Booking Status: ${bookingData.status}`);

      // Notes
      doc.moveDown();
      doc
        .fontSize(9)
        .font("Helvetica")
        .text(
          "Thank you for choosing Shine Art Studio! This invoice is a confirmation of your booking and payment status."
        );

      // Footer
      doc.moveTo(40, doc.page.height - 100).lineTo(555, doc.page.height - 100).stroke();
      doc
        .fontSize(8)
        .text(
          "Terms & Conditions",
          40,
          doc.page.height - 90,
          { width: 515 }
        )
        .text("Payments are non-refundable. Rescheduling is possible up to 15 days before the event.").text(
          "For cancellations, contact support immediately."
        );

      doc.end();

      stream.on("finish", () => {
        resolve(fileName);
      });

      stream.on("error", (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};

// Generate expense report
exports.generateExpenseReport = (expenses, startDate, endDate, outputPath = null) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName =
        outputPath ||
        path.join(
          invoicesDir,
          `expense_report_${startDate}_to_${endDate}_${Date.now()}.pdf`
        );

      const doc = new PDFDocument({
        size: "A4",
        margins: 40,
      });

      const stream = fs.createWriteStream(fileName);

      doc.pipe(stream);

      // Header
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("EXPENSE REPORT", { align: "center" });
      doc
        .fontSize(10)
        .font("Helvetica")
        .text("SHINE ART STUDIO", { align: "center" });

      doc.moveDown();
      doc
        .fontSize(10)
        .text(`Period: ${startDate} to ${endDate}`, { align: "center" })
        .text(`Generated on: ${new Date().toLocaleString()}`, {
          align: "center",
        });

      doc.moveTo(40, doc.y + 10).lineTo(555, doc.y + 10).stroke();
      doc.moveDown();

      // Table Header
      const col1 = 40;
      const col2 = 180;
      const col3 = 380;
      const col4 = 480;

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Date", col1, doc.y)
        .text("Expense Name", col2, doc.y)
        .text("User", col3, doc.y)
        .text("Amount", col4, doc.y);

      doc.moveTo(40, doc.y + 5).lineTo(555, doc.y + 5).stroke();
      doc.moveDown();

      // Table Rows
      let totalExpenses = 0;
      expenses.forEach((expense) => {
        const expenseDate = new Date(expense.expense_date).toLocaleDateString();
        doc
          .fontSize(9)
          .font("Helvetica")
          .text(expenseDate, col1, doc.y, { width: 100 })
          .text(expense.expense_name, col2, doc.y, { width: 180 })
          .text(expense.user_name, col3, doc.y, { width: 80 })
          .text(`Rs. ${parseFloat(expense.price).toFixed(2)}`, col4, doc.y);
        doc.moveDown();
        totalExpenses += parseFloat(expense.price);
      });

      doc.moveTo(40, doc.y + 2).lineTo(555, doc.y + 2).stroke();

      // Summary
      doc.moveDown();
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Total Expenses:", 400, doc.y)
        .text(`Rs. ${totalExpenses.toFixed(2)}`, 480, doc.y);

      doc.end();

      stream.on("finish", () => {
        resolve(fileName);
      });

      stream.on("error", (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateThermalBill,
  generateA4Invoice,
  generateExpenseReport,
  invoicesDir,
};
