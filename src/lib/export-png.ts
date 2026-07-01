/**
 * Exports an SVG element inside a container as a PNG download.
 * @param container - Element wrapping the chart SVG
 * @param filename - Download filename
 */
export async function downloadChartPng(
  container: HTMLElement,
  filename: string,
): Promise<void> {
  const svg = container.querySelector("svg");

  if (!svg) {
    throw new Error("Chart SVG not found");
  }

  const cloned = svg.cloneNode(true) as SVGSVGElement;
  const bbox = svg.getBoundingClientRect();
  const width = Math.max(bbox.width, 1);
  const height = Math.max(bbox.height, 1);

  cloned.setAttribute("width", String(width));
  cloned.setAttribute("height", String(height));

  const svgData = new XMLSerializer().serializeToString(cloned);
  const svgBlob = new Blob([svgData], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);
  const image = new Image();

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Failed to render chart image"));
    image.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = width * 2;
  canvas.height = height * 2;
  const context = canvas.getContext("2d");

  if (!context) {
    URL.revokeObjectURL(url);
    throw new Error("Canvas context unavailable");
  }

  context.scale(2, 2);
  context.fillStyle = getComputedStyle(document.documentElement)
    .getPropertyValue("--background")
    .trim() || "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  URL.revokeObjectURL(url);

  const pngUrl = canvas.toDataURL("image/png");
  const anchor = document.createElement("a");
  anchor.href = pngUrl;
  anchor.download = filename;
  anchor.click();
}
