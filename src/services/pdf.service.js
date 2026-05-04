import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve('uploads/pdfs');

/**
 * Genera el PDF de un albarán y lo guarda en disco.
 * Devuelve la ruta relativa del archivo generado.
 */
export const generateDeliveryNotePdf = (note) => {
  return new Promise((resolve, reject) => {
    const filename = `albaran-${note._id}.pdf`;
    const filepath = path.join(OUTPUT_DIR, filename);
    const doc = new PDFDocument({ margin: 50 });

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Cabecera
    doc.fontSize(20).font('Helvetica-Bold').text('ALBARÁN', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Nº: ${note._id}`, { align: 'center' });
    doc.moveDown(1.5);

    // Datos de empresa y cliente
    doc.fontSize(12).font('Helvetica-Bold').text('Empresa');
    doc.fontSize(10).font('Helvetica').text(`ID: ${note.company}`);
    doc.moveDown(0.5);

    if (note.client) {
      doc.fontSize(12).font('Helvetica-Bold').text('Cliente');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Nombre: ${note.client.name ?? note.client}`);
      if (note.client.cif) doc.text(`CIF: ${note.client.cif}`);
      if (note.client.email) doc.text(`Email: ${note.client.email}`);
    }
    doc.moveDown(0.5);

    if (note.project) {
      doc.fontSize(12).font('Helvetica-Bold').text('Proyecto');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Nombre: ${note.project.name ?? note.project}`);
      if (note.project.projectCode) doc.text(`Código: ${note.project.projectCode}`);
    }
    doc.moveDown(1);

    // Fecha de trabajo
    doc.fontSize(12).font('Helvetica-Bold').text('Fecha de trabajo');
    doc.fontSize(10).font('Helvetica').text(new Date(note.workDate).toLocaleDateString('es-ES'));
    doc.moveDown(1);

    // Contenido según formato
    doc.fontSize(12).font('Helvetica-Bold').text('Detalle');
    doc.moveDown(0.3);

    if (note.format === 'hours') {
      doc.fontSize(10).font('Helvetica');
      doc.text(`Formato: Horas`);
      doc.text(`Horas trabajadas: ${note.hours}`);
      if (note.workers) doc.text(`Trabajadores: ${note.workers}`);
    } else {
      doc.fontSize(10).font('Helvetica').text('Formato: Material');
      doc.moveDown(0.3);

      // Cabecera de tabla de materiales
      const tableTop = doc.y;
      const col = { material: 50, quantity: 300, unit: 400 };

      doc.font('Helvetica-Bold');
      doc.text('Material', col.material, tableTop);
      doc.text('Cantidad', col.quantity, tableTop);
      doc.text('Unidad', col.unit, tableTop);
      doc.moveDown(0.3);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.3);

      doc.font('Helvetica');
      (note.items ?? []).forEach((item) => {
        const y = doc.y;
        doc.text(item.material, col.material, y);
        doc.text(String(item.quantity), col.quantity, y);
        doc.text(item.unit, col.unit, y);
        doc.moveDown(0.3);
      });
    }

    doc.moveDown(2);

    // Firma
    doc.fontSize(12).font('Helvetica-Bold').text('Firma');
    doc.moveDown(0.3);

    if (note.signed && note.signatureUrl) {
      const sigPath = path.resolve(note.signatureUrl.replace(/^\//, ''));
      if (fs.existsSync(sigPath)) {
        doc.image(sigPath, { width: 150 });
      }
      doc.fontSize(10).font('Helvetica').text(
        `Firmado el ${new Date(note.signedAt).toLocaleString('es-ES')}`
      );
    } else {
      doc.fontSize(10).font('Helvetica').text('Pendiente de firma');
      doc.moveDown(3);
      doc.moveTo(50, doc.y).lineTo(250, doc.y).stroke();
    }

    doc.end();

    stream.on('finish', () => resolve(`uploads/pdfs/${filename}`));
    stream.on('error', reject);
  });
};
