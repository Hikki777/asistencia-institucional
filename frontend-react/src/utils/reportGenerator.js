import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

/**
 * Cargar imagen desde URL y convertir a Base64
 */
const loadImageBase64 = async (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      console.warn('No se pudo cargar el logo:', src);
      resolve(null);
    };
  });
};

export const generatePDF = async (data) => {
  const { asistencias, institucion, stats, filtrosGenerated } = data;
  const doc = new jsPDF();

  // Cargar Logo
  try {
    const logoBase64 = await loadImageBase64('/logo.png'); // Logo público
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 15, 15, 25, 25);
    }
  } catch (error) {
    console.warn('Error cargando logo para PDF', error);
  }

  // Encabezado
  doc.setFontSize(16);
  doc.setTextColor(31, 71, 136); // #1F4788
  doc.text(institucion?.nombre || 'Instituto Educativo', 50, 22);

  doc.setFontSize(10);
  doc.setTextColor(0);
  const info = [];
  if (institucion?.direccion) info.push(institucion.direccion);
  if (institucion?.telefono) info.push(`Tel: ${institucion.telefono}`);
  doc.text(info.join(' | '), 50, 30);

  // Título
  doc.setFontSize(14);
  doc.text('REPORTE DE ASISTENCIAS', 105, 50, { align: 'center' });
  doc.setDrawColor(200);
  doc.line(15, 55, 195, 55);

  // Filtros
  doc.setFontSize(9);
  const filterParts = [];
  if (filtrosGenerated.fechaInicio) filterParts.push(`Desde: ${new Date(filtrosGenerated.fechaInicio).toLocaleDateString()}`);
  if (filtrosGenerated.fechaFin) filterParts.push(`Hasta: ${new Date(filtrosGenerated.fechaFin).toLocaleDateString()}`);
  filterParts.push(`Total: ${stats.total} | Entradas: ${stats.entradas} | Salidas: ${stats.salidas} | Tardes: ${stats.tardes}`);
  
  doc.text(filterParts.join(' • '), 105, 62, { align: 'center' });

  // Tabla
  const tableData = asistencias.map(a => {
    const persona = a.alumno || a.personal;
    return [
      new Date(a.timestamp).toLocaleString(),
      persona?.carnet || 'N/A',
      `${persona?.nombres} ${persona?.apellidos}`.trim(),
      persona?.grado || (persona?.cargo || 'N/A'),
      a.alumno ? 'Alumno' : 'Personal',
      a.tipo_evento === 'entrada' ? 'Entrada' : 'Salida',
      a.estado_puntualidad?.toUpperCase() || '-'
    ];
  });

  autoTable(doc, {
    startY: 70,
    head: [['Fecha/Hora', 'Carnet', 'Nombre Completo', 'Grado/Cargo', 'Tipo', 'Evento', 'Puntualidad']],
    body: tableData,
    headStyles: { fillColor: [31, 71, 136] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    styles: { fontSize: 8 },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Generado por HikariOpen - Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
  }

  doc.save(`reporte_asistencias_${Date.now()}.pdf`);
};

export const generateExcel = async (data) => {
  const { asistencias, institucion, stats, filtrosGenerated } = data;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Asistencias');

  // Logo (si pudiéramos cargar buffers en browser easily, for now skip logo in excel or use base64)
  // ExcelJS in browser supports base64 images
  try {
    const logoBase64 = await loadImageBase64('/logo.png');
    if (logoBase64) {
      const imageId = workbook.addImage({
        base64: logoBase64,
        extension: 'png',
      });
      sheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 60, height: 60 }
      });
      sheet.getRow(1).height = 40;
    }
  } catch (e) {
    console.warn('Error logo Excel', e);
  }

  // Título Institución
  sheet.mergeCells('B2:H2');
  const titleCell = sheet.getCell('B2');
  titleCell.value = institucion?.nombre || 'Instituto Educativo';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FF1F4788' } };

  // Título Reporte
  sheet.mergeCells('A5:H5');
  const reportCell = sheet.getCell('A5');
  reportCell.value = 'REPORTE DE ASISTENCIAS';
  reportCell.alignment = { horizontal: 'center' };
  reportCell.font = { bold: true, size: 12 };
  reportCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };

  // Headers
  const headers = ['Fecha', 'Hora', 'Carnet', 'Nombre', 'Grado/Cargo', 'Tipo', 'Evento', 'Puntualidad'];
  const headerRow = sheet.getRow(7);
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4788' } };
    cell.alignment = { horizontal: 'center' };
  });

  // Datos
  asistencias.forEach((a, index) => {
    const persona = a.alumno || a.personal;
    const row = sheet.getRow(8 + index);
    
    row.getCell(1).value = new Date(a.timestamp).toLocaleDateString();
    row.getCell(2).value = new Date(a.timestamp).toLocaleTimeString();
    row.getCell(3).value = persona?.carnet || '';
    row.getCell(4).value = `${persona?.nombres} ${persona?.apellidos}`;
    row.getCell(5).value = persona?.grado || persona?.cargo || '';
    row.getCell(6).value = a.alumno ? 'Alumno' : 'Personal';
    row.getCell(7).value = a.tipo_evento;
    row.getCell(8).value = a.estado_puntualidad;

    // Colores condicionales
    if (a.estado_puntualidad === 'tarde') {
      row.getCell(8).font = { color: { argb: 'FFFF0000' } };
    }
  });

  // Ajustar anchos
  sheet.columns = [
    { width: 12 }, { width: 10 }, { width: 15 }, { width: 30 }, 
    { width: 15 }, { width: 10 }, { width: 10 }, { width: 12 }
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  
  // Descargar Blob
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `reporte_asistencias_${Date.now()}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};
