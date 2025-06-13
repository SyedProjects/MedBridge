import { jsPDF } from 'jspdf';

interface CertificateData {
  studentName: string;
  doctorName: string;
  specialty: string;
  hours: number;
  date: string;
}

export function generateCertificate(data: CertificateData): string {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Set background color
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 297, 210, 'F');

  // Add border
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(1);
  doc.rect(10, 10, 277, 190);

  // Add header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(40);
  doc.setTextColor(79, 70, 229);
  doc.text('Certificate of Completion', 148.5, 40, { align: 'center' });

  // Add MedBridge logo text
  doc.setFontSize(20);
  doc.setTextColor(17, 24, 39);
  doc.text('MedBridge', 148.5, 25, { align: 'center' });

  // Add certificate text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(55, 65, 81);
  
  const text = [
    `This is to certify that`,
    `${data.studentName}`,
    `has successfully completed ${data.hours} hours of virtual medical shadowing`,
    `under the guidance of`,
    `Dr. ${data.doctorName}`,
    `in the field of ${data.specialty}`,
    `on ${new Date(data.date).toLocaleDateString()}`,
  ];

  let y = 80;
  text.forEach((line, index) => {
    if (index === 1 || index === 4) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(17, 24, 39);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(16);
      doc.setTextColor(55, 65, 81);
    }
    doc.text(line, 148.5, y, { align: 'center' });
    y += index === 1 || index === 4 ? 15 : 10;
  });

  // Add signature line
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.5);
  doc.line(98.5, 160, 198.5, 160);

  // Add signature text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128);
  doc.text('Authorized Signature', 148.5, 170, { align: 'center' });

  // Add footer
  doc.setFontSize(10);
  doc.text('This certificate is issued by MedBridge Virtual Shadowing Platform', 148.5, 180, { align: 'center' });
  doc.text('Verify authenticity at medbridge.com/verify', 148.5, 185, { align: 'center' });

  // Return the PDF as a data URL
  return doc.output('dataurlstring');
} 