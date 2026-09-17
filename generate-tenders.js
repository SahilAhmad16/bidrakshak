const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outDir = path.join(__dirname, 'public', 'sample-tenders');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. GENERATE COMPLIANT LOW RISK TENDER (Score ~90-100, Low Risk)
function generateLowRiskTender() {
  const filePath = path.join(outDir, 'Tender_Compliant_LowRisk.pdf');
  const doc = new PDFDocument({ margin: 50, size: 'A4', compress: false });
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Header
  doc.fontSize(16).font('Helvetica-Bold').text('NATIONAL INFORMATICS & TELECOMMUNICATIONS CORPORATION', { align: 'center' });
  doc.fontSize(10).font('Helvetica').text('(A Government of India Enterprise)', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica-Bold').text('NOTICE INVITING TENDER (NIT)', { align: 'center' });
  doc.fontSize(9).font('Helvetica').text('Tender Reference No: NIT-NITC/DC-HW/2026/089 | Dated: 10-09-2026', { align: 'center' });
  doc.moveDown(1);

  // Title
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#1E3A8A').text('TENDER DOCUMENT FOR SUPPLY, COMMISSIONING AND MAINTENANCE OF ENTERPRISE DATA CENTER SERVER INFRASTRUCTURE');
  doc.fillColor('#000000');
  doc.moveDown(1);

  // Section 1: Eligibility & Statutory
  doc.fontSize(11).font('Helvetica-Bold').text('1. STATUTORY AND LEGAL ELIGIBILITY CRITERIA');
  doc.fontSize(10).font('Helvetica');
  doc.text('1.1 GST Compliance: The bidder must possess a valid GST registration. The bidder shall submit a certified copy of GSTIN registration certificate along with the latest GSTR-3B return filings for the preceding quarter.');
  doc.moveDown(0.5);
  doc.text('1.2 PAN / Direct Tax: The bidder must possess a valid Permanent Account Number (PAN) issued by the Income Tax Department. Copies of PAN card and Income Tax Return (ITR) acknowledgments for the last 3 financial years must be furnished.');
  doc.moveDown(0.5);
  doc.text('1.3 Entity Registration: The bidder must be a registered commercial entity under the Companies Act or a registered Partnership Deed / LLP. A certified copy of the Certificate of Incorporation from the Registrar of Companies (RoC) and CIN must be submitted.');
  doc.moveDown(0.5);
  doc.text('1.4 MSME / Udyam Concessions: Micro and Small Enterprises (MSEs) registered under Udyam Registration or NSIC are entitled to tender fee exemption and Earnest Money Deposit (EMD) exemption under the Public Procurement Policy for MSEs.');
  doc.moveDown(1);

  // Section 2: Technical & OEM
  doc.fontSize(11).font('Helvetica-Bold').text('2. TECHNICAL QUALIFICATIONS & OEM AUTHORIZATION');
  doc.fontSize(10).font('Helvetica');
  doc.text('2.1 OEM Authorization Form (MAF): The bidder must submit a tender-specific Manufacturer Authorization Form (MAF) from the Original Equipment Manufacturer (OEM) guaranteeing 3-year comprehensive 24x7 back-to-back OEM warranty support.');
  doc.moveDown(0.5);
  doc.text('2.2 Technical Specifications & Standards: The bidder must provide a clause-by-clause technical compliance sheet. All equipment must adhere to ISO 9001 quality management systems and BIS standards with valid manufacturer test certificates and datasheets.');
  doc.moveDown(0.5);
  doc.text('2.3 Past Experience: The bidder must possess at least 5 years of past experience in similar server infrastructure projects and must have successfully executed at least 3 similar work orders with client completion certificates.');
  doc.moveDown(1);

  // Section 3: Financial Criteria
  doc.fontSize(11).font('Helvetica-Bold').text('3. FINANCIAL ELIGIBILITY CRITERIA');
  doc.fontSize(10).font('Helvetica');
  doc.text('3.1 Minimum Annual Turnover: The bidder must have a minimum average annual turnover of INR 10 Crores during the last 3 financial years. Audited balance sheets, profit & loss accounts, and a CA certificate with UDIN must be enclosed.');
  doc.moveDown(0.5);
  doc.text('3.2 Solvency: The bidder shall submit a certified Solvency Certificate from a scheduled commercial bank demonstrating adequate working capital.');
  doc.moveDown(1);

  // Section 4: Security & Integrity
  doc.fontSize(11).font('Helvetica-Bold').text('4. TENDER SECURITY AND INTEGRITY CONDITIONS');
  doc.fontSize(10).font('Helvetica');
  doc.text('4.1 Earnest Money Deposit (EMD): An EMD amount of INR 5,00,000/- (Rupees Five Lakhs only) must be submitted via Bank Guarantee or Demand Draft from a scheduled commercial bank.');
  doc.moveDown(0.5);
  doc.text('4.2 Non-Debarment Affidavit: The bidder must submit a notarized affidavit on stamp paper declaring that the firm has not been blacklisted, debarred, or banned by any Central or State Government PSU or department.');
  doc.moveDown(0.5);
  doc.text('4.3 Performance Bank Guarantee (PBG): The successful bidder shall furnish a Performance Bank Guarantee of 5% of the total contract value.');

  doc.end();
  return new Promise((resolve) => writeStream.on('finish', resolve));
}

// 2. GENERATE INCOMPLETE HIGH RISK TENDER (Score ~25-45, High Risk)
function generateHighRiskTender() {
  const filePath = path.join(outDir, 'Tender_Incomplete_HighRisk.pdf');
  const doc = new PDFDocument({ margin: 50, size: 'A4', compress: false });
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Header
  doc.fontSize(16).font('Helvetica-Bold').text('DISTRICT LOGISTICS CELL', { align: 'center' });
  doc.fontSize(10).font('Helvetica').text('General Administration Section', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica-Bold').text('NOTICE INVITING QUOTATIONS', { align: 'center' });
  doc.fontSize(9).font('Helvetica').text('Ref: NIQ/DIST/LOG/2026/014', { align: 'center' });
  doc.moveDown(1);

  // Title
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#991B1B').text('INVITATION OF QUOTATIONS FOR MISCELLANEOUS OFFICE REPAIRS');
  doc.fillColor('#000000');
  doc.moveDown(1);

  doc.fontSize(10).font('Helvetica');
  doc.text('Quotations are invited from local vendors for miscellaneous repair work, plumbing assistance, and periodic painting at district sub-offices as and when required.');
  doc.moveDown(1);

  doc.fontSize(11).font('Helvetica-Bold').text('TERMS AND CONDITIONS:');
  doc.fontSize(10).font('Helvetica');
  doc.text('1. Quotes must be dropped in the office dispatch counter box before 3:00 PM on the closing date.');
  doc.moveDown(0.5);
  doc.text('2. All quotes must be lump sum inclusive of local cartage and laborer charges.');
  doc.moveDown(0.5);
  doc.text('3. Vendors should be available locally and carry out tasks within reasonable notice.');
  doc.moveDown(0.5);
  doc.text('4. Workmanship and paint quality must be satisfactory as determined by the caretaker.');
  doc.moveDown(0.5);
  doc.text('5. A nominal security amount may be collected from the vendor before commencing work if required.');
  doc.moveDown(0.5);
  doc.text('6. Payment shall be released only upon completion of work and submission of a handwritten bill.');
  doc.moveDown(0.5);
  doc.text('7. The department reserves the absolute right to cancel this quotation without giving any reasons.');

  doc.end();
  return new Promise((resolve) => writeStream.on('finish', resolve));
}

async function run() {
  await generateLowRiskTender();
  console.log('Regenerated Tender_Compliant_LowRisk.pdf');
  await generateHighRiskTender();
  console.log('Regenerated Tender_Incomplete_HighRisk.pdf');
}

run().catch(console.error);
