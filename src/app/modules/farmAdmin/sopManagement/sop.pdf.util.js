import PDFDocument from "pdfkit";

/**
 * Generates a PDF document stream from SOP data.
 * @param {object} sop - The SOP record with title, category, parsedContent
 * @returns {PDFDocument} - A readable stream of the generated PDF
 */
export function generateSOPPdf(sop) {
  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
    info: {
      Title: sop.title,
      Author: "Agricultural SOP Management",
    },
  });

  // ── Header ──
  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text(sop.title, { align: "center" });

  doc.moveDown(0.3);

  doc
    .fontSize(12)
    .font("Helvetica")
    .fillColor("#555555")
    .text(`Category: ${sop.category}`, { align: "center" });

  doc
    .fillColor("#555555")
    .text(`Generated on: ${new Date().toLocaleDateString()}`, {
      align: "center",
    });

  doc.moveDown(0.5);

  // Divider line
  doc
    .strokeColor("#cccccc")
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();

  doc.moveDown(1);

  // ── Content ──
  doc.fillColor("#000000");

  const content = sop.parsedContent;

  if (content) {
    renderContent(doc, content);
  } else {
    doc.fontSize(12).font("Helvetica").text("No content available.");
  }

  doc.end();
  return doc;
}

/**
 * Recursively renders JSON content into the PDF.
 */
function renderContent(doc, data, depth = 0) {
  if (typeof data === "string") {
    doc
      .fontSize(11)
      .font("Helvetica")
      .text(data, { indent: depth * 15 });
    doc.moveDown(0.3);
    return;
  }

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      if (typeof item === "string") {
        doc
          .fontSize(11)
          .font("Helvetica")
          .text(`${index + 1}. ${item}`, { indent: depth * 15 });
        doc.moveDown(0.2);
      } else if (typeof item === "object" && item !== null) {
        renderContent(doc, item, depth);
      }
    });
    doc.moveDown(0.3);
    return;
  }

  if (typeof data === "object" && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      // Section heading
      const fontSize = depth === 0 ? 15 : depth === 1 ? 13 : 11;
      const font = depth <= 1 ? "Helvetica-Bold" : "Helvetica-Bold";

      doc
        .fontSize(fontSize)
        .font(font)
        .text(formatKey(key), { indent: depth * 15 });
      doc.moveDown(0.2);

      renderContent(doc, value, depth + 1);
    }
  }
}

/**
 * Formats a JSON key into a human-readable heading.
 * e.g. "safetyPrecautions" → "Safety Precautions"
 */
function formatKey(key) {
  return key
    .replace(/([A-Z])/g, " $1") // camelCase → spaced
    .replace(/[_-]/g, " ") // snake_case / kebab → spaced
    .replace(/\b\w/g, (c) => c.toUpperCase()) // capitalize first letters
    .trim();
}
