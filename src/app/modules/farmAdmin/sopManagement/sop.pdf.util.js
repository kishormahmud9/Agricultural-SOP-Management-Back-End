import PDFDocument from "pdfkit";

/**
 * Generates a PDF document stream from SOP data.
 *
 * Supports content as an ordered array format:
 * [
 *   { "title": "Section Name", "text": "Section content" },
 *   { "title": "Another Section", "text": "More content" }
 * ]
 *
 * Also supports legacy object format for backward compatibility.
 *
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
    if (Array.isArray(content)) {
      renderArrayContent(doc, content);
    } else if (typeof content === "object") {
      renderObjectContent(doc, content);
    } else {
      doc.fontSize(11).font("Helvetica").text(String(content));
    }
  } else {
    doc.fontSize(12).font("Helvetica").text("No content available.");
  }

  doc.end();
  return doc;
}

/**
 * Renders array-based content (preserves order).
 * Expected format: [{ title: "...", text: "..." }, ...]
 */
function renderArrayContent(doc, items) {
  items.forEach((item, index) => {
    if (typeof item === "object" && item !== null) {
      // Section heading
      if (item.title) {
        doc
          .fontSize(15)
          .font("Helvetica-Bold")
          .text(item.title);
        doc.moveDown(0.2);
      }

      // Section body
      if (item.text) {
        doc
          .fontSize(11)
          .font("Helvetica")
          .text(item.text, { indent: 15 });
        doc.moveDown(0.5);
      }
    } else if (typeof item === "string") {
      doc
        .fontSize(11)
        .font("Helvetica")
        .text(`${index + 1}. ${item}`);
      doc.moveDown(0.3);
    }
  });
}

/**
 * Renders object-based content (legacy format, key order NOT guaranteed).
 */
function renderObjectContent(doc, data, depth = 0) {
  for (const [key, value] of Object.entries(data)) {
    const fontSize = depth === 0 ? 15 : depth === 1 ? 13 : 11;

    doc
      .fontSize(fontSize)
      .font("Helvetica-Bold")
      .text(formatKey(key), { indent: depth * 15 });
    doc.moveDown(0.2);

    if (typeof value === "string") {
      doc
        .fontSize(11)
        .font("Helvetica")
        .text(value, { indent: (depth + 1) * 15 });
      doc.moveDown(0.3);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "string") {
          doc
            .fontSize(11)
            .font("Helvetica")
            .text(`${index + 1}. ${item}`, { indent: (depth + 1) * 15 });
          doc.moveDown(0.2);
        } else if (typeof item === "object" && item !== null) {
          renderObjectContent(doc, item, depth + 1);
        }
      });
      doc.moveDown(0.3);
    } else if (typeof value === "object" && value !== null) {
      renderObjectContent(doc, value, depth + 1);
    }
  }
}

/**
 * Formats a JSON key into a human-readable heading.
 * e.g. "safetyPrecautions" → "Safety Precautions"
 */
function formatKey(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
