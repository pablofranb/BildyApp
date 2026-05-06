import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const generateDeliveryNotePdf = (note, localSignaturePath = null) => {
  return new Promise((resolve, reject) => {
    const filepath = path.join(os.tmpdir(), `albaran-${note._id}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    doc.fontSize(20).font('Helvetica-Bold').text('ALBARÁN', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Nº: ${note._id}`, { align: 'center' });
    doc.moveDown(1.5);

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

    doc.fontSize(12).font('Helvetica-Bold').text('Fecha de trabajo');
    doc.fontSize(10).font('Helvetica').text(new Date(note.workDate).toLocaleDateString('es-ES'));
    doc.moveDown(1);

    if (note.description) {
      doc.fontSize(12).font('Helvetica-Bold').text('Descripción');
      doc.fontSize(10).font('Helvetica').text(note.description);
      doc.moveDown(1);
    }

    doc.fontSize(12).font('Helvetica-Bold').text('Detalle');
    doc.moveDown(0.3);

    if (note.format === 'hours') {
      doc.fontSize(10).font('Helvetica');
      doc.text('Formato: Horas');
      if (note.hours) doc.text(`Horas trabajadas: ${note.hours}`);
      if (note.workers && note.workers.length > 0) {
        doc.moveDown(0.3);
        doc.font('Helvetica-Bold').text('Trabajadores:');
        doc.font('Helvetica');
        note.workers.forEach((w) => doc.text(`  ${w.name}: ${w.hours}h`));
      }
    } else {
      doc.fontSize(10).font('Helvetica').text('Formato: Material');
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').text(`Material: ${note.material}`);
      doc.font('Helvetica').text(`Cantidad: ${note.quantity} ${note.unit}`);
    }

    doc.moveDown(2);
    doc.fontSize(12).font('Helvetica-Bold').text('Firma');
    doc.moveDown(0.3);

    if (note.signed) {
      if (localSignaturePath && fs.existsSync(localSignaturePath)) {
        doc.image(localSignaturePath, { width: 150 });
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
    stream.on('finish', () => resolve(filepath));
    stream.on('error', reject);
  });
};
