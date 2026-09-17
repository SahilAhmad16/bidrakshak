const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outDir = path.join(__dirname, '..', 'public', 'sample-tenders');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. GENERATE TENDER DOCUMENT (Smart City AI CCTV & Surveillance RFP)
function generateTenderPDF() {
  const filePath = path.join(outDir, 'Tender_NIT_SmartSurveillance_2026.pdf');
  const doc = new PDFDocument({ margin: 40, size: 'A4', compress: false });
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Top Header Banner
  doc.rect(40, 40, 515, 65).fill('#0F172A');
  doc.fillColor('#FFFFFF');
  doc.fontSize(14).font('Helvetica-Bold').text('MINISTRY OF HOUSING AND URBAN AFFAIRS', 50, 52, { align: 'center' });
  doc.fontSize(10).font('Helvetica').text('MUNICIPAL SMART CITY DEVELOPMENT CORPORATION LTD', { align: 'center' });
  doc.fontSize(9).font('Helvetica-Oblique').text('Government of India Enterprise | Smart City Mission Mission Project', { align: 'center' });
  
  doc.moveDown(2);
  doc.fillColor('#000000');
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#1D4ED8').text('NOTICE INVITING TENDER (NIT) & RFP DOCUMENT', { align: 'center' });
  doc.fontSize(9).font('Helvetica').fillColor('#475569').text('Tender Reference: MOHUA/SC-CCTV/2026/09 | Dated: 12-09-2026', { align: 'center' });
  doc.moveDown(1);

  doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text('PROJECT SCOPE: SUPPLY, INSTALLATION, COMMISSIONING & 5-YEAR O&M OF AI SMART SURVEILLANCE CAMERAS AND FIBER NETWORK');
  doc.moveDown(0.5);

  doc.fontSize(10).font('Helvetica').fillColor('#1E293B');
  doc.text('Sealed tenders are invited from eligible and reputed system integrators for deployment of an enterprise-grade AI-powered surveillance network. Bidders must satisfy all statutory, technical, and financial criteria detailed below.');
  doc.moveDown(0.8);

  // Section 1: Statutory Criteria
  doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#0369A1').text('1. STATUTORY ELIGIBILITY & REGISTRATION REQUIREMENTS');
  doc.fontSize(9.5).font('Helvetica').fillColor('#1E293B');
  doc.text('1.1 GST Compliance: Bidder must possess active GST Registration (GSTIN) with certified copies of the last 12 months GSTR-3B filed returns.');
  doc.text('1.2 Income Tax & PAN: Bidder must possess a valid PAN card and furnish audited Income Tax Returns (ITR) for the preceding 3 assessment years.');
  doc.text('1.3 Entity Proof: Valid Certificate of Incorporation under the Companies Act 2013 with valid Corporate Identification Number (CIN).');
  doc.text('1.4 Labor Compliance: Valid EPFO and ESIC establishment registration certificates along with recent monthly Electronic Challan cum Return (ECR) payment receipts.');
  doc.text('1.5 MSME / Udyam Benefits: Micro & Small Enterprises (MSEs) registered under Udyam Registration are entitled to EMD exemption and tender fee waiver.');
  doc.moveDown(0.8);

  // Section 2: Technical Qualifications
  doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#0369A1').text('2. TECHNICAL QUALIFICATION & OEM AUTHORIZATION');
  doc.fontSize(9.5).font('Helvetica').fillColor('#1E293B');
  doc.text('2.1 OEM Authorization Form (MAF): Tender-specific Manufacturer Authorization Form (MAF) from the CCTV OEM guaranteeing 5 years 24x7 hardware replacement and firmware support.');
  doc.text('2.2 Past Experience: The bidder must have successfully completed at least 3 similar smart surveillance or IT networking contracts for Government / PSU bodies with satisfactory client completion certificates.');
  doc.text('2.3 Quality Standards: The bidder must hold ISO 9001 and ISO 27001 certifications and BIS compliance for all edge IP cameras.');
  doc.moveDown(0.8);

  // Section 3: Financial Qualifications
  doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#0369A1').text('3. FINANCIAL ELIGIBILITY & INTEGRITY PACT');
  doc.fontSize(9.5).font('Helvetica').fillColor('#1E293B');
  doc.text('3.1 Annual Financial Turnover: Minimum average annual turnover of INR 15 Crores during the last 3 financial years. Audited balance sheets with CA certified UDIN mandatory.');
  doc.text('3.2 Bank Solvency: Certified Solvency Certificate from a scheduled commercial bank demonstrating working capital.');
  doc.text('3.3 Make in India (Local Content): In accordance with Public Procurement Order (PPO), bidder must certify minimum 50% Class-I Local Content self-declaration.');
  doc.text('3.4 Non-Blacklisting Undertaking: Notarized affidavit on INR 100 non-judicial stamp paper stating the bidder has not been blacklisted or debarred by any Central/State Govt.');

  doc.end();
  return new Promise((resolve) => writeStream.on('finish', resolve));
}

// 2. GENERATE COMPLIANT BIDDER PROPOSAL (ABC Technologies Pvt Ltd - Score > 90%, Low Risk)
function generateBidderPDF() {
  const filePath = path.join(outDir, 'Bidder_Compliant_ABC_Technologies.pdf');
  const doc = new PDFDocument({ margin: 40, size: 'A4', compress: false });
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Top Header Banner
  doc.rect(40, 40, 515, 65).fill('#065F46');
  doc.fillColor('#FFFFFF');
  doc.fontSize(14).font('Helvetica-Bold').text('ABC TECHNOLOGIES PRIVATE LIMITED', 50, 52, { align: 'center' });
  doc.fontSize(10).font('Helvetica').text('TECHNICAL QUALIFICATION DOSSIER & BID PROPOSAL', { align: 'center' });
  doc.fontSize(9).font('Helvetica-Oblique').text('Submission against Tender Reference: MOHUA/SC-CCTV/2026/09', { align: 'center' });
  
  doc.moveDown(2);
  doc.fillColor('#000000');
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#047857').text('BIDDER CREDENTIALS & CLAUSE-BY-CLAUSE COMPLIANCE STATEMENT', { align: 'center' });
  doc.fontSize(9).font('Helvetica').fillColor('#475569').text('Bidder: ABC Technologies Pvt Ltd | Registered Vendor ID: V-98241', { align: 'center' });
  doc.moveDown(1);

  // Section 1: Statutory Compliance Evidence
  doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#065F46').text('1. STATUTORY COMPLIANCE & LEGAL REGISTRATIONS');
  doc.fontSize(9.5).font('Helvetica').fillColor('#1E293B');
  doc.text('1.1 GST Registration: Active GSTIN 27ABCDE1234F1Z5 registered in Maharashtra. Verified GSTR-3B monthly return filings submitted for all 4 quarters.');
  doc.text('1.2 Permanent Account Number: Valid PAN AAACA9999P. Income Tax Return (ITR-V) acknowledgments for FY 2023-24, FY 2024-25, and FY 2025-26 enclosed.');
  doc.text('1.3 Entity Incorporation: Registered under Companies Act. Certificate of Incorporation No: U72200MH2016PTC284910 issued by Registrar of Companies (ROC).');
  doc.text('1.4 MSME Registration: Micro & Small Enterprise Udyam Registration Certificate: UDYAM-MH-02-0012345 verified under Class MSE.');
  doc.text('1.5 Labor Statutory Proof: Active EPFO Registration Code MH/BAN/0048192 and ESIC Code 31000492810001001 with verified monthly ECR challan payment receipts.');
  doc.moveDown(0.8);

  // Section 2: Technical & OEM Submittals
  doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#065F46').text('2. TECHNICAL QUALIFICATIONS & OEM AUTHORIZATION (MAF)');
  doc.fontSize(9.5).font('Helvetica').fillColor('#1E293B');
  doc.text('2.1 Manufacturer Authorization Form: Attached official tender-specific OEM Manufacturer Authorization Form (MAF Ref: OEM-SEC/2026/8821) from Hikvision/Bosch OEM with 5-year 24x7 SLA warranty.');
  doc.text('2.2 Past Project Experience: Successfully executed 3 smart city surveillance projects. Enclosed client completion certificates for: (a) Pune Smart City (INR 12 Cr), (b) Bhopal Municipal Corp (INR 8.5 Cr), (c) Surat Safe City (INR 14 Cr).');
  doc.text('2.3 Quality Standards: Enclosed certified copies of ISO 9001:2015 Quality Management and ISO 27001 Information Security Management, along with BIS compliance certificates.');
  doc.moveDown(0.8);

  // Section 3: Financial & Integrity
  doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#065F46').text('3. FINANCIAL CAPACITY, LOCAL CONTENT & INTEGRITY DECLARATION');
  doc.fontSize(9.5).font('Helvetica').fillColor('#1E293B');
  doc.text('3.1 Annual Turnover: Average annual turnover of INR 18.5 Crores during the last 3 financial years. CA Audit Certificate with UDIN: 26045812BKRLPX8819 attached.');
  doc.text('3.2 Bank Solvency: Bank Solvency Certificate of INR 5 Crores from State Bank of India (SBI Commercial Branch) enclosed.');
  doc.text('3.3 Public Procurement Order (Make in India): Self-declaration certifying 65% Class-I Local Content manufactured and assembled in India.');
  doc.text('3.4 Integrity Undertaking: Notarized affidavit on stamp paper affirming non-blacklisting and non-debarment by any Government ministry or department.');

  doc.end();
  return new Promise((resolve) => writeStream.on('finish', resolve));
}

async function run() {
  console.log('Generating high-accuracy sample PDFs...');
  await generateTenderPDF();
  await generateBidderPDF();
  console.log('Done! Files saved in public/sample-tenders/');
}

run();
