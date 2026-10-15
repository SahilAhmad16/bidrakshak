'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

export interface Translations {
  [key: string]: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Brand & App
    appName: 'BidRakshak',
    tagline: 'AI-Powered Tender & Bid Compliance Verification Platform',
    sihBadge: 'Procurement Intelligence System',

    // Navigation
    navDashboard: 'Dashboard',
    navTenderLibrary: 'Tender Library',
    navBidderLibrary: 'Bidder Library',
    navCreateTender: 'Create Tender',
    navVerifications: 'Verification Reports',
    navProfile: 'Officer & Profile',
    navHome: 'Home',
    navLogout: 'Sign Out',
    navSignIn: 'Sign In',
    navGetStarted: 'Get Started',
    navRoleSwitch: 'Switch Role',

    // Statuses
    statusDraft: 'Draft',
    statusPublished: 'Published',
    statusOpen: 'Open',
    statusClosed: 'Closed',
    statusArchived: 'Archived',
    statusAppDraft: 'Application Draft',
    statusSubmitted: 'Submitted',
    statusPendingVerification: 'Verification Pending',
    statusInProgress: 'Verification In Progress',
    statusVerified: 'Verified',
    statusRejected: 'Rejected',
    statusNeedsReview: 'Needs Review',
    statusCompliant: 'Compliant',
    statusNonCompliant: 'Non-Compliant',
    statusMissing: 'Missing Evidence',
    statusExpired: 'Expired Document',
    statusMismatch: 'Mismatch Detected',
    statusUnableToVerify: 'Unable to Verify',
    statusUnverified: 'Unverified',
    statusOutdated: 'Outdated (Re-verification Required)',
    colOfficialStatus: 'Official Registry Status',
    officialRegistryPending: 'Pending Verification',
    officialRegistryUnverified: 'Unverified',
    officialRegistryVerified: 'Officially Verified',

    // Common Actions
    btnApply: 'Apply for Tender',
    btnPublish: 'Publish Tender',
    btnSaveDraft: 'Save as Draft',
    btnRunVerification: 'Run Verification',
    btnReVerifyDirect: 'Re-run Verification',
    btnReviewDecision: 'Record Final Decision',
    btnExportReport: 'Export / Print Report',
    btnViewDetails: 'View Details',
    btnDelete: 'Delete',
    btnEdit: 'Edit',
    btnCancel: 'Cancel',
    btnSubmitApplication: 'Submit Application',
    btnUploadFiles: 'Upload Documents',
    btnReVerify: 'Re-run Verification',
    btnSearch: 'Search',
    btnClearFilters: 'Clear Filters',
    btnBack: 'Back',

    // Tender Library Page
    tenderLibraryTitle: 'Tender Discovery & Library',
    tenderLibrarySubtitle: 'Browse active government tenders, review qualification criteria, and apply directly.',
    searchTendersPlaceholder: 'Search by tender title, reference, issuing department, or keyword...',
    filterAll: 'All Tenders',
    filterPublished: 'Published / Open',
    filterDraft: 'My Drafts',
    filterClosed: 'Closed Tenders',
    filterCategory: 'All Categories',
    filterDepartment: 'All Departments',
    sortByDeadline: 'Deadline: Nearest',
    sortByDate: 'Date: Newest First',
    tendersFound: 'tenders found',
    noTendersFound: 'No tenders match the specified criteria.',
    deadlineLabel: 'Submission Deadline',
    budgetLabel: 'Estimated Value',
    departmentLabel: 'Department / Organization',
    categoryLabel: 'Category',
    locationLabel: 'Location',
    applicationsCountLabel: 'Applications Received',

    // Tender Creation Page
    createTenderTitle: 'Tender Creation & Requirement Extraction',
    createTenderSubtitle: 'Upload tender RFP document(s) to extract requirement baseline. Review criteria before publishing.',
    step1Label: '1. Enter Details & Documents',
    step2Label: '2. Review & Edit Extracted Criteria',
    step3Label: '3. Publish to Tender Library',
    tenderTitleLabel: 'Tender Title',
    tenderTitlePlaceholder: 'e.g. RFP for Supply of High-Capacity Enterprise Servers',
    tenderOrgLabel: 'Procurement Department / Issuing Organization',
    tenderOrgPlaceholder: 'e.g. National Informatics Centre Services Inc (NICSI)',
    tenderRefLabel: 'Tender Reference / ID',
    tenderRefPlaceholder: 'e.g. NICSI/IT-SRV/2026/104',
    tenderCategoryLabel: 'Tender Category',
    tenderLocationLabel: 'Location / State',
    tenderBudgetLabel: 'Estimated Budget / Value',
    tenderBudgetPlaceholder: 'e.g. ₹25 Crores or ₹50 Lakhs',
    tenderDeadlineLabel: 'Bid Submission Deadline',
    tenderScopeLabel: 'Description & Scope of Work',
    tenderScopePlaceholder: 'Provide brief scope or objectives of the procurement contract...',
    tenderClausesLabel: 'Direct RFP Clauses (Optional text input)',
    btnExtractReview: 'Extract & Review Requirements',
    publishedNotice: 'Tender published successfully! It is now live in the Tender Library for eligible bidders.',
    draftNotice: 'Tender saved as Draft. You can review, update, and publish it when ready.',

    // Bidder Application
    applyModalTitle: 'Bidder Application Form',
    applyModalSubtitle: 'Submit company credentials and required evidence for evaluation against tender criteria.',
    bidderNameLabel: 'Bidder / Company Name',
    bidderPanLabel: 'Company PAN',
    bidderGstinLabel: 'Company GSTIN',
    bidderUdyamLabel: 'Udyam / MSME Registration Number',
    bidderDocsLabel: 'Upload Bid Documents & Supporting Evidence (PDF)',
    bidderDocsHint: 'Upload GST certificate, PAN, Balance Sheet with UDIN, MAF, Work Orders, and Declarations.',
    mandatoryChecklistTitle: 'Tender Eligibility & Mandatory Checklist',
    mandatoryChecklistHint: 'Ensure your uploaded documentation addresses all mandatory tender clauses before submitting.',
    duplicateAppError: 'You have already submitted an application for this tender.',
    deadlinePassedError: 'The submission deadline for this tender has passed. Applications are closed.',
    appSubmittedSuccess: 'Application submitted successfully! Your submission is queued for compliance verification.',

    // Bidder Library & Dashboard
    bidderLibraryTitle: 'Bidder Dashboard & Library',
    bidderLibrarySubtitle: 'Track your submitted tenders, manage company documentation, and review verification audit outcomes.',
    myApplicationsTab: 'My Tender Applications',
    companyProfileTab: 'Company Profile & Credentials',
    totalApplicationsMetric: 'Total Applications',
    pendingVerificationMetric: 'Awaiting Audit',
    approvedBidsMetric: 'Approved / High Compliance',
    actionRequiredMetric: 'Action / Review Required',

    // Verification Report
    reportTitle: 'Procurement Verification & Compliance Report',
    reportSubtitle: 'AI-assisted comparative audit evaluating submitted bidder evidence against tender requirements.',
    complianceScoreLabel: 'Compliance Score',
    riskScoreLabel: 'Procurement Risk Index',
    riskLevelLabel: 'Risk Assessment Level',
    authenticitySectionTitle: 'Document Authenticity & Extraction Transparency',
    authenticityNotice: 'Documents analyzed via AI text extraction and structural pattern recognition. External registry checks: Unofficial autonomous validation.',
    clauseComparisonTitle: 'Clause-by-Clause Tender vs Bidder Evaluation',
    colRequirement: 'Tender Requirement',
    colCategory: 'Category',
    colEvidence: 'Bidder Evidence & Excerpt',
    colStatus: 'Verification Status',
    colScore: 'Score Awarded',
    colRemarks: 'Audit Remarks & Source Reference',
    officerDecisionTitle: 'Authorized Procurement Officer Decision',
    decisionApproved: 'Officially Qualified / Approved',
    decisionRejected: 'Disqualified / Rejected',
    decisionClarification: 'Needs Formal Clarification',
    decisionRemarksLabel: 'Decision Remarks & Justification',
    btnRecordDecision: 'Submit Officer Decision',

    // Dashboard
    dashboardTitle: 'Executive Procurement Intelligence',
    dashboardSubtitle: 'Real-time monitoring of tender publishing, bidder submittals, and AI compliance audits.',
    metricTenders: 'Published Tenders',
    metricBidders: 'Bidder Applications',
    metricVerified: 'Completed Audits',
    metricAverageScore: 'Average Compliance Score',
    recentActivityTitle: 'Recent Applications & Verifications',
    riskDistributionTitle: 'Procurement Risk Distribution',

    // Languages
    langEn: 'English',
    langHi: 'हिंदी (Hindi)',
  },
  hi: {
    // Brand & App
    appName: 'बिडरक्षक',
    tagline: 'एआई-संचालित निविदा और बोली अनुपालन सत्यापन मंच',
    sihBadge: 'सरकारी खरीद आसूचना प्रणाली',

    // Navigation
    navDashboard: 'डैशबोर्ड',
    navTenderLibrary: 'निविदा लाइब्रेरी',
    navBidderLibrary: 'बोलीदाता लाइब्रेरी',
    navCreateTender: 'निविदा बनाएं',
    navVerifications: 'सत्यापन रिपोर्ट',
    navProfile: 'अधिकारी एवं प्रोफाइल',
    navHome: 'होम',
    navLogout: 'लॉग आउट',
    navSignIn: 'लॉग इन करें',
    navGetStarted: 'शुरू करें',
    navRoleSwitch: 'भूमिका बदलें',

    // Statuses
    statusDraft: 'प्रारूप (Draft)',
    statusPublished: 'प्रकाशित (Published)',
    statusOpen: 'खुला (Open)',
    statusClosed: 'बंद (Closed)',
    statusArchived: 'अभिलेखागार (Archived)',
    statusAppDraft: 'आवेदन प्रारूप (Draft)',
    statusSubmitted: 'जमा किया गया (Submitted)',
    statusPendingVerification: 'सत्यापन लंबित (Pending)',
    statusInProgress: 'सत्यापन प्रगति पर (In Progress)',
    statusVerified: 'सत्यापित (Verified)',
    statusRejected: 'अस्वीकृत (Rejected)',
    statusNeedsReview: 'समीक्षा आवश्यक (Needs Review)',
    statusCompliant: 'अनुपालन (Compliant)',
    statusNonCompliant: 'गैर-अनुपालन (Non-Compliant)',
    statusMissing: 'साक्ष्य अनुपलब्ध (Missing)',
    statusExpired: 'समाप्त दस्तावेज (Expired)',
    statusMismatch: 'विसंगति पाई गई (Mismatch)',
    statusUnableToVerify: 'सत्यापन में असमर्थ (Unable)',
    statusUnverified: 'असत्यापित (Unverified)',
    statusOutdated: 'अद्यतन आवश्यक (Re-verification)',
    colOfficialStatus: 'आधिकारिक रजिस्ट्री स्थिति',
    officialRegistryPending: 'सत्यापन लंबित (Pending)',
    officialRegistryUnverified: 'असत्यापित (Unverified)',
    officialRegistryVerified: 'आधिकारिक तौर पर सत्यापित',

    // Common Actions
    btnApply: 'निविदा के लिए आवेदन करें',
    btnPublish: 'निविदा प्रकाशित करें',
    btnSaveDraft: 'प्रारूप सहेजें',
    btnRunVerification: 'सत्यापन चलाएं',
    btnReVerifyDirect: 'पुनः सत्यापन चलाएं',
    btnReviewDecision: 'अंतिम निर्णय दर्ज करें',
    btnExportReport: 'रिपोर्ट निर्यात / प्रिंट करें',
    btnViewDetails: 'विवरण देखें',
    btnDelete: 'हटाएं',
    btnEdit: 'संपादित करें',
    btnCancel: 'रद्द करें',
    btnSubmitApplication: 'आवेदन जमा करें',
    btnUploadFiles: 'दस्तावेज अपलोड करें',
    btnReVerify: 'पुनः सत्यापन करें',
    btnSearch: 'खोजें',
    btnClearFilters: 'फ़िल्टर हटाएं',
    btnBack: 'वापस जाएं',

    // Tender Library Page
    tenderLibraryTitle: 'निविदा खोज एवं लाइब्रेरी',
    tenderLibrarySubtitle: 'सक्रिय सरकारी निविदाएं खोजें, पात्रता मानदंड जांचें और सीधे आवेदन करें।',
    searchTendersPlaceholder: 'निविदा शीर्षक, संदर्भ संख्या, विभाग या कीवर्ड द्वारा खोजें...',
    filterAll: 'सभी निविदाएं',
    filterPublished: 'प्रकाशित / खुली निविदाएं',
    filterDraft: 'मेरे प्रारूप',
    filterClosed: 'बंद निविदाएं',
    filterCategory: 'सभी श्रेणियां',
    filterDepartment: 'सभी विभाग',
    sortByDeadline: 'अंतिम तिथि: निकटतम',
    sortByDate: 'दिनांक: नवीनतम पहले',
    tendersFound: 'निविदाएं मिलीं',
    noTendersFound: 'निर्दिष्ट मानदंडों से कोई निविदा मेल नहीं खाती।',
    deadlineLabel: 'आवेदन की अंतिम तिथि',
    budgetLabel: 'अनुमानित मूल्य / बजट',
    departmentLabel: 'विभाग / संगठन',
    categoryLabel: 'श्रेणी',
    locationLabel: 'स्थान',
    applicationsCountLabel: 'प्राप्त आवेदन',

    // Tender Creation Page
    createTenderTitle: 'निविदा निर्माण एवं आवश्यकता निष्कर्षण',
    createTenderSubtitle: 'आरएफपी दस्तावेज अपलोड करें। आवश्यकता आधार रेखा की समीक्षा करें और फिर प्रकाशित करें।',
    step1Label: '1. विवरण और दस्तावेज दर्ज करें',
    step2Label: '2. निष्कर्षित मानदंडों की समीक्षा व संपादन',
    step3Label: '3. निविदा लाइब्रेरी में प्रकाशित करें',
    tenderTitleLabel: 'निविदा का शीर्षक',
    tenderTitlePlaceholder: 'उदा. उच्च क्षमता वाले सर्वरों की आपूर्ति हेतु निविदा',
    tenderOrgLabel: 'खरीद विभाग / जारीकर्ता संगठन',
    tenderOrgPlaceholder: 'उदा. राष्ट्रीय सूचना विज्ञान केंद्र (NICSI)',
    tenderRefLabel: 'निविदा संदर्भ / आईडी',
    tenderRefPlaceholder: 'उदा. NICSI/IT-SRV/2026/104',
    tenderCategoryLabel: 'निविदा श्रेणी',
    tenderLocationLabel: 'स्थान / राज्य',
    tenderBudgetLabel: 'अनुमानित बजट / मूल्य',
    tenderBudgetPlaceholder: 'उदा. ₹25 करोड़ या ₹50 लाख',
    tenderDeadlineLabel: 'बोली जमा करने की अंतिम तिथि',
    tenderScopeLabel: 'कार्य का विवरण एवं दायरा',
    tenderScopePlaceholder: 'खरीद अनुबंध के उद्देश्य या संक्षिप्त कार्यक्षेत्र दर्ज करें...',
    tenderClausesLabel: 'प्रत्यक्ष आरएफपी शर्तें (वैकल्पिक टेक्स्ट)',
    btnExtractReview: 'आवश्यकताएं निकालें और समीक्षा करें',
    publishedNotice: 'निविदा सफलतापूर्वक प्रकाशित हो गई! अब यह निविदा लाइब्रेरी में पात्र बोलीदाताओं के लिए उपलब्ध है।',
    draftNotice: 'निविदा प्रारूप के रूप में सहेजी गई। आप समीक्षा के बाद इसे कभी भी प्रकाशित कर सकते हैं।',

    // Bidder Application
    applyModalTitle: 'बोलीदाता आवेदन पत्र',
    applyModalSubtitle: 'निविदा मानदंडों के विरुद्ध मूल्यांकन के लिए कंपनी विवरण और आवश्यक साक्ष्य प्रस्तुत करें।',
    bidderNameLabel: 'बोलीदाता / कंपनी का नाम',
    bidderPanLabel: 'कंपनी पैन (PAN)',
    bidderGstinLabel: 'कंपनी जीएसटी (GSTIN)',
    bidderUdyamLabel: 'उद्यम / एमएसएमई पंजीकरण संख्या',
    bidderDocsLabel: 'बोली दस्तावेज व साक्ष्य अपलोड करें (PDF)',
    bidderDocsHint: 'जीएसटी, पैन, यूडीआईएन सहित बैलेंस शीट, ओईएम प्राधिकरण और घोषणा पत्र अपलोड करें।',
    mandatoryChecklistTitle: 'निविदा पात्रता एवं अनिवार्य जांच सूची',
    mandatoryChecklistHint: 'जमा करने से पहले सुनिश्चित करें कि आपके दस्तावेज सभी अनिवार्य शर्तों को पूरा करते हैं।',
    duplicateAppError: 'आप इस निविदा के लिए पहले ही आवेदन जमा कर चुके हैं।',
    deadlinePassedError: 'इस निविदा की अंतिम तिथि समाप्त हो चुकी है। आवेदन बंद हैं।',
    appSubmittedSuccess: 'आवेदन सफलतापूर्वक जमा हो गया! यह अनुपालन सत्यापन के लिए कतारबद्ध है।',

    // Bidder Library & Dashboard
    bidderLibraryTitle: 'बोलीदाता डैशबोर्ड एवं लाइब्रेरी',
    bidderLibrarySubtitle: 'अपने जमा किए गए आवेदनों को ट्रैक करें, कंपनी दस्तावेज प्रबंधित करें और सत्यापन परिणाम देखें।',
    myApplicationsTab: 'मेरे निविदा आवेदन',
    companyProfileTab: 'कंपनी प्रोफाइल एवं विवरण',
    totalApplicationsMetric: 'कुल आवेदन',
    pendingVerificationMetric: 'सत्यापन प्रतीक्षारत',
    approvedBidsMetric: 'स्वीकृत / उच्च अनुपालन',
    actionRequiredMetric: 'कार्रवाई आवश्यक',

    // Verification Report
    reportTitle: 'खरीद सत्यापन एवं अनुपालन रिपोर्ट',
    reportSubtitle: 'निविदा आवश्यकताओं के विरुद्ध प्रस्तुत बोलीदाता साक्ष्यों का एआई-सहायता प्राप्त तुलनात्मक ऑडिट।',
    complianceScoreLabel: 'अनुपालन स्कोर',
    riskScoreLabel: 'खरीद जोखिम सूचकांक',
    riskLevelLabel: 'जोखिम मूल्यांकन स्तर',
    authenticitySectionTitle: 'दस्तावेज प्रामाणिकता एवं निष्कर्षण पारदर्शिता',
    authenticityNotice: 'दस्तावेजों का विश्लेषण एआई टेक्स्ट निष्कर्षण और पैटर्न पहचान द्वारा किया गया है। सरकारी रजिस्ट्री सत्यापन: अनौपचारिक स्वायत्त निरीक्षण।',
    clauseComparisonTitle: 'शर्त-दर-शर्त निविदा बनाम बोलीदाता मूल्यांकन',
    colRequirement: 'निविदा आवश्यकता',
    colCategory: 'श्रेणी',
    colEvidence: 'बोलीदाता साक्ष्य एवं उद्धरण',
    colStatus: 'सत्यापन स्थिति',
    colScore: 'अंक प्रदान किए गए',
    colRemarks: 'ऑडिट टिप्पणियां एवं स्रोत संदर्भ',
    officerDecisionTitle: 'अधिकृत खरीद अधिकारी का निर्णय',
    decisionApproved: 'आधिकारिक तौर पर योग्य / स्वीकृत',
    decisionRejected: 'अयोग्य / अस्वीकृत घोषित',
    decisionClarification: 'औपचारिक स्पष्टीकरण आवश्यक',
    decisionRemarksLabel: 'निर्णय टिप्पणी एवं औचित्य',
    btnRecordDecision: 'अधिकारी निर्णय दर्ज करें',

    // Dashboard
    dashboardTitle: 'कार्यकारी खरीद आसूचना',
    dashboardSubtitle: 'निविदा प्रकाशन, बोलीदाता आवेदनों और एआई अनुपालन ऑडिट की वास्तविक समय पर निगरानी।',
    metricTenders: 'प्रकाशित निविदाएं',
    metricBidders: 'बोलीदाता आवेदन',
    metricVerified: 'पूर्ण किए गए ऑडिट',
    metricAverageScore: 'औसत अनुपालन स्कोर',
    recentActivityTitle: 'हाल की गतिविधियां एवं सत्यापन',
    riskDistributionTitle: 'खरीद जोखिम वितरण',

    // Languages
    langEn: 'English',
    langHi: 'हिंदी (Hindi)',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bidrakshak_language') as Language;
      if (stored === 'en' || stored === 'hi') {
        setLanguageState(stored);
      }
    } catch {
      // localStorage may fail in SSR or restricted environments
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('bidrakshak_language', lang);
    } catch {
      // ignore
    }
  };

  const t = (key: string, fallback?: string): string => {
    const dict = translations[language] || translations.en;
    if (dict[key] !== undefined) return dict[key];
    if (translations.en[key] !== undefined) return translations.en[key];
    return fallback !== undefined ? fallback : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
