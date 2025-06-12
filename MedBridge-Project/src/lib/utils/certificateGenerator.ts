import { jsPDF } from 'jspdf';

interface CertificateData {
  studentName: string;
  doctorName: string;
  date: string;
  hours: number;
  topic?: string;
}

export const generateCertificate = async (data: CertificateData): Promise<Blob> => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Set background color
  doc.setFillColor(240, 240, 240);
  doc.rect(0, 0, 297, 210, 'F');

  // Add border
  doc.setDrawColor(0, 48, 87);
  doc.setLineWidth(1);
  doc.rect(10, 10, 277, 190);

  // Add header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(0, 48, 87);
  doc.text('Certificate of Completion', 148.5, 40, { align: 'center' });

  // Add MedBridge logo text
  doc.setFontSize(20);
  doc.text('MedBridge', 148.5, 25, { align: 'center' });

  // Add certificate text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('This is to certify that', 148.5, 70, { align: 'center' });

  // Add student name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text(data.studentName, 148.5, 85, { align: 'center' });

  // Add details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.text('has successfully completed a virtual shadowing session with', 148.5, 100, { align: 'center' });

  // Add doctor name
  doc.setFont('helvetica', 'bold');
  doc.text(`Dr. ${data.doctorName}`, 148.5, 115, { align: 'center' });

  // Add additional details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text([
    `Date: ${data.date}`,
    `Duration: ${data.hours} hours`,
    data.topic ? `Topic: ${data.topic}` : ''
  ].filter(Boolean), 148.5, 140, { align: 'center' });

  // Add signature line
  doc.setDrawColor(0, 0, 0);
  doc.line(90, 170, 207, 170);
  doc.setFontSize(12);
  doc.text('Doctor\'s Signature', 148.5, 175, { align: 'center' });

  // Add footer
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('This certificate is issued by MedBridge Virtual Shadowing Platform', 148.5, 190, { align: 'center' });

  return doc.output('blob');
}; 