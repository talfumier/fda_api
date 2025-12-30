import {PDFDocument, rgb, StandardFonts} from "pdf-lib";
import {readFile, writeFile} from "fs/promises";
import {fileURLToPath} from "url";
import {dirname, join} from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export async function createPDFFromTemplate(data) {
  const templatePath = join(
    __dirname,
    "template",
    `template_single_${data[0].lang}.pdf`
  );
  const existingPdfBytes = await readFile(templatePath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const {width, height} = firstPage.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  firstPage.drawText(data[0].artist, {
    x: data[0].lang === "en" ? 160 : 110,
    y: height - 92,
    size: 10,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(data[0][`short_${data[0].lang}`], {
    x: data[0].lang === "en" ? 230 : 200,
    y: height - parseInt(data[0].lang === "en" ? 114 : 114),
    size: 10,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${data[0].price} €`, {
    x: data[0].lang === "en" ? 290 : 460,
    y: height - parseInt(data[0].lang === "en" ? 151 : 129),
    size: 10,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${data[0].deadline}`, {
    x: data[0].lang === "en" ? 450 : 175,
    y: height - parseInt(data[0].lang === "en" ? 151 : 143),
    size: 10,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(
    `${data[0].lang === "en" ? "Art works deposit:" : "Dépôt des oeuvres:"} ${
      data[0].depot
    }`,
    {
      x: 73,
      y: height - parseInt(data[0].lang === "en" ? 279 : 260),
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    }
  );
  firstPage.drawText(
    `${
      data[0].lang === "en" ? "Art works collection:" : "Retrait des oeuvres:"
    } ${data[0].collection}`,
    {
      x: 73,
      y: height - parseInt(data[0].lang === "en" ? 298 : 278),
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    }
  );
  // Draw table
  await drawSelectionTable(
    firstPage,
    pdfDoc,
    data,
    height - parseInt(data[0].lang === "en" ? 320 : 300),
    font,
    fontBold
  );
  // Save the modified PDF
  const pdfBytes = await pdfDoc.save();
  const fileName = `${data[0].artist.replace(" ", "_")}_${
    data[0].idBooking
  }.pdf`;
  const outputPath = join(__dirname, "output", fileName);
  await writeFile(outputPath, pdfBytes);
  return {outputPath, fileName};
}
function getCloudinaryResizedUrl(url, width, height, crop = "fill") {
  if (url.includes("cloudinary.com") && url.includes("/upload/")) {
    // Add transformations: convert to JPG, resize, and crop
    return url.replace(
      "/upload/",
      `/upload/f_jpg,c_${crop},w_${width},h_${height},g_auto,q_auto/`
    );
  }
  return url;
}
function wrapText(text, maxWidth, font, fontSize) {
  if (!text) return [];
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}
function drawBooleanIndicator(page, value, x, y) {
  if (value) {
    // Green checkmark
    page.drawLine({
      start: {x: x, y: y},
      end: {x: x + 3, y: y - 4},
      thickness: 2.5,
      color: rgb(0, 0.7, 0),
    });
    page.drawLine({
      start: {x: x + 3, y: y - 4},
      end: {x: x + 9, y: y + 5},
      thickness: 2.5,
      color: rgb(0, 0.7, 0),
    });
  } else {
    // Red cross
    page.drawLine({
      start: {x: x, y: y},
      end: {x: x + 8, y: y + 8},
      thickness: 2.5,
      color: rgb(0.8, 0, 0),
    });
    page.drawLine({
      start: {x: x, y: y + 8},
      end: {x: x + 8, y: y},
      thickness: 2.5,
      color: rgb(0.8, 0, 0),
    });
  }
}

async function drawSelectionTable(
  page,
  pdfDoc,
  artworks,
  startY,
  font,
  fontBold
) {
  const x = 30;
  let currentY = startY;
  const columnWidths = [180, 65, 65, 110, 110]; // Art work (merged), Show room, On screen
  const artworkColumnWidth = columnWidths[0];
  const imageWidth = 40;
  const titleWidth = artworkColumnWidth - imageWidth;

  const totalWidth = columnWidths.reduce((sum, w) => sum + w, 0);
  const rowHeight = 49;
  const imageSize = 35;
  const headerFontSize = 10;
  // Header background
  page.drawRectangle({
    x,
    y: currentY - 30,
    width: totalWidth,
    height: 30,
    color: rgb(0.4, 0.4, 0.4),
  });
  // Draw "Art work" header (horizontally centered)
  const artworkHeaderText = artworks[0].lang === "en" ? "Art work" : "Oeuvre";
  const artworkHeaderWidth = fontBold.widthOfTextAtSize(
    artworkHeaderText,
    headerFontSize
  );
  page.drawText(artworkHeaderText, {
    x: x + (columnWidths[0] - artworkHeaderWidth) / 2,
    y: currentY - 20,
    size: headerFontSize,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  // Draw other headers (horizontally centered)
  let headerX = x + columnWidths[0];
  const otherHeaders =
    artworks[0].lang === "en"
      ? ["Show room", "On screen", "Deposit", "Collection"]
      : ["En salle", "A l'écran", "Dépôt", "Retrait"];
  otherHeaders.forEach((header, i) => {
    const headerWidth = fontBold.widthOfTextAtSize(header, headerFontSize);
    page.drawText(header, {
      x: headerX + (columnWidths[i + 1] - headerWidth) / 2,
      y: currentY - 20,
      size: headerFontSize,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    headerX += columnWidths[i + 1];
  });
  currentY -= 30;
  // Rows
  for (const artwork of artworks) {
    if (currentY - rowHeight < 50) {
      page = pdfDoc.addPage([595, 842]);
      currentY = 792;
    }
    let cellX = x;
    // Column 1: Art work (Image + Title merged)
    // Draw image
    if (artwork.url) {
      try {
        const imgUrl = getCloudinaryResizedUrl(
          artwork.url,
          imageSize,
          imageSize,
          "fill"
        );
        const response = await fetch(imgUrl);
        const imgBytes = await response.arrayBuffer();
        const image = await pdfDoc.embedJpg(imgBytes);
        page.drawImage(image, {
          x: cellX + 5,
          y: currentY - rowHeight + 7,
          width: imageSize,
          height: imageSize,
        });
      } catch (e) {
        console.error("Image load failed:", e);
      }
    }
    // Draw title next to image
    const titleLines = wrapText(
      artwork[`title_${artwork.lang}`],
      titleWidth - 15,
      font,
      9
    );
    let textY = currentY - 20;
    titleLines.slice(0, 3).forEach((line) => {
      page.drawText(line, {
        x: cellX + imageWidth + 5,
        y: textY,
        size: 9,
        font,
      });
      textY -= 11;
    });
    cellX += columnWidths[0];
    // Calculate vertical center of the row
    const rowCenterY = currentY - rowHeight / 2;
    // Column 2: Show room (vertically and horizontally centered)
    drawBooleanIndicator(
      page,
      artwork.showRoom,
      cellX + (columnWidths[1] - 8) / 2, // Horizontally center (8 is approx width of indicator)
      rowCenterY
    );
    cellX += columnWidths[1];
    // Column 3: On screen (vertically and horizontally centered)
    drawBooleanIndicator(
      page,
      artwork.screen,
      cellX + (columnWidths[2] - 8) / 2, // Horizontally center
      rowCenterY
    );
    cellX += columnWidths[3];
    // Column 4: Depot (vertically and horizontally centered)
    if (!artwork.showRoom)
      page.drawText("N/A", {
        x: cellX, // Horizontally center,
        y: rowCenterY,
        size: 10,
        // font: fontBold,
        color: rgb(0, 0, 0),
      });
    cellX += columnWidths[4];
    // Column 5: Collection (vertically and horizontally centered)
    if (!artwork.showRoom)
      page.drawText("N/A", {
        x: cellX, // Horizontally center,
        y: rowCenterY,
        size: 10,
        // font: fontBold,
        color: rgb(0, 0, 0),
      });
    // Row border
    page.drawLine({
      start: {x, y: currentY - rowHeight},
      end: {x: x + totalWidth, y: currentY - rowHeight},
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
    currentY -= rowHeight;
  }
  // Vertical borders
  let borderX = x;
  for (let i = 0; i <= columnWidths.length; i++) {
    page.drawLine({
      start: {x: borderX, y: startY},
      end: {x: borderX, y: currentY},
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
    if (i < columnWidths.length) borderX += columnWidths[i];
  }
  return {page, finalY: currentY};
}
