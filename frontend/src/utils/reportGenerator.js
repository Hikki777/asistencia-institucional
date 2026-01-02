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

  // 1. Logo Institucional (Izquierda)
  if (institucion?.logo_base64) {
    try {
      doc.addImage(institucion.logo_base64, 'PNG', 15, 15, 25, 25);
    } catch (e) {
      console.warn('Error rendering institutional logo', e);
    }
  }

  // 2. Logo HikariOpen (Derecha)
  try {
    const appLogoBase64 = await loadImageBase64('/logo.png');
    if (appLogoBase64) {
      doc.addImage(appLogoBase64, 'PNG', 170, 15, 25, 25);
    }
  } catch (error) {
    console.warn('Error loading app logo', error);
  }

  // Encabezado (Centrado)
  doc.setFontSize(16);
  doc.setTextColor(31, 71, 136); // #1F4788
  doc.text(institucion?.nombre || 'Instituto Educativo', 105, 22, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(0);
  
  // Línea 1: Dirección y Teléfono
  const infoLine1 = [];
  if (institucion?.direccion) infoLine1.push(institucion.direccion);
  if (institucion?.telefono) infoLine1.push(`Tel: ${institucion.telefono}`);
  doc.text(infoLine1.join(' | '), 105, 30, { align: 'center' });

  // Línea 2: Email y País (Nuevo requerimiento)
  const infoLine2 = [];
  if (institucion?.email) infoLine2.push(institucion.email);
  
  // Construcción limpia de ubicación
  const ubicacionParts = [institucion?.municipio, institucion?.departamento].filter(Boolean);
  if (ubicacionParts.length > 0) {
    infoLine2.push(ubicacionParts.join(', '));
  }
  
  if (institucion?.pais) infoLine2.push(institucion.pais);
  
  if (infoLine2.length > 0) {
    doc.text(infoLine2.join(' | '), 105, 36, { align: 'center' });
  }

  // Título del Reporte
  doc.setFontSize(14);
  doc.setTextColor(50);
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
    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '-';
    
    return [
      new Date(a.timestamp).toLocaleString(),
      persona?.carnet || 'N/A',
      `${persona?.nombres} ${persona?.apellidos}`.trim(),
      persona?.grado || (persona?.cargo || 'N/A'),
      a.alumno ? 'Alumno' : 'Personal',
      a.tipo_evento === 'entrada' ? 'Entrada' : 'Salida',
      capitalize(a.estado_puntualidad)
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

  // 1. Logo Institucional (Izquierda - Columna A)
  if (institucion?.logo_base64) {
    try {
      const imageId = workbook.addImage({
        base64: institucion.logo_base64,
        extension: 'png',
      });
      sheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 80, height: 80 }
      });
    } catch (e) {
      console.warn('Error logo institucional Excel', e);
    }
  }

  // 2. Logo HikariOpen (Derecha - Columna H)
  try {
    const appLogoBase64 = await loadImageBase64('/logo.png');
    if (appLogoBase64) {
      const imageId = workbook.addImage({
        base64: appLogoBase64,
        extension: 'png',
      });
      // Ajustar posición a columna H (índice 7)
      sheet.addImage(imageId, {
        tl: { col: 7, row: 0 }, 
        ext: { width: 80, height: 80 },
        editAs: 'absolute'
      });
    }
  } catch (e) {
    console.warn('Error logo app Excel', e);
  }

  // Configurar altura de filas de encabezado
  sheet.getRow(1).height = 20;
  sheet.getRow(2).height = 20;
  sheet.getRow(3).height = 20;
  sheet.getRow(4).height = 25;

  // Título Institución (Centrado C1:F1)
  sheet.mergeCells('C1:F1');
  const titleCell = sheet.getCell('C1');
  titleCell.value = institucion?.nombre || 'Instituto Educativo';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FF1F4788' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Dirección y Teléfono (Centrado C2:F2)
  sheet.mergeCells('C2:F2');
  const addressCell = sheet.getCell('C2');
  const infoLine1 = [];
  if (institucion?.direccion) infoLine1.push(institucion.direccion);
  if (institucion?.telefono) infoLine1.push(`Tel: ${institucion.telefono}`);
  addressCell.value = infoLine1.join(' | ');
  addressCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Email y Ubicación (Centrado C3:F3)
  sheet.mergeCells('C3:F3');
  const locationCell = sheet.getCell('C3');
  const infoLine2 = [];
  if (institucion?.email) infoLine2.push(institucion.email);
  const ubicacionParts = [institucion?.municipio, institucion?.departamento].filter(Boolean);
  if (ubicacionParts.length > 0) infoLine2.push(ubicacionParts.join(', '));
  if (institucion?.pais) infoLine2.push(institucion.pais);
  locationCell.value = infoLine2.join(' | ');
  locationCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Título Reporte
  sheet.mergeCells('A5:H5');
  const reportCell = sheet.getCell('A5');
  reportCell.value = 'REPORTE DE ASISTENCIAS';
  reportCell.alignment = { horizontal: 'center', vertical: 'middle' };
  reportCell.font = { bold: true, size: 14 };
  reportCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };

  // Filtros (Fila 6)
  sheet.mergeCells('A6:H6');
  const statsCell = sheet.getCell('A6');
  const filterParts = [];
  if (filtrosGenerated.fechaInicio) filterParts.push(`Desde: ${new Date(filtrosGenerated.fechaInicio).toLocaleDateString()}`);
  if (filtrosGenerated.fechaFin) filterParts.push(`Hasta: ${new Date(filtrosGenerated.fechaFin).toLocaleDateString()}`);
  filterParts.push(`Total: ${stats.total} | Entradas: ${stats.entradas} | Salidas: ${stats.salidas} | Tardes: ${stats.tardes}`);
  statsCell.value = filterParts.join(' • ');
  statsCell.alignment = { horizontal: 'center', vertical: 'middle' };
  statsCell.font = { size: 10, italic: true };
  sheet.getRow(6).height = 20;



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
    row.getCell(7).value = a.tipo_evento === 'entrada' ? 'Entrada' : 'Salida';
    
    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '-';
    row.getCell(8).value = capitalize(a.estado_puntualidad);

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
