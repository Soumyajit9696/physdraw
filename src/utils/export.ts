import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportToPNG(element: HTMLElement, filename: string = 'physics-diagram') {
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
  });
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function exportToSVG(svgElement: SVGSVGElement, filename: string = 'physics-diagram') {
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgElement);
  
  // Ensure proper SVG namespace
  if (!svgString.includes('xmlns=')) {
    svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  
  // Add white background
  svgString = svgString.replace('<svg', '<svg style="background: white"');
  
  svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const link = document.createElement('a');
  link.download = `${filename}.svg`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function exportToPDF(element: HTMLElement, filename: string = 'physics-diagram') {
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
  });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(`${filename}.pdf`);
}
