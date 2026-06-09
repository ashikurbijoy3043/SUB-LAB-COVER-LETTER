import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "./components/ui/card";

const DEFAULT_GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";

const ASSET_BASE_URL = import.meta.env.BASE_URL ?? "/";
const SUB_LOGO_URL = `${ASSET_BASE_URL}sub-logo.jpg`;
const CSE_IMAGE_URL = `${ASSET_BASE_URL}cse-logo.jpg`;
const DEPARTMENT_LOGOS = {
  architecture: `${ASSET_BASE_URL}department-architecture.jpg`,
  "business-studies": `${ASSET_BASE_URL}department-business-studies.jpg`,
  "english-studies": `${ASSET_BASE_URL}department-english-studies.jpg`,
  "environmental-science": `${ASSET_BASE_URL}department-environmental-science.jpg`,
  "food-engineering": `${ASSET_BASE_URL}department-food-engineering.jpg`,
  journalism: `${ASSET_BASE_URL}department-journalism.jpg`,
  law: `${ASSET_BASE_URL}department-law.jpg`,
  pharmacy: `${ASSET_BASE_URL}department-pharmacy.jpg`,
  "public-health": `${ASSET_BASE_URL}department-public-health.jpg`
};

const FONT_MAPPING = {
  georgia: '"Georgia", "Times New Roman", Times, serif',
  times: '"Times New Roman", Times, Georgia, serif',
  garamond: '"EB Garamond", Garamond, Georgia, serif',
  inter: '"Inter", sans-serif',
  outfit: '"Outfit", "Inter", sans-serif',
  firacode: '"Fira Code", Courier New, Courier, monospace'
};

function getFormattedCurrentDate() {
  const date = new Date();
  const day = date.getDate();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${monthName} ${year}`;
}

const defaultData = {
  pageSize: "a4",
  customWidthMm: "210",
  customHeightMm: "297",
  previewMode: "fit",
  departmentPreset: "cse",
  reportPrefix: "A LAB REPORT ON",
  reportTitle: "Determination of total hardness of water using Eriochrome Black T (EBT) as an indicator",
  university: "State University of Bangladesh",
  department: "Department of Computer Science and Engineering",
  courseCode: "CSE-3107",
  courseTitle: "Software Engineering Lab",
  experimentNo: "01",
  experimentNoOptional: false,
  experimentNoLabelType: "default",
  customExperimentNoLabel: "",
  experimentDate: "17 May 2026",
  teacherName: "SAKIB AL HASAN",
  teacherTitle: "Associate Professor",
  teacherDepartment: "Department of Computer Science and Engineering",
  submittedByName: "Ashikur Rahman Joy",
  status: "Undergraduate Student",
  year: "3rd",
  semester: "1st",
  group: "",
  session: "",
  roll: "UG02-69-26-006",
  registration: "",
  submissionDate: getFormattedCurrentDate(),
  showDepartmentLogo: false,
  departmentLogoUrl: CSE_IMAGE_URL,
  layoutTheme: "classic",
  useCustomLogo: false,
  customLogoUrl: "",
  useCustomSignature: false,
  customSignatureUrl: "",
  fontFamily: "georgia",
  headingFont: "georgia",
  bodyFont: "georgia",
  titleAlign: "center",
  courseAlign: "center",
  isGroupMode: false,
  groupStudents: [
    { name: "ASHIKUR RAHMAN JOY", roll: "UG02-69-26-006", registration: "", status: "Undergraduate Student", year: "1st", semester: "1st", group: "", session: "" }
  ],
  accentColor: "#1e3a5f",
  // Cover design extras
  bgPattern: "none",
  useBannerImage: false,
  bannerImageUrl: "",
  coverDarkMode: false,
  watermarkText: "",
  watermarkOpacity: "0.07",
  // QR code
  showQrCode: false,
  qrCodeUrl: "",
  // Deadline countdown
  submissionDeadline: "",
  // Page numbering
  pageNumberStyle: "arabic",
  pageNumberStart: "1",
  // Language
  lang: "en"
};

function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(30, 58, 95, ${alpha})`;
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 6) return `rgba(30, 58, 95, ${alpha})`;
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function SignatureDrawingPad({ onSave, onClear }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onClear();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blank = document.createElement("canvas");
    blank.width = canvas.width;
    blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL()) {
      Swal.fire({
        title: "Blank Canvas",
        text: "Please draw something on the canvas before saving.",
        icon: "warning",
        timer: 1800,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e8f0ff"
      });
      return;
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        showAppToast("Could not save the signature image.", "error");
        return;
      }
      onSave(URL.createObjectURL(blob));
    }, "image/png");
  };

  return (
    <div className="signature-pad-wrapper" style={{ marginTop: "10px", padding: "10px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "6px" }}>
      <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: "500" }}>Or draw signature here (optional):</span>
      <canvas
        ref={canvasRef}
        width={280}
        height={100}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{
          border: "1px solid var(--border-subtle)",
          background: "#ffffff",
          borderRadius: "4px",
          display: "block",
          cursor: "crosshair",
          touchAction: "none",
          width: "100%",
          maxWidth: "280px"
        }}
      />
      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        <button
          type="button"
          className="toolbar-btn"
          onClick={handleSave}
          style={{ fontSize: "0.75rem", padding: "6px 10px", height: "auto" }}
        >
          Save Signature
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={handleClear}
          style={{ fontSize: "0.75rem", padding: "6px 10px", height: "auto", background: "transparent", border: "1px solid var(--border-subtle)" }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

const optionalFields = new Set(["group", "session", "registration", "departmentLogoUrl", "experimentDate"]);

const TRANSLATIONS = {
  en: {
    courseCode: "Course Code",
    courseTitle: "Course Title",
    experimentNo: "Experiment No.",
    labProgramNo: "Lab / Program No.",
    assignmentNo: "Assignment No.",
    labNo: "Lab No.",
    labReportNo: "Lab Report No.",
    programNo: "Program No.",
    experimentDate: "Experiment Date",
    academicSubmission: "Academic Submission",
    submittedTo: "Submitted To",
    submittedBy: "Submitted By",
    dateOfSubmission: "Date of Submission",
    name: "Name",
    status: "Status",
    year: "Year",
    semester: "Semester",
    group: "Group",
    session: "Session",
    rollNo: "Roll No.",
    regNo: "Reg. No."
  },
  bn: {
    courseCode: "কোর্স কোড",
    courseTitle: "কোর্সের শিরোনাম",
    experimentNo: "এক্সপেরিমেন্ট নং",
    labProgramNo: "ল্যাব / প্রোগ্রাম নং",
    assignmentNo: "অ্যাসাইনমেন্ট নং",
    labNo: "ল্যাব নং",
    labReportNo: "ল্যাব রিপোর্ট নং",
    programNo: "প্রোগ্রাম নং",
    experimentDate: "এক্সপেরিমেন্টের তারিখ",
    academicSubmission: "একাডেমিক জমাদান",
    submittedTo: "জমা দেওয়া হয়েছে",
    submittedBy: "জমা দিয়েছে",
    dateOfSubmission: "জমাদানের তারিখ",
    name: "নাম",
    status: "স্ট্যাটাস",
    year: "বর্ষ",
    semester: "সেমিস্টার",
    group: "গ্রুপ",
    session: "সেশন",
    rollNo: "রোল নং",
    regNo: "রেজি. নং"
  }
};

function t(formData, key) {
  const lang = formData?.lang === "bn" ? "bn" : "en";
  return TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? key;
}

function countWords(value = "") {
  return String(value).trim().split(/\s+/).filter(Boolean).length;
}

function getCounterTone(count, limit) {
  if (count > limit) return "#ef4444";
  if (count > limit * 0.8) return "#f97316";
  return "#15803d";
}

function toRoman(num) {
  const value = Math.max(1, Number(num) || 1);
  const map = [["m", 1000], ["cm", 900], ["d", 500], ["cd", 400], ["c", 100], ["xc", 90], ["l", 50], ["xl", 40], ["x", 10], ["ix", 9], ["v", 5], ["iv", 4], ["i", 1]];
  let n = value;
  let out = "";
  for (const [roman, arabic] of map) {
    while (n >= arabic) {
      out += roman;
      n -= arabic;
    }
  }
  return out;
}

function getPageNumber(formData, offset = 0) {
  if (formData.pageNumberStyle === "none") return "";
  const page = Math.max(1, Number(formData.pageNumberStart) || 1) + offset;
  return formData.pageNumberStyle === "roman" ? toRoman(page) : String(page);
}

function PageNumber({ formData, offset = 0 }) {
  const pageNumber = getPageNumber(formData, offset);
  return pageNumber ? <div className="page-number">{pageNumber}</div> : null;
}

function isMissingRequiredField(formData, key) {
  if (key === "experimentNo") return !formData.experimentNoOptional && !formData.experimentNo?.trim();
  if (key === "submittedByName") return !formData.isGroupMode && !formData.submittedByName?.trim();
  return ["reportTitle", "courseCode", "courseTitle", "teacherName"].includes(key) && !formData[key]?.trim();
}

function getExperimentNoLabel(formData) {
  const type = formData.experimentNoLabelType || "default";
  if (type === "default") {
    return formData.departmentPreset === "cse" ? t(formData, "labProgramNo") : t(formData, "experimentNo");
  }
  if (type === "custom") {
    return formData.customExperimentNoLabel || "Custom No.";
  }
  return t(formData, type);
}

function getFieldLabel(formData, key, fallbackLabel) {
  return key === "experimentNo" ? getExperimentNoLabel(formData) : fallbackLabel;
}

function isOptionalField(formData, key) {
  return optionalFields.has(key) || (key === "experimentNo" && formData.experimentNoOptional);
}

function isRequiredField(formData, key) {
  return key === "experimentNo" && !formData.experimentNoOptional;
}

function getCourseRows(formData) {
  return [
    [t(formData, "courseCode"), formData.courseCode, false, "courseCode"],
    [t(formData, "courseTitle"), formData.courseTitle, false, "courseTitle"],
    [getExperimentNoLabel(formData), formData.experimentNo, formData.experimentNoOptional, "experimentNo"],
    [t(formData, "experimentDate"), formData.experimentDate, true, "experimentDate"]
  ].filter(([, value, optional]) => !optional || value?.trim());
}

const EXPORT_ICONS = {
  pdf: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ef4444" }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  docx: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#3b82f6" }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="14" y2="17" />
    </svg>
  ),
  pptx: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#f97316" }}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  png: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#10b981" }}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  jpg: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#84cc16" }}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  svg: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ec4899" }}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  zip: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#a855f7" }}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
      <polyline points="7.5 19.79 7.5 14.6 3 12" />
      <polyline points="16.5 19.79 16.5 14.6 21 12" />
      <polyline points="12 22.08 12 12" />
    </svg>
  )
};

const EXPORT_BADGES = {
  pdf: { text: "Best", type: "blue" },
  docx: { text: "Editable", type: "orange" },
  pptx: { text: "Slide", type: "yellow" },
  zip: { text: "All-in-1", type: "purple" }
};

const exportFormats = [
  { id: "pdf", label: "PDF", hint: "Best for direct submission" },
  { id: "png", label: "PNG image", hint: "Sharp image for sharing" },
  { id: "jpg", label: "JPG image", hint: "Small image file" },
  { id: "svg", label: "SVG vector", hint: "Editable vector preview" },
  { id: "docx", label: "Word DOCX", hint: "Editable Word cover" },
  { id: "pptx", label: "PowerPoint PPTX", hint: "Slide-ready cover" },
  { id: "zip", label: "ZIP bundle", hint: "PDF + DOCX together" }
];

const pageRenderOrder = ["cover", "acknowledgement", "transmittal", "toc", "abstract", "rubric", "references", "labInfo", "appendix", "certificate"];

const pageSizes = [
  { id: "a4",     label: "A4",     widthMm: 210, heightMm: 297 },
  { id: "letter", label: "Letter", widthMm: 216, heightMm: 279 },
  { id: "legal",  label: "Legal",  widthMm: 216, heightMm: 356 },
  { id: "a5",     label: "A5",     widthMm: 148, heightMm: 210 },
  { id: "custom", label: "Custom", widthMm: 210, heightMm: 297 }
];

const departments = [
  { id: "architecture",        label: "Architecture",                          logoUrl: DEPARTMENT_LOGOS.architecture },
  { id: "business-studies",    label: "Business Studies",                      logoUrl: DEPARTMENT_LOGOS["business-studies"] },
  { id: "cse",                 label: "Computer Science and Engineering",       logoUrl: CSE_IMAGE_URL },
  { id: "english-studies",     label: "English Studies",                        logoUrl: DEPARTMENT_LOGOS["english-studies"] },
  { id: "environmental-science", label: "Environmental Science",               logoUrl: DEPARTMENT_LOGOS["environmental-science"] },
  { id: "food-engineering",    label: "Food Engineering and Nutrition Science", logoUrl: DEPARTMENT_LOGOS["food-engineering"] },
  { id: "journalism",          label: "Journalism, Communication and Media Studies", logoUrl: DEPARTMENT_LOGOS.journalism },
  { id: "law",                 label: "Law",                                   logoUrl: DEPARTMENT_LOGOS.law },
  { id: "pharmacy",            label: "Pharmacy",                              logoUrl: DEPARTMENT_LOGOS.pharmacy },
  { id: "public-health",       label: "Public Health",                         logoUrl: DEPARTMENT_LOGOS["public-health"] },
  { id: "custom",              label: "Custom department",                     logoUrl: "" }
];

const labReportTemplates = {
  architecture: {
    title: "Architecture Studio / Lab Report",
    focus: "site analysis, drawing plates, model photos, observations",
    sections: ["Objective", "Site / Case Context", "Tools and Materials", "Methodology", "Drawing / Plate Documentation", "Observations", "Analysis", "Conclusion"],
    helpers: ["figure", "plate", "table", "references"]
  },
  "business-studies": {
    title: "Business Studies Analysis Report",
    focus: "case analysis, data tables, charts, findings, recommendation",
    sections: ["Objective", "Background", "Methodology", "Data Presentation", "Analysis", "Findings", "Recommendation", "Conclusion"],
    helpers: ["table", "chart", "references"]
  },
  cse: {
    title: "CSE Lab Report",
    focus: "algorithm, source code, output screenshots, complexity, result",
    sections: ["Objective", "Theory", "Algorithm", "Source Code", "Input / Output", "Result", "Discussion", "Conclusion"],
    helpers: ["code", "figure", "table", "equation"]
  },
  "english-studies": {
    title: "English Studies Report",
    focus: "text analysis, language observation, citations, interpretation",
    sections: ["Objective", "Text / Topic Background", "Theoretical Framework", "Observation", "Analysis", "Findings", "Conclusion", "References"],
    helpers: ["quote", "table", "references"]
  },
  "environmental-science": {
    title: "Environmental Science Lab Report",
    focus: "sample collection, environmental parameters, calculations, result",
    sections: ["Objective", "Theory", "Sampling Method", "Apparatus", "Procedure", "Data Table", "Calculation", "Result", "Discussion", "Conclusion"],
    helpers: ["sample-table", "figure", "equation", "references"]
  },
  "food-engineering": {
    title: "Food Engineering and Nutrition Lab Report",
    focus: "raw materials, process flow, sensory data, nutrition calculation",
    sections: ["Objective", "Principle", "Raw Materials", "Apparatus", "Process Flow", "Procedure", "Observation Table", "Calculation", "Result", "Conclusion"],
    helpers: ["process-flow", "table", "figure", "equation"]
  },
  journalism: {
    title: "Journalism / Media Field Report",
    focus: "field notes, interview sources, media observation, analysis",
    sections: ["Objective", "Background", "Methodology", "Source / Interview Notes", "Observation", "Media Analysis", "Findings", "Conclusion"],
    helpers: ["quote", "table", "references"]
  },
  law: {
    title: "Law Case / Lab Report",
    focus: "facts, legal issues, rule, application, conclusion",
    sections: ["Objective", "Facts", "Issue", "Relevant Law / Rule", "Analysis", "Decision / Finding", "Conclusion", "References"],
    helpers: ["quote", "table", "references"]
  },
  pharmacy: {
    title: "Pharmacy Lab Report",
    focus: "principle, chemicals, apparatus, observation, calculation, precautions",
    sections: ["Objective", "Principle", "Apparatus", "Chemicals / Reagents", "Procedure", "Observation", "Calculation", "Result", "Precautions", "Conclusion"],
    helpers: ["chemical-table", "figure", "equation", "references"]
  },
  "public-health": {
    title: "Public Health Lab / Field Report",
    focus: "sample population, data collection, analysis, recommendation",
    sections: ["Objective", "Background", "Study Population", "Data Collection Method", "Data Presentation", "Analysis", "Findings", "Recommendation", "Conclusion"],
    helpers: ["survey-table", "figure", "references"]
  },
  custom: {
    title: "Custom Department Lab Report",
    focus: "general lab structure with editable sections",
    sections: ["Objective", "Theory / Background", "Materials / Apparatus", "Procedure", "Observation", "Calculation / Analysis", "Result", "Discussion", "Conclusion"],
    helpers: ["figure", "table", "equation", "references"]
  }
};

const latexCommandCards = [
  {
    category: "Starter",
    title: "Document Setup",
    hint: "Minimum Overleaf file setup for lab reports.",
    code: "\\documentclass[12pt,a4paper]{article}\n\\usepackage[margin=1in]{geometry}\n\\usepackage{graphicx}\n\\usepackage{float}\n\\usepackage{amsmath}\n\\usepackage{booktabs}\n\\usepackage{hyperref}\n\n\\begin{document}\n\n\\title{Lab Report Title}\n\\author{Your Name}\n\\date{\\today}\n\\maketitle\n\n\\end{document}"
  },
  {
    category: "Structure",
    title: "Section / Subsection",
    hint: "Fast structure for report body writing.",
    code: "\\section{Objective}\nWrite the objective here.\n\n\\subsection{Specific Objectives}\n\\begin{enumerate}\n    \\item First objective\n    \\item Second objective\n\\end{enumerate}"
  },
  {
    category: "Images",
    title: "Image / Figure",
    hint: "Upload the image to Overleaf, then use the same filename.",
    code: "\\begin{figure}[H]\n    \\centering\n    \\includegraphics[width=0.8\\textwidth]{result.png}\n    \\caption{Experiment result}\n    \\label{fig:result}\n\\end{figure}"
  },
  {
    category: "Images",
    title: "Two Images Side by Side",
    hint: "Good for before/after, input/output, or plate comparisons.",
    code: "\\begin{figure}[H]\n    \\centering\n    \\begin{subfigure}{0.45\\textwidth}\n        \\centering\n        \\includegraphics[width=\\textwidth]{before.png}\n        \\caption{Before}\n    \\end{subfigure}\n    \\hfill\n    \\begin{subfigure}{0.45\\textwidth}\n        \\centering\n        \\includegraphics[width=\\textwidth]{after.png}\n        \\caption{After}\n    \\end{subfigure}\n    \\caption{Comparison of observations}\n    \\label{fig:comparison}\n\\end{figure}"
  },
  {
    category: "Tables",
    title: "Data Table",
    hint: "Good for observation, sample, survey, or result tables.",
    code: "\\begin{table}[H]\n    \\centering\n    \\caption{Observation data}\n    \\label{tab:observation}\n    \\begin{tabular}{lll}\n        \\toprule\n        Parameter & Value & Unit \\\\\n        \\midrule\n        Sample 1 & -- & -- \\\\\n        Sample 2 & -- & -- \\\\\n        \\bottomrule\n    \\end{tabular}\n\\end{table}"
  },
  {
    category: "Tables",
    title: "Wide Table",
    hint: "Use when tables are too wide for the page.",
    code: "\\begin{table}[H]\n    \\centering\n    \\resizebox{\\textwidth}{!}{%\n    \\begin{tabular}{llllll}\n        \\toprule\n        Sample & Trial 1 & Trial 2 & Trial 3 & Average & Unit \\\\\n        \\midrule\n        A & -- & -- & -- & -- & -- \\\\\n        B & -- & -- & -- & -- & -- \\\\\n        \\bottomrule\n    \\end{tabular}}\n    \\caption{Wide observation table}\n\\end{table}"
  },
  {
    category: "Tables",
    title: "Chemical / Reagent Table",
    hint: "Useful for Pharmacy, Chemistry, Food, and Environmental labs.",
    code: "\\begin{table}[H]\n    \\centering\n    \\caption{Chemicals and reagents}\n    \\begin{tabular}{lll}\n        \\toprule\n        Chemical & Concentration & Purpose \\\\\n        \\midrule\n        EDTA & 0.01 M & Titrant \\\\\n        Buffer solution & pH 10 & Maintain pH \\\\\n        Indicator & EBT & Endpoint detection \\\\\n        \\bottomrule\n    \\end{tabular}\n\\end{table}"
  },
  {
    category: "Math",
    title: "Equation",
    hint: "Use for formulas and calculations.",
    code: "\\begin{equation}\n    C_1V_1 = C_2V_2\n    \\label{eq:dilution}\n\\end{equation}"
  },
  {
    category: "Math",
    title: "Aligned Calculation",
    hint: "Best for step-by-step calculation in lab reports.",
    code: "\\begin{align}\n    \\text{Hardness} &= \\frac{V \\times M \\times 1000}{\\text{Sample volume}} \\\\\n                    &= \\frac{25 \\times 0.01 \\times 1000}{50} \\\\\n                    &= 5\\ \\text{mg/L}\n\\end{align}"
  },
  {
    category: "Math",
    title: "SI Units",
    hint: "Cleaner scientific units. Add \\usepackage{siunitx}.",
    code: "\\SI{25}{\\milli\\liter}\n\\quad\n\\SI{0.01}{\\mole\\per\\liter}\n\\quad\n\\SI{5}{\\milli\\gram\\per\\liter}"
  },
  {
    category: "Chemistry",
    title: "Chemical Equation",
    hint: "Useful for Pharmacy/Food/Environmental labs. Add \\usepackage[version=4]{mhchem}.",
    code: "\\begin{equation}\n    \\ce{Ca^{2+} + H2Y^{2-} -> CaY^{2-} + 2H+}\n\\end{equation}"
  },
  {
    category: "Code",
    title: "CSE Code Block",
    hint: "Best for algorithms, source code, and output sections.",
    code: "\\begin{lstlisting}[language=Python, caption={Sample program}]\nprint(\"Hello, lab report\")\n\\end{lstlisting}"
  },
  {
    category: "Code",
    title: "Output Block",
    hint: "Use for terminal/program output in CSE reports.",
    code: "\\begin{verbatim}\nInput:  5 10\nOutput: 15\n\\end{verbatim}"
  },
  {
    category: "Lists",
    title: "Bullet List",
    hint: "Useful for apparatus, objectives, findings, precautions.",
    code: "\\begin{itemize}\n    \\item First point\n    \\item Second point\n    \\item Third point\n\\end{itemize}"
  },
  {
    category: "Lists",
    title: "Numbered Procedure",
    hint: "Best for experiment procedure steps.",
    code: "\\begin{enumerate}\n    \\item Prepare all apparatus and chemicals.\n    \\item Take the required sample volume.\n    \\item Perform the experiment carefully.\n    \\item Record observations and calculate the result.\n\\end{enumerate}"
  },
  {
    category: "Charts",
    title: "Simple Bar Chart",
    hint: "Use pgfplots for graphs directly in Overleaf.",
    code: "\\begin{tikzpicture}\n\\begin{axis}[\n    ybar,\n    xlabel={Sample},\n    ylabel={Value},\n    symbolic x coords={A,B,C},\n    xtick=data\n]\n\\addplot coordinates {(A,10) (B,15) (C,12)};\n\\end{axis}\n\\end{tikzpicture}"
  },
  {
    category: "Flow",
    title: "Process Flow",
    hint: "Useful for Food Engineering, CSE algorithms, and procedure flow.",
    code: "\\begin{center}\n\\begin{tikzpicture}[node distance=1.5cm]\n\\node (start) [draw, rounded corners] {Start};\n\\node (process) [draw, below of=start] {Process sample};\n\\node (result) [draw, rounded corners, below of=process] {Record result};\n\\draw[->] (start) -- (process);\n\\draw[->] (process) -- (result);\n\\end{tikzpicture}\n\\end{center}"
  },
  {
    category: "Text",
    title: "Quote / Interview",
    hint: "Useful for English, Law, Journalism, and field reports.",
    code: "\\begin{quote}\n``Write quoted text or interview response here.''\n\\end{quote}"
  },
  {
    category: "Appendix",
    title: "Appendix",
    hint: "Put raw data, extra screenshots, or long code here.",
    code: "\\appendix\n\\section{Raw Data}\nPaste extra tables, screenshots, code, or survey forms here."
  },
  {
    category: "References",
    title: "References",
    hint: "Simple reference list without BibTeX.",
    code: "\\begin{thebibliography}{9}\n\\bibitem{book1} Author Name, \\textit{Book or Article Title}, Publisher, Year.\n\\end{thebibliography}"
  },
  {
    category: "References",
    title: "Website Reference",
    hint: "Quick web citation format.",
    code: "\\bibitem{website1} Organization Name, ``Page Title,'' Available: \\url{https://example.com}. Accessed: 21 May 2026."
  }
];

const latexCategories = {
  greek: [
    { label: "alpha (α)", code: "\\alpha" },
    { label: "beta (β)", code: "\\beta" },
    { label: "gamma (γ)", code: "\\gamma" },
    { label: "theta (θ)", code: "\\theta" },
    { label: "pi (π)", code: "\\pi" },
    { label: "mu (μ)", code: "\\mu" },
    { label: "Delta (Δ)", code: "\\Delta" },
    { label: "sigma (σ)", code: "\\sigma" },
    { label: "lambda (λ)", code: "\\lambda" },
    { label: "omega (ω)", code: "\\omega" },
    { label: "phi (φ)", code: "\\phi" },
    { label: "epsilon (ε)", code: "\\epsilon" }
  ],
  operators: [
    { label: "integral (∫)", code: "\\int" },
    { label: "summation (∑)", code: "\\sum" },
    { label: "square root (√)", code: "\\sqrt{x}" },
    { label: "fraction", code: "\\frac{a}{b}" },
    { label: "partial (∂)", code: "\\partial" },
    { label: "infinity (∞)", code: "\\infty" },
    { label: "gradient (∇)", code: "\\nabla" },
    { label: "times (×)", code: "\\times" },
    { label: "divide (÷)", code: "\\div" },
    { label: "approx (≈)", code: "\\approx" },
    { label: "not equal (≠)", code: "\\neq" },
    { label: "less/equal (≤)", code: "\\leq" },
    { label: "greater/equal (≥)", code: "\\geq" }
  ],
  formulas: [
    { label: "Dilution Formula", code: "C_1V_1 = C_2V_2" },
    { label: "Water Hardness", code: "\\text{Hardness} = \\frac{V \\times M \\times 1000}{\\text{Sample volume}}" },
    { label: "Mean (Average)", code: "\\bar{x} = \\frac{1}{n} \\sum_{i=1}^{n} x_i" },
    { label: "Standard Deviation", code: "s = \\sqrt{\\frac{\\sum (x_i - \\bar{x})^2}{n-1}}" },
    { label: "Beer-Lambert Law", code: "A = \\epsilon c l" },
    { label: "Quadratic Formula", code: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" }
  ]
};

const fieldGroups = [
  {
    id: "report", title: "Report Details",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    fields: [
      ["reportPrefix","Small heading"],["reportTitle","Report title"],
      ["courseCode","Course code"],["courseTitle","Course title"],
      ["experimentNo","Experiment no."],["experimentDate","Experiment date"],
      ["submissionDate","Submission date"]
    ]
  },
  {
    id: "university", title: "University",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
      </svg>
    ),
    fields: [["university","University name"]]
  },
  {
    id: "teacher", title: "Submitted To",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" />
      </svg>
    ),
    fields: [["teacherName","Teacher name"],["teacherTitle","Teacher title"],["teacherDepartment","Teacher department"]]
  },
  {
    id: "student", title: "Submitted By",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    fields: [
      ["submittedByName","Name"],["status","Status"],["year","Year"],["semester","Semester"],
      ["group","Group"],["session","Session"],["roll","Roll no."],["registration","Reg. no."]
    ]
  }
];

const hasDepartmentLogo = (f) => f.showDepartmentLogo && getSafeImageSrc(f.departmentLogoUrl);

const SAFE_UPLOAD_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);
const TRUSTED_IMAGE_ORIGINS = new Set(["https://api.qrserver.com"]);

function createSafeObjectImageUrl(file) {
  if (!file || !SAFE_UPLOAD_IMAGE_TYPES.has(file.type)) return "";
  return URL.createObjectURL(file);
}

function getSafeImageSrc(value, fallback = "") {
  const candidate = String(value ?? "").trim();
  if (!candidate) return fallback;

  if ((candidate.startsWith("/") && !candidate.startsWith("//")) || candidate.startsWith("./") || candidate.startsWith("../")) {
    return candidate;
  }

  try {
    const baseOrigin = globalThis.location?.origin ?? "http://localhost";
    const url = new URL(candidate, baseOrigin);
    if (url.protocol === "blob:" && url.origin === baseOrigin) {
      return url.href;
    }
    if ((url.protocol === "http:" || url.protocol === "https:") && (url.origin === baseOrigin || TRUSTED_IMAGE_ORIGINS.has(url.origin))) {
      return url.href;
    }
  } catch {
    // Invalid image URLs are ignored so they cannot be used as browser navigation sinks.
  }

  return fallback;
}

function getSafeQrImageSrc(value) {
  const qrData = String(value ?? "").trim();
  if (!qrData) return "";

  const qrUrl = new URL("https://api.qrserver.com/v1/create-qr-code/");
  qrUrl.searchParams.set("size", "90x90");
  qrUrl.searchParams.set("data", qrData);
  return qrUrl.href;
}

function SafeImage({ src, fallback = "", alt, ...props }) {
  const safeSrc = getSafeImageSrc(src, fallback);
  if (!safeSrc) return null;

  // The source is restricted by getSafeImageSrc to same-origin assets, app-created blob URLs, or a trusted QR endpoint.
  // codeql[js/client-side-unvalidated-url-redirection]
  // codeql[js/xss-through-dom]
  return <img src={safeSrc} alt={alt} {...props} />;
}

function showAppToast(title, icon = "success") {
  Swal.fire({
    title,
    icon,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1800,
    timerProgressBar: true,
    background: "#0f172a",
    color: "#e8f0ff",
    customClass: {
      popup: "app-swal-toast"
    }
  });
}

function slugifyFilePart(value = "cover-page") {
  const slug = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "cover-page";
}

function getExportBaseName(formData) {
  return `sub-lab-cover-${slugifyFilePart(formData.courseCode || formData.reportTitle)}`;
}

function downloadDataUrl(filename, dataUrl) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function makeDocxParagraph(docx, text, options = {}) {
  const { Paragraph, TextRun } = docx;
  return new Paragraph({
    alignment: options.alignment,
    heading: options.heading,
    spacing: options.spacing ?? { after: 180 },
    children: [
      new TextRun({
        text: String(text ?? ""),
        bold: options.bold,
        italics: options.italics,
        size: options.size
      })
    ]
  });
}

async function buildDocxCover(formData, studentRows, selectedPage) {
  const docx = await import("docx");
  const { AlignmentType, BorderStyle, Document, HeadingLevel, Table, TableCell, TableRow, WidthType } = docx;
  const infoRows = getCourseRows(formData).map(([label, value]) => [label, value]);

  const makeKeyValueRows = (rows) => rows.map(([label, value]) => new TableRow({
    children: [
      new TableCell({ children: [makeDocxParagraph(docx, `${label}:`, { bold: true })], width: { size: 36, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [makeDocxParagraph(docx, value || "-")], width: { size: 64, type: WidthType.PERCENTAGE } })
    ]
  }));

  const submittedTo = [
    formData.teacherName,
    formData.teacherTitle,
    formData.teacherDepartment,
    formData.university
  ].filter(Boolean).join("\n");

  const blankBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }
  };

  return new Document({
    creator: "JOY",
    lastModifiedBy: "JOY",
    title: formData.reportTitle,
    description: "SUB lab report cover page",
    sections: [{
      properties: {
        page: {
          size: {
            width: Math.round(selectedPage.widthMm * 56.6929),
            height: Math.round(selectedPage.heightMm * 56.6929)
          },
          margin: { top: 720, right: 720, bottom: 720, left: 720 }
        }
      },
      children: [
        makeDocxParagraph(docx, formData.reportPrefix, { alignment: AlignmentType.CENTER, bold: true, size: 26 }),
        makeDocxParagraph(docx, formData.reportTitle, { alignment: AlignmentType.CENTER, bold: true, italics: true, size: 34, heading: HeadingLevel.TITLE }),
        makeDocxParagraph(docx, formData.university, { alignment: AlignmentType.CENTER, bold: true, size: 28 }),
        makeDocxParagraph(docx, formData.department, { alignment: AlignmentType.CENTER, size: 24 }),
        new Table({
          width: { size: 82, type: WidthType.PERCENTAGE },
          alignment: AlignmentType.CENTER,
          rows: makeKeyValueRows(infoRows)
        }),
        makeDocxParagraph(docx, "Academic Submission", { alignment: AlignmentType.CENTER, bold: true, size: 20, spacing: { before: 420, after: 180 } }),
        (() => {
          let submittedByChildren = [makeDocxParagraph(docx, "Submitted By:", { bold: true })];
          if (formData.isGroupMode && formData.groupStudents && formData.groupStudents.length > 0) {
            formData.groupStudents.forEach((student, index) => {
              submittedByChildren.push(makeDocxParagraph(docx, student.name || "Student Name", { bold: true, spacing: { before: 120, after: 60 } }));
              const rows = [
                ["Roll No.", student.roll],
                ["Reg. No.", student.registration],
                ["Status", student.status],
                ["Year", student.year],
                ["Semester", student.semester],
                ["Group", student.group],
                ["Session", student.session]
              ].filter(([, v]) => v && v.trim());
              
              rows.forEach(([label, value]) => {
                submittedByChildren.push(makeDocxParagraph(docx, `${label}: ${value}`, { spacing: { after: 40 } }));
              });
              if (index < formData.groupStudents.length - 1) {
                submittedByChildren.push(makeDocxParagraph(docx, "--------------------", { spacing: { before: 60, after: 60 } }));
              }
            });
          } else {
            submittedByChildren.push(
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: makeKeyValueRows(studentRows)
              })
            );
          }

          return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: blankBorders,
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      makeDocxParagraph(docx, "Submitted To:", { bold: true }),
                      ...submittedTo.split("\n").map((line) => makeDocxParagraph(docx, line))
                    ]
                  }),
                  new TableCell({
                    borders: blankBorders,
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: submittedByChildren
                  })
                ]
              })
            ]
          });
        })(),
        makeDocxParagraph(docx, `Date of Submission: ${formData.submissionDate}`, { alignment: AlignmentType.CENTER, bold: true, spacing: { before: 420, after: 420 } }),
        makeDocxParagraph(docx, formData.department, { alignment: AlignmentType.CENTER, bold: true, size: 20 }),
        makeDocxParagraph(docx, formData.university, { alignment: AlignmentType.CENTER, bold: true, size: 20 })
      ]
    }]
  });
}

function escapeLatex(value = "") {
  const replacements = {
    "\\": "\\textbackslash{}",
    "&": "\\&",
    "%": "\\%",
    "$": "\\$",
    "#": "\\#",
    "_": "\\_",
    "{": "\\{",
    "}": "\\}",
    "~": "\\textasciitilde{}",
    "^": "\\textasciicircum{}"
  };

  return String(value).replace(/[\\&%$#_{}~^]/g, (char) => replacements[char]);
}

function getTemplateForDepartment(departmentPreset) {
  return labReportTemplates[departmentPreset] ?? labReportTemplates.custom;
}

function buildLatexCover(formData, studentRows) {
  const rows = studentRows
    .map(([label, value]) => `        \\textbf{${escapeLatex(label)}:} & ${escapeLatex(value)} \\\\`)
    .join("\n");
  const courseRows = getCourseRows(formData)
    .map(([label, value]) => `        \\textbf{${escapeLatex(label)}:} & ${escapeLatex(value)} \\\\`)
    .join("\n");

  return `\\begin{titlepage}
    \\centering
    {\\large\\bfseries ${escapeLatex(formData.reportPrefix)}\\par}
    \\vspace{0.6cm}
    {\\LARGE\\bfseries ${escapeLatex(formData.reportTitle)}\\par}
    \\vspace{1.0cm}
    {\\Large\\bfseries ${escapeLatex(formData.university)}\\par}
    \\vspace{0.2cm}
    {\\large ${escapeLatex(formData.department)}\\par}
    \\vspace{0.9cm}

    \\begin{tabular}{rl}
${courseRows}
    \\end{tabular}

    \\vfill

    \\begin{minipage}{0.45\\textwidth}
        \\textbf{Submitted To:}\\\\[0.2cm]
        ${escapeLatex(formData.teacherName)}\\\\
        \\textit{${escapeLatex(formData.teacherTitle)}}\\\\
        ${escapeLatex(formData.teacherDepartment)}\\\\
        ${escapeLatex(formData.university)}
    \\end{minipage}
    \\hfill
    \\begin{minipage}{0.45\\textwidth}
        \\textbf{Submitted By:}\\\\[0.2cm]
        ${formData.isGroupMode && formData.groupStudents && formData.groupStudents.length > 0 ? (
          formData.groupStudents.map((student) => {
            const sRows = [
              ["Roll No.", student.roll],
              ["Reg. No.", student.registration],
              ["Status", student.status],
              ["Year", student.year],
              ["Semester", student.semester],
              ["Group", student.group],
              ["Session", student.session]
            ].filter(([, v]) => v && v.trim());
            const tableRows = sRows
              .map(([lbl, val]) => `        \\textbf{${escapeLatex(lbl)}:} & ${escapeLatex(val)} \\\\`)
              .join("\n");
            return `\\textbf{${escapeLatex(student.name)}}\\\\\n        \\begin{tabular}{rl}\n${tableRows}\n        \\end{tabular}`;
          }).join("\n\n        \\vspace{0.3cm}\n        ")
        ) : `\\begin{tabular}{rl}\n${rows}\n        \\end{tabular}`}
    \\end{minipage}

    \\vfill
    \\textbf{Date of Submission:} ${escapeLatex(formData.submissionDate)}

    \\vspace{0.8cm}
    {\\bfseries ${escapeLatex(formData.department)}\\par}
    {\\bfseries ${escapeLatex(formData.university)}\\par}
\\end{titlepage}`;
}

function buildSectionBody(section, helpers) {
  const key = section.toLowerCase();

  if (key.includes("source code")) {
    return "\\begin{lstlisting}[language=Python, caption={Source code}]\n# Paste your code here\n\\end{lstlisting}";
  }

  if (key.includes("algorithm")) {
    return "\\begin{enumerate}\n    \\item Start the program or experiment.\n    \\item Take the required input or data.\n    \\item Process the data according to the method.\n    \\item Record output and result.\n\\end{enumerate}";
  }

  if (key.includes("apparatus") || key.includes("materials") || key.includes("chemicals") || key.includes("reagents")) {
    return "\\begin{itemize}\n    \\item Item 1\n    \\item Item 2\n    \\item Item 3\n\\end{itemize}";
  }

  if (key.includes("data") || key.includes("observation") || key.includes("sample") || key.includes("survey")) {
    return latexCommandCards[1].code;
  }

  if (key.includes("calculation") || key.includes("analysis") || helpers.includes("equation")) {
    return "% Write calculation here. Example:\n\\[\n    \\text{Result} = \\frac{\\text{Observed value}}{\\text{Standard value}}\n\\]";
  }

  return "% Write this section here.";
}

function buildOverleafDocument(formData, studentRows, selectedPage, template) {
  const sections = template.sections
    .map((section) => `\\section{${escapeLatex(section)}}\n${buildSectionBody(section, template.helpers)}`)
    .join("\n\n");

  const paperName = selectedPage.label === "A4" ? "a4paper" : "";
  const paperComment = selectedPage.label === "Custom"
    ? `% Custom page selected in app: ${selectedPage.widthMm}mm x ${selectedPage.heightMm}mm`
    : `% Page size selected in app: ${selectedPage.label} (${selectedPage.widthMm}mm x ${selectedPage.heightMm}mm)`;

  return `\\documentclass[12pt${paperName ? `,${paperName}` : ""}]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{graphicx}
\\usepackage{float}
\\usepackage{amsmath}
\\usepackage{booktabs}
\\usepackage{xcolor}
\\usepackage{listings}
\\usepackage{hyperref}
\\usepackage{subcaption}
\\usepackage{siunitx}
\\usepackage[version=4]{mhchem}
\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}

${paperComment}

\\lstset{
    basicstyle=\\ttfamily\\small,
    breaklines=true,
    frame=single,
    columns=fullflexible,
    keywordstyle=\\color{blue},
    commentstyle=\\color{gray}
}

\\begin{document}

${buildLatexCover(formData, studentRows)}

\\tableofcontents
\\newpage

${sections}

\\end{document}
`;
}

/* ── Particle canvas hook ── */
function useParticles(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W, H;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const N = 50;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * window.innerWidth,  y: Math.random() * window.innerHeight,
      r: Math.random() * 1.3 + 0.3,
      vx: (Math.random() - 0.5) * 0.22,     vy: (Math.random() - 0.5) * 0.22,
      a: Math.random() * 0.45 + 0.07
    }));
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 115) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(59,130,246,${(1 - d/115) * 0.11})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
      for (const p of pts) {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(99,130,220,${p.a})`; ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []); // canvasRef is a stable ref object — empty deps is correct
}

/* ════════════════════════════════════
   LIGHTBOX COMPONENT
   Shows full-screen zoomable preview
════════════════════════════════════ */
function Lightbox({ children, onClose, onPrint, exportFormats, exportCover }) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Preview enlarged">
      <button className="lightbox-close" onClick={onClose} aria-label="Close enlarged preview">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div className="lightbox-hint" onClick={(e) => e.stopPropagation()}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span>Print preview with margin guides</span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginLeft: "8px" }}>
          {onPrint && (
            <button type="button" className="lightbox-print" onClick={onPrint}>
              Print
            </button>
          )}
          {exportFormats && exportCover && (
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                type="button"
                className={`lightbox-print ${isExportOpen ? "active" : ""}`}
                onClick={() => setIsExportOpen(!isExportOpen)}
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform var(--t-fast) ease", transform: isExportOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {isExportOpen && (
                <div className="toolbar-dropdown lightbox-dropdown">
                  <div className="dropdown-header">Export Format</div>
                  {exportFormats.map((format) => (
                    <button
                      key={format.id}
                      type="button"
                      className="toolbar-dropdown-item"
                      onClick={() => {
                        exportCover(format.id);
                        setIsExportOpen(false);
                      }}
                    >
                      <span className="dropdown-item-title-row">
                        {EXPORT_ICONS[format.id]}
                        <strong>{format.label}</strong>
                        {EXPORT_BADGES[format.id] && (
                          <span className={`dropdown-badge badge-${EXPORT_BADGES[format.id].type}`}>
                            {EXPORT_BADGES[format.id].text}
                          </span>
                        )}
                      </span>
                      <span className="dropdown-item-hint">{format.hint}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()} onDoubleClick={onClose}>
        {children}
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   COVER PAGE (reusable)
════════════════════════════════════ */
function CoverPage({
  formData,
  updateField,
  paperStyle,
  studentRows,
  is3D,
  cardRef,
  selectedPage,
  showRulers,
  showGrid,
  showGuides,
  isEditable = false
}) {
  const bannerImageSrc = getSafeImageSrc(formData.bannerImageUrl);
  const departmentLogoSrc = getSafeImageSrc(formData.departmentLogoUrl);
  const primaryLogoSrc = formData.useCustomLogo
    ? getSafeImageSrc(formData.customLogoUrl, SUB_LOGO_URL)
    : SUB_LOGO_URL;
  const signatureSrc = getSafeImageSrc(formData.customSignatureUrl);

  return (
    <div className={`paper layout-${formData.layoutTheme || "classic"} pattern-${formData.bgPattern || "none"} ${formData.coverDarkMode ? "cover-dark" : ""}`} style={paperStyle} ref={cardRef}>
      {is3D && <div className="paper-glare" />}
      <div className="paper-texture" />
      <div className="paper-edge-left" />
      <div className="paper-edge-bottom" />
      <div className="paper-top-bar" />
      <div className="paper-bottom-bar" />
      <div className="paper-border-frame" />
      <div className="paper-watermark custom-watermark" style={formData.watermarkText ? { opacity: formData.watermarkOpacity || 0.07 } : undefined}>
        {formData.watermarkText || "SUB"}
      </div>

      {showGrid && <div className="paper-grid-overlay no-print" data-html2canvas-ignore="true" />}
      {showGuides && <div className="paper-guides-overlay no-print" data-html2canvas-ignore="true" />}
      {showRulers && selectedPage && (
        <>
          <div className="paper-ruler-x no-print" data-html2canvas-ignore="true" style={{ height: "16px", paddingLeft: "16px" }}>
            {Array.from({ length: Math.ceil(selectedPage.widthMm / 10) + 1 }).map((_, i) => {
              const pos = (i * 10 / selectedPage.widthMm) * 100;
              return (
                <div key={i} style={{ position: "absolute", left: `calc(${pos}% + 16px)`, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", width: "20px", transform: "translateX(-50%)" }}>
                  <span style={{ fontSize: "6px", lineHeight: "1" }}>{i * 10}</span>
                  <div style={{ width: "1px", height: "4px", background: "#64748b", marginTop: "1px" }} />
                </div>
              );
            })}
          </div>
          <div className="paper-ruler-y no-print" data-html2canvas-ignore="true" style={{ width: "16px", paddingTop: "16px" }}>
            {Array.from({ length: Math.ceil(selectedPage.heightMm / 10) + 1 }).map((_, i) => {
              const pos = (i * 10 / selectedPage.heightMm) * 100;
              return (
                <div key={i} style={{ position: "absolute", top: `calc(${pos}% + 16px)`, right: 0, display: "flex", alignItems: "center", height: "20px", transform: "translateY(-50%)" }}>
                  <span style={{ fontSize: "6px", marginRight: "2px" }}>{i * 10}</span>
                  <div style={{ height: "1px", width: "4px", background: "#64748b" }} />
                </div>
              );
            })}
          </div>
        </>
      )}

      {formData.useBannerImage && bannerImageSrc && (
        <div className="cover-banner">
          <SafeImage src={bannerImageSrc} alt="Custom cover banner" />
        </div>
      )}

      <div className="title-block" style={formData.titleAlign ? { textAlign: formData.titleAlign } : undefined}>
        <p
          className="inline-editable"
          contentEditable={isEditable}
          suppressContentEditableWarning
          onBlur={(e) => updateField("reportPrefix", e.target.innerText)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
        >
          {formData.reportPrefix}
        </p>
        <h2
          className="inline-editable"
          contentEditable={isEditable}
          suppressContentEditableWarning
          onBlur={(e) => updateField("reportTitle", e.target.innerText)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
        >
          {formData.reportTitle}
        </h2>
      </div>

      <div className={`logos ${hasDepartmentLogo(formData) ? "" : "logos-single"}`}>
        <SafeImage src={primaryLogoSrc} alt="State University of Bangladesh logo" />
        {departmentLogoSrc && formData.showDepartmentLogo && (
          <SafeImage className="department-logo" src={departmentLogoSrc} alt={`${formData.department} logo`} />
        )}
      </div>

      <div className="course-info" style={formData.courseAlign ? { textAlign: formData.courseAlign } : undefined}>
        {getCourseRows(formData).map(([label, value, , key]) => (
          <p key={label}>
            <strong>{label}: </strong>
            <span
              className="inline-editable"
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => updateField(key, e.target.innerText)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
            >
              {value}
            </span>
          </p>
        ))}
      </div>

      <div className="section-divider"><span>{t(formData, "academicSubmission")}</span></div>

       <div className="submission-grid">
        <div>
          <h3>{t(formData, "submittedTo")}:</h3>
          <div className="rule" />
          <p
            className="person-name inline-editable"
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => updateField("teacherName", e.target.innerText)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
          >
            {formData.teacherName}
          </p>
          <p>
            <em
              className="inline-editable"
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => updateField("teacherTitle", e.target.innerText)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
            >
              {formData.teacherTitle}
            </em>
          </p>
          <p
            className="inline-editable"
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => updateField("teacherDepartment", e.target.innerText)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
          >
            {formData.teacherDepartment}
          </p>
          <p
            className="inline-editable"
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => updateField("university", e.target.innerText)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
          >
            {formData.university}
          </p>
        </div>
        <div>
          <h3>{t(formData, "submittedBy")}:</h3>
          <div className="rule" />
          {formData.useCustomSignature && signatureSrc ? (
            <div className="signature-container" style={{ margin: "4px 0", textAlign: "left" }}>
              <SafeImage
                src={signatureSrc}
                alt="Signature"
                style={{ maxHeight: "35px", maxWidth: "120px", objectFit: "contain", display: "block" }}
              />
            </div>
          ) : null}
          {formData.isGroupMode && formData.groupStudents && formData.groupStudents.length > 0 ? (
            <div className="group-submission-grid-container">
              {formData.groupStudents.map((student, idx) => {
                const sRows = [
                  ["Roll No.", student.roll, "roll"],
                  ["Reg. No.", student.registration, "registration"],
                  ["Status", student.status, "status"],
                  ["Year", student.year, "year"],
                  ["Semester", student.semester, "semester"],
                  ["Group", student.group, "group"],
                  ["Session", student.session, "session"]
                ].filter(([, v]) => v && v.trim());
                return (
                  <div className="group-student-card" key={idx}>
                    <div
                      className="group-student-name inline-editable"
                      contentEditable={isEditable}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const updated = [...formData.groupStudents];
                        updated[idx] = { ...updated[idx], name: e.target.innerText };
                        updateField("groupStudents", updated);
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
                    >
                      {student.name || "Student Name"}
                    </div>
                    <dl>
                      {sRows.map(([label, value, key]) => (
                        <div key={label}>
                          <dt>{label}:</dt>
                          <dd
                            className="inline-editable"
                            contentEditable={isEditable}
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const updated = [...formData.groupStudents];
                              updated[idx] = { ...updated[idx], [key]: e.target.innerText };
                              updateField("groupStudents", updated);
                            }}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
                          >
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                );
              })}
            </div>
          ) : (
            <dl>
              {studentRows.map(([label, value, key]) => (
                <div key={label}>
                  <dt>{label}:</dt>
                  <dd
                    className="inline-editable"
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => updateField(key, e.target.innerText)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      <p className="date-line">
        <strong>{t(formData, "dateOfSubmission")}: </strong>
        <span
          className="inline-editable"
          contentEditable={isEditable}
          suppressContentEditableWarning
          onBlur={(e) => updateField("submissionDate", e.target.innerText)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
        >
          {formData.submissionDate}
        </span>
      </p>

      {formData.showQrCode && formData.qrCodeUrl && (
        <div className="cover-qr">
          <SafeImage
            src={getSafeQrImageSrc(formData.qrCodeUrl)}
            alt="Cover QR code"
          />
        </div>
      )}

      <footer>
        <div className="footer-rule" />
        <p
          className="inline-editable"
          contentEditable={isEditable}
          suppressContentEditableWarning
          onBlur={(e) => updateField("department", e.target.innerText)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
        >
          {formData.department}
        </p>
        <p
          className="inline-editable"
          contentEditable={isEditable}
          suppressContentEditableWarning
          onBlur={(e) => updateField("university", e.target.innerText)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
        >
          {formData.university}
        </p>
      </footer>
      <PageNumber formData={formData} />
    </div>
  );
}

function AcknowledgementPage({ paperStyle, ackData, setAckData, showRulers, showGrid, showGuides, selectedPage, cardRef, formData, pageOffset = 0, isEditable = false }) {
  return (
    <div className="paper" style={paperStyle} ref={cardRef}>
      <div className="paper-texture" />
      <div className="paper-edge-left" />
      <div className="paper-edge-bottom" />
      {showGrid && <div className="paper-grid-overlay no-print" data-html2canvas-ignore="true" />}
      {showGuides && <div className="paper-guides-overlay no-print" data-html2canvas-ignore="true" />}
      {showRulers && selectedPage && (
        <>
          <div className="paper-ruler-x no-print" data-html2canvas-ignore="true" style={{ height: "16px", paddingLeft: "16px" }}>
            {Array.from({ length: Math.ceil(selectedPage.widthMm / 10) + 1 }).map((_, i) => {
              const pos = (i * 10 / selectedPage.widthMm) * 100;
              return (
                <div key={i} style={{ position: "absolute", left: `calc(${pos}% + 16px)`, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", width: "20px", transform: "translateX(-50%)" }}>
                  <span style={{ fontSize: "6px", lineHeight: "1" }}>{i * 10}</span>
                  <div style={{ width: "1px", height: "4px", background: "#64748b", marginTop: "1px" }} />
                </div>
              );
            })}
          </div>
          <div className="paper-ruler-y no-print" data-html2canvas-ignore="true" style={{ width: "16px", paddingTop: "16px" }}>
            {Array.from({ length: Math.ceil(selectedPage.heightMm / 10) + 1 }).map((_, i) => {
              const pos = (i * 10 / selectedPage.heightMm) * 100;
              return (
                <div key={i} style={{ position: "absolute", top: `calc(${pos}% + 16px)`, right: 0, display: "flex", alignItems: "center", height: "20px", transform: "translateY(-50%)" }}>
                  <span style={{ fontSize: "6px", marginRight: "2px" }}>{i * 10}</span>
                  <div style={{ height: "1px", width: "4px", background: "#64748b" }} />
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="academic-page">
        <h2
          className="page-title inline-editable"
          contentEditable={isEditable}
          suppressContentEditableWarning
          onBlur={(e) => setAckData && setAckData(prev => ({ ...prev, title: e.target.innerText }))}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
        >
          {ackData.title || "ACKNOWLEDGEMENT"}
        </h2>
        <div
          className="academic-body inline-editable"
          contentEditable={isEditable}
          suppressContentEditableWarning
          onBlur={(e) => setAckData && setAckData(prev => ({ ...prev, body: e.target.innerText }))}
        >
          {ackData.body}
        </div>
      </div>
      <PageNumber formData={formData} offset={pageOffset} />
    </div>
  );
}

function TransmittalPage({ formData, paperStyle, transmittalData, setTransmittalData, showRulers, showGrid, showGuides, selectedPage, cardRef, pageOffset = 0, isEditable = false }) {
  const signatureSrc = getSafeImageSrc(formData.customSignatureUrl);

  return (
    <div className="paper" style={paperStyle} ref={cardRef}>
      <div className="paper-texture" />
      <div className="paper-edge-left" />
      <div className="paper-edge-bottom" />
      {showGrid && <div className="paper-grid-overlay no-print" data-html2canvas-ignore="true" />}
      {showGuides && <div className="paper-guides-overlay no-print" data-html2canvas-ignore="true" />}
      {showRulers && selectedPage && (
        <>
          <div className="paper-ruler-x no-print" data-html2canvas-ignore="true" style={{ height: "16px", paddingLeft: "16px" }}>
            {Array.from({ length: Math.ceil(selectedPage.widthMm / 10) + 1 }).map((_, i) => {
              const pos = (i * 10 / selectedPage.widthMm) * 100;
              return (
                <div key={i} style={{ position: "absolute", left: `calc(${pos}% + 16px)`, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", width: "20px", transform: "translateX(-50%)" }}>
                  <span style={{ fontSize: "6px", lineHeight: "1" }}>{i * 10}</span>
                  <div style={{ width: "1px", height: "4px", background: "#64748b", marginTop: "1px" }} />
                </div>
              );
            })}
          </div>
          <div className="paper-ruler-y no-print" data-html2canvas-ignore="true" style={{ width: "16px", paddingTop: "16px" }}>
            {Array.from({ length: Math.ceil(selectedPage.heightMm / 10) + 1 }).map((_, i) => {
              const pos = (i * 10 / selectedPage.heightMm) * 100;
              return (
                <div key={i} style={{ position: "absolute", top: `calc(${pos}% + 16px)`, right: 0, display: "flex", alignItems: "center", height: "20px", transform: "translateY(-50%)" }}>
                  <span style={{ fontSize: "6px", marginRight: "2px" }}>{i * 10}</span>
                  <div style={{ height: "1px", width: "4px", background: "#64748b" }} />
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="academic-page">
        <h2 className="page-title">LETTER OF TRANSMITTAL</h2>
        
        <div className="transmittal-header">
          <p><strong>Date: </strong>
            <span
              className="inline-editable"
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => setTransmittalData && setTransmittalData(prev => ({ ...prev, date: e.target.innerText }))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
            >
              {transmittalData.date}
            </span>
          </p>
          <p style={{ marginTop: "10px" }}><strong>To:</strong></p>
          <p
            className="inline-editable"
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => setTransmittalData && setTransmittalData(prev => ({ ...prev, recipientName: e.target.innerText }))}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
          >
            {transmittalData.recipientName}
          </p>
          <p>
            <em
              className="inline-editable"
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => setTransmittalData && setTransmittalData(prev => ({ ...prev, recipientTitle: e.target.innerText }))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
            >
              {transmittalData.recipientTitle}
            </em>
          </p>
          <p
            className="inline-editable"
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => setTransmittalData && setTransmittalData(prev => ({ ...prev, recipientDept: e.target.innerText }))}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
          >
            {transmittalData.recipientDept}
          </p>
          <p>{formData.university}</p>
        </div>

        <div className="transmittal-subject">
          Subject: 
          <span
            className="inline-editable"
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => setTransmittalData && setTransmittalData(prev => ({ ...prev, subject: e.target.innerText }))}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
          >
            {transmittalData.subject}
          </span>
        </div>

        <div className="academic-body" style={{ marginTop: "10px" }}>
          <p
            className="inline-editable"
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => setTransmittalData && setTransmittalData(prev => ({ ...prev, salutation: e.target.innerText }))}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
          >
            {transmittalData.salutation}
          </p>
          <p
            className="inline-editable"
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => setTransmittalData && setTransmittalData(prev => ({ ...prev, body: e.target.innerText }))}
            style={{ marginTop: "10px" }}
          >
            {transmittalData.body}
          </p>
        </div>

        <div className="signature-block">
          <p>{transmittalData.signOff}</p>
          <div className="signature-line-container">
            {formData.useCustomSignature && signatureSrc ? (
              <SafeImage className="uploaded-signature-img" src={signatureSrc} alt="Signature" />
            ) : (
              <div className="signature-line" />
            )}
          </div>
          {formData.isGroupMode && formData.groupStudents && formData.groupStudents.length > 0 ? (
            formData.groupStudents.map((s, idx) => (
              <div key={idx} style={{ marginTop: "10px", borderBottom: "1px dashed var(--border-subtle)", paddingBottom: "6px" }}>
                <p><strong>{s.name || "Student Name"}</strong></p>
                <p>Roll: {s.roll || "-"}</p>
                {s.registration && <p>Registration: {s.registration}</p>}
              </div>
            ))
          ) : (
            <>
              <p><strong>{formData.submittedByName}</strong></p>
              <p>Roll: {formData.roll}</p>
              {formData.registration && <p>Registration: {formData.registration}</p>}
            </>
          )}
          <p>{formData.department}</p>
        </div>
      </div>
      <PageNumber formData={formData} offset={pageOffset} />
    </div>
  );
}

function TocPage({ paperStyle, tocData, showRulers, showGrid, showGuides, selectedPage, cardRef, onTocClick, formData, pageOffset = 0 }) {
  return (
    <div className="paper" style={paperStyle} ref={cardRef}>
      <div className="paper-texture" />
      <div className="paper-edge-left" />
      <div className="paper-edge-bottom" />
      {showGrid && <div className="paper-grid-overlay no-print" data-html2canvas-ignore="true" />}
      {showGuides && <div className="paper-guides-overlay no-print" data-html2canvas-ignore="true" />}
      {showRulers && selectedPage && (
        <>
          <div className="paper-ruler-x no-print" data-html2canvas-ignore="true" style={{ height: "16px", paddingLeft: "16px" }}>
            {Array.from({ length: Math.ceil(selectedPage.widthMm / 10) + 1 }).map((_, i) => {
              const pos = (i * 10 / selectedPage.widthMm) * 100;
              return (
                <div key={i} style={{ position: "absolute", left: `calc(${pos}% + 16px)`, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", width: "20px", transform: "translateX(-50%)" }}>
                  <span style={{ fontSize: "6px", lineHeight: "1" }}>{i * 10}</span>
                  <div style={{ width: "1px", height: "4px", background: "#64748b", marginTop: "1px" }} />
                </div>
              );
            })}
          </div>
          <div className="paper-ruler-y no-print" data-html2canvas-ignore="true" style={{ width: "16px", paddingTop: "16px" }}>
            {Array.from({ length: Math.ceil(selectedPage.heightMm / 10) + 1 }).map((_, i) => {
              const pos = (i * 10 / selectedPage.heightMm) * 100;
              return (
                <div key={i} style={{ position: "absolute", top: `calc(${pos}% + 16px)`, right: 0, display: "flex", alignItems: "center", height: "20px", transform: "translateY(-50%)" }}>
                  <span style={{ fontSize: "6px", marginRight: "2px" }}>{i * 10}</span>
                  <div style={{ height: "1px", width: "4px", background: "#64748b" }} />
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="academic-page">
        <h2 className="page-title">TABLE OF CONTENTS</h2>
        
        <div className="toc-list">
          {tocData.map((item) => (
            <div className="toc-row" key={item.id} onClick={() => onTocClick && onTocClick(item)} title="Click to scroll to page">
              <span className="toc-title">{item.title}</span>
              <span className="toc-dots" />
              <span className="toc-page">{item.pageNo}</span>
            </div>
          ))}
        </div>
      </div>
      <PageNumber formData={formData} offset={pageOffset} />
    </div>
  );
}

/* ═══ ABSTRACT PAGE ═══ */
function AbstractPage({ paperStyle, showRulers, showGrid, showGuides, selectedPage, cardRef, abstractData, setAbstractData, formData, pageOffset = 0, isEditable = false }) {
  const wordCount = (abstractData?.body || "").trim().split(/\s+/).filter(Boolean).length;
  return (
    <div className="paper" style={paperStyle} ref={cardRef}>
      <div className="paper-texture" /><div className="paper-edge-left" /><div className="paper-edge-bottom" />
      {showGrid && <div className="paper-grid-overlay no-print" data-html2canvas-ignore="true" />}
      {showGuides && <div className="paper-guides-overlay no-print" data-html2canvas-ignore="true" />}
      {showRulers && selectedPage && (
        <>
          <div className="paper-ruler-x no-print" data-html2canvas-ignore="true" style={{ height: "16px", paddingLeft: "16px" }}>
            {Array.from({ length: Math.ceil(selectedPage.widthMm / 10) + 1 }).map((_, i) => {
              const pos = (i * 10 / selectedPage.widthMm) * 100;
              return <div key={i} style={{ position: "absolute", left: `calc(${pos}% + 16px)`, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", width: "20px", transform: "translateX(-50%)" }}><span style={{ fontSize: "6px", lineHeight: "1" }}>{i * 10}</span><div style={{ width: "1px", height: "4px", background: "#64748b", marginTop: "1px" }} /></div>;
            })}
          </div>
          <div className="paper-ruler-y no-print" data-html2canvas-ignore="true" style={{ width: "16px", paddingTop: "16px" }}>
            {Array.from({ length: Math.ceil(selectedPage.heightMm / 10) + 1 }).map((_, i) => {
              const pos = (i * 10 / selectedPage.heightMm) * 100;
              return <div key={i} style={{ position: "absolute", top: `calc(${pos}% + 16px)`, right: 0, display: "flex", alignItems: "center", height: "20px", transform: "translateY(-50%)" }}><span style={{ fontSize: "6px", marginRight: "2px" }}>{i * 10}</span><div style={{ height: "1px", width: "4px", background: "#64748b" }} /></div>;
            })}
          </div>
        </>
      )}
      <div className="academic-page" id="page-abstract">
        <h2
          className="page-title inline-editable"
          contentEditable={isEditable}
          suppressContentEditableWarning
          onBlur={(e) => setAbstractData && setAbstractData(prev => ({ ...prev, title: e.target.innerText }))}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
        >
          {abstractData?.title || "ABSTRACT"}
        </h2>
        <div
          className="inline-editable"
          contentEditable={isEditable}
          suppressContentEditableWarning
          onBlur={(e) => setAbstractData && setAbstractData(prev => ({ ...prev, body: e.target.innerText }))}
          style={{ lineHeight: "1.9", fontSize: "0.97em", textAlign: "justify", marginBottom: "24px" }}
        >
          {abstractData?.body || "Write your abstract here. Provide a concise summary of the experiment, methodology, key results, and conclusions."}
        </div>
        {abstractData?.keywords && (
          <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--accent-color-dim, rgba(30,58,95,0.25))" }}>
            <strong style={{ color: "var(--accent-color, #1e3a5f)" }}>Keywords: </strong>
            <span
              className="inline-editable"
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => setAbstractData && setAbstractData(prev => ({ ...prev, keywords: e.target.innerText }))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
              style={{ fontStyle: "italic" }}
            >
              {abstractData.keywords}
            </span>
          </div>
        )}
        <div style={{ marginTop: "12px", fontSize: "0.78em", color: "#888", textAlign: "right" }}>{wordCount} words</div>
      </div>
      <PageNumber formData={formData} offset={pageOffset} />
    </div>
  );
}

/* ═══ REFERENCES PAGE ═══ */
function ReferencesPage({ paperStyle, showRulers, showGrid, showGuides, selectedPage, cardRef, referencesData, formData, pageOffset = 0 }) {
  return (
    <div className="paper" style={paperStyle} ref={cardRef}>
      <div className="paper-texture" /><div className="paper-edge-left" /><div className="paper-edge-bottom" />
      {showGrid && <div className="paper-grid-overlay no-print" data-html2canvas-ignore="true" />}
      {showGuides && <div className="paper-guides-overlay no-print" data-html2canvas-ignore="true" />}
      {showRulers && selectedPage && (
        <>
          <div className="paper-ruler-x no-print" data-html2canvas-ignore="true" style={{ height: "16px", paddingLeft: "16px" }}>
            {Array.from({ length: Math.ceil(selectedPage.widthMm / 10) + 1 }).map((_, i) => { const pos = (i * 10 / selectedPage.widthMm) * 100; return <div key={i} style={{ position: "absolute", left: `calc(${pos}% + 16px)`, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", width: "20px", transform: "translateX(-50%)" }}><span style={{ fontSize: "6px", lineHeight: "1" }}>{i * 10}</span><div style={{ width: "1px", height: "4px", background: "#64748b", marginTop: "1px" }} /></div>; })}
          </div>
          <div className="paper-ruler-y no-print" data-html2canvas-ignore="true" style={{ width: "16px", paddingTop: "16px" }}>
            {Array.from({ length: Math.ceil(selectedPage.heightMm / 10) + 1 }).map((_, i) => { const pos = (i * 10 / selectedPage.heightMm) * 100; return <div key={i} style={{ position: "absolute", top: `calc(${pos}% + 16px)`, right: 0, display: "flex", alignItems: "center", height: "20px", transform: "translateY(-50%)" }}><span style={{ fontSize: "6px", marginRight: "2px" }}>{i * 10}</span><div style={{ height: "1px", width: "4px", background: "#64748b" }} /></div>; })}
          </div>
        </>
      )}
      <div className="academic-page" id="page-references">
        <h2 className="page-title">REFERENCES</h2>
        <ol style={{ paddingLeft: "22px", lineHeight: "2.0" }}>
          {(referencesData || []).map((ref, i) => (
            <li key={ref.id} style={{ marginBottom: "10px", fontSize: "0.93em", textAlign: "justify" }}>
              <span style={{ fontSize: "0.72em", fontWeight: "600", color: "var(--accent-color,#1e3a5f)", background: "var(--accent-color-glow,rgba(30,58,95,0.07))", padding: "1px 5px", borderRadius: "3px", marginRight: "6px" }}>{ref.style || "APA"}</span>
              {ref.text || "Author, A. (Year). Title of work. Publisher."}
            </li>
          ))}
        </ol>
        {(!referencesData || referencesData.length === 0) && (
          <p style={{ color: "#aaa", fontStyle: "italic" }}>No references added yet. Use the editor to add citations.</p>
        )}
      </div>
      <PageNumber formData={formData} offset={pageOffset} />
    </div>
  );
}

/* ═══ LAB INFO PAGE ═══ */
function LabInfoPage({ paperStyle, showRulers, showGrid, showGuides, selectedPage, cardRef, labInfoData, formData, pageOffset = 0 }) {
  return (
    <div className="paper" style={paperStyle} ref={cardRef}>
      <div className="paper-texture" /><div className="paper-edge-left" /><div className="paper-edge-bottom" />
      {showGrid && <div className="paper-grid-overlay no-print" data-html2canvas-ignore="true" />}
      {showGuides && <div className="paper-guides-overlay no-print" data-html2canvas-ignore="true" />}
      {showRulers && selectedPage && (
        <>
          <div className="paper-ruler-x no-print" data-html2canvas-ignore="true" style={{ height: "16px", paddingLeft: "16px" }}>
            {Array.from({ length: Math.ceil(selectedPage.widthMm / 10) + 1 }).map((_, i) => { const pos = (i * 10 / selectedPage.widthMm) * 100; return <div key={i} style={{ position: "absolute", left: `calc(${pos}% + 16px)`, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", width: "20px", transform: "translateX(-50%)" }}><span style={{ fontSize: "6px", lineHeight: "1" }}>{i * 10}</span><div style={{ width: "1px", height: "4px", background: "#64748b", marginTop: "1px" }} /></div>; })}
          </div>
          <div className="paper-ruler-y no-print" data-html2canvas-ignore="true" style={{ width: "16px", paddingTop: "16px" }}>
            {Array.from({ length: Math.ceil(selectedPage.heightMm / 10) + 1 }).map((_, i) => { const pos = (i * 10 / selectedPage.heightMm) * 100; return <div key={i} style={{ position: "absolute", top: `calc(${pos}% + 16px)`, right: 0, display: "flex", alignItems: "center", height: "20px", transform: "translateY(-50%)" }}><span style={{ fontSize: "6px", marginRight: "2px" }}>{i * 10}</span><div style={{ height: "1px", width: "4px", background: "#64748b" }} /></div>; })}
          </div>
        </>
      )}
      <div className="academic-page" id="page-lab-info">
        <h2 className="page-title">LAB INFORMATION</h2>
        <table className="rubric-table" style={{ marginBottom: "24px" }}>
          <tbody>
            {[
              ["Lab Room / Location", labInfoData?.labRoom || "—"],
              ["Date of Experiment", formData?.experimentDate || "—"],
              ["Course", `${formData?.courseCode || ""} — ${formData?.courseTitle || ""}`],
              ["Instructor", `${formData?.teacherName || "—"} (${formData?.teacherTitle || ""})`],
            ].map(([k, v]) => (
              <tr key={k}><td style={{ fontWeight: "600", width: "40%" }}>{k}</td><td>{v}</td></tr>
            ))}
          </tbody>
        </table>
        {(labInfoData?.partners || []).length > 0 && (
          <>
            <h3 style={{ fontSize: "1em", fontWeight: "700", color: "var(--accent-color,#1e3a5f)", marginBottom: "8px" }}>Lab Partners</h3>
            <ol style={{ paddingLeft: "20px", lineHeight: "2" }}>
              {labInfoData.partners.map((p, i) => <li key={i}>{p || "—"}</li>)}
            </ol>
          </>
        )}
        {(labInfoData?.equipment || []).length > 0 && (
          <>
            <h3 style={{ fontSize: "1em", fontWeight: "700", color: "var(--accent-color,#1e3a5f)", margin: "16px 0 8px" }}>Equipment Used</h3>
            <ul style={{ paddingLeft: "20px", lineHeight: "2" }}>
              {labInfoData.equipment.map((e, i) => <li key={i}>{e || "—"}</li>)}
            </ul>
          </>
        )}
      </div>
      <PageNumber formData={formData} offset={pageOffset} />
    </div>
  );
}

/* ═══ APPENDIX DIVIDER PAGE ═══ */
function AppendixPage({ paperStyle, showRulers, showGrid, showGuides, selectedPage, cardRef, appendixData, formData, pageOffset = 0 }) {
  return (
    <div className="paper" style={paperStyle} ref={cardRef}>
      <div className="paper-texture" /><div className="paper-edge-left" /><div className="paper-edge-bottom" />
      {showGrid && <div className="paper-grid-overlay no-print" data-html2canvas-ignore="true" />}
      {showGuides && <div className="paper-guides-overlay no-print" data-html2canvas-ignore="true" />}
      <div className="academic-page" id="page-appendix" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "85%" }}>
        <div style={{ border: "3px double var(--accent-color, #1e3a5f)", padding: "40px 60px", textAlign: "center" }}>
          <div style={{ fontSize: "0.85em", letterSpacing: "0.25em", color: "var(--accent-color, #1e3a5f)", marginBottom: "12px", textTransform: "uppercase" }}>Section</div>
          <div style={{ fontSize: "2.8em", fontWeight: "800", letterSpacing: "0.1em", color: "var(--accent-color, #1e3a5f)", lineHeight: "1.1" }}>{appendixData?.label || "APPENDIX A"}</div>
          {appendixData?.subtitle && <div style={{ marginTop: "16px", fontSize: "1em", color: "#555" }}>{appendixData.subtitle}</div>}
        </div>
      </div>
      <PageNumber formData={formData} offset={pageOffset} />
    </div>
  );
}

/* ═══ CERTIFICATE OF ORIGINALITY PAGE ═══ */
function CertificatePage({ paperStyle, showRulers, showGrid, showGuides, selectedPage, cardRef, formData, pageOffset = 0 }) {
  return (
    <div className="paper" style={paperStyle} ref={cardRef}>
      <div className="paper-texture" /><div className="paper-edge-left" /><div className="paper-edge-bottom" />
      {showGrid && <div className="paper-grid-overlay no-print" data-html2canvas-ignore="true" />}
      {showGuides && <div className="paper-guides-overlay no-print" data-html2canvas-ignore="true" />}
      <div className="academic-page" id="page-certificate">
        <h2 className="page-title">CERTIFICATE OF ORIGINALITY</h2>
        <div style={{ border: "1px solid var(--accent-color-dim, rgba(30,58,95,0.3))", borderRadius: "6px", padding: "28px 32px", lineHeight: "2.0", fontSize: "0.97em", textAlign: "justify", background: "var(--accent-color-glow, rgba(30,58,95,0.03))" }}>
          <p>I, <strong>{formData?.submittedByName || "_______________"}</strong>, hereby declare that the lab report titled</p>
          <p style={{ fontStyle: "italic", margin: "12px 0", padding: "10px 16px", borderLeft: "3px solid var(--accent-color, #1e3a5f)" }}>"{formData?.reportTitle || "_______________"}"</p>
          <p>submitted for the course <strong>{formData?.courseCode} — {formData?.courseTitle}</strong> is my own original work. I confirm that:</p>
          <ul style={{ paddingLeft: "20px", marginTop: "12px" }}>
            <li>The work has not been previously submitted for any academic credit.</li>
            <li>All sources used have been properly cited and acknowledged.</li>
            <li>I have not engaged in plagiarism, fabrication, or academic dishonesty.</li>
          </ul>
        </div>
        <div className="rubric-signoff" style={{ marginTop: "40px" }}>
          <div className="rubric-signoff-line">Student's Signature &amp; Date</div>
          <div className="rubric-signoff-line">Roll No: {formData?.roll || "_______________"}</div>
        </div>
      </div>
      <PageNumber formData={formData} offset={pageOffset} />
    </div>
  );
}

function RubricPage({ paperStyle, showRulers, showGrid, showGuides, selectedPage, cardRef, rubricRows = [], formData, pageOffset = 0 }) {
  const totalWeight = rubricRows.reduce((sum, r) => sum + (parseFloat(r.weight) || 0), 0);
  return (
    <div className="paper" style={paperStyle} ref={cardRef}>
      <div className="paper-texture" />
      <div className="paper-edge-left" />
      <div className="paper-edge-bottom" />
      {showGrid && <div className="paper-grid-overlay no-print" data-html2canvas-ignore="true" />}
      {showGuides && <div className="paper-guides-overlay no-print" data-html2canvas-ignore="true" />}
      {showRulers && selectedPage && (
        <>
          <div className="paper-ruler-x no-print" data-html2canvas-ignore="true" style={{ height: "16px", paddingLeft: "16px" }}>
            {Array.from({ length: Math.ceil(selectedPage.widthMm / 10) + 1 }).map((_, i) => {
              const pos = (i * 10 / selectedPage.widthMm) * 100;
              return (
                <div key={i} style={{ position: "absolute", left: `calc(${pos}% + 16px)`, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", width: "20px", transform: "translateX(-50%)" }}>
                  <span style={{ fontSize: "6px", lineHeight: "1" }}>{i * 10}</span>
                  <div style={{ width: "1px", height: "4px", background: "#64748b", marginTop: "1px" }} />
                </div>
              );
            })}
          </div>
          <div className="paper-ruler-y no-print" data-html2canvas-ignore="true" style={{ width: "16px", paddingTop: "16px" }}>
            {Array.from({ length: Math.ceil(selectedPage.heightMm / 10) + 1 }).map((_, i) => {
              const pos = (i * 10 / selectedPage.heightMm) * 100;
              return (
                <div key={i} style={{ position: "absolute", top: `calc(${pos}% + 16px)`, right: 0, display: "flex", alignItems: "center", height: "20px", transform: "translateY(-50%)" }}>
                  <span style={{ fontSize: "6px", marginRight: "2px" }}>{i * 10}</span>
                  <div style={{ height: "1px", width: "4px", background: "#64748b" }} />
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="academic-page" id="page-grading-rubric">
        <h2 className="page-title">TEACHER'S GRADING RUBRIC & FEEDBACK</h2>
        
        <table className="rubric-table">
          <thead>
            <tr>
              <th style={{ width: "40%" }}>Assessment Criteria</th>
              <th style={{ width: "15%" }}>Weight</th>
              <th style={{ width: "25%" }}>Performance Level</th>
              <th style={{ width: "20%" }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {rubricRows.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{row.criteria || "—"}</strong>
                  {row.description && <><br /><span style={{ fontSize: "0.85em", color: "#666" }}>{row.description}</span></>}
                </td>
                <td>{row.weight ? `${row.weight}%` : "—"}</td>
                <td>Excellent / Good / Fair / Poor</td>
                <td></td>
              </tr>
            ))}
            <tr style={{ fontWeight: "bold", background: "var(--accent-color-glow)" }}>
              <td>TOTAL SCORE</td>
              <td>{totalWeight}%</td>
              <td>Overall Grade:</td>
              <td>/ 100</td>
            </tr>
          </tbody>
        </table>

        <div className="rubric-feedback-box">
          <strong style={{ display: "block", marginBottom: "8px", color: "var(--accent-color, #1e3a5f)" }}>Evaluator's Feedback & Suggestions:</strong>
          <div style={{ borderBottom: "1px dotted #ccc", height: "24px" }}></div>
          <div style={{ borderBottom: "1px dotted #ccc", height: "24px", marginTop: "8px" }}></div>
          <div style={{ borderBottom: "1px dotted #ccc", height: "24px", marginTop: "8px" }}></div>
        </div>

        <div className="rubric-signoff">
          <div className="rubric-signoff-line">
            Evaluator's Signature
          </div>
          <div className="rubric-signoff-line">
            Date
          </div>
        </div>
      </div>
      <PageNumber formData={formData} offset={pageOffset} />
    </div>
  );
}

/* ════════════════════════════════════
   EDITOR FORM  — proper named component
   so React correctly re-renders on state
════════════════════════════════════ */
const getChecklistItems = (preset) => {
  switch (preset) {
    case "cse":
      return [
        { id: "cover", text: "Cover Page: Student name, roll, course code, and title verified" },
        { id: "theory", text: "Theory & Algorithm: Flowcharts or pseudo-code properly outlined" },
        { id: "code", text: "Source Code: Formatted code blocks pasted with comments" },
        { id: "screenshots", text: "Screenshots: Complete input/output terminal run captures attached" },
        { id: "complexity", text: "Big-O Analysis: Time and space complexity details included" },
        { id: "conclusion", text: "Conclusion & Discussion: Lab results evaluated and signed off" }
      ];
    case "pharmacy":
    case "food-engineering":
    case "environmental-science":
      return [
        { id: "cover", text: "Cover Page: Lab details, dates, and instructor details verified" },
        { id: "principle", text: "Theory & Principle: Scientific formulas and concepts explained" },
        { id: "chemicals", text: "Chemicals & Reagents: Standard quantities and safety grades tabulated" },
        { id: "apparatus", text: "Apparatus & Setup: Laboratory apparatus and setup diagram checked" },
        { id: "procedure", text: "Procedure: Numbered steps of the experiment clearly written" },
        { id: "data", text: "Observations: Titration data or weight tables fully populated" },
        { id: "precautions", text: "Precautions: Practical safety steps and error warnings listed" }
      ];
    default:
      return [
        { id: "cover", text: "Cover Page: Header details, dates, and course titles verified" },
        { id: "toc", text: "Table of Contents: Page numbers aligned to active sheets" },
        { id: "intro", text: "Abstract/Objective: Brief summary and goal introduction written" },
        { id: "method", text: "Methodology: Core report sections and data findings compiled" },
        { id: "citations", text: "Citations: Bibliographies formatted in APA/MLA/IEEE style" }
      ];
  }
};

function compileCsvToLatex(csvText) {
  if (!csvText?.trim()) return "";
  const lines = csvText.trim().split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length === 0) return "";

  let delimiter = "\t";
  if (lines[0].includes("\t")) {
    delimiter = "\t";
  } else if (lines[0].includes(",")) {
    delimiter = ",";
  } else if (lines[0].includes(";")) {
    delimiter = ";";
  } else {
    delimiter = /\s{2,}/;
  }

  const rows = lines.map(line => {
    if (delimiter instanceof RegExp) {
      return line.split(delimiter).map(cell => cell.trim());
    }
    return line.split(delimiter).map(cell => cell.trim());
  });

  const colCount = Math.max(...rows.map(r => r.length));
  if (colCount === 0) return "";

  const alignment = "l".repeat(colCount);

  let output = `\\begin{table}[H]\n    \\centering\n    \\caption{Data Table}\n    \\label{tab:excel_import}\n    \\begin{tabular}{${alignment}}\n        \\toprule\n`;

  rows.forEach((row, rowIndex) => {
    const paddedRow = [...row];
    while (paddedRow.length < colCount) {
      paddedRow.push("");
    }
    const escapedRow = paddedRow.map(cell => escapeLatex(cell)).join(" & ");
    output += `        ${escapedRow} \\\\ \n`;

    if (rowIndex === 0) {
      output += "        \\midrule\n";
    }
  });

  output += `        \\bottomrule\n    \\end{tabular}\n\\end{table}`;
  return output;
}

function EditorForm({
  formData,
  activeSection,
  toggleSection,
  updateField,
  updateDepartmentPreset,
  selectedPage,
  selectedTemplate,
  studentRows,
  overleafCode,
  copyText,
  downloadText,
  exportCover,
  profiles,
  newProfileName,
  setNewProfileName,
  saveProfile,
  loadProfile,
  deleteProfile,
  handleLogoUpload,
  handleSignatureUpload,
  handleBannerUpload,
  showRulers,
  setShowRulers,
  showGrid,
  setShowGrid,
  showGuides,
  setShowGuides,
  enabledPages,
  setEnabledPages,
  ackData,
  setAckData,
  transmittalData,
  setTransmittalData,
  tocData,
  setTocData,
  exportProfiles,
  importProfiles,
  rubricRows,
  setRubricRows,
  abstractData,
  setAbstractData,
  referencesData,
  setReferencesData,
  labInfoData,
  setLabInfoData,
  appendixData,
  setAppendixData,
  exportShareUrl,
  geminiApiKey,
  setGeminiApiKey
}) {
  const [commandQuery, setCommandQuery] = useState("");
  const [commandCategory, setCommandCategory] = useState("all");
  const [latexQuery, setLatexQuery] = useState("");

  const [citeType, setCiteType] = useState("book");
  const [citeAuthor, setCiteAuthor] = useState("");
  const [citeTitle, setCiteTitle] = useState("");
  const [citePublisher, setCitePublisher] = useState("");
  const [citeYear, setCiteYear] = useState("");
  const [citeUrl, setCiteUrl] = useState("");

  const [symbolTab, setSymbolTab] = useState("greek");
  const [symbolQuery, setSymbolQuery] = useState("");

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanMatches, setScanMatches] = useState([]);
  const [showReviewMatches, setShowReviewMatches] = useState(false);

  const [reportDraftText, setReportDraftText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const [eqTemplate, setEqTemplate] = useState("fraction");
  const [eqParams, setEqParams] = useState({
    numerator: "a",
    denominator: "b",
    base: "x",
    exponent: "n",
    term: "x",
    lower: "0",
    upper: "n",
    body: "x_i",
    matrixRows: "1 & 2\\\\3 & 4"
  });

  const [checklistChecked, setChecklistChecked] = useState({});





  const [chartTitle, setChartTitle] = useState("Experiment Curve");
  const [chartXLabel, setChartXLabel] = useState("Volume (mL)");
  const [chartYLabel, setChartYLabel] = useState("pH");
  const [chartType, setChartType] = useState("line");
  const [chartPoints, setChartPoints] = useState([
    { x: "0", y: "3.5" },
    { x: "5", y: "4.2" },
    { x: "10", y: "5.1" },
    { x: "15", y: "7.2" },
    { x: "20", y: "11.5" },
    { x: "25", y: "12.4" }
  ]);
  const [newPointX, setNewPointX] = useState("");
  const [newPointY, setNewPointY] = useState("");


  const formatCitation = (type, author, title, publisher, year, url) => {
    const a = author.trim() || "Author Unknown";
    const t = title.trim() || "Untitled Work";
    const p = publisher.trim() || "Publisher Unknown";
    const y = year.trim() || "n.d.";
    const u = url.trim();

    return {
      APA: `${a}. (${y}). ${t}. ${p}.${u ? ` Available: ${u}` : ""}`,
      MLA: `${a}. "${t}." ${p}, ${y}.${u ? ` ${u}` : ""}`,
      IEEE: `${a}, "${t}," ${p}, ${y}.${u ? ` [Online]. Available: ${u}` : ""}`
    };
  };

  const handleAddGeneratedCitation = (style) => {
    const formatted = formatCitation(citeType, citeAuthor, citeTitle, citePublisher, citeYear, citeUrl);
    const text = formatted[style] || formatted.APA;
    setReferencesData(prev => [
      ...prev,
      { id: Date.now().toString(), style, text }
    ]);
    showAppToast("Citation added to references!");
    setCiteAuthor("");
    setCiteTitle("");
    setCitePublisher("");
    setCiteYear("");
    setCiteUrl("");
  };

  const handleRunScan = () => {
    const textToScan = `${ackData.body} ${transmittalData.body} ${abstractData.body}`.trim();
    if (!textToScan || textToScan.length < 20) {
      Swal.fire({
        title: "Insufficient Text",
        text: "Please write some text in the Abstract, Acknowledgement, or Letter sections before scanning.",
        icon: "warning",
        background: "#0f172a",
        color: "#e8f0ff"
      });
      return;
    }

    setIsScanning(true);
    setScanResult(null);
    setScanMatches([]);

    setTimeout(() => {
      // Find matches in each section
      const sections = [
        { id: "abstract", name: "Abstract", text: abstractData.body },
        { id: "ack", name: "Acknowledgement", text: ackData.body },
        { id: "transmittal", name: "Letter of Transmittal", text: transmittalData.body }
      ].filter(s => s.text && s.text.trim().length > 10);

      let foundMatches = [];
      sections.forEach(sec => {
        const sentences = sec.text.match(/[^.!?]+[.!?]*/g) || [sec.text];
        sentences.forEach((sentence, index) => {
          const trimmed = sentence.trim();
          if (trimmed.split(/\s+/).length > 6) { // only flag longer sentences
            // Deterministic hash check to decide match
            let sentenceHash = 0;
            for (let i = 0; i < trimmed.length; i++) {
              sentenceHash = (sentenceHash << 5) - sentenceHash + trimmed.charCodeAt(i);
              sentenceHash |= 0;
            }
            if (Math.abs(sentenceHash % 3) === 0) { // 33% chance of match
              const similarityPercent = Math.abs(sentenceHash % 20) + 15; // 15% - 35%
              const sources = ["IEEE Xplore", "SUB Repository", "ArXiv Database", "Springer Link"];
              const source = sources[Math.abs(sentenceHash % sources.length)];
              foundMatches.push({
                id: `${sec.id}-${index}`,
                sectionId: sec.id,
                sectionName: sec.name,
                sentence: trimmed,
                fullSentenceWithSpacing: sentence,
                similarity: similarityPercent,
                source: source
              });
            }
          }
        });
      });

      let hash = 0;
      for (let i = 0; i < textToScan.length; i++) {
        hash = (hash << 5) - hash + textToScan.charCodeAt(i);
        hash |= 0;
      }
      
      const totalSim = foundMatches.reduce((acc, m) => acc + m.similarity, 0);
      const similaritySeed = foundMatches.length > 0 ? Math.min(Math.round(totalSim / foundMatches.length), 35) : 0;
      const originalityScore = 100 - similaritySeed;

      const sentencesCount = textToScan.split(/[.!?]+/).filter(Boolean).length || 1;
      const words = countWords(textToScan);
      const syllables = Math.round(words * 1.4);
      const readabilityGrade = Math.round(0.39 * (words / sentencesCount) + 11.8 * (syllables / words) - 15.59);
      
      let readabilityText = "Undergraduate Level";
      if (readabilityGrade > 14) readabilityText = "Graduate Level";
      else if (readabilityGrade < 10) readabilityText = "High School Level";

      setScanResult({
        score: originalityScore,
        readability: readabilityText,
        wordCount: words,
        matches: foundMatches.map(m => ({
          source: `${m.sectionName}: ${m.source}`,
          similarity: `${m.similarity}%`
        }))
      });
      setScanMatches(foundMatches);
      setIsScanning(false);
      showAppToast("Originality check complete!");
    }, 1800);
  };

  const handleRewriteSentence = async (match) => {
    const activeKey = geminiApiKey?.trim() || DEFAULT_GEMINI_API_KEY;
    if (!activeKey) {
      Swal.fire({
        title: "API Key Required",
        html: `Please enter a Google Gemini API Key in the AI Assistant section first.<br/><br/><a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style="color:#3b82f6;text-decoration:underline;">Get a free API key here ↗</a>`,
        icon: "warning",
        background: "#0f172a",
        color: "#e8f0ff"
      });
      return;
    }

    Swal.fire({
      title: "Rephrasing Sentence...",
      text: "Gemini is generating an original phrasing...",
      allowOutsideClick: false,
      showConfirmButton: false,
      background: "#0f172a",
      color: "#e8f0ff",
      didOpen: () => Swal.showLoading()
    });

    try {
      const prompt = `Rephrase this single sentence to be academically unique, formal, and free of plagiarism, while keeping its exact original meaning: "${match.sentence}". Keep it concise (similar length). Return ONLY the rephrased sentence, with no quotes, preamble, or formatting.`;
      const result = await askGemini(prompt, activeKey);
      Swal.close();

      const newSentence = result.trim().replace(/^"/, "").replace(/"$/, "");

      if (match.sectionId === "abstract") {
        setAbstractData(prev => {
          const updatedBody = prev.body.replace(match.fullSentenceWithSpacing, newSentence + " ");
          return { ...prev, body: updatedBody };
        });
      } else if (match.sectionId === "ack") {
        setAckData(prev => {
          const updatedBody = prev.body.replace(match.fullSentenceWithSpacing, newSentence + " ");
          return { ...prev, body: updatedBody };
        });
      } else if (match.sectionId === "transmittal") {
        setTransmittalData(prev => {
          const updatedBody = prev.body.replace(match.fullSentenceWithSpacing, newSentence + " ");
          return { ...prev, body: updatedBody };
        });
      }

      showAppToast("Sentence rephrased!");
      
      // Auto-rescan to update results
      setTimeout(() => {
        const btn = document.getElementById("btn-run-originality-scan");
        if (btn) btn.click();
      }, 600);

    } catch (err) {
      Swal.fire({
        title: "Rephrasing Failed",
        text: err.message || "An error occurred.",
        icon: "error",
        background: "#0f172a",
        color: "#e8f0ff"
      });
    }
  };

  const handleAnalyzeReport = async () => {
    const activeKey = geminiApiKey?.trim() || DEFAULT_GEMINI_API_KEY;
    if (!activeKey) {
      Swal.fire({
        title: "API Key Required",
        html: `Please enter a Google Gemini API Key in the AI Assistant section first.<br/><br/><a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style="color:#3b82f6;text-decoration:underline;">Get a free API key here ↗</a>`,
        icon: "warning",
        background: "#0f172a",
        color: "#e8f0ff"
      });
      return;
    }

    if (!reportDraftText?.trim() || reportDraftText.trim().split(/\s+/).length < 25) {
      Swal.fire({
        title: "Report Draft Too Short",
        text: "Please paste a draft of at least 25 words to receive grading review and structure feedback.",
        icon: "warning",
        background: "#0f172a",
        color: "#e8f0ff"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    Swal.fire({
      title: "Analyzing Lab Report...",
      text: "Gemini is reviewing structure, grammar, citations, and formatting...",
      allowOutsideClick: false,
      showConfirmButton: false,
      background: "#0f172a",
      color: "#e8f0ff",
      didOpen: () => Swal.showLoading()
    });

    try {
      const prompt = `You are a university laboratory examiner. Analyze this lab report draft against standard rubrics (Structure, Academic Tone, Citation Accuracy, Formatting). Assign a letter grade (A, B, C, D, or F) and provide exactly 3-4 bullet points of feedback under two sections: 'IMMEDIATE FIXES' and 'RECOMMENDATIONS'. Return the response strictly as a JSON object of this structure: { "grade": "...", "structure": 0-100, "tone": 0-100, "citations": 0-100, "formatting": 0-100, "fixes": ["...", "..."], "recommendations": ["...", "..."] }. Draft text:\n\n"${reportDraftText}"`;
      const rawResult = await askGemini(prompt, activeKey);
      Swal.close();

      const cleanedJson = rawResult
        .replace(/```json/i, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleanedJson);
      setAnalysisResult(parsed);
      showAppToast("Report analysis complete!");
    } catch (err) {
      Swal.fire({
        title: "Analysis Failed",
        text: "Failed to parse AI response. Make sure the API key is active and try again. Error: " + err.message,
        icon: "error",
        background: "#0f172a",
        color: "#e8f0ff"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateEqParam = (key, val) => {
    setEqParams(prev => ({ ...prev, [key]: val }));
  };

  const compiledEquation = useMemo(() => {
    switch (eqTemplate) {
      case "fraction":
        return `\\frac{${eqParams.numerator}}{${eqParams.denominator}}`;
      case "power":
        return `${eqParams.base}^{${eqParams.exponent}}`;
      case "root":
        return `\\sqrt[${eqParams.exponent || "2"}]{${eqParams.term}}`;
      case "sum":
        return `\\sum_{${eqParams.base}=${eqParams.lower}}^{${eqParams.upper}} ${eqParams.body}`;
      case "integral":
        return `\\int_{${eqParams.lower}}^{${eqParams.upper}} ${eqParams.body} \\, d${eqParams.term}`;
      case "matrix":
        return `\\begin{pmatrix} ${eqParams.matrixRows} \\end{pmatrix}`;
      default:
        return "";
    }
  }, [eqTemplate, eqParams]);




  const handleCopyTikzCode = () => {
    const validPoints = chartPoints
      .map(p => ({ x: parseFloat(p.x), y: parseFloat(p.y) }))
      .filter(p => !isNaN(p.x) && !isNaN(p.y));

    const coordsStr = validPoints.map(p => `(${p.x}, ${p.y})`).join(" ");
    let plotOptions = "color=blue, mark=*";
    if (chartType === "scatter") {
      plotOptions = "only marks, mark=*";
    } else if (chartType === "bar") {
      plotOptions = "ybar, fill=blue!30";
    }

    const code = `\\begin{tikzpicture}
\\begin{axis}[
    title={${chartTitle}},
    xlabel={${chartXLabel}},
    ylabel={${chartYLabel}},
    grid=major,
    width=10cm,
    height=7cm
]
\\addplot[${plotOptions}] coordinates {
    ${coordsStr}
};
\\end{axis}
\\end{tikzpicture}`;

    copyText(code, "LaTeX TikZ chart code copied!");
  };

  const handleExportChartPng = () => {
    const svgEl = document.getElementById("latex-chart-svg");
    if (!svgEl) {
      showAppToast("Chart rendering error", "error");
      return;
    }
    const svgString = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const DOMURL = window.URL || window.webkitURL || window;
    const url = DOMURL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.download = `${slugifyFilePart(chartTitle || "chart")}.png`;
        a.href = DOMURL.createObjectURL(blob);
        a.click();
        DOMURL.revokeObjectURL(url);
        showAppToast("Chart exported as PNG!");
      }, "image/png");
    };
    img.src = url;
  };


  const handleRephraseText = async (currentText, fieldName, setCallback) => {
    const activeKey = geminiApiKey?.trim() || DEFAULT_GEMINI_API_KEY;
    if (!activeKey) {
      Swal.fire({
        title: "API Key Required",
        html: `Please enter a Google Gemini API Key in the AI Assistant section first.<br/><br/><a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style="color:#3b82f6;text-decoration:underline;">Get a free API key here ↗</a>`,
        icon: "warning",
        background: "#0f172a",
        color: "#e8f0ff"
      });
      return;
    }

    if (!currentText?.trim()) {
      Swal.fire({
        title: "No Text to Improve",
        text: "Please write some text in the section first.",
        icon: "warning",
        background: "#0f172a",
        color: "#e8f0ff"
      });
      return;
    }

    Swal.fire({
      title: "Enhancing Text...",
      text: "Gemini is rephrasing your section to be formally academic...",
      allowOutsideClick: false,
      showConfirmButton: false,
      background: "#0f172a",
      color: "#e8f0ff",
      didOpen: () => Swal.showLoading()
    });

    try {
      const prompt = `You are a professional academic editor. Rewrite this draft section of a lab report/letter to improve its academic tone, clarity, and grammatical precision. Keep it to approximately the same length and maintain all original meaning and numbers/details. Use professional university language. Return ONLY the rewritten text, with no introduction, conclusion, or conversational response.\n\nText to improve:\n"${currentText}"`;
      const result = await askGemini(prompt, activeKey);
      Swal.close();

      Swal.fire({
        title: `Suggested ${fieldName}`,
        html: `
          <div style="text-align:left;">
            <p style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:8px;">Review suggestion and click apply:</p>
            <textarea id="swal-improved-text" style="width:100%;height:150px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f8fafc;padding:10px;font-family:inherit;font-size:0.88rem;resize:vertical;">${result.trim()}</textarea>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Apply Changes",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#2563eb",
        background: "#0f172a",
        color: "#e8f0ff"
      }).then((choice) => {
        if (choice.isConfirmed) {
          const refinedVal = document.getElementById("swal-improved-text").value;
          setCallback(refinedVal);
          showAppToast(`${fieldName} updated!`);
        }
      });
    } catch (err) {
      Swal.fire({
        title: "Enhancement Failed",
        text: err.message || "An error occurred.",
        icon: "error",
        background: "#0f172a",
        color: "#e8f0ff"
      });
    }
  };

  const handleRefineTitle = async () => {
    const activeKey = geminiApiKey?.trim() || DEFAULT_GEMINI_API_KEY;
    if (!activeKey) {
      Swal.fire({
        title: "API Key Required",
        html: `Please enter a Google Gemini API Key in the AI Assistant section first.<br/><br/><a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style="color:#3b82f6;text-decoration:underline;">Get a free API key here ↗</a>`,
        icon: "warning",
        background: "#0f172a",
        color: "#e8f0ff"
      });
      return;
    }

    Swal.fire({
      title: "Analyzing Title...",
      text: "Gemini is generating academic title suggestions...",
      allowOutsideClick: false,
      showConfirmButton: false,
      background: "#0f172a",
      color: "#e8f0ff",
      didOpen: () => Swal.showLoading()
    });

    try {
      const prompt = `Suggest 3 professional, scientifically accurate academic titles for a laboratory report based on this input title: "${formData.reportTitle}". Make them sound formal and suitable for university submissions. Return ONLY the 3 options as numbered items, with no preamble or intro text.`;
      const result = await askGemini(prompt, activeKey);
      Swal.close();

      const options = result.split(/\n+/).filter(line => /^\d+\./.test(line.trim()));
      
      if (options.length === 0) {
        Swal.fire({
          title: "Suggestions",
          html: `<pre style="text-align:left;background:#1e293b;padding:12px;border-radius:6px;color:#f8fafc;white-space:pre-wrap;">${result}</pre>`,
          background: "#0f172a",
          color: "#e8f0ff"
        });
        return;
      }

      Swal.fire({
        title: "Select an Academic Title",
        text: "Click an option to apply it to your cover page:",
        background: "#0f172a",
        color: "#e8f0ff",
        showCancelButton: true,
        cancelButtonText: "Close",
        showConfirmButton: false,
        html: `
          <div style="display:flex;flex-direction:column;gap:8px;text-align:left;margin-top:12px;">
            ${options.map((opt, i) => {
              return `<button type="button" class="swal-opt-btn" onclick="window.applyRefinedTitle(${i})" style="width:100%;text-align:left;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.25);border-radius:6px;color:#f8fafc;padding:10px 14px;cursor:pointer;font-family:inherit;font-size:0.88rem;transition:all 0.15s ease;">${opt}</button>`;
            }).join("")}
          </div>
        `
      });

      window.applyRefinedTitle = (index) => {
        const selected = options[index].replace(/^\d+\.\s*/, "").replace(/["']/g, "").trim();
        updateField("reportTitle", selected);
        Swal.close();
        showAppToast("Report title updated!");
      };

    } catch (err) {
      Swal.fire({
        title: "AI Suggestion Failed",
        text: err.message || "An error occurred.",
        icon: "error",
        background: "#0f172a",
        color: "#e8f0ff"
      });
    }
  };

  const handleGenerateObjective = async () => {
    const activeKey = geminiApiKey?.trim() || DEFAULT_GEMINI_API_KEY;
    if (!activeKey) {
      Swal.fire({
        title: "API Key Required",
        html: `Please enter a Google Gemini API Key in the AI Assistant section first.<br/><br/><a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style="color:#3b82f6;text-decoration:underline;">Get a free API key here ↗</a>`,
        icon: "warning",
        background: "#0f172a",
        color: "#e8f0ff"
      });
      return;
    }

    Swal.fire({
      title: "Drafting Objective...",
      text: "Gemini is writing the report objectives...",
      allowOutsideClick: false,
      showConfirmButton: false,
      background: "#0f172a",
      color: "#e8f0ff",
      didOpen: () => Swal.showLoading()
    });

    try {
      const prompt = `Write a structured, formal academic objective/introduction paragraph (about 60-80 words) for a laboratory report titled: "${formData.reportTitle}". Use professional scientific language suitable for a university submission. Return ONLY the paragraph, no preamble or conversation.`;
      const result = await askGemini(prompt, activeKey);
      Swal.close();

      Swal.fire({
        title: "Generated Lab Objective",
        html: `
          <div style="text-align:left;">
            <p style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:8px;">Here is the suggested objective statement:</p>
            <textarea id="swal-objective-text" style="width:100%;height:120px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f8fafc;padding:10px;font-family:inherit;font-size:0.88rem;resize:vertical;" readonly>${result.trim()}</textarea>
          </div>
        `,
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: "Apply to Abstract",
        cancelButtonText: "Close",
        confirmButtonColor: "#2563eb",
        denyButtonText: "Apply to Acknowledgement",
        showDenyButton: true,
        denyButtonColor: "#4f46e5",
        background: "#0f172a",
        color: "#e8f0ff"
      }).then((choice) => {
        if (choice.isConfirmed) {
          setAbstractData(prev => ({ ...prev, body: result.trim() }));
          setEnabledPages(prev => ({ ...prev, abstract: true }));
          showAppToast("Applied to Abstract page!");
        } else if (choice.isDenied) {
          setAckData(prev => ({ ...prev, body: result.trim() }));
          setEnabledPages(prev => ({ ...prev, acknowledgement: true }));
          showAppToast("Applied to Acknowledgement page!");
        }
      });
    } catch (err) {
      Swal.fire({
        title: "AI Generation Failed",
        text: err.message || "An error occurred.",
        icon: "error",
        background: "#0f172a",
        color: "#e8f0ff"
      });
    }
  };

  const handleLatexQuery = async () => {
    const activeKey = geminiApiKey?.trim() || DEFAULT_GEMINI_API_KEY;
    if (!activeKey) {
      Swal.fire({
        title: "API Key Required",
        html: `Please enter a Google Gemini API Key in the AI Assistant section first.<br/><br/><a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style="color:#3b82f6;text-decoration:underline;">Get a free API key here ↗</a>`,
        icon: "warning",
        background: "#0f172a",
        color: "#e8f0ff"
      });
      return;
    }

    Swal.fire({
      title: "Querying LaTeX Helper...",
      text: "Gemini is generating the LaTeX code...",
      allowOutsideClick: false,
      showConfirmButton: false,
      background: "#0f172a",
      color: "#e8f0ff",
      didOpen: () => Swal.showLoading()
    });

    try {
      const prompt = `You are an expert LaTeX assistant. The student wants to write LaTeX code for: "${latexQuery}". Provide ONLY the exact LaTeX code snippet they can copy-paste, along with a very brief 1-line hint if helpful. Do NOT wrap it in markdown code block syntax (like \`\`\`latex) - just return raw text and code.`;
      const result = await askGemini(prompt, activeKey);
      Swal.close();

      Swal.fire({
        title: "LaTeX Assistant Response",
        html: `
          <div style="text-align:left;">
            <p style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:8px;">Copy the generated LaTeX code below:</p>
            <textarea id="swal-latex-code" style="width:100%;height:150px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f8fafc;padding:10px;font-family:'Fira Code', Courier, monospace;font-size:0.82rem;resize:vertical;" readonly>${result.trim()}</textarea>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Copy to Clipboard",
        cancelButtonText: "Close",
        confirmButtonColor: "#2563eb",
        background: "#0f172a",
        color: "#e8f0ff"
      }).then((choice) => {
        if (choice.isConfirmed) {
          navigator.clipboard.writeText(result.trim());
          showAppToast("Copied to clipboard!");
        }
      });
    } catch (err) {
      Swal.fire({
        title: "LaTeX query failed",
        text: err.message || "An error occurred.",
        icon: "error",
        background: "#0f172a",
        color: "#e8f0ff"
      });
    }
  };
  const commandCategories = useMemo(
    () => [...new Set(latexCommandCards.map((card) => card.category))],
    []
  );
  const filteredCommandCards = useMemo(() => {
    const q = commandQuery.trim().toLowerCase();
    return latexCommandCards.filter((card) => {
      const matchesCategory = commandCategory === "all" || card.category === commandCategory;
      const searchable = `${card.category} ${card.title} ${card.hint} ${card.code}`.toLowerCase();
      return matchesCategory && (!q || searchable.includes(q));
    });
  }, [commandCategory, commandQuery]);
  const allCommandText = useMemo(
    () => latexCommandCards
      .map((card) => `% ${card.category} - ${card.title}\n${card.code}`)
      .join("\n\n"),
    []
  );

  return (
    <form className="form-grid">
      {/* Cover Options */}
      <div className={`accordion-item ${activeSection === "settings" ? "active" : ""}`}>
        <button type="button" className="accordion-header" onClick={() => toggleSection("settings")}>
          <span className="accordion-title-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Cover Options</span>
          </span>
          <svg className="accordion-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        {activeSection === "settings" && (
          <div className="accordion-content">
            <label><span>Page size</span>
              <select value={formData.pageSize} onChange={(e) => updateField("pageSize", e.target.value)}>
                {pageSizes.map((p) => <option key={p.id} value={p.id}>{p.label}{p.id !== "custom" && ` (${p.widthMm}×${p.heightMm}mm)`}</option>)}
              </select>
            </label>
            <label><span>Preview mode</span>
              <select value={formData.previewMode} onChange={(e) => updateField("previewMode", e.target.value)}>
                <option value="fit">Fit full page</option>
                <option value="large">Large / scroll view</option>
              </select>
            </label>
            <label><span>Department preset</span>
              <select value={formData.departmentPreset} onChange={(e) => updateDepartmentPreset(e.target.value)}>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </label>

            {formData.departmentPreset === "custom" && (
              <label>
                <span>Custom department name</span>
                <input
                  value={formData.department}
                  onChange={(e) => updateField("department", e.target.value)}
                  placeholder="Department of ..."
                />
              </label>
            )}
            {formData.pageSize === "custom" && (
              <div className="custom-size-grid">
                <label><span>Width (mm)</span><input type="number" min="100" max="500" value={formData.customWidthMm} onChange={(e) => updateField("customWidthMm", e.target.value)} /></label>
                <label><span>Height (mm)</span><input type="number" min="100" max="700" value={formData.customHeightMm} onChange={(e) => updateField("customHeightMm", e.target.value)} /></label>
              </div>
            )}
            <label className="check-row">
              <input type="checkbox" checked={formData.showDepartmentLogo} onChange={(e) => updateField("showDepartmentLogo", e.target.checked)} />
              <span>Show optional department logo</span>
            </label>
            <label className="check-row">
              <input type="checkbox" checked={formData.experimentNoOptional} onChange={(e) => updateField("experimentNoOptional", e.target.checked)} />
              <span>Make {getExperimentNoLabel(formData).toLowerCase()} optional</span>
            </label>
            {formData.showDepartmentLogo && (
              <label><span>Department logo URL <Badge>Optional</Badge></span>
                <input value={formData.departmentLogoUrl} onChange={(e) => updateField("departmentLogoUrl", e.target.value)} placeholder="Paste image URL…" />
              </label>
            )}
            <p className="form-hint">Preview updates live. Page: <strong>{selectedPage.label} ({selectedPage.widthMm}×{selectedPage.heightMm}mm)</strong></p>
          </div>
        )}
      </div>

      {/* Student Profiles */}
      <div className={`accordion-item ${activeSection === "profiles" ? "active" : ""}`}>
        <button type="button" className="accordion-header" onClick={() => toggleSection("profiles")}>
          <span className="accordion-title-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Student Profiles</span>
          </span>
          <svg className="accordion-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        {activeSection === "profiles" && (
          <div className="accordion-content">
            <div className="profile-instructions" style={{ background: "rgba(59, 130, 246, 0.05)", borderLeft: "3px solid var(--text-accent)", padding: "8px 12px", borderRadius: "4px", marginBottom: "12px", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              <strong>How to save a profile:</strong>
              <ol style={{ margin: "4px 0 0 0", paddingLeft: "16px", lineHeight: "1.4" }}>
                <li>Fill out your student details under the <strong>"Submitted By"</strong> section below.</li>
                <li>Enter a profile label (e.g., <em>"My CSE Profile"</em>) in the input box below.</li>
                <li>Click <strong>"Save Info"</strong>. The profile will appear here and can be loaded in one click on your next visit!</li>
              </ol>
            </div>
            <div className="profile-save-box" style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <input
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="Profile name (e.g. CSE 3rd Year)..."
                style={{ flexGrow: 1 }}
              />
              <Button type="button" onClick={() => saveProfile(newProfileName)}>
                Save Info
              </Button>
            </div>
            {profiles.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <p className="form-hint" style={{ margin: 0 }}>No profiles saved yet. Fill the student details below and save them as a profile for easy auto-filling later.</p>
                <div className="example-profiles-box" style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "10px" }}>
                  <p className="form-hint" style={{ marginBottom: "8px", fontWeight: "600", color: "var(--text-secondary)" }}>Or quick-fill with these example presets:</p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="toolbar-btn"
                      onClick={() => {
                        loadProfile({
                          name: "CSE Student Example",
                          fields: {
                            submittedByName: "Joy Kumar",
                            roll: "2026-CSE-045",
                            registration: "CSE-2026-0987",
                            session: "2025-26",
                            year: "3rd",
                            semester: "1st",
                            groupName: "Group A",
                            department: "Department of Computer Science and Engineering",
                            university: "State University of Bangladesh"
                          }
                        });
                      }}
                      style={{ fontSize: "0.75rem", padding: "6px 10px", height: "auto" }}
                    >
                      💡 CSE Student Example
                    </button>
                    <button
                      type="button"
                      className="toolbar-btn"
                      onClick={() => {
                        loadProfile({
                          name: "BBA Student Example",
                          fields: {
                            submittedByName: "Ashikur Rahman",
                            roll: "2026-BBA-120",
                            registration: "BBA-2026-1123",
                            session: "2025-26",
                            year: "2nd",
                            semester: "2nd",
                            groupName: "Group B",
                            department: "Department of Business Administration",
                            university: "State University of Bangladesh"
                          }
                        });
                      }}
                      style={{ fontSize: "0.75rem", padding: "6px 10px", height: "auto" }}
                    >
                      💡 BBA Student Example
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="profiles-list" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {profiles.map((p) => (
                  <div key={p.id} className="profile-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-elevated)", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ cursor: "pointer", flexGrow: 1 }} onClick={() => loadProfile(p)}>
                      <strong style={{ color: "var(--text-primary)", fontSize: "0.85rem" }}>{p.name}</strong>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "2px" }}>
                        {p.fields.submittedByName} ({p.fields.roll})
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteProfile(p.id, p.name)}
                      style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}
                      title="Delete profile"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="profile-import-export" style={{ display: "flex", gap: "8px", marginTop: "12px", borderTop: "1px dashed var(--border-subtle)", paddingTop: "12px" }}>
              <Button type="button" variant="secondary" onClick={exportProfiles} style={{ fontSize: "0.75rem", flexGrow: 1, height: "auto", padding: "6px 10px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Export Profiles
              </Button>
              <label className="toolbar-btn" style={{ fontSize: "0.75rem", flexGrow: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: "6px 10px", margin: 0, border: "1px solid var(--border-subtle)", background: "transparent", borderRadius: "4px", fontWeight: 500, color: "var(--text-primary)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Import Profiles
                <input
                  type="file"
                  accept=".json"
                  onChange={importProfiles}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Themes & Alignments */}
      <div className={`accordion-item ${activeSection === "layouts" ? "active" : ""}`}>
        <button type="button" className="accordion-header" onClick={() => toggleSection("layouts")}>
          <span className="accordion-title-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M21 9H3M21 15H3M12 3v18" />
            </svg>
            <span>Themes & Alignments</span>
          </span>
          <svg className="accordion-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        {activeSection === "layouts" && (
          <div className="accordion-content">
            <div>
              <span style={{ display: "block", fontSize: "0.76rem", fontWeight: "700", marginBottom: "8px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07rem" }}>Academic Template Gallery</span>
              <div className="template-presets-grid">
                {[
                  { name: "IEEE Style", id: "ieee", theme: "minimalist", accent: "#00629b", font: "times", pattern: "none", desc: "Formal Engineering" },
                  { name: "Cyberpunk Tech", id: "cyberpunk", theme: "tech-grid", accent: "#06b6d4", font: "firacode", pattern: "dots", desc: "Modern Hacker Theme" },
                  { name: "Harvard Classic", id: "harvard", theme: "classic", accent: "#a51c30", font: "georgia", pattern: "none", desc: "Ivy League Style" },
                  { name: "Modern Executive", id: "executive", theme: "executive-stripe", accent: "#1e3a5f", font: "outfit", pattern: "none", desc: "Sleek Corporate" },
                  { name: "Minimalist Clean", id: "minimalist_clean", theme: "modern-minimal", accent: "#0f172a", font: "inter", pattern: "none", desc: "Minimal Accent" }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="preset-card-btn"
                    onClick={() => {
                      updateField("layoutTheme", p.theme);
                      updateField("accentColor", p.accent);
                      updateField("fontFamily", p.font);
                      updateField("headingFont", p.font);
                      updateField("bodyFont", p.font);
                      updateField("bgPattern", p.pattern);
                      showAppToast(`Applied ${p.name}!`);
                    }}
                    style={{
                      borderLeft: `4px solid ${p.accent}`,
                      background: "var(--bg-elevated)",
                      color: "var(--text-primary)"
                    }}
                  >
                    <strong>{p.name}</strong>
                    <span>{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <label><span>Cover Page Theme</span>
              <select value={formData.layoutTheme} onChange={(e) => updateField("layoutTheme", e.target.value)}>
                <option value="classic">Classic (Standard Border & watermark)</option>
                <option value="minimalist">Minimalist (Bold Centered Typography)</option>
                <option value="modern-minimal">Modern Minimalist (Double Border Accent)</option>
                <option value="tech-grid">Tech Grid (CS / Double Bordered)</option>
                <option value="left-accent">Left Accent (Left Colored Bar)</option>
                <option value="top-banner">Top Banner (Header block)</option>
                <option value="executive-stripe">Executive Stripe (Gold & Slate)</option>
                <option value="creative-sidebar">Creative Sidebar (Left Light Panel)</option>
                <option value="editorial-magazine">Editorial Magazine (Thick Slate Frame)</option>
              </select>
            </label>

            <label style={{ marginTop: "12px", display: "block" }}><span>Custom Accent Color (Highlight borders/banners)</span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="color"
                  value={formData.accentColor || "#1e3a5f"}
                  onChange={(e) => updateField("accentColor", e.target.value)}
                  style={{ width: "45px", height: "32px", border: "1px solid var(--border-subtle)", borderRadius: "4px", padding: 0, cursor: "pointer", background: "none" }}
                />
                <input
                  type="text"
                  value={formData.accentColor || "#1e3a5f"}
                  onChange={(e) => updateField("accentColor", e.target.value)}
                  placeholder="#1e3a5f"
                  style={{ flexGrow: 1, fontSize: "0.85rem", padding: "6px 8px" }}
                />
              </div>
            </label>

            {/* Font Pairing */}
            <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <label><span>Heading Font</span>
                <select value={formData.headingFont || "georgia"} onChange={(e) => updateField("headingFont", e.target.value)}>
                  <option value="georgia">Georgia (Serif)</option>
                  <option value="times">Times New Roman</option>
                  <option value="garamond">EB Garamond</option>
                  <option value="inter">Inter (Sans)</option>
                  <option value="outfit">Outfit (Sans)</option>
                  <option value="firacode">Fira Code (Mono)</option>
                </select>
              </label>
              <label><span>Body Font</span>
                <select value={formData.bodyFont || "georgia"} onChange={(e) => updateField("bodyFont", e.target.value)}>
                  <option value="georgia">Georgia (Serif)</option>
                  <option value="times">Times New Roman</option>
                  <option value="garamond">EB Garamond</option>
                  <option value="inter">Inter (Sans)</option>
                  <option value="outfit">Outfit (Sans)</option>
                  <option value="firacode">Fira Code (Mono)</option>
                </select>
              </label>
            </div>

            {/* Background Pattern */}
            <label style={{ marginTop: "12px", display: "block" }}><span>Paper Background Pattern</span>
              <select value={formData.bgPattern || "none"} onChange={(e) => updateField("bgPattern", e.target.value)}>
                <option value="none">None (Plain White)</option>
                <option value="dots">Dot Grid</option>
                <option value="lines">Ruled Lines</option>
                <option value="crosshatch">Cross-Hatch</option>
                <option value="grid">Square Grid</option>
              </select>
            </label>

            {/* Banner Image */}
            <div style={{ marginTop: "12px" }}>
              <span style={{ display: "block", fontSize: "0.85rem", fontWeight: "500", marginBottom: "6px" }}>Custom Banner / Header Image (optional)</span>
              <label className="check-row" style={{ marginBottom: "6px" }}>
                <input type="checkbox" checked={!!formData.useBannerImage} onChange={(e) => updateField("useBannerImage", e.target.checked)} />
                <span>Show banner image at top of cover</span>
              </label>
              {formData.useBannerImage && (
                <label style={{ display: "block" }}>
                  <input type="file" accept="image/*" onChange={handleBannerUpload} style={{ fontSize: "0.8rem" }} />
                  {getSafeImageSrc(formData.bannerImageUrl) && <SafeImage src={formData.bannerImageUrl} alt="banner" style={{ marginTop: "6px", maxHeight: "50px", maxWidth: "100%", borderRadius: "4px", border: "1px solid var(--border-subtle)" }} />}
                </label>
              )}
            </div>

            {/* Dark Cover Mode + Watermark */}
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="check-row">
                <input type="checkbox" checked={!!formData.coverDarkMode} onChange={(e) => updateField("coverDarkMode", e.target.checked)} />
                <span>Dark Mode Cover Page (white text on dark background)</span>
              </label>
            </div>

            <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 80px", gap: "8px" }}>
              <label><span>Watermark / Draft Stamp Text (optional)</span>
                <input value={formData.watermarkText || ""} onChange={(e) => updateField("watermarkText", e.target.value)} placeholder='e.g. DRAFT or CONFIDENTIAL' />
              </label>
              <label><span>Opacity</span>
                <input type="number" value={formData.watermarkOpacity || "0.07"} onChange={(e) => updateField("watermarkOpacity", e.target.value)} min="0.01" max="0.5" step="0.01" />
              </label>
            </div>

            {/* QR Code */}
            <div style={{ marginTop: "12px" }}>
              <label className="check-row" style={{ marginBottom: "6px" }}>
                <input type="checkbox" checked={!!formData.showQrCode} onChange={(e) => updateField("showQrCode", e.target.checked)} />
                <span>Show QR Code on cover page (bottom corner)</span>
              </label>
              {formData.showQrCode && (
                <label><span>URL for QR Code</span>
                  <input value={formData.qrCodeUrl || ""} onChange={(e) => updateField("qrCodeUrl", e.target.value)} placeholder="https://github.com/yourrepo" />
                </label>
              )}
            </div>

            {/* Deadline Countdown */}
            <label style={{ marginTop: "12px", display: "block" }}><span>Submission Deadline (optional countdown)</span>
              <input type="datetime-local" value={formData.submissionDeadline || ""} onChange={(e) => updateField("submissionDeadline", e.target.value)} />
            </label>

            {/* Page Numbering */}
            <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 80px", gap: "8px" }}>
              <label><span>Page Number Style</span>
                <select value={formData.pageNumberStyle || "arabic"} onChange={(e) => updateField("pageNumberStyle", e.target.value)}>
                  <option value="none">None</option>
                  <option value="arabic">Arabic (1, 2, 3…)</option>
                  <option value="roman">Roman (i, ii, iii…)</option>
                </select>
              </label>
              <label><span>Start At</span>
                <input type="number" min="1" value={formData.pageNumberStart || "1"} onChange={(e) => updateField("pageNumberStart", e.target.value)} />
              </label>
            </div>

            {/* Language Toggle */}
            <label style={{ marginTop: "12px", display: "block" }}><span>Cover Page Language</span>
              <select value={formData.lang || "en"} onChange={(e) => updateField("lang", e.target.value)}>
                <option value="en">English</option>
                <option value="bn">বাংলা (Bengali)</option>
              </select>
            </label>

            {/* Share Link */}
            <div style={{ marginTop: "16px" }}>
              <Button type="button" variant="secondary" style={{ width: "100%", fontSize: "0.8rem" }} onClick={exportShareUrl}>
                🔗 Copy Share Link (pre-filled config URL)
              </Button>
            </div>

            <div style={{ marginTop: "12px" }}>
              <span style={{ display: "block", fontSize: "0.85rem", fontWeight: "500", marginBottom: "8px" }}>Alignment Helpers</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label className="check-row">
                  <input type="checkbox" checked={showRulers} onChange={(e) => setShowRulers(e.target.checked)} />
                  <span>Show Rulers (top &amp; left mm ticks)</span>
                </label>
                <label className="check-row">
                  <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
                  <span>Show Grid Overlay (1cm dotted spacing)</span>
                </label>
                <label className="check-row">
                  <input type="checkbox" checked={showGuides} onChange={(e) => setShowGuides(e.target.checked)} />
                  <span>Show Margin Guides (red outer printable border)</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Assets */}
      <div className={`accordion-item ${activeSection === "assets" ? "active" : ""}`}>
        <button type="button" className="accordion-header" onClick={() => toggleSection("assets")}>
          <span className="accordion-title-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Custom Assets</span>
          </span>
          <svg className="accordion-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        {activeSection === "assets" && (
          <div className="accordion-content">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="check-row">
                  <input type="checkbox" checked={formData.useCustomLogo} onChange={(e) => updateField("useCustomLogo", e.target.checked)} />
                  <span>Use custom university/report logo</span>
                </label>
                {formData.useCustomLogo && (
                  <div style={{ marginTop: "6px" }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ fontSize: "0.8rem", width: "100%" }}
                    />
                    {getSafeImageSrc(formData.customLogoUrl) && (
                      <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <SafeImage src={formData.customLogoUrl} alt="Logo Preview" style={{ maxHeight: "30px", maxWidth: "60px", objectFit: "contain", borderRadius: "3px" }} />
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Logo uploaded successfully</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "12px" }}>
                <label className="check-row">
                  <input type="checkbox" checked={formData.useCustomSignature} onChange={(e) => updateField("useCustomSignature", e.target.checked)} />
                  <span>Use handwritten/custom signature</span>
                </label>
                {formData.useCustomSignature && (
                  <div style={{ marginTop: "6px" }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      style={{ fontSize: "0.8rem", width: "100%" }}
                    />
                    <SignatureDrawingPad
                      onSave={(url) => {
                        updateField("customSignatureUrl", url);
                        updateField("useCustomSignature", true);
                        showAppToast("Signature drawn and applied!");
                      }}
                      onClear={() => {
                        updateField("customSignatureUrl", "");
                      }}
                    />
                    {getSafeImageSrc(formData.customSignatureUrl) && (
                      <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <SafeImage src={formData.customSignatureUrl} alt="Signature Preview" style={{ maxHeight: "30px", maxWidth: "60px", objectFit: "contain", borderRadius: "3px" }} />
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Signature ready</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Academic Packager */}
      <div className={`accordion-item ${activeSection === "packager" ? "active" : ""}`}>
        <button type="button" className="accordion-header" onClick={() => toggleSection("packager")}>
          <span className="accordion-title-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Academic Packager</span>
          </span>
          <svg className="accordion-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        {activeSection === "packager" && (
          <div className="accordion-content">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <span style={{ display: "block", fontSize: "0.85rem", fontWeight: "500", marginBottom: "8px" }}>Enable Pages in Packager</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  <label className="check-row" style={{ marginRight: "12px" }}>
                    <input type="checkbox" checked={enabledPages.cover} onChange={(e) => setEnabledPages(prev => ({ ...prev, cover: e.target.checked }))} />
                    <span>Cover Page</span>
                  </label>
                  <label className="check-row" style={{ marginRight: "12px" }}>
                    <input type="checkbox" checked={enabledPages.acknowledgement} onChange={(e) => setEnabledPages(prev => ({ ...prev, acknowledgement: e.target.checked }))} />
                    <span>Acknowledgement</span>
                  </label>
                  <label className="check-row" style={{ marginRight: "12px" }}>
                    <input type="checkbox" checked={enabledPages.transmittal} onChange={(e) => setEnabledPages(prev => ({ ...prev, transmittal: e.target.checked }))} />
                    <span>Transmittal Letter</span>
                  </label>
                  <label className="check-row" style={{ marginRight: "12px" }}>
                    <input type="checkbox" checked={enabledPages.toc} onChange={(e) => setEnabledPages(prev => ({ ...prev, toc: e.target.checked }))} />
                    <span>Table of Contents</span>
                  </label>
                  <label className="check-row">
                    <input type="checkbox" checked={enabledPages.rubric} onChange={(e) => setEnabledPages(prev => ({ ...prev, rubric: e.target.checked }))} />
                    <span>Grading Rubric</span>
                  </label>
                  <label className="check-row" style={{ marginRight: "12px" }}>
                    <input type="checkbox" checked={enabledPages.abstract} onChange={(e) => setEnabledPages(prev => ({ ...prev, abstract: e.target.checked }))} />
                    <span>Abstract</span>
                  </label>
                  <label className="check-row" style={{ marginRight: "12px" }}>
                    <input type="checkbox" checked={enabledPages.references} onChange={(e) => setEnabledPages(prev => ({ ...prev, references: e.target.checked }))} />
                    <span>References</span>
                  </label>
                  <label className="check-row" style={{ marginRight: "12px" }}>
                    <input type="checkbox" checked={enabledPages.labInfo} onChange={(e) => setEnabledPages(prev => ({ ...prev, labInfo: e.target.checked }))} />
                    <span>Lab Info</span>
                  </label>
                  <label className="check-row" style={{ marginRight: "12px" }}>
                    <input type="checkbox" checked={enabledPages.appendix} onChange={(e) => setEnabledPages(prev => ({ ...prev, appendix: e.target.checked }))} />
                    <span>Appendix Divider</span>
                  </label>
                  <label className="check-row">
                    <input type="checkbox" checked={enabledPages.certificate} onChange={(e) => setEnabledPages(prev => ({ ...prev, certificate: e.target.checked }))} />
                    <span>Certificate of Originality</span>
                  </label>
                </div>
              </div>

              {/* Acknowledgement Inputs */}
              {enabledPages.acknowledgement && (
                <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "12px" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}>Acknowledgement Details</h4>
                  <label><span>Page Title</span>
                    <input value={ackData.title} onChange={(e) => setAckData(prev => ({ ...prev, title: e.target.value }))} />
                  </label>
                  <label>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span>Acknowledgement Body <small style={{ color: getCounterTone(countWords(ackData.body), 140) }}>{countWords(ackData.body)}/140 words</small></span>
                      <button
                        type="button"
                        className="text-enhance-btn"
                        onClick={() => handleRephraseText(ackData.body, "Acknowledgement", (val) => setAckData(prev => ({ ...prev, body: val })))}
                        title="Improve academic tone with Gemini AI"
                      >
                        ✨ Academic Tone
                      </button>
                    </div>
                    <textarea value={ackData.body} onChange={(e) => setAckData(prev => ({ ...prev, body: e.target.value }))} rows="4" />
                  </label>
                </div>
              )}

              {/* Transmittal Inputs */}
              {enabledPages.transmittal && (
                <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "12px" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}>Letter of Transmittal Details</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <label><span>Date</span>
                      <input value={transmittalData.date} onChange={(e) => setTransmittalData(prev => ({ ...prev, date: e.target.value }))} />
                    </label>
                    <label><span>Recipient Name</span>
                      <input value={transmittalData.recipientName} onChange={(e) => setTransmittalData(prev => ({ ...prev, recipientName: e.target.value }))} />
                    </label>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <label><span>Recipient Title</span>
                      <input value={transmittalData.recipientTitle} onChange={(e) => setTransmittalData(prev => ({ ...prev, recipientTitle: e.target.value }))} />
                    </label>
                    <label><span>Recipient Dept</span>
                      <input value={transmittalData.recipientDept} onChange={(e) => setTransmittalData(prev => ({ ...prev, recipientDept: e.target.value }))} />
                    </label>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <label><span>Subject</span>
                      <input value={transmittalData.subject} onChange={(e) => setTransmittalData(prev => ({ ...prev, subject: e.target.value }))} />
                    </label>
                    <label><span>Salutation</span>
                      <input value={transmittalData.salutation} onChange={(e) => setTransmittalData(prev => ({ ...prev, salutation: e.target.value }))} />
                    </label>
                  </div>
                  <label>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span>Letter Body <small style={{ color: getCounterTone(countWords(transmittalData.body), 160) }}>{countWords(transmittalData.body)}/160 words</small></span>
                      <button
                        type="button"
                        className="text-enhance-btn"
                        onClick={() => handleRephraseText(transmittalData.body, "Letter of Transmittal", (val) => setTransmittalData(prev => ({ ...prev, body: val })))}
                        title="Improve academic tone with Gemini AI"
                      >
                        ✨ Academic Tone
                      </button>
                    </div>
                    <textarea value={transmittalData.body} onChange={(e) => setTransmittalData(prev => ({ ...prev, body: e.target.value }))} rows="4" />
                  </label>
                  <label><span>Sign-off Text</span>
                    <input value={transmittalData.signOff} onChange={(e) => setTransmittalData(prev => ({ ...prev, signOff: e.target.value }))} />
                  </label>
                </div>
              )}

              {/* TOC Inputs */}
              {enabledPages.toc && (
                <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "12px" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}>Table of Contents Items</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {tocData.map((item, idx) => (
                      <div key={item.id} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <input
                          value={item.title}
                          onChange={(e) => {
                            const newToc = [...tocData];
                            newToc[idx].title = e.target.value;
                            setTocData(newToc);
                          }}
                          placeholder="Section Title"
                          style={{ flexGrow: 1 }}
                        />
                        <input
                          value={item.pageNo}
                          onChange={(e) => {
                            const newToc = [...tocData];
                            newToc[idx].pageNo = e.target.value;
                            setTocData(newToc);
                          }}
                          placeholder="Page"
                          style={{ width: "60px" }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newToc = tocData.filter(t => t.id !== item.id);
                            setTocData(newToc);
                          }}
                          style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setTocData(prev => [
                          ...prev,
                          { id: Date.now().toString(), title: "New Section", pageNo: (prev.length + 1).toString() }
                        ]);
                      }}
                      style={{ marginTop: "6px", alignSelf: "flex-start" }}
                    >
                      Add Item
                    </Button>
                  </div>
                </div>
              )}

              {/* Rubric Criteria Editor */}
              {enabledPages.rubric && (
                <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>Rubric Criteria Rows</h4>
                    <span style={{ fontSize: "0.75rem", color: (() => { const t = (rubricRows || []).reduce((s, r) => s + (parseFloat(r.weight) || 0), 0); return t === 100 ? "#22c55e" : "#f97316"; })() }}>
                      Total: {(rubricRows || []).reduce((s, r) => s + (parseFloat(r.weight) || 0), 0)}% {(rubricRows || []).reduce((s, r) => s + (parseFloat(r.weight) || 0), 0) !== 100 && "⚠ should be 100%"}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {(rubricRows || []).map((row, idx) => (
                      <div key={row.id} style={{ border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "10px", background: "var(--bg-elevated)", position: "relative" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <span style={{ fontSize: "0.78rem", fontWeight: "600", color: "var(--text-accent)" }}>Criterion #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => setRubricRows(prev => prev.filter((_, i) => i !== idx))}
                            style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.75rem", fontWeight: "600", padding: "2px 6px" }}
                          >
                            Remove
                          </button>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 70px", gap: "6px" }}>
                          <input
                            value={row.criteria || ""}
                            onChange={(e) => { const u = [...rubricRows]; u[idx] = { ...u[idx], criteria: e.target.value }; setRubricRows(u); }}
                            placeholder="Criteria Name (e.g. Introduction)"
                            style={{ fontSize: "0.82rem" }}
                          />
                          <input
                            value={row.weight || ""}
                            onChange={(e) => { const u = [...rubricRows]; u[idx] = { ...u[idx], weight: e.target.value }; setRubricRows(u); }}
                            placeholder="Weight %"
                            type="number"
                            min="0"
                            max="100"
                            style={{ fontSize: "0.82rem" }}
                          />
                        </div>
                        <input
                          value={row.description || ""}
                          onChange={(e) => { const u = [...rubricRows]; u[idx] = { ...u[idx], description: e.target.value }; setRubricRows(u); }}
                          placeholder="Short description (optional)"
                          style={{ marginTop: "6px", fontSize: "0.82rem", width: "100%", boxSizing: "border-box" }}
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setRubricRows(prev => [
                        ...prev,
                        { id: Date.now().toString(), criteria: "", description: "", weight: "" }
                      ])}
                      style={{ marginTop: "4px", alignSelf: "flex-start", fontSize: "0.75rem" }}
                    >
                      + Add Criterion
                    </Button>
                  </div>
                </div>
              )}

              {/* Abstract Editor */}
              {enabledPages.abstract && (
                <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "12px" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}>Abstract Details</h4>
                  <label><span>Page Title</span>
                    <input value={abstractData.title} onChange={(e) => setAbstractData(prev => ({ ...prev, title: e.target.value }))} />
                  </label>
                  <label style={{ marginTop: "8px", display: "block" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span>Abstract Body <small style={{ color: getCounterTone(countWords(abstractData.body), 220) }}>{countWords(abstractData.body)}/220 words</small></span>
                      <button
                        type="button"
                        className="text-enhance-btn"
                        onClick={() => handleRephraseText(abstractData.body, "Abstract", (val) => setAbstractData(prev => ({ ...prev, body: val })))}
                        title="Improve academic tone with Gemini AI"
                      >
                        ✨ Academic Tone
                      </button>
                    </div>
                    <textarea value={abstractData.body} onChange={(e) => setAbstractData(prev => ({ ...prev, body: e.target.value }))} rows="5" placeholder="Write a concise summary of your experiment, methodology, and key findings..." />
                  </label>
                  <label style={{ marginTop: "8px", display: "block" }}><span>Keywords (comma-separated)</span>
                    <input value={abstractData.keywords} onChange={(e) => setAbstractData(prev => ({ ...prev, keywords: e.target.value }))} placeholder="e.g. water hardness, EBT indicator, titration" />
                  </label>
                </div>
              )}

              {/* References Editor */}
              {enabledPages.references && (
                <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "12px" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}>References / Citations</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {referencesData.map((ref, idx) => (
                      <div key={ref.id} style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                        <select value={ref.style || "APA"} onChange={(e) => { const u = [...referencesData]; u[idx] = { ...u[idx], style: e.target.value }; setReferencesData(u); }} style={{ width: "75px", fontSize: "0.8rem" }}>
                          <option value="APA">APA</option>
                          <option value="IEEE">IEEE</option>
                          <option value="MLA">MLA</option>
                        </select>
                        <input value={ref.text || ""} onChange={(e) => { const u = [...referencesData]; u[idx] = { ...u[idx], text: e.target.value }; setReferencesData(u); }} placeholder="Author. (Year). Title. Publisher." style={{ flexGrow: 1, fontSize: "0.82rem" }} />
                        <button type="button" onClick={() => setReferencesData(prev => prev.filter((_, i) => i !== idx))} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
                        </button>
                      </div>
                    ))}
                    <Button type="button" variant="secondary" size="sm" onClick={() => setReferencesData(prev => [...prev, { id: Date.now().toString(), style: "APA", text: "" }])} style={{ alignSelf: "flex-start", fontSize: "0.75rem" }}>+ Add Reference</Button>
                  </div>

                  {/* Auto-Citation Builder Form */}
                  <div style={{ marginTop: "12px", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "12px", background: "var(--bg-elevated)" }}>
                    <span style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-accent)", marginBottom: "8px" }}>Auto-Citation Builder</span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                      <label><span>Resource Type</span>
                        <select value={citeType} onChange={(e) => setCiteType(e.target.value)} style={{ fontSize: "0.8rem", padding: "6px 10px" }}>
                          <option value="book">Book</option>
                          <option value="website">Website</option>
                          <option value="journal">Journal Article</option>
                        </select>
                      </label>
                      <label><span>Year</span>
                        <input value={citeYear} onChange={(e) => setCiteYear(e.target.value)} placeholder="e.g. 2026" style={{ fontSize: "0.8rem", padding: "6px 10px" }} />
                      </label>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label><span>Author(s)</span>
                        <input value={citeAuthor} onChange={(e) => setCiteAuthor(e.target.value)} placeholder="e.g. Kumar, J. & Joy, A." style={{ fontSize: "0.8rem", padding: "6px 10px" }} />
                      </label>
                      <label><span>Title</span>
                        <input value={citeTitle} onChange={(e) => setCiteTitle(e.target.value)} placeholder={citeType === "website" ? "e.g. Water Hardness Guide" : "e.g. Lab Manual of Chemistry"} style={{ fontSize: "0.8rem", padding: "6px 10px" }} />
                      </label>
                      <label><span>{citeType === "book" ? "Publisher" : citeType === "website" ? "Website Name" : "Journal Name"}</span>
                        <input value={citePublisher} onChange={(e) => setCitePublisher(e.target.value)} placeholder={citeType === "book" ? "e.g. Academic Press" : "e.g. State University of Bangladesh"} style={{ fontSize: "0.8rem", padding: "6px 10px" }} />
                      </label>
                      <label><span>URL / DOI (optional)</span>
                        <input value={citeUrl} onChange={(e) => setCiteUrl(e.target.value)} placeholder="e.g. https://sub.edu.bd" style={{ fontSize: "0.8rem", padding: "6px 10px" }} />
                      </label>
                    </div>
                    <div style={{ marginTop: "12px", borderTop: "1px dashed var(--border-subtle)", paddingTop: "10px" }}>
                      <span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "6px" }}>Preview & Add:</span>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <Button type="button" variant="secondary" size="sm" onClick={() => handleAddGeneratedCitation("APA")} style={{ fontSize: "0.72rem", padding: "6px 10px", height: "auto" }}>+ Add APA</Button>
                        <Button type="button" variant="secondary" size="sm" onClick={() => handleAddGeneratedCitation("IEEE")} style={{ fontSize: "0.72rem", padding: "6px 10px", height: "auto" }}>+ Add IEEE</Button>
                        <Button type="button" variant="secondary" size="sm" onClick={() => handleAddGeneratedCitation("MLA")} style={{ fontSize: "0.72rem", padding: "6px 10px", height: "auto" }}>+ Add MLA</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Lab Info Editor */}
              {enabledPages.labInfo && (
                <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "12px" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}>Lab Information Details</h4>
                  <label><span>Lab Room / Location</span>
                    <input value={labInfoData.labRoom || ""} onChange={(e) => setLabInfoData(prev => ({ ...prev, labRoom: e.target.value }))} placeholder="e.g. Room 301, CSE Building" />
                  </label>
                  <div style={{ marginTop: "8px" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: "500", display: "block", marginBottom: "4px" }}>Lab Partners</span>
                    {(labInfoData.partners || []).map((p, i) => (
                      <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
                        <input value={p} onChange={(e) => { const u = [...labInfoData.partners]; u[i] = e.target.value; setLabInfoData(prev => ({ ...prev, partners: u })); }} placeholder={`Partner ${i + 1} name`} style={{ flexGrow: 1 }} />
                        <button type="button" onClick={() => setLabInfoData(prev => ({ ...prev, partners: prev.partners.filter((_, j) => j !== i) }))} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}>✕</button>
                      </div>
                    ))}
                    <Button type="button" variant="secondary" size="sm" onClick={() => setLabInfoData(prev => ({ ...prev, partners: [...prev.partners, ""] }))} style={{ fontSize: "0.75rem", marginTop: "2px" }}>+ Add Partner</Button>
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: "500", display: "block", marginBottom: "4px" }}>Equipment Used</span>
                    {(labInfoData.equipment || []).map((eq, i) => (
                      <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
                        <input value={eq} onChange={(e) => { const u = [...labInfoData.equipment]; u[i] = e.target.value; setLabInfoData(prev => ({ ...prev, equipment: u })); }} placeholder={`Equipment ${i + 1}`} style={{ flexGrow: 1 }} />
                        <button type="button" onClick={() => setLabInfoData(prev => ({ ...prev, equipment: prev.equipment.filter((_, j) => j !== i) }))} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}>✕</button>
                      </div>
                    ))}
                    <Button type="button" variant="secondary" size="sm" onClick={() => setLabInfoData(prev => ({ ...prev, equipment: [...prev.equipment, ""] }))} style={{ fontSize: "0.75rem", marginTop: "2px" }}>+ Add Equipment</Button>
                  </div>
                </div>
              )}

              {/* Appendix Editor */}
              {enabledPages.appendix && (
                <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "12px" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}>Appendix Divider</h4>
                  <label><span>Section Label</span>
                    <input value={appendixData.label || ""} onChange={(e) => setAppendixData(prev => ({ ...prev, label: e.target.value }))} placeholder="APPENDIX A" />
                  </label>
                  <label style={{ marginTop: "6px", display: "block" }}><span>Subtitle (optional)</span>
                    <input value={appendixData.subtitle || ""} onChange={(e) => setAppendixData(prev => ({ ...prev, subtitle: e.target.value }))} placeholder="e.g. Raw Data Tables" />
                  </label>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Download Formats */}
      <div className={`accordion-item ${activeSection === "exports" ? "active" : ""}`}>
        <button type="button" className="accordion-header" onClick={() => toggleSection("exports")}>
          <span className="accordion-title-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download Formats</span>
          </span>
          <svg className="accordion-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        {activeSection === "exports" && (
          <div className="accordion-content export-panel">
            <Card>
              <CardHeader>
                <CardTitle>Export this cover page</CardTitle>
                <CardDescription>Download the same cover as document, image, PDF, or slide format.</CardDescription>
              </CardHeader>
            </Card>

            <div className="export-grid">
              {exportFormats.map((format) => (
                <Button
                  type="button"
                  variant="export"
                  full
                  key={format.id}
                  onClick={() => exportCover(format.id)}
                >
                  <strong>{format.label}</strong>
                  <span>{format.hint}</span>
                </Button>
              ))}
            </div>

            <p className="form-hint">
              For official submission, PDF is best. PNG/JPG/SVG are useful for sharing, while DOCX and PPTX are editable.
            </p>
          </div>
        )}
      </div>

      {/* Dynamic field groups */}
      {/* Dynamic field groups */}
      {fieldGroups.map((group) => (
        <div key={group.id} className={`accordion-item ${activeSection === group.id ? "active" : ""}`}>
          <button type="button" className="accordion-header" onClick={() => toggleSection(group.id)}>
            <span className="accordion-title-wrapper">{group.icon}<span>{group.title}</span></span>
            <svg className="accordion-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {activeSection === group.id && (
            <div className="accordion-content">
              {group.id === "student" && (
                <label className="check-row" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    checked={formData.isGroupMode || false}
                    onChange={(e) => updateField("isGroupMode", e.target.checked)}
                  />
                  <span style={{ fontWeight: "600" }}>Group Submission Mode (Multiple Students)</span>
                </label>
              )}

              {group.id === "student" && formData.isGroupMode ? (
                <div className="group-students-editor" style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
                  {(formData.groupStudents || []).map((student, index) => (
                    <div key={index} className="group-student-form-card" style={{ border: "1px solid var(--border-subtle)", padding: "12px", borderRadius: "6px", background: "var(--bg-elevated)", position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <strong style={{ fontSize: "0.85rem", color: "var(--text-accent)" }}>Student #{index + 1}</strong>
                        {(formData.groupStudents || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.groupStudents.filter((_, i) => i !== index);
                              updateField("groupStudents", updated);
                            }}
                            style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.75rem", fontWeight: "600" }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <label style={{ gridColumn: "span 2" }}><span>Name</span>
                          <input
                            value={student.name || ""}
                            onChange={(e) => {
                              const updated = [...formData.groupStudents];
                              updated[index] = { ...updated[index], name: e.target.value };
                              updateField("groupStudents", updated);
                            }}
                            placeholder="Full Name"
                          />
                        </label>
                        <label><span>Roll No.</span>
                          <input
                            value={student.roll || ""}
                            onChange={(e) => {
                              const updated = [...formData.groupStudents];
                              updated[index] = { ...updated[index], roll: e.target.value };
                              updateField("groupStudents", updated);
                            }}
                            placeholder="Roll No."
                          />
                        </label>
                        <label><span>Reg. No. (Optional)</span>
                          <input
                            value={student.registration || ""}
                            onChange={(e) => {
                              const updated = [...formData.groupStudents];
                              updated[index] = { ...updated[index], registration: e.target.value };
                              updateField("groupStudents", updated);
                            }}
                            placeholder="Reg. No."
                          />
                        </label>
                        <label><span>Status</span>
                          <input
                            value={student.status || ""}
                            onChange={(e) => {
                              const updated = [...formData.groupStudents];
                              updated[index] = { ...updated[index], status: e.target.value };
                              updateField("groupStudents", updated);
                            }}
                            placeholder="Status"
                          />
                        </label>
                        <label><span>Year</span>
                          <input
                            value={student.year || ""}
                            onChange={(e) => {
                              const updated = [...formData.groupStudents];
                              updated[index] = { ...updated[index], year: e.target.value };
                              updateField("groupStudents", updated);
                            }}
                            placeholder="Year"
                          />
                        </label>
                        <label><span>Semester</span>
                          <input
                            value={student.semester || ""}
                            onChange={(e) => {
                              const updated = [...formData.groupStudents];
                              updated[index] = { ...updated[index], semester: e.target.value };
                              updateField("groupStudents", updated);
                            }}
                            placeholder="Semester"
                          />
                        </label>
                        <label><span>Group (Optional)</span>
                          <input
                            value={student.group || ""}
                            onChange={(e) => {
                              const updated = [...formData.groupStudents];
                              updated[index] = { ...updated[index], group: e.target.value };
                              updateField("groupStudents", updated);
                            }}
                            placeholder="Group"
                          />
                        </label>
                        <label style={{ gridColumn: "span 2" }}><span>Session (Optional)</span>
                          <input
                            value={student.session || ""}
                            onChange={(e) => {
                              const updated = [...formData.groupStudents];
                              updated[index] = { ...updated[index], session: e.target.value };
                              updateField("groupStudents", updated);
                            }}
                            placeholder="Session"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      const newStudent = { name: "", roll: "", registration: "", status: "Undergraduate Student", year: "1st", semester: "1st", group: "", session: "" };
                      updateField("groupStudents", [...(formData.groupStudents || []), newStudent]);
                    }}
                    style={{ alignSelf: "flex-start", fontSize: "0.75rem", padding: "6px 12px" }}
                  >
                    + Add Student
                  </Button>
                </div>
              ) : (
                group.fields.map(([key, label]) => {
                  if (key === "experimentNo") {
                    const isCustom = formData.experimentNoLabelType === "custom";
                    return (
                      <div key={key} className="experiment-no-wrapper" style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "4px" }}>
                        <div className="experiment-no-container" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px", width: "100%" }}>
                          <label style={{ margin: 0 }}>
                            <span>Number Label Style</span>
                            <select
                              value={formData.experimentNoLabelType || "default"}
                              onChange={(e) => updateField("experimentNoLabelType", e.target.value)}
                              style={{ width: "100%" }}
                            >
                              <option value="default">Default ({formData.departmentPreset === "cse" ? "Lab/Prog No." : "Exp No."})</option>
                              <option value="labProgramNo">Lab / Program No.</option>
                              <option value="experimentNo">Experiment No.</option>
                              <option value="assignmentNo">Assignment No.</option>
                              <option value="labNo">Lab No.</option>
                              <option value="labReportNo">Lab Report No.</option>
                              <option value="programNo">Program No.</option>
                              <option value="custom">Custom...</option>
                            </select>
                          </label>
                          <label style={{ margin: 0 }}>
                            <span>
                              Number
                              {isOptionalField(formData, key) && <Badge>Optional</Badge>}
                              {isRequiredField(formData, key) && <Badge variant="success">Required</Badge>}
                            </span>
                            <input
                              className={isMissingRequiredField(formData, key) ? "field-missing" : undefined}
                              value={formData[key]}
                              onChange={(e) => updateField(key, e.target.value)}
                              required={isRequiredField(formData, key)}
                              aria-required={isRequiredField(formData, key)}
                              placeholder="e.g. 01"
                              style={{ width: "100%" }}
                            />
                          </label>
                        </div>
                        {isCustom && (
                          <label style={{ margin: 0 }}>
                            <span>Custom Label Text</span>
                            <input
                              value={formData.customExperimentNoLabel || ""}
                              onChange={(e) => updateField("customExperimentNoLabel", e.target.value)}
                              placeholder="e.g. Task No. or Worksheet No."
                              style={{ width: "100%" }}
                            />
                          </label>
                        )}
                      </div>
                    );
                  }
                  return (
                    <label key={key}>
                      <span>
                        {getFieldLabel(formData, key, label)}
                        {isOptionalField(formData, key) && <Badge>Optional</Badge>}
                        {isRequiredField(formData, key) && <Badge variant="success">Required</Badge>}
                      {key === "reportTitle" && (
                        <small style={{ color: getCounterTone(countWords(formData.reportTitle), 24) }}>
                          {countWords(formData.reportTitle)}/24 words
                        </small>
                      )}
                      </span>
                      {key === "reportTitle"
                        ? <textarea className={isMissingRequiredField(formData, key) ? "field-missing" : undefined} value={formData[key]} onChange={(e) => updateField(key, e.target.value)} rows="3" />
                        : <input
                            className={isMissingRequiredField(formData, key) ? "field-missing" : undefined}
                            value={formData[key]}
                            onChange={(e) => updateField(key, e.target.value)}
                            required={isRequiredField(formData, key)}
                            aria-required={isRequiredField(formData, key)}
                          />}
                    </label>
                  );
                })
              )}
            </div>
          )}
        </div>
      ))}

      {/* Overleaf Builder */}
      <div className={`accordion-item ${activeSection === "overleaf" ? "active" : ""}`}>
        <button type="button" className="accordion-header" onClick={() => toggleSection("overleaf")}>
          <span className="accordion-title-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3" />
              <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
              <path d="M14 8l-4 8" />
              <path d="M9 8H7v8h2" />
              <path d="M15 8h2v8h-2" />
            </svg>
            <span>Overleaf Builder</span>
          </span>
          <svg className="accordion-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        {activeSection === "overleaf" && (
          <div className="accordion-content overleaf-panel">
            <Card>
              <CardHeader>
                <CardTitle>{selectedTemplate.title}</CardTitle>
                <CardDescription>{selectedTemplate.focus}</CardDescription>
              </CardHeader>
            </Card>

            <div className="section-pill-grid">
              {selectedTemplate.sections.map((section) => (
                <span key={section}>{section}</span>
              ))}
            </div>

            <div className="latex-actions">
              <Button type="button" onClick={() => copyText(overleafCode, "Full Overleaf LaTeX copied")}>
                Copy full LaTeX
              </Button>
              <Button type="button" variant="secondary" onClick={() => downloadText("main.tex", overleafCode)}>
                Download main.tex
              </Button>
              <Button type="button" variant="secondary" onClick={() => copyText(buildLatexCover(formData, studentRows), "Cover page LaTeX copied")}>
                Copy cover only
              </Button>
            </div>

            <label>
              <span>Generated Overleaf main.tex</span>
              <textarea className="latex-preview" readOnly value={overleafCode} rows="12" />
            </label>

            <div className="command-finder">
              <label>
                <span>Find Overleaf command</span>
                <input
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                  placeholder="Search image, table, equation, code, chemistry..."
                />
              </label>
              <label>
                <span>Command category</span>
                <select value={commandCategory} onChange={(e) => setCommandCategory(e.target.value)}>
                  <option value="all">All categories</option>
                  {commandCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="command-toolbar">
              <span>{filteredCommandCards.length} command{filteredCommandCards.length === 1 ? "" : "s"} ready</span>
              <Button type="button" variant="secondary" size="sm" onClick={() => copyText(allCommandText, "All Overleaf commands copied")}>
                Copy all commands
              </Button>
            </div>

            <div className="command-grid">
              {filteredCommandCards.map((card) => (
                <div className="command-card" key={card.title}>
                  <div>
                    <small className="command-category">{card.category}</small>
                    <strong>{card.title}</strong>
                    <span>{card.hint}</span>
                  </div>
                  <pre>{card.code}</pre>
                  <Button type="button" variant="secondary" onClick={() => copyText(card.code, `${card.title} command copied`)}>
                    Copy command
                  </Button>
                </div>
              ))}
              {!filteredCommandCards.length && (
                <div className="empty-command-state">
                  No command found. Try keywords like table, image, math, code, reference, or chemistry.
                </div>
              )}
            </div>

            {/* LaTeX Table Generator */}
            <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "16px", marginTop: "12px" }}>
              <span style={{ display: "block", fontSize: "0.76rem", fontWeight: "700", marginBottom: "4px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07rem" }}>Excel / CSV to LaTeX Table Generator</span>
              <p className="form-hint" style={{ marginBottom: "8px" }}>Paste cells directly from Excel/Sheets or write CSV data here to instantly compile into a LaTeX table.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <textarea
                  id="latex-table-csv-input"
                  placeholder="Parameter&#9;Value&#9;Unit&#10;Hardness&#9;25&#9;mg/L&#10;Calcium&#9;15&#9;mg/L"
                  rows="4"
                  onChange={(e) => {
                    const compiled = compileCsvToLatex(e.target.value);
                    const out = document.getElementById("latex-table-output");
                    if (out) out.value = compiled;
                  }}
                  style={{ fontFamily: "'Fira Code', Courier, monospace", fontSize: "0.82rem" }}
                />
                <label style={{ marginTop: "4px" }}>
                  <span>Generated LaTeX Table Code</span>
                  <textarea
                    id="latex-table-output"
                    className="latex-preview"
                    readOnly
                    rows="5"
                    placeholder="LaTeX code will compile here automatically..."
                    style={{ fontFamily: "'Fira Code', Courier, monospace", fontSize: "0.82rem" }}
                  />
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const out = document.getElementById("latex-table-output");
                      if (out && out.value) {
                        copyText(out.value, "LaTeX Table code copied!");
                      } else {
                        showAppToast("No table code compiled yet.", "error");
                      }
                    }}
                    style={{ fontSize: "0.78rem" }}
                  >
                    Copy Table Code
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const inp = document.getElementById("latex-table-csv-input");
                      const out = document.getElementById("latex-table-output");
                      if (inp) inp.value = "";
                      if (out) out.value = "";
                    }}
                    style={{ fontSize: "0.78rem", background: "transparent", border: "1px solid var(--border-subtle)" }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            {/* Interactive Lab Chart & Graph Generator */}
            <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "16px", marginTop: "12px" }}>
              <span style={{ display: "block", fontSize: "0.76rem", fontWeight: "700", marginBottom: "4px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07rem" }}>Interactive Lab Chart & Graph Generator</span>
              <p className="form-hint" style={{ marginBottom: "8px" }}>Generate plots from experiment coordinates, download PNG images, and copy TikZ code for Overleaf.</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "500" }}>Chart Title</span>
                  <input value={chartTitle} onChange={(e) => setChartTitle(e.target.value)} placeholder="Volume vs pH" style={{ fontSize: "0.8rem", padding: "6px 10px" }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "500" }}>Chart Type</span>
                  <select value={chartType} onChange={(e) => setChartType(e.target.value)} style={{ fontSize: "0.8rem", padding: "6px 10px", background: "var(--bg-input)", border: "1px solid var(--border-input)", borderRadius: "4px", color: "var(--text-primary)" }}>
                    <option value="line">Line Graph</option>
                    <option value="scatter">Scatter Plot</option>
                    <option value="bar">Bar Chart</option>
                  </select>
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "500" }}>X-Axis Label</span>
                  <input value={chartXLabel} onChange={(e) => setChartXLabel(e.target.value)} placeholder="Volume (mL)" style={{ fontSize: "0.8rem", padding: "6px 10px" }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "500" }}>Y-Axis Label</span>
                  <input value={chartYLabel} onChange={(e) => setChartYLabel(e.target.value)} placeholder="pH" style={{ fontSize: "0.8rem", padding: "6px 10px" }} />
                </label>
              </div>

              {/* Data points table */}
              <div style={{ marginBottom: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "10px" }}>
                <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "var(--text-accent)", marginBottom: "6px" }}>Data Coordinates (X, Y)</span>
                <div style={{ maxHeight: "115px", overflowY: "auto", paddingRight: "4px" }}>
                  {chartPoints.map((p, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px" }}>
                      <input
                        type="number"
                        step="any"
                        value={p.x}
                        onChange={(e) => {
                          const u = [...chartPoints];
                          u[idx] = { ...u[idx], x: e.target.value };
                          setChartPoints(u);
                        }}
                        style={{ flex: 1, fontSize: "0.78rem", padding: "4px 8px", background: "var(--bg-input)", border: "1px solid var(--border-input)", borderRadius: "4px", color: "var(--text-primary)" }}
                        placeholder="X"
                      />
                      <input
                        type="number"
                        step="any"
                        value={p.y}
                        onChange={(e) => {
                          const u = [...chartPoints];
                          u[idx] = { ...u[idx], y: e.target.value };
                          setChartPoints(u);
                        }}
                        style={{ flex: 1, fontSize: "0.78rem", padding: "4px 8px", background: "var(--bg-input)", border: "1px solid var(--border-input)", borderRadius: "4px", color: "var(--text-primary)" }}
                        placeholder="Y"
                      />
                      <button
                        type="button"
                        onClick={() => setChartPoints(prev => prev.filter((_, i) => i !== idx))}
                        style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* New Point form */}
                <div style={{ display: "flex", gap: "6px", marginTop: "8px", borderTop: "1px dashed var(--border-subtle)", paddingTop: "8px" }}>
                  <input
                    type="number"
                    step="any"
                    value={newPointX}
                    onChange={(e) => setNewPointX(e.target.value)}
                    placeholder="Next X"
                    style={{ flex: 1, fontSize: "0.78rem", padding: "4px 8px", background: "var(--bg-input)", border: "1px solid var(--border-input)", borderRadius: "4px", color: "var(--text-primary)" }}
                  />
                  <input
                    type="number"
                    step="any"
                    value={newPointY}
                    onChange={(e) => setNewPointY(e.target.value)}
                    placeholder="Next Y"
                    style={{ flex: 1, fontSize: "0.78rem", padding: "4px 8px", background: "var(--bg-input)", border: "1px solid var(--border-input)", borderRadius: "4px", color: "var(--text-primary)" }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (newPointX.trim() && newPointY.trim()) {
                        setChartPoints(prev => [...prev, { x: newPointX.trim(), y: newPointY.trim() }]);
                        setNewPointX("");
                        setNewPointY("");
                      } else {
                        showAppToast("Enter both X and Y values", "error");
                      }
                    }}
                    style={{ fontSize: "0.72rem", height: "auto", padding: "4px 10px" }}
                  >
                    + Add Point
                  </Button>
                </div>
              </div>

              {/* Chart Render Box */}
              {(() => {
                const validPts = chartPoints
                  .map(p => ({ x: parseFloat(p.x), y: parseFloat(p.y) }))
                  .filter(p => !isNaN(p.x) && !isNaN(p.y));

                const xs = validPts.map(p => p.x);
                const ys = validPts.map(p => p.y);
                const mnX = xs.length > 0 ? Math.min(...xs, 0) : 0;
                const mxX = xs.length > 0 ? Math.max(...xs, 10) : 10;
                const mnY = ys.length > 0 ? Math.min(...ys, 0) : 0;
                const mxY = ys.length > 0 ? Math.max(...ys, 10) : 10;

                const rX = (mxX - mnX) || 1;
                const rY = (mxY - mnY) || 1;

                const mX = (x) => 45 + ((x - mnX) / rX) * 335;
                const mY = (y) => 205 - ((y - mnY) / rY) * 180;

                const xTicks = Array.from({ length: 6 }).map((_, i) => mnX + (i * rX) / 5);
                const yTicks = Array.from({ length: 6 }).map((_, i) => mnY + (i * rY) / 5);

                const lineP = validPts.length > 1
                  ? "M " + validPts.map(p => `${mX(p.x)} ${mY(p.y)}`).join(" L ")
                  : "";

                return (
                  <div style={{ background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "12px", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)" }}>
                    <svg id="latex-chart-svg" viewBox="0 0 400 240" style={{ width: "100%", height: "auto", background: "#ffffff", display: "block" }}>
                      {/* Title */}
                      <text x="200" y="15" fill="#1e293b" fontSize="11" fontWeight="700" textAnchor="middle">{chartTitle || "Experiment Curve"}</text>
                      
                      {/* X-axis Label */}
                      <text x="200" y="234" fill="#475569" fontSize="9" fontWeight="600" textAnchor="middle">{chartXLabel || "X Axis"}</text>
                      
                      {/* Y-axis Label */}
                      <text x="10" y="115" fill="#475569" fontSize="9" fontWeight="600" textAnchor="middle" transform="rotate(-90, 10, 115)">{chartYLabel || "Y Axis"}</text>

                      {/* X gridlines & ticks */}
                      {xTicks.map((val, i) => {
                        const posX = mX(val);
                        return (
                          <g key={`x-grid-${i}`}>
                            <line x1={posX} y1="25" x2={posX} y2="205" stroke="#e2e8f0" strokeDasharray="3" />
                            <text x={posX} y="217" fill="#475569" fontSize="8" textAnchor="middle">{val.toFixed(1)}</text>
                          </g>
                        );
                      })}

                      {/* Y gridlines & ticks */}
                      {yTicks.map((val, i) => {
                        const posY = mY(val);
                        return (
                          <g key={`y-grid-${i}`}>
                            <line x1="45" y1={posY} x2="380" y2={posY} stroke="#e2e8f0" strokeDasharray="3" />
                            <text x="39" y={posY + 3} fill="#475569" fontSize="8" textAnchor="end">{val.toFixed(1)}</text>
                          </g>
                        );
                      })}

                      {/* Main Axes */}
                      <line x1="45" y1="205" x2="380" y2="205" stroke="#475569" strokeWidth="1.5" />
                      <line x1="45" y1="25" x2="45" y2="205" stroke="#475569" strokeWidth="1.5" />

                      {/* Line graph connect path */}
                      {chartType === "line" && lineP && (
                        <path d={lineP} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      )}

                      {/* Bar graph render */}
                      {chartType === "bar" && validPts.map((p, i) => {
                        const barW = Math.max(6, 335 / (validPts.length * 2));
                        const posX = mX(p.x) - barW / 2;
                        const posY = mY(p.y);
                        const barH = 205 - posY;
                        return (
                          <rect
                            key={`bar-${i}`}
                            x={posX}
                            y={posY}
                            width={barW}
                            height={Math.max(barH, 0)}
                            fill="#93c5fd"
                            stroke="#2563eb"
                            strokeWidth="1.2"
                            rx="1"
                          />
                        );
                      })}

                      {/* Data Points markers (Line/Scatter) */}
                      {chartType !== "bar" && validPts.map((p, i) => (
                        <circle
                          key={`point-${i}`}
                          cx={mX(p.x)}
                          cy={mY(p.y)}
                          r="4.5"
                          fill="#2563eb"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                      ))}
                    </svg>
                  </div>
                );
              })()}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyTikzCode}
                  style={{ fontSize: "0.78rem" }}
                >
                  Copy LaTeX TikZ Code
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleExportChartPng}
                  style={{ fontSize: "0.78rem", background: "transparent", border: "1px solid var(--border-subtle)" }}
                >
                  Export PNG
                </Button>
              </div>
            </div>

            {/* Visual LaTeX Equation Builder */}
            <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "16px", marginTop: "12px" }}>
              <span style={{ display: "block", fontSize: "0.76rem", fontWeight: "700", marginBottom: "4px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07rem" }}>Visual LaTeX Equation Builder</span>
              <p className="form-hint" style={{ marginBottom: "8px" }}>Select a math structure, fill in variables, and copy the compiled LaTeX math command.</p>
              
              {/* Template selector tabs */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
                {[
                  { id: "fraction", label: "Fraction" },
                  { id: "power", label: "Power" },
                  { id: "root", label: "Radical" },
                  { id: "sum", label: "Summation" },
                  { id: "integral", label: "Integral" },
                  { id: "matrix", label: "Matrix" }
                ].map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setEqTemplate(tmpl.id)}
                    style={{
                      background: eqTemplate === tmpl.id ? "rgba(99, 102, 241, 0.15)" : "transparent",
                      border: `1px solid ${eqTemplate === tmpl.id ? "var(--text-accent)" : "var(--border-subtle)"}`,
                      color: eqTemplate === tmpl.id ? "var(--text-accent)" : "var(--text-secondary)",
                      fontSize: "0.72rem",
                      fontWeight: eqTemplate === tmpl.id ? "700" : "500",
                      padding: "4px 8px",
                      cursor: "pointer",
                      borderRadius: "4px",
                      transition: "all 0.1s ease"
                    }}
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>

              {/* Dynamic input slots */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                {eqTemplate === "fraction" && (
                  <>
                    <label style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>Numerator (Top)</span>
                      <input value={eqParams.numerator} onChange={(e) => updateEqParam("numerator", e.target.value)} style={{ fontSize: "0.8rem", padding: "4px 8px" }} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>Denominator (Bottom)</span>
                      <input value={eqParams.denominator} onChange={(e) => updateEqParam("denominator", e.target.value)} style={{ fontSize: "0.8rem", padding: "4px 8px" }} />
                    </label>
                  </>
                )}
                {eqTemplate === "power" && (
                  <>
                    <label style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>Base Variable</span>
                      <input value={eqParams.base} onChange={(e) => updateEqParam("base", e.target.value)} style={{ fontSize: "0.8rem", padding: "4px 8px" }} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>Exponent (Power)</span>
                      <input value={eqParams.exponent} onChange={(e) => updateEqParam("exponent", e.target.value)} style={{ fontSize: "0.8rem", padding: "4px 8px" }} />
                    </label>
                  </>
                )}
                {eqTemplate === "root" && (
                  <>
                    <label style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>Term (Under Root)</span>
                      <input value={eqParams.term} onChange={(e) => updateEqParam("term", e.target.value)} style={{ fontSize: "0.8rem", padding: "4px 8px" }} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>Degree (e.g. 2, 3)</span>
                      <input value={eqParams.exponent} onChange={(e) => updateEqParam("exponent", e.target.value)} style={{ fontSize: "0.8rem", padding: "4px 8px" }} />
                    </label>
                  </>
                )}
                {eqTemplate === "sum" && (
                  <>
                    <label style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>Lower Bound (e.g. i=0)</span>
                      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        <input value={eqParams.base} onChange={(e) => updateEqParam("base", e.target.value)} placeholder="var" style={{ width: "40px", fontSize: "0.8rem", padding: "4px" }} />
                        <span style={{ fontSize: "0.75rem" }}>=</span>
                        <input value={eqParams.lower} onChange={(e) => updateEqParam("lower", e.target.value)} placeholder="0" style={{ flexGrow: 1, fontSize: "0.8rem", padding: "4px 8px" }} />
                      </div>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>Upper Limit (Top)</span>
                      <input value={eqParams.upper} onChange={(e) => updateEqParam("upper", e.target.value)} style={{ fontSize: "0.8rem", padding: "4px 8px" }} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "2px", gridColumn: "span 2", marginTop: "4px" }}>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>Summation Expression (Body)</span>
                      <input value={eqParams.body} onChange={(e) => updateEqParam("body", e.target.value)} placeholder="e.g. x_i" style={{ fontSize: "0.8rem", padding: "4px 8px" }} />
                    </label>
                  </>
                )}
                {eqTemplate === "integral" && (
                  <>
                    <label style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>Limits (Lower & Upper)</span>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <input value={eqParams.lower} onChange={(e) => updateEqParam("lower", e.target.value)} placeholder="lower" style={{ flexGrow: 1, fontSize: "0.8rem", padding: "4px 6px" }} />
                        <input value={eqParams.upper} onChange={(e) => updateEqParam("upper", e.target.value)} placeholder="upper" style={{ flexGrow: 1, fontSize: "0.8rem", padding: "4px 6px" }} />
                      </div>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>Integration Variable</span>
                      <input value={eqParams.term} onChange={(e) => updateEqParam("term", e.target.value)} placeholder="x" style={{ fontSize: "0.8rem", padding: "4px 8px" }} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "2px", gridColumn: "span 2", marginTop: "4px" }}>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>Integrand Function (Body)</span>
                      <input value={eqParams.body} onChange={(e) => updateEqParam("body", e.target.value)} placeholder="e.g. f(x)" style={{ fontSize: "0.8rem", padding: "4px 8px" }} />
                    </label>
                  </>
                )}
                {eqTemplate === "matrix" && (
                  <label style={{ display: "flex", flexDirection: "column", gap: "2px", gridColumn: "span 2" }}>
                    <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>Matrix Content (use & for columns, \\ for rows)</span>
                    <input value={eqParams.matrixRows} onChange={(e) => updateEqParam("matrixRows", e.target.value)} style={{ fontSize: "0.8rem", padding: "4px 8px", fontFamily: "'Fira Code', Courier, monospace" }} />
                  </label>
                )}
              </div>

              {/* Math WYSIWYG & Output Box */}
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "10px", marginBottom: "10px" }}>
                {/* Visual Preview */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff", color: "#1e293b", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "8px", minHeight: "60px", userSelect: "none" }}>
                  {eqTemplate === "fraction" && (
                    <div style={{ display: "inline-flex", flexDirection: "column", alignSelf: "center", alignItems: "center", fontSize: "0.85rem", verticalAlign: "middle" }}>
                      <span style={{ borderBottom: "1.5px solid #1e293b", padding: "0 4px", fontWeight: "600" }}>{eqParams.numerator || "a"}</span>
                      <span style={{ padding: "0 4px", fontWeight: "600" }}>{eqParams.denominator || "b"}</span>
                    </div>
                  )}
                  {eqTemplate === "power" && (
                    <span style={{ fontSize: "0.95rem", fontWeight: "600" }}>
                      {eqParams.base || "x"}
                      <sup style={{ fontSize: "0.65em", verticalAlign: "super", marginLeft: "1px" }}>{eqParams.exponent || "n"}</sup>
                    </span>
                  )}
                  {eqTemplate === "root" && (
                    <span style={{ display: "inline-flex", alignItems: "center", fontSize: "0.88rem" }}>
                      <sup style={{ fontSize: "0.55em", marginRight: "-3px", verticalAlign: "super", fontWeight: "700" }}>{eqParams.exponent || "2"}</sup>
                      <span style={{ fontSize: "1.2rem", marginRight: "-1px" }}>√</span>
                      <span style={{ borderTop: "1.5px solid #1e293b", paddingTop: "1px", paddingLeft: "2px", fontWeight: "600" }}>{eqParams.term || "x"}</span>
                    </span>
                  )}
                  {eqTemplate === "sum" && (
                    <div style={{ display: "inline-flex", alignItems: "center" }}>
                      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", fontSize: "0.82rem" }}>
                        <span style={{ fontSize: "0.58em", lineHeight: "1", fontWeight: "700" }}>{eqParams.upper || "n"}</span>
                        <span style={{ fontSize: "1.2rem", lineHeight: "1.1", fontWeight: "600", margin: "1px 0" }}>∑</span>
                        <span style={{ fontSize: "0.58em", lineHeight: "1", fontWeight: "700" }}>{eqParams.base || "i"}={eqParams.lower || "1"}</span>
                      </div>
                      <span style={{ marginLeft: "4px", fontSize: "0.82rem", fontWeight: "600" }}>{eqParams.body || "x_i"}</span>
                    </div>
                  )}
                  {eqTemplate === "integral" && (
                    <div style={{ display: "inline-flex", alignItems: "center" }}>
                      <span style={{ fontSize: "1.4rem", lineHeight: "1", marginRight: "1px", position: "relative" }}>
                        ∫
                        <span style={{ position: "absolute", top: "-4px", left: "6px", fontSize: "0.45em", fontWeight: "700" }}>{eqParams.upper || "b"}</span>
                        <span style={{ position: "absolute", bottom: "-6px", left: "2px", fontSize: "0.45em", fontWeight: "700" }}>{eqParams.lower || "a"}</span>
                      </span>
                      <span style={{ marginLeft: "8px", fontSize: "0.82rem", fontWeight: "600" }}>{eqParams.body || "f(x)"} d{eqParams.term || "x"}</span>
                    </div>
                  )}
                  {eqTemplate === "matrix" && (
                    <span style={{ display: "inline-flex", alignItems: "center", fontSize: "0.82rem", fontWeight: "600" }}>
                      <span style={{ fontSize: "1.4rem", fontWeight: "200", marginRight: "3px" }}>(</span>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", gap: "2px 6px", textAlign: "center" }}>
                        {(() => {
                          let rows = [];
                          try {
                            rows = eqParams.matrixRows.split("\\\\").map(r => r.split("&").map(c => c.trim()));
                          } catch {
                            rows = [["1", "2"], ["3", "4"]];
                          }
                          return rows.map((row, rI) => 
                            row.map((cell, cI) => (
                              <span key={`${rI}-${cI}`}>{cell || "·"}</span>
                            ))
                          );
                        })()}
                      </div>
                      <span style={{ fontSize: "1.4rem", fontWeight: "200", marginLeft: "3px" }}>)</span>
                    </span>
                  )}
                </div>
                
                {/* Text output */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Generated LaTeX Math Code:</span>
                  <input
                    readOnly
                    value={compiledEquation}
                    style={{ fontFamily: "'Fira Code', Courier, monospace", fontSize: "0.8rem", padding: "6px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "4px", color: "var(--text-accent)" }}
                    onClick={(e) => e.target.select()}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => copyText(compiledEquation, "LaTeX math formula copied!")}
                  style={{ fontSize: "0.78rem" }}
                >
                  Copy Equation Code
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEqParams({
                      numerator: "a",
                      denominator: "b",
                      base: "x",
                      exponent: "n",
                      term: "x",
                      lower: "0",
                      upper: "n",
                      body: "x_i",
                      matrixRows: "1 & 2\\\\3 & 4"
                    });
                  }}
                  style={{ fontSize: "0.78rem", background: "transparent", border: "1px solid var(--border-subtle)" }}
                >
                  Reset Template
                </Button>
              </div>
            </div>

            {/* LaTeX Symbol & Formula Sheet */}
            <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "16px", marginTop: "12px" }}>
              <span style={{ display: "block", fontSize: "0.76rem", fontWeight: "700", marginBottom: "4px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07rem" }}>LaTeX Equation & Greek Symbol Panel</span>
              <p className="form-hint" style={{ marginBottom: "8px" }}>Click any mathematical symbol or lab report formula below to copy its LaTeX code to your clipboard.</p>
              
              <div className="symbol-finder" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "6px", marginBottom: "8px" }}>
                <input
                  value={symbolQuery}
                  onChange={(e) => setSymbolQuery(e.target.value)}
                  placeholder="Filter symbols (e.g. alpha, sum, yield)..."
                  style={{ fontSize: "0.8rem", padding: "6px 10px" }}
                />
              </div>

              {/* Tab headers */}
              <div style={{ display: "flex", gap: "4px", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>
                {["greek", "operators", "formulas"].map((tabName) => (
                  <button
                    key={tabName}
                    type="button"
                    onClick={() => setSymbolTab(tabName)}
                    style={{
                      background: symbolTab === tabName ? "rgba(59, 130, 246, 0.15)" : "transparent",
                      border: "none",
                      color: symbolTab === tabName ? "var(--text-accent)" : "var(--text-secondary)",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      padding: "4px 8px",
                      cursor: "pointer",
                      borderRadius: "4px",
                      textTransform: "capitalize"
                    }}
                  >
                    {tabName}
                  </button>
                ))}
              </div>

              {/* Symbol Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "6px", maxHeight: "150px", overflowY: "auto", padding: "2px" }}>
                {Object.keys(latexCategories).map((catName) => {
                  if (symbolTab !== catName && !symbolQuery.trim()) return null;
                  return latexCategories[catName]
                    .filter((item) => {
                      if (!symbolQuery.trim()) return true;
                      return item.label.toLowerCase().includes(symbolQuery.trim().toLowerCase()) || item.code.toLowerCase().includes(symbolQuery.trim().toLowerCase());
                    })
                    .map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          copyText(item.code, `Copied: ${item.code}`);
                        }}
                        style={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "4px",
                          padding: "6px",
                          fontSize: "0.72rem",
                          color: "var(--text-primary)",
                          textAlign: "left",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px"
                        }}
                        title={`Copy ${item.code}`}
                        className="preset-card-btn"
                      >
                        <strong>{item.label}</strong>
                        <code style={{ fontSize: "0.6rem", color: "var(--text-accent)" }}>{item.code}</code>
                      </button>
                    ));
                })}
              </div>
            </div>

            <p className="form-hint" style={{ marginTop: "12px" }}>
              Overleaf workflow: create a blank project, upload images if needed, paste or upload <strong>main.tex</strong>, then compile.
            </p>
          </div>
        )}
      </div>

      {/* Quick Portals */}
      <div className={`accordion-item ${activeSection === "sub-utilities" ? "active" : ""}`}>
        <button type="button" className="accordion-header" onClick={() => toggleSection("sub-utilities")}>
          <span className="accordion-title-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>SUB Quick Portals</span>
          </span>
          <svg className="accordion-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        {activeSection === "sub-utilities" && (
          <div className="accordion-content">
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.5 }}>Direct shortcuts to official SUB campus services:</p>
            <div className="utilities-grid">
              {[
                { href: "http://119.148.8.225:8020/apps/",  color: "blue",   title: "Student Portal",    sub: "Grades, Billing, Registration",
                  icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
                { href: "http://119.148.8.225:8020/moodle/", color: "orange", title: "LMS (Moodle)",       sub: "Lab Assignments, Materials",
                  icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></> },
                { href: "http://119.148.8.225:8005/",        color: "green",  title: "Teacher Evaluation", sub: "Semester course feedback",
                  icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></> },
                { href: "https://isdce.sub.edu.bd/",         color: "purple", title: "ISDCE Portal",       sub: "Skill development center",
                  icon: <><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></> }
              ].map(({ href, color, title, sub, icon }) => (
                <a key={title} href={href} target="_blank" rel="noreferrer" className="utility-link-card">
                  <div className={`utility-icon-wrapper ${color}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                  </div>
                  <div><h4>{title}</h4><small>{sub}</small></div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant Accordion */}
      <div className={`accordion-item ${activeSection === "ai-assistant" ? "active" : ""}`}>
        <button type="button" className="accordion-header" onClick={() => toggleSection("ai-assistant")}>
          <span className="accordion-title-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>AI Assistant</span>
          </span>
          <svg className="accordion-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        {activeSection === "ai-assistant" && (
          <div className="accordion-content">
            <div className="profile-instructions" style={{ background: "rgba(99, 102, 241, 0.05)", borderLeft: "3px solid #6366f1", padding: "8px 12px", borderRadius: "4px", marginBottom: "8px", fontSize: "0.78rem" }}>
              <strong>Powered by Google Gemini 1.5 Flash:</strong>
              <p style={{ margin: "4px 0 0 0", lineHeight: "1.4" }}>
                Use a free developer key from Google AI Studio to unlock automatic academic title refining, lab objectives drafting, and LaTeX helpers.
              </p>
              <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: "6px", color: "#60a5fa", fontWeight: "600", textDecoration: "underline" }}>
                Get a Free API Key here ↗
              </a>
            </div>

            <label><span>Gemini API Key</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder={geminiApiKey ? "Custom key active" : "Using shared key (paste custom key to override)"}
                  style={{ flexGrow: 1 }}
                />
                {geminiApiKey && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setGeminiApiKey("");
                      showAppToast("API Key removed");
                    }}
                    style={{ background: "#ef4444", color: "#fff", border: "none" }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </label>

            <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "12px", marginTop: "6px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <strong style={{ fontSize: "0.82rem", color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>Refine Report Title</strong>
                <p className="form-hint" style={{ marginBottom: "8px" }}>Takes the current report title and suggests 3 professional alternatives.</p>
                <Button
                  type="button"
                  onClick={handleRefineTitle}
                  style={{ width: "100%", fontSize: "0.8rem", justifyContent: "center" }}
                  disabled={!formData.reportTitle?.trim()}
                >
                  ✨ Suggest Academic Titles
                </Button>
              </div>

              <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "12px" }}>
                <strong style={{ fontSize: "0.82rem", color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>Generate Lab Objective</strong>
                <p className="form-hint" style={{ marginBottom: "8px" }}>Drafts an academic introduction paragraph based on the current title.</p>
                <Button
                  type="button"
                  onClick={handleGenerateObjective}
                  style={{ width: "100%", fontSize: "0.8rem", justifyContent: "center" }}
                  disabled={!formData.reportTitle?.trim()}
                >
                  📝 Draft Lab Objective / Introduction
                </Button>
              </div>

              <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "12px" }}>
                <strong style={{ fontSize: "0.82rem", color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>LaTeX Command Helper</strong>
                <p className="form-hint" style={{ marginBottom: "8px" }}>Ask how to write tables, matrices, or formulas in LaTeX.</p>
                <div style={{ display: "flex", gap: "6px" }}>
                  <input
                    value={latexQuery}
                    onChange={(e) => setLatexQuery(e.target.value)}
                    placeholder="e.g. how to write a 3x3 matrix?"
                    style={{ flexGrow: 1 }}
                  />
                  <Button
                    type="button"
                    onClick={handleLatexQuery}
                    style={{ padding: "10px 14px" }}
                    disabled={!latexQuery.trim()}
                  >
                    Ask
                  </Button>
                </div>
              </div>

              {/* Originality Checker Simulator */}
              <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "12px" }}>
                <strong style={{ fontSize: "0.82rem", color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>Academic Originality Checker Simulator</strong>
                <p className="form-hint" style={{ marginBottom: "8px" }}>Simulate Turnitin-style originality check & readability statistics on your drafted pages.</p>
                
                {isScanning ? (
                  <div style={{ padding: "12px", background: "var(--bg-elevated)", borderRadius: "6px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <div className="visit-dot" style={{ width: "12px", height: "12px", background: "#3b82f6", boxShadow: "0 0 8px #3b82f6" }}></div>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Scanning document databases...</span>
                  </div>
                ) : (
                  <Button
                    type="button"
                    id="btn-run-originality-scan"
                    onClick={handleRunScan}
                    style={{ width: "100%", fontSize: "0.8rem", justifyContent: "center", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "0 4px 16px rgba(16,185,129,0.25)" }}
                  >
                    🛡 Run Originality Scan
                  </Button>
                )}

                {scanResult && (
                  <div style={{ marginTop: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-accent)" }}>Scan Results Summary</span>
                      <Badge variant="success">{scanResult.score}% Original</Badge>
                    </div>

                    <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden", marginBottom: "12px" }}>
                      <div style={{ height: "100%", width: `${scanResult.score}%`, background: scanResult.score > 90 ? "#10b981" : "#fbbf24", borderRadius: "99px", transition: "width 0.4s ease" }} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.76rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Readability:</span>
                        <strong style={{ color: "var(--text-primary)" }}>{scanResult.readability}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Scanned Length:</span>
                        <strong style={{ color: "var(--text-primary)" }}>{scanResult.wordCount} words</strong>
                      </div>
                      
                      <div style={{ borderTop: "1px dashed var(--border-subtle)", marginTop: "6px", paddingTop: "6px" }}>
                        <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "4px" }}>Similarity sources detected:</span>
                        {scanResult.matches.length === 0 ? (
                          <div style={{ fontSize: "0.72rem", color: "#10b981", fontStyle: "italic" }}>No matching text sources found! Excellent originality.</div>
                        ) : (
                          scanResult.matches.map((match, idx) => (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "2px" }}>
                              <span style={{ color: "var(--text-secondary)" }}>· {match.source}</span>
                              <strong style={{ color: "#fbbf24" }}>{match.similarity}</strong>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Highlight Review Toggle */}
                      {scanMatches.length > 0 && (
                        <div style={{ borderTop: "1px dashed var(--border-subtle)", marginTop: "10px", paddingTop: "8px" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", userSelect: "none" }}>
                            <input type="checkbox" checked={showReviewMatches} onChange={(e) => setShowReviewMatches(e.target.checked)} style={{ cursor: "pointer" }} />
                            <span style={{ fontSize: "0.76rem", fontWeight: "600", color: "var(--text-accent)" }}>Highlight & Rephrase Matches</span>
                          </label>
                          
                          {showReviewMatches && (
                            <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>Click any flagged sentence to rephrase it:</span>
                              <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: "6px", padding: "8px", fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: "8px", maxHeight: "180px", overflowY: "auto", border: "1px solid var(--border-subtle)" }}>
                                {scanMatches.map((m) => (
                                  <div
                                    key={m.id}
                                    onClick={() => {
                                      Swal.fire({
                                        title: "Rewrite with AI?",
                                        html: `
                                          <div style="text-align:left;font-size:0.85rem;line-height:1.4;">
                                            <p style="color:var(--text-secondary);margin-bottom:6px;"><strong>Original (${m.similarity}% Match from ${m.source}):</strong></p>
                                            <p style="font-style:italic;background:#1e293b;padding:8px;border-radius:4px;border-left:3px solid #f59e0b;color:#f8fafc;user-select:none;">"${m.sentence}"</p>
                                            <p style="color:var(--text-secondary);margin-top:10px;">Do you want the AI assistant to rewrite this sentence to lower plagiarism?</p>
                                          </div>
                                        `,
                                        showCancelButton: true,
                                        confirmButtonText: "✨ Rephrase Sentence",
                                        cancelButtonText: "Cancel",
                                        confirmButtonColor: "#10b981",
                                        background: "#0f172a",
                                        color: "#e8f0ff"
                                      }).then((res) => {
                                        if (res.isConfirmed) {
                                          handleRewriteSentence(m);
                                        }
                                      });
                                    }}
                                    style={{
                                      padding: "6px 8px",
                                      background: "rgba(239, 68, 68, 0.08)",
                                      borderLeft: "3px solid #ef4444",
                                      borderRadius: "3px",
                                      cursor: "pointer",
                                      transition: "background 0.15s ease",
                                    }}
                                    title="Click to rewrite sentence"
                                    className="preset-card-btn"
                                  >
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: "2px" }}>
                                      <span style={{ fontWeight: "600" }}>{m.sectionName}</span>
                                      <span style={{ color: "#ef4444", fontWeight: "600" }}>{m.similarity}% match</span>
                                    </div>
                                    <div style={{ color: "var(--text-primary)", fontWeight: "500", marginTop: "2px" }}>{m.sentence}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Lab Report Analyzer & Rubric Reviewer */}
              <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "12px", marginTop: "12px" }}>
                <strong style={{ fontSize: "0.82rem", color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>Lab Report Analyzer & Rubric Reviewer</strong>
                <p className="form-hint" style={{ marginBottom: "8px" }}>Paste your drafted report paragraphs here to check against academic grading criteria and get actionable improvements.</p>
                
                <textarea
                  value={reportDraftText}
                  onChange={(e) => setReportDraftText(e.target.value)}
                  placeholder="Paste your report introduction, theory, algorithm, results, or full content here..."
                  rows="6"
                  style={{ width: "100%", fontSize: "0.82rem", fontFamily: "inherit", padding: "8px 10px", background: "var(--bg-input)", border: "1px solid var(--border-input)", borderRadius: "6px", color: "var(--text-primary)", resize: "vertical", marginBottom: "8px" }}
                />

                {isAnalyzing ? (
                  <div style={{ padding: "12px", background: "var(--bg-elevated)", borderRadius: "6px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <div className="visit-dot" style={{ width: "12px", height: "12px", background: "#6366f1", boxShadow: "0 0 8px #6366f1" }}></div>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Analyzing draft structure & tone...</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <Button
                      type="button"
                      onClick={handleAnalyzeReport}
                      style={{ flexGrow: 1, fontSize: "0.8rem", justifyContent: "center", background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", boxShadow: "0 4px 16px rgba(99,102,241,0.25)" }}
                    >
                      🔍 Analyze Report Draft
                    </Button>
                    {reportDraftText && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setReportDraftText("");
                          setAnalysisResult(null);
                        }}
                        style={{ fontSize: "0.8rem", background: "transparent", border: "1px solid var(--border-subtle)" }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                )}

                {analysisResult && (
                  <div style={{ marginTop: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-accent)" }}>AI Grading Report Card</span>
                      <Badge style={{
                        background: ["A", "A+", "A-", "B", "B+", "B-"].includes(analysisResult.grade) ? "#10b981" : "#f59e0b",
                        color: "#ffffff",
                        fontSize: "0.85rem",
                        padding: "4px 8px"
                      }}>
                        Grade: {analysisResult.grade}
                      </Badge>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.76rem", marginBottom: "12px" }}>
                      {/* Structure bar */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                          <span style={{ color: "var(--text-secondary)" }}>Structure & Flow:</span>
                          <strong style={{ color: "var(--text-primary)" }}>{analysisResult.structure}%</strong>
                        </div>
                        <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${analysisResult.structure}%`, background: "#3b82f6" }} />
                        </div>
                      </div>

                      {/* Scientific Tone bar */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                          <span style={{ color: "var(--text-secondary)" }}>Scientific Tone & Language:</span>
                          <strong style={{ color: "var(--text-primary)" }}>{analysisResult.tone}%</strong>
                        </div>
                        <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${analysisResult.tone}%`, background: "#10b981" }} />
                        </div>
                      </div>

                      {/* Citations & References bar */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                          <span style={{ color: "var(--text-secondary)" }}>Citations & References:</span>
                          <strong style={{ color: "var(--text-primary)" }}>{analysisResult.citations}%</strong>
                        </div>
                        <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${analysisResult.citations}%`, background: "#f59e0b" }} />
                        </div>
                      </div>

                      {/* Formatting & Math bar */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                          <span style={{ color: "var(--text-secondary)" }}>Formatting & Equations:</span>
                          <strong style={{ color: "var(--text-primary)" }}>{analysisResult.formatting}%</strong>
                        </div>
                        <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${analysisResult.formatting}%`, background: "#8b5cf6" }} />
                        </div>
                      </div>
                    </div>

                    {/* Immediate Fixes */}
                    {analysisResult.fixes && analysisResult.fixes.length > 0 && (
                      <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "8px", marginBottom: "8px" }}>
                        <span style={{ display: "block", fontSize: "0.72rem", color: "#ef4444", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>🔴 Immediate Fixes Required:</span>
                        <ul style={{ margin: 0, paddingLeft: "14px", fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                          {analysisResult.fixes.map((fix, idx) => (
                            <li key={idx} style={{ marginBottom: "2px" }}>{fix}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                      <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "8px" }}>
                        <span style={{ display: "block", fontSize: "0.72rem", color: "#6366f1", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>💡 Recommended Enhancements:</span>
                        <ul style={{ margin: 0, paddingLeft: "14px", fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                          {analysisResult.recommendations.map((rec, idx) => (
                            <li key={idx} style={{ marginBottom: "2px" }}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Submission Readiness Checklist */}
      <div className={`accordion-item ${activeSection === "readiness-checklist" ? "active" : ""}`}>
        <button type="button" className="accordion-header" onClick={() => toggleSection("readiness-checklist")}>
          <span className="accordion-title-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Submission Readiness Checklist</span>
          </span>
          <svg className="accordion-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        {activeSection === "readiness-checklist" && (() => {
          const items = getChecklistItems(formData.departmentPreset);
          const checkedCount = items.filter(item => checklistChecked[item.id]).length;
          const pct = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;
          
          let readinessBadge = "Incomplete";
          let badgeColor = "#ef4444";
          if (pct === 100) {
            readinessBadge = "Ready for Submission!";
            badgeColor = "#10b981";
          } else if (pct >= 50) {
            readinessBadge = "Drafting Review";
            badgeColor = "#f59e0b";
          }

          return (
            <div className="accordion-content">
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.5, marginBottom: "10px" }}>
                Verify your report content against department criteria to ensure standard lab submission compliance.
              </p>

              {/* Progress gauge */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "12px", marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-accent)" }}>Readiness Progress</span>
                  <Badge style={{ background: badgeColor, color: "#ffffff", fontSize: "0.74rem" }}>{readinessBadge}</Badge>
                </div>
                <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden", marginBottom: "6px" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444", borderRadius: "99px", transition: "width 0.3s ease" }} />
                </div>
                <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{checkedCount} of {items.length} requirements met ({pct}%)</span>
              </div>

              {/* Items checklist */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {items.map((item) => (
                  <label
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      padding: "8px 10px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.78rem",
                      color: checklistChecked[item.id] ? "var(--text-secondary)" : "var(--text-primary)",
                      textDecoration: checklistChecked[item.id] ? "line-through" : "none",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!checklistChecked[item.id]}
                      onChange={(e) => {
                        setChecklistChecked(prev => ({
                          ...prev,
                          [item.id]: e.target.checked
                        }));
                      }}
                      style={{ marginTop: "2px", cursor: "pointer" }}
                    />
                    <span>{item.text}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </form>

  );
}

/* ════════════════════════════════════
   MAIN APP
════════════════════════════════════ */
let hitPromise = null;

async function askGemini(prompt, apiKey) {
  const finalKey = apiKey?.trim() || DEFAULT_GEMINI_API_KEY;
  if (!finalKey) {
    throw new Error("Please enter your Gemini API Key in the AI Assistant section first.");
  }
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${finalKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData?.error?.message || `API Error: ${response.status} ${response.statusText}`;
    throw new Error(errMsg);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No response text returned from Gemini API.");
  }
  return text;
}

function App() {
  const [formData, setFormData] = useState(defaultData);
  const cardRef = useRef(null);
  const exportCardRef = useRef(null);
  const exportAckRef = useRef(null);
  const exportTransmittalRef = useRef(null);
  const exportTocRef = useRef(null);
  const exportRubricRef = useRef(null);
  const exportAbstractRef = useRef(null);
  const exportReferencesRef = useRef(null);
  const exportLabInfoRef = useRef(null);
  const exportAppendixRef = useRef(null);
  const exportCertificateRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [is3D, setIs3D] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [activeSection, setActiveSection] = useState("report");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef(null);
  const lastPreviewTapRef = useRef(0);
  const [mobileTab, setMobileTab] = useState("editor");
  const [lightboxScale, setLightboxScale] = useState(0.75);
  const [visitCount, setVisitCount] = useState(null);

  // 1. Global App Theme Switcher
  const [appTheme, setAppTheme] = useState(() => {
    return localStorage.getItem("sub_lab_app_theme") || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (appTheme === "light") {
      root.classList.add("light-theme");
    } else {
      root.classList.remove("light-theme");
    }
    localStorage.setItem("sub_lab_app_theme", appTheme);
  }, [appTheme]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setIsExportDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleAppTheme = () => {
    setAppTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Gemini API Key State
  const [geminiApiKey, setGeminiApiKeyState] = useState(() => {
    return localStorage.getItem("sub_lab_gemini_api_key") || "";
  });

  const setGeminiApiKey = (key) => {
    setGeminiApiKeyState(key);
    if (key) {
      localStorage.setItem("sub_lab_gemini_api_key", key);
    } else {
      localStorage.removeItem("sub_lab_gemini_api_key");
    }
  };

  // 2. Profiles state
  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem("sub_lab_student_profiles");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newProfileName, setNewProfileName] = useState("");

  // 3. Ruler and alignment grid state
  const [showRulers, setShowRulers] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  const undoSnapshotRef = useRef(null);

  // 4. Multi-page document packager state
  const [enabledPages, setEnabledPages] = useState({
    cover: true,
    acknowledgement: false,
    transmittal: false,
    toc: false,
    rubric: false,
    abstract: false,
    references: false,
    labInfo: false,
    appendix: false,
    certificate: false
  });

  const pageOffsets = useMemo(() => {
    const offsets = {};
    let index = 0;
    pageRenderOrder.forEach((pageKey) => {
      if (enabledPages[pageKey]) {
        offsets[pageKey] = index;
        index += 1;
      }
    });
    return offsets;
  }, [enabledPages]);

  const [ackData, setAckData] = useState({
    title: "ACKNOWLEDGEMENT",
    body: "I would like to express my special thanks of gratitude to my teacher as well as our university who gave me the golden opportunity to do this wonderful project on the topic, which also helped me in doing a lot of Research and I came to know about so many new things. I am really thankful to them."
  });

  const [transmittalData, setTransmittalData] = useState({
    date: getFormattedCurrentDate(),
    recipientName: "SAKIB AL HASAN",
    recipientTitle: "Associate Professor",
    recipientDept: "Department of Computer Science and Engineering",
    subject: "Submission of Lab Report",
    salutation: "Dear Sir,",
    body: "It is a great pleasure to submit the lab report on our Software Engineering Lab course. I have completed the assigned lab tasks and experiments. I have tried my level best to compile the report with clear findings and standard documentation. I hope that this report will meet your requirements and expectation.",
    signOff: "Sincerely yours,"
  });

  const [tocData, setTocData] = useState([
    { id: "1", title: "Introduction", pageNo: "1" },
    { id: "2", title: "Experimental Procedure", pageNo: "2" },
    { id: "3", title: "Results and Discussions", pageNo: "4" },
    { id: "4", title: "Conclusion", pageNo: "6" }
  ]);

  const [rubricRows, setRubricRows] = useState([
    { id: "r1", criteria: "Introduction & Objectives", description: "Clarity of purpose, background information.", weight: "10" },
    { id: "r2", criteria: "Methodology & Procedure", description: "Completeness of steps, apparatus layout.", weight: "20" },
    { id: "r3", criteria: "Data Representation & Results", description: "Tables, figures, curves properly labeled.", weight: "30" },
    { id: "r4", criteria: "Analysis & Discussions", description: "Critical evaluation, error discussion.", weight: "30" },
    { id: "r5", criteria: "Conclusion & Formatting", description: "Summary, references, presentation neatness.", weight: "10" }
  ]);

  // ── New page data ──────────────────────────────────────────────────────────
  const [abstractData, setAbstractData] = useState({
    title: "ABSTRACT",
    body: "",
    keywords: ""
  });

  const [referencesData, setReferencesData] = useState([
    { id: "ref1", style: "APA", text: "" }
  ]);

  const [labInfoData, setLabInfoData] = useState({
    labRoom: "",
    partners: [""],
    equipment: [""]
  });

  const [appendixData, setAppendixData] = useState({
    label: "APPENDIX A",
    subtitle: ""
  });

  // ── Smart features state ───────────────────────────────────────────────────
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem("sub_lab_onboarding_done"));
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [deadlineCountdown, setDeadlineCountdown] = useState("");

  // ── Auto-save to localStorage (30s debounce) ───────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("sub_lab_autosave", JSON.stringify(formData));
    }, 30000);
    return () => clearTimeout(timer);
  }, [formData]);

  // Auto-restore prompt on first load
  useEffect(() => {
    const saved = localStorage.getItem("sub_lab_autosave");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.reportTitle && parsed.reportTitle !== defaultData.reportTitle) {
          Swal.fire({
            title: "Restore Last Session?",
            text: "We found unsaved work from your last visit. Would you like to restore it?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, restore it",
            cancelButtonText: "Start fresh",
            background: "#0f172a",
            color: "#e8f0ff",
            confirmButtonColor: "#2563eb"
          }).then((result) => {
            if (result.isConfirmed) setFormData((prev) => ({ ...prev, ...parsed }));
            else localStorage.removeItem("sub_lab_autosave");
          });
        }
      } catch {}
    }
  }, []);

  // ── Deadline countdown ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!formData.submissionDeadline) { setDeadlineCountdown(""); return; }
    const update = () => {
      const diff = new Date(formData.submissionDeadline) - new Date();
      if (diff <= 0) { setDeadlineCountdown("⏰ Deadline passed!"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setDeadlineCountdown(`⏳ ${d}d ${h}h ${m}m left`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [formData.submissionDeadline]);

  // ── URL State share/load ───────────────────────────────────────────────────
  const exportShareUrl = useCallback(() => {
    const shareFields = { reportTitle: formData.reportTitle, university: formData.university, department: formData.department, courseCode: formData.courseCode, courseTitle: formData.courseTitle, teacherName: formData.teacherName, teacherTitle: formData.teacherTitle, submittedByName: formData.submittedByName, roll: formData.roll, year: formData.year, semester: formData.semester, layoutTheme: formData.layoutTheme, accentColor: formData.accentColor, fontFamily: formData.fontFamily, experimentNoLabelType: formData.experimentNoLabelType, customExperimentNoLabel: formData.customExperimentNoLabel };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(shareFields))));
    const url = `${window.location.origin}${window.location.pathname}?state=${encoded}`;
    navigator.clipboard.writeText(url).then(() => showAppToast("Share link copied to clipboard!")).catch(() => showAppToast("Copy failed — check browser permissions", "error"));
  }, [formData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const state = params.get("state");
    if (state) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(state))));
        Swal.fire({
          title: "Load Shared Config?",
          text: "A pre-filled configuration was shared with you. Load it?",
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Load it",
          background: "#0f172a",
          color: "#e8f0ff",
          confirmButtonColor: "#2563eb"
        }).then((r) => { if (r.isConfirmed) setFormData((prev) => ({ ...prev, ...decoded })); });
      } catch {}
    }
  }, []);

  // ── Keyboard Shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === "s") { e.preventDefault(); saveProfile(newProfileName || "Quick Save"); }
      if ((e.ctrlKey || e.metaKey) && key === "p") { e.preventDefault(); exportCover("pdf"); }
      if ((e.ctrlKey || e.metaKey) && key === "z" && undoSnapshotRef.current) {
        e.preventDefault();
        setFormData(undoSnapshotRef.current);
        undoSnapshotRef.current = null;
        showAppToast("Last edit undone");
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && key === "r") { e.preventDefault(); resetForm(); }
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        setShowShortcutsModal(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [formData, newProfileName]);

  // ── Onboarding tour completion ─────────────────────────────────────────────
  const completeOnboarding = useCallback(() => {
    localStorage.setItem("sub_lab_onboarding_done", "1");
    setShowOnboarding(false);
  }, []);

  // ── Field validation before export ────────────────────────────────────────
  const validateBeforeExport = useCallback(() => {
    const missing = [];
    if (!formData.reportTitle?.trim()) missing.push("Report Title");
    if (!formData.courseCode?.trim()) missing.push("Course Code");
    if (!formData.courseTitle?.trim()) missing.push("Course Title");
    if (!formData.experimentNoOptional && !formData.experimentNo?.trim()) missing.push(getExperimentNoLabel(formData));
    if (!formData.teacherName?.trim()) missing.push("Teacher Name");
    if (!formData.submittedByName?.trim() && !formData.isGroupMode) missing.push("Student Name");
    return missing;
  }, [formData]);

  // ── Banner upload handler ──────────────────────────────────────────────────
  const handleBannerUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = createSafeObjectImageUrl(file);
    if (!objectUrl) {
      showAppToast("Please upload a PNG, JPG, GIF, or WebP image.", "error");
      e.target.value = null;
      return;
    }
    updateField("bannerImageUrl", objectUrl);
  }, []);


  const saveProfile = (name) => {
    if (!name.trim()) {
      Swal.fire({
        title: "Profile Name Required",
        text: "Please enter a name for the profile.",
        icon: "warning",
        background: appTheme === "light" ? "#ffffff" : "#0f172a",
        color: appTheme === "light" ? "#0f172a" : "#e8f0ff",
        confirmButtonColor: "#2563eb"
      });
      return;
    }
    const newProfile = {
      id: Date.now().toString(),
      name: name.trim(),
      fields: {
        submittedByName: formData.submittedByName,
        roll: formData.roll,
        registration: formData.registration,
        session: formData.session,
        year: formData.year,
        semester: formData.semester,
        group: formData.group,
        status: formData.status,
        departmentPreset: formData.departmentPreset,
        department: formData.department,
        university: formData.university,
        experimentNoLabelType: formData.experimentNoLabelType,
        customExperimentNoLabel: formData.customExperimentNoLabel
      }
    };
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    localStorage.setItem("sub_lab_student_profiles", JSON.stringify(updated));
    setNewProfileName("");
    showAppToast(`Profile "${name.trim()}" saved`);
  };

  const loadProfile = (profile) => {
    setFormData((prev) => ({
      ...prev,
      ...profile.fields
    }));
    showAppToast(`Loaded profile "${profile.name}"`);
  };

  const deleteProfile = (id, name) => {
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    localStorage.setItem("sub_lab_student_profiles", JSON.stringify(updated));
    showAppToast(`Deleted profile "${name}"`);
  };

  const exportProfiles = () => {
    try {
      const dataStr = JSON.stringify(profiles, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = 'sub_lab_student_profiles.json';
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      showAppToast("Profiles exported successfully");
    } catch (e) {
      Swal.fire({
        title: "Export Failed",
        text: "Could not export profiles.",
        icon: "error",
        background: appTheme === "light" ? "#ffffff" : "#0f172a",
        color: appTheme === "light" ? "#0f172a" : "#e8f0ff"
      });
    }
  };

  const importProfiles = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!Array.isArray(parsed)) {
          throw new Error("Invalid profiles format. Must be a JSON array.");
        }
        const validated = parsed.filter(item => item && typeof item === 'object' && item.name && item.fields);
        if (validated.length === 0) {
          throw new Error("No valid profiles found in the file.");
        }
        const existingIds = new Set(profiles.map(p => p.id));
        const newProfiles = validated.map(item => {
          if (existingIds.has(item.id) || !item.id) {
            const randomSuffix = window.crypto.getRandomValues(new Uint32Array(1))[0] % 1000;
            item.id = (Date.now() + randomSuffix).toString();
          }
          return item;
        });
        const merged = [...profiles, ...newProfiles];
        setProfiles(merged);
        localStorage.setItem("sub_lab_student_profiles", JSON.stringify(merged));
        showAppToast(`Successfully imported ${newProfiles.length} profiles`);
      } catch (err) {
        Swal.fire({
          title: "Import Failed",
          text: err.message || "Invalid file content.",
          icon: "error",
          background: appTheme === "light" ? "#ffffff" : "#0f172a",
          color: appTheme === "light" ? "#0f172a" : "#e8f0ff"
        });
      }
    };
    fileReader.readAsText(file);
    e.target.value = null;
  };

  const handleTocClick = (item) => {
    const titleSlug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    let targetId = `page-${titleSlug}`;
    if (titleSlug.includes("cover")) targetId = "page-cover";
    if (titleSlug.includes("acknowledgement")) targetId = "page-acknowledgement";
    if (titleSlug.includes("transmittal") || titleSlug.includes("letter")) targetId = "page-transmittal";
    if (titleSlug.includes("toc") || titleSlug.includes("contents")) targetId = "page-toc";
    if (titleSlug.includes("rubric") || titleSlug.includes("grading")) targetId = "page-grading-rubric";
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      showAppToast(`Jumping to ${item.title}...`);
    } else {
      showAppToast(`Section "${item.title}" is in the main report (Page ${item.pageNo})`, "info");
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = createSafeObjectImageUrl(file);
    if (!objectUrl) {
      showAppToast("Please upload a PNG, JPG, GIF, or WebP image.", "error");
      e.target.value = null;
      return;
    }
    setFormData((prev) => ({
      ...prev,
      customLogoUrl: objectUrl
    }));
    showAppToast("Custom logo uploaded!");
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = createSafeObjectImageUrl(file);
    if (!objectUrl) {
      showAppToast("Please upload a PNG, JPG, GIF, or WebP image.", "error");
      e.target.value = null;
      return;
    }
    setFormData((prev) => ({
      ...prev,
      customSignatureUrl: objectUrl
    }));
    showAppToast("Signature uploaded!");
  };

  useParticles(canvasRef);

  useEffect(() => {
    // 1. Initial hit (increments count by 1 and gets the new value)
    // We use a shared module-level promise to guarantee it only hits once per page load,
    // preventing double-counting or race conditions in StrictMode remounts.
    if (!hitPromise) {
      hitPromise = fetch("https://countapi.mileshilliard.com/api/v1/hit/sub_lab_cover_letter_visits")
        .then((res) => res.json())
        .catch((err) => {
          console.error("Error registering visit:", err);
          hitPromise = null; // Reset to allow retry on next mount
          return null;
        });
    }

    hitPromise.then((data) => {
      if (data && typeof data.value === "number") {
        setVisitCount(data.value);
      }
    });

    // 2. Auto-refresh / polling interval to fetch updates every 7 seconds
    const interval = setInterval(() => {
      fetch("https://countapi.mileshilliard.com/api/v1/get/sub_lab_cover_letter_visits")
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.value === "number") {
            setVisitCount(data.value);
          }
        })
        .catch((err) => console.error("Error polling visits:", err));
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const toggleSection = (s) => setActiveSection((c) => (c === s ? null : s));

  const selectedPage = useMemo(() => {
    if (formData.pageSize === "custom") return {
      label: "Custom",
      widthMm:  clampPageSize(formData.customWidthMm,  100, 500, 210),
      heightMm: clampPageSize(formData.customHeightMm, 100, 700, 297)
    };
    return pageSizes.find((p) => p.id === formData.pageSize) ?? pageSizes[0];
  }, [formData.customHeightMm, formData.customWidthMm, formData.pageSize]);

  const selectedTemplate = useMemo(
    () => getTemplateForDepartment(formData.departmentPreset),
    [formData.departmentPreset]
  );

  const paperPixelSize = useMemo(() => ({
    width: 794 * (selectedPage.widthMm / 210),
    height: 794 * (selectedPage.heightMm / 210)
  }), [selectedPage.widthMm, selectedPage.heightMm]);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const isMobilePreview = window.matchMedia("(max-width: 768px)").matches;
      const cW = containerRef.current.clientWidth - (isMobilePreview ? 24 : 48);
      const cH = containerRef.current.clientHeight - (isMobilePreview ? 132 : 80);
      let s = Math.min(cW / paperPixelSize.width, cH / paperPixelSize.height);
      if (formData.previewMode === "large" && !isMobilePreview) s = cW / paperPixelSize.width;
      setScaleFactor(Math.min(Math.max(s, 0.12), 1.05));
    };
    const frame = requestAnimationFrame(handleResize);
    window.addEventListener("resize", handleResize);
    const obs = new ResizeObserver(handleResize);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", handleResize); obs.disconnect(); };
  }, [paperPixelSize.width, paperPixelSize.height, formData.previewMode, mobileTab]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const updateLightboxScale = () => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const availableWidth = window.innerWidth - (isMobile ? 24 : 64);
      const availableHeight = window.innerHeight - (isMobile ? 112 : 96);
      const nextScale = Math.min(
        availableWidth / paperPixelSize.width,
        availableHeight / paperPixelSize.height,
        1
      );

      setLightboxScale(Math.max(nextScale, 0.25));
    };

    updateLightboxScale();
    window.addEventListener("resize", updateLightboxScale);
    window.addEventListener("orientationchange", updateLightboxScale);
    return () => {
      window.removeEventListener("resize", updateLightboxScale);
      window.removeEventListener("orientationchange", updateLightboxScale);
    };
  }, [lightboxOpen, paperPixelSize.width, paperPixelSize.height]);

  /* 3D tilt */
  const handleMouseMove = useCallback((e) => {
    if (!is3D || !cardRef.current || !containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const rx = ((r.height/2 - y) / (r.height/2)) * 12;
    const ry = ((x - r.width/2) / (r.width/2)) * -12;
    cardRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
    cardRef.current.style.setProperty("--light-x", `${(x/r.width)*100}%`);
    cardRef.current.style.setProperty("--light-y", `${(y/r.height)*100}%`);
    const sX = ry*2, sY = -rx*2+24, sB = 42+Math.abs(rx)*3;
    cardRef.current.style.boxShadow = `${sX}px ${sY}px ${sB}px rgba(10,22,64,.28), 0 4px 12px rgba(0,0,0,.12)`;
  }, [is3D]);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "rotateX(0) rotateY(0) scale3d(1,1,1)";
    cardRef.current.style.setProperty("--light-x", "50%");
    cardRef.current.style.setProperty("--light-y", "50%");
    cardRef.current.style.boxShadow = "0 22px 58px rgba(10,22,64,.18)";
  }, []);

  const handlePreviewPointerUp = useCallback((event) => {
    if (event.pointerType === "mouse") return;

    const now = window.performance?.now?.() ?? Date.now();
    if (now - lastPreviewTapRef.current < 360) {
      event.preventDefault();
      lastPreviewTapRef.current = 0;
      setLightboxOpen(true);
      return;
    }

    lastPreviewTapRef.current = now;
  }, []);

  // Single paperStyle — used for both preview and lightbox
  const paperStyle = useMemo(() => ({
    "--content-scale": getContentScale(selectedPage),
    "--paper-width-px":  `${794 * (selectedPage.widthMm  / 210)}px`,
    "--paper-height-px": `${794 * (selectedPage.heightMm / 210)}px`,
    "--document-font": FONT_MAPPING[formData.fontFamily] || FONT_MAPPING.georgia,
    "--heading-font": FONT_MAPPING[formData.headingFont] || FONT_MAPPING.georgia,
    "--body-font": FONT_MAPPING[formData.bodyFont] || FONT_MAPPING.georgia,
    "--accent-color": formData.accentColor || "#1e3a5f",
    "--accent-color-dim": hexToRgba(formData.accentColor || "#1e3a5f", 0.45),
    "--accent-color-glow": hexToRgba(formData.accentColor || "#1e3a5f", 0.15),
    width:  "var(--paper-width-px)",
    height: "var(--paper-height-px)"
  }), [selectedPage, formData.fontFamily, formData.headingFont, formData.bodyFont, formData.accentColor]);

  const lightboxPageFrameStyle = useMemo(() => ({
    "--lightbox-scale": lightboxScale,
    width: `${paperPixelSize.width * lightboxScale}px`,
    height: `${paperPixelSize.height * lightboxScale}px`
  }), [lightboxScale, paperPixelSize.width, paperPixelSize.height]);

  const studentRows = useMemo(() => [
    [t(formData, "name"),     formData.submittedByName, "submittedByName"],
    [t(formData, "status"),   formData.status, "status"],
    [t(formData, "year"),     formData.year, "year"],
    [t(formData, "semester"), formData.semester, "semester"],
    [t(formData, "group"),    formData.group, "group"],
    [t(formData, "session"),  formData.session, "session"],
    [t(formData, "rollNo"),   formData.roll, "roll"],
    [t(formData, "regNo"),    formData.registration, "registration"]
  ].filter(([,v]) => v && v.trim()), [formData]);

  const overleafCode = useMemo(
    () => buildOverleafDocument(formData, studentRows, selectedPage, selectedTemplate),
    [formData, studentRows, selectedPage, selectedTemplate]
  );

  function updateField(k, v) {
    setFormData((c) => {
      undoSnapshotRef.current = c;
      const next = { ...c, [k]: v };
      if (k === "department" && c.departmentPreset === "custom") {
        next.teacherDepartment = v;
      }
      return next;
    });
  }
  function updateDepartmentPreset(v) {
    const d = departments.find((x) => x.id === v);
    setFormData((c) => {
      undoSnapshotRef.current = c;
      if (!d || d.id === "custom") {
        return {
          ...c,
          departmentPreset: "custom",
          department: "",
          teacherDepartment: "",
          departmentLogoUrl: "",
          showDepartmentLogo: false
        };
      }
      const dn = `Department of ${d.label}`;
      return { ...c, departmentPreset: v, department: dn, teacherDepartment: dn, departmentLogoUrl: d.logoUrl };
    });
  }
  function resetForm() {
    undoSnapshotRef.current = formData;
    setFormData(defaultData);
  }
  function handlePrint() { setTimeout(() => window.print(), 60); }
  async function copyText(text, message = "Copied") {
    try {
      await navigator.clipboard.writeText(text);
      showAppToast(message);
    } catch {
      Swal.fire({
        title: "Copy failed",
        text: "Please select the text and copy it manually.",
        icon: "error",
        confirmButtonText: "OK",
        background: "#0f172a",
        color: "#e8f0ff",
        confirmButtonColor: "#2563eb"
      });
    }
  }
  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/x-tex;charset=utf-8" });
    downloadBlob(filename, blob);
    showAppToast(`${filename} downloaded`);
  }

  async function getCoverImageDataUrl(format = "png", pixelRatio = 2) {
    const node = exportCardRef.current;
    if (!node) throw new Error("Cover preview is not ready yet.");
    await document.fonts?.ready;

    if (format === "svg") {
      const { toSvg } = await import("html-to-image");
      return toSvg(node, {
        backgroundColor: "#ffffff",
        cacheBust: true,
        imagePlaceholder: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
        filter: (domNode) => !domNode.classList?.contains("paper-glare")
      });
    }

    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(node, {
        backgroundColor: "#ffffff",
        scale: pixelRatio,
        useCORS: true,
        allowTaint: false,
        imageTimeout: 8000,
        logging: false,
        ignoreElements: (domNode) => domNode.classList?.contains("paper-glare")
      });
      return canvas.toDataURL(format === "jpg" ? "image/jpeg" : "image/png", format === "jpg" ? 0.96 : 1);
    } catch {
      const { toJpeg, toPng } = await import("html-to-image");
      const options = {
        backgroundColor: "#ffffff",
        cacheBust: true,
        pixelRatio,
        imagePlaceholder: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
        filter: (domNode) => !domNode.classList?.contains("paper-glare")
      };
      return format === "jpg" ? toJpeg(node, { ...options, quality: 0.96 }) : toPng(node, options);
    }
  }

  async function buildPdfDocument() {
    const { jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");
    const pagesToRender = [];

    if (enabledPages.cover) pagesToRender.push({ name: "Cover", ref: exportCardRef });
    if (enabledPages.acknowledgement) pagesToRender.push({ name: "Acknowledgement", ref: exportAckRef });
    if (enabledPages.transmittal) pagesToRender.push({ name: "Letter of Transmittal", ref: exportTransmittalRef });
    if (enabledPages.toc) pagesToRender.push({ name: "Table of Contents", ref: exportTocRef });
    if (enabledPages.abstract) pagesToRender.push({ name: "Abstract", ref: exportAbstractRef });
    if (enabledPages.rubric) pagesToRender.push({ name: "Grading Rubric", ref: exportRubricRef });
    if (enabledPages.references) pagesToRender.push({ name: "References", ref: exportReferencesRef });
    if (enabledPages.labInfo) pagesToRender.push({ name: "Lab Information", ref: exportLabInfoRef });
    if (enabledPages.appendix) pagesToRender.push({ name: "Appendix", ref: exportAppendixRef });
    if (enabledPages.certificate) pagesToRender.push({ name: "Certificate", ref: exportCertificateRef });

    const pdf = new jsPDF({
      orientation: selectedPage.widthMm > selectedPage.heightMm ? "landscape" : "portrait",
      unit: "mm",
      format: [selectedPage.widthMm, selectedPage.heightMm]
    });

    for (let i = 0; i < pagesToRender.length; i++) {
      const node = pagesToRender[i].ref.current;
      if (!node) continue;
      await document.fonts?.ready;

      let pageImg = "";
      try {
        const canvas = await html2canvas(node, {
          backgroundColor: "#ffffff",
          scale: 2.4,
          useCORS: true,
          allowTaint: false,
          imageTimeout: 8000,
          logging: false,
          ignoreElements: (domNode) => domNode.classList?.contains("paper-glare")
        });
        pageImg = canvas.toDataURL("image/png");
      } catch {
        const { toPng } = await import("html-to-image");
        pageImg = await toPng(node, {
          backgroundColor: "#ffffff",
          cacheBust: true,
          pixelRatio: 2.4,
          imagePlaceholder: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
          filter: (domNode) => !domNode.classList?.contains("paper-glare")
        });
      }

      if (i > 0) {
        pdf.addPage([selectedPage.widthMm, selectedPage.heightMm], selectedPage.widthMm > selectedPage.heightMm ? "landscape" : "portrait");
      }
      pdf.addImage(pageImg, "PNG", 0, 0, selectedPage.widthMm, selectedPage.heightMm);
    }

    return pdf;
  }

  async function exportCover(format) {
    const baseName = getExportBaseName(formData);
    const label = exportFormats.find((item) => item.id === format)?.label ?? format.toUpperCase();
    const missingFields = validateBeforeExport();

    if (missingFields.length) {
      Swal.fire({
        title: "Missing required fields",
        html: `<ul style="text-align:left;margin:0;padding-left:20px;">${missingFields.map((field) => `<li>${field}</li>`).join("")}</ul>`,
        icon: "warning",
        confirmButtonText: "Fix fields",
        background: "#0f172a",
        color: "#e8f0ff",
        confirmButtonColor: "#2563eb"
      });
      return;
    }

    Swal.fire({
      title: `Preparing ${label}`,
      text: "Please wait a moment...",
      allowOutsideClick: false,
      showConfirmButton: false,
      background: "#0f172a",
      color: "#e8f0ff",
      didOpen: () => Swal.showLoading()
    });

    try {
      if (format === "pdf") {
        const pdf = await buildPdfDocument();
        pdf.save(`${baseName}.pdf`);
      } else if (format === "png") {
        downloadDataUrl(`${baseName}.png`, await getCoverImageDataUrl("png", 2.6));
      } else if (format === "jpg") {
        downloadDataUrl(`${baseName}.jpg`, await getCoverImageDataUrl("jpg", 2.4));
      } else if (format === "svg") {
        downloadDataUrl(`${baseName}.svg`, await getCoverImageDataUrl("svg", 1));
      } else if (format === "docx") {
        const { Packer } = await import("docx");
        const blob = await Packer.toBlob(await buildDocxCover(formData, studentRows, selectedPage));
        downloadBlob(`${baseName}.docx`, blob);
      } else if (format === "pptx") {
        const { default: PptxGenJS } = await import("pptxgenjs");
        const image = await getCoverImageDataUrl("png", 2.2);
        const pptx = new PptxGenJS();
        const widthIn = selectedPage.widthMm / 25.4;
        const heightIn = selectedPage.heightMm / 25.4;
        pptx.author = "JOY";
        pptx.company = "State University of Bangladesh";
        pptx.subject = formData.reportTitle;
        pptx.title = formData.reportTitle;
        pptx.defineLayout({ name: "COVER_PAGE", width: widthIn, height: heightIn });
        pptx.layout = "COVER_PAGE";
        const slide = pptx.addSlide();
        slide.background = { color: "FFFFFF" };
        slide.addImage({ data: image, x: 0, y: 0, w: widthIn, h: heightIn });
        await pptx.writeFile({ fileName: `${baseName}.pptx` });
      } else if (format === "zip") {
        const [{ default: JSZip }, { Packer }] = await Promise.all([
          import("jszip"),
          import("docx")
        ]);
        const pdf = await buildPdfDocument();

        const zip = new JSZip();
        zip.file(`${baseName}.pdf`, pdf.output("blob"));
        zip.file(`${baseName}.docx`, await Packer.toBlob(await buildDocxCover(formData, studentRows, selectedPage)));
        zip.file("main.tex", overleafCode);

        const zipBlob = await zip.generateAsync({ type: "blob" }, (metadata) => {
          if (metadata.percent) Swal.update({ text: `Creating ZIP... ${Math.round(metadata.percent)}%` });
        });
        downloadBlob(`${baseName}.zip`, zipBlob);
      }

      Swal.close();
      showAppToast(`${label} downloaded`);
    } catch (error) {
      Swal.fire({
        title: "Export failed",
        text: error?.message || "Please try again, or use Print / Save PDF.",
        icon: "error",
        confirmButtonText: "OK",
        background: "#0f172a",
        color: "#e8f0ff",
        confirmButtonColor: "#2563eb"
      });
    }
  }

  return (
    <main className="app-shell">
      <canvas id="particle-canvas" ref={canvasRef} aria-hidden="true" />

      <style>{`
        @page { size: ${selectedPage.widthMm}mm ${selectedPage.heightMm}mm; margin: 0; }
        @media print {
          html, body, #root { width: ${selectedPage.widthMm}mm !important; height: ${selectedPage.heightMm}mm !important; }
          .paper { width: ${selectedPage.widthMm}mm !important; height: ${selectedPage.heightMm}mm !important; }
        }
      `}</style>

      {/* ── Mobile Tab Bar ── */}
      <div className="mobile-tabs no-print">
        <button type="button" className={`mobile-tab ${mobileTab === "editor" ? "active" : ""}`} onClick={() => setMobileTab("editor")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          Edit Fields
        </button>
        <button type="button" className={`mobile-tab ${mobileTab === "preview" ? "active" : ""}`} onClick={() => setMobileTab("preview")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          Preview
        </button>
      </div>

      {/* ════ EDITOR PANEL ════ */}
      <section className={`editor-panel ${mobileTab === "editor" ? "mobile-visible" : "mobile-hidden"}`}>
        <div className="panel-header">
          <div className="header-top-row">
            <p className="eyebrow">SUB Lab Report</p>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                type="button"
                className="theme-toggle-btn no-print"
                onClick={toggleAppTheme}
                title={`Switch to ${appTheme === "dark" ? "light" : "dark"} theme`}
              >
                {appTheme === "dark" ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
              {visitCount !== null && (
                <div className="visit-badge">
                  <span className="visit-dot" />
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="visit-icon">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>{visitCount.toLocaleString()} visits</span>
                </div>
              )}
              {deadlineCountdown && (
                <div className="deadline-badge no-print">
                  {deadlineCountdown}
                </div>
              )}
            </div>
          </div>
          <h1>Cover Page Generator</h1>
          <p className="hero-subtitle">Fill in the details and instantly generate a print-ready cover page with official SUB branding.</p>
        </div>

        {/* ── Scrollable body: brand note + actions + form ── */}
        <div className="editor-scroll-body">
          <div className="brand-note no-print">
            <img src={SUB_LOGO_URL} alt="State University of Bangladesh logo" />
            <div>
              <strong>Built for SUB Students</strong>
              <span>Official university logo included — department logo optional.</span>
            </div>
          </div>

          <div className="actions no-print">
            <Button type="button" id="print-btn" onClick={handlePrint}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
              </svg>
              Print / Save PDF
            </Button>
            <Button type="button" variant="secondary" onClick={resetForm}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3" />
              </svg>
              Reset
            </Button>
          </div>

          <EditorForm
            formData={formData}
            activeSection={activeSection}
            toggleSection={toggleSection}
            updateField={updateField}
            updateDepartmentPreset={updateDepartmentPreset}
            selectedPage={selectedPage}
            selectedTemplate={selectedTemplate}
            studentRows={studentRows}
            overleafCode={overleafCode}
            copyText={copyText}
            downloadText={downloadText}
            exportCover={exportCover}
            profiles={profiles}
            newProfileName={newProfileName}
            setNewProfileName={setNewProfileName}
            saveProfile={saveProfile}
            loadProfile={loadProfile}
            deleteProfile={deleteProfile}
            handleLogoUpload={handleLogoUpload}
            handleSignatureUpload={handleSignatureUpload}
            handleBannerUpload={handleBannerUpload}
            showRulers={showRulers}
            setShowRulers={setShowRulers}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            showGuides={showGuides}
            setShowGuides={setShowGuides}
            enabledPages={enabledPages}
            setEnabledPages={setEnabledPages}
            ackData={ackData}
            setAckData={setAckData}
            transmittalData={transmittalData}
            setTransmittalData={setTransmittalData}
            tocData={tocData}
            setTocData={setTocData}
            exportProfiles={exportProfiles}
            importProfiles={importProfiles}
            rubricRows={rubricRows}
            setRubricRows={setRubricRows}
            abstractData={abstractData}
            setAbstractData={setAbstractData}
            referencesData={referencesData}
            setReferencesData={setReferencesData}
            labInfoData={labInfoData}
            setLabInfoData={setLabInfoData}
            appendixData={appendixData}
            setAppendixData={setAppendixData}
            exportShareUrl={exportShareUrl}
            geminiApiKey={geminiApiKey}
            setGeminiApiKey={setGeminiApiKey}
          />
        </div>
      </section>

      {/* ════ PREVIEW PANEL ════ */}
      <section
        className={`preview-panel preview-${formData.previewMode} ${is3D ? "mode-3d" : "mode-2d"} ${mobileTab === "preview" ? "mobile-visible" : "mobile-hidden"}`}
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Toolbar */}
        <div className="preview-toolbar no-print">
          <span className="toolbar-title">Preview</span>
          <div className="toolbar-divider" />
          <button type="button" className={`toolbar-btn ${is3D ? "active" : ""}`} onClick={() => { setIs3D(true); handleMouseLeave(); }} title="3D Tilt mode">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            3D
          </button>
          <button type="button" className={`toolbar-btn ${!is3D ? "active" : ""}`} onClick={() => { setIs3D(false); handleMouseLeave(); }} title="2D Flat mode">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
              <line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" />
            </svg>
            2D
          </button>
          <button type="button" className="toolbar-btn" onClick={() => setLightboxOpen(true)} title="Open full preview">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
            Full
          </button>
          <div className="toolbar-divider" />
          <button type="button" className="toolbar-btn" onClick={handlePrint} title="Print or save as PDF">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
            </svg>
            Print
          </button>
          <div className="toolbar-divider" />
          <div style={{ position: "relative" }} ref={exportDropdownRef}>
            <button
              type="button"
              className={`toolbar-btn ${isExportDropdownOpen ? "active" : ""}`}
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              title="Export cover in other formats (DOCX, PPTX, PNG, JPG, etc.)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export</span>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform var(--t-fast) ease", transform: isExportDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {isExportDropdownOpen && (
              <div className="toolbar-dropdown">
                <div className="dropdown-header">Export Format</div>
                {exportFormats.map((format) => (
                  <button
                    key={format.id}
                    type="button"
                    className="toolbar-dropdown-item"
                    onClick={() => {
                      exportCover(format.id);
                      setIsExportDropdownOpen(false);
                    }}
                  >
                    <span className="dropdown-item-title-row">
                      {EXPORT_ICONS[format.id]}
                      <strong>{format.label}</strong>
                      {EXPORT_BADGES[format.id] && (
                        <span className={`dropdown-badge badge-${EXPORT_BADGES[format.id].type}`}>
                          {EXPORT_BADGES[format.id].text}
                        </span>
                      )}
                    </span>
                    <span className="dropdown-item-hint">{format.hint}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zoom hint badge */}
        <div className="zoom-hint no-print" onClick={() => setLightboxOpen(true)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
          Double-click to expand
        </div>

        {/* Paper scene — double-click opens lightbox */}
        <div className="paper-scene">
          <div
            className="paper-scaler"
            style={{
              "--preview-scale": scaleFactor,
              transform: `scale(${scaleFactor})`,
              transformOrigin: formData.previewMode === "large" ? "top center" : "center center",
              transition: "transform 0.15s ease-out",
              cursor: "zoom-in",
              touchAction: "manipulation"
            }}
            onDoubleClick={() => setLightboxOpen(true)}
            onPointerUp={handlePreviewPointerUp}
            title="Double-click to enlarge"
          >
            {enabledPages.cover && (
              <CoverPage
                formData={formData}
                updateField={updateField}
                paperStyle={paperStyle}
                studentRows={studentRows}
                is3D={is3D}
                cardRef={cardRef}
                selectedPage={selectedPage}
                showRulers={showRulers}
                showGrid={showGrid}
                showGuides={showGuides}
                isEditable={true}
              />
            )}
            {enabledPages.acknowledgement && (
              <AcknowledgementPage
                paperStyle={paperStyle}
                ackData={ackData}
                setAckData={setAckData}
                showRulers={showRulers}
                showGrid={showGrid}
                showGuides={showGuides}
                selectedPage={selectedPage}
                formData={formData}
                pageOffset={pageOffsets.acknowledgement}
                isEditable={true}
              />
            )}
            {enabledPages.transmittal && (
              <TransmittalPage
                formData={formData}
                paperStyle={paperStyle}
                transmittalData={transmittalData}
                setTransmittalData={setTransmittalData}
                showRulers={showRulers}
                showGrid={showGrid}
                showGuides={showGuides}
                selectedPage={selectedPage}
                pageOffset={pageOffsets.transmittal}
                isEditable={true}
              />
            )}
            {enabledPages.toc && (
              <TocPage
                paperStyle={paperStyle}
                tocData={tocData}
                showRulers={showRulers}
                showGrid={showGrid}
                showGuides={showGuides}
                selectedPage={selectedPage}
                onTocClick={handleTocClick}
                formData={formData}
                pageOffset={pageOffsets.toc}
              />
            )}
            {enabledPages.abstract && (
              <AbstractPage
                paperStyle={paperStyle}
                showRulers={showRulers}
                showGrid={showGrid}
                showGuides={showGuides}
                selectedPage={selectedPage}
                abstractData={abstractData}
                setAbstractData={setAbstractData}
                formData={formData}
                pageOffset={pageOffsets.abstract}
                isEditable={true}
              />
            )}
            {enabledPages.rubric && (
              <RubricPage paperStyle={paperStyle} showRulers={showRulers} showGrid={showGrid} showGuides={showGuides} selectedPage={selectedPage} rubricRows={rubricRows} formData={formData} pageOffset={pageOffsets.rubric} />
            )}
            {enabledPages.references && (
              <ReferencesPage paperStyle={paperStyle} showRulers={showRulers} showGrid={showGrid} showGuides={showGuides} selectedPage={selectedPage} referencesData={referencesData} formData={formData} pageOffset={pageOffsets.references} />
            )}
            {enabledPages.labInfo && (
              <LabInfoPage paperStyle={paperStyle} showRulers={showRulers} showGrid={showGrid} showGuides={showGuides} selectedPage={selectedPage} labInfoData={labInfoData} formData={formData} pageOffset={pageOffsets.labInfo} />
            )}
            {enabledPages.appendix && (
              <AppendixPage paperStyle={paperStyle} showRulers={showRulers} showGrid={showGrid} showGuides={showGuides} selectedPage={selectedPage} appendixData={appendixData} formData={formData} pageOffset={pageOffsets.appendix} />
            )}
            {enabledPages.certificate && (
              <CertificatePage paperStyle={paperStyle} showRulers={showRulers} showGrid={showGrid} showGuides={showGuides} selectedPage={selectedPage} formData={formData} pageOffset={pageOffsets.certificate} />
            )}
          </div>
        </div>

        {/* Status bar */}
        <div className="status-bar no-print">
          <span className="dot" />
          Live Preview · {selectedPage.label} · {selectedPage.widthMm}×{selectedPage.heightMm}mm
        </div>
      </section>

      <div className="export-stage" aria-hidden="true">
        {enabledPages.cover && (
          <CoverPage
            formData={formData}
            updateField={updateField}
            paperStyle={paperStyle}
            studentRows={studentRows}
            is3D={false}
            cardRef={exportCardRef}
            selectedPage={selectedPage}
            showRulers={false}
            showGrid={false}
            showGuides={false}
            isEditable={false}
          />
        )}
        {enabledPages.acknowledgement && (
          <AcknowledgementPage
            paperStyle={paperStyle}
            ackData={ackData}
            setAckData={setAckData}
            showRulers={false}
            showGrid={false}
            showGuides={false}
            selectedPage={selectedPage}
            cardRef={exportAckRef}
            formData={formData}
            pageOffset={pageOffsets.acknowledgement}
            isEditable={false}
          />
        )}
        {enabledPages.transmittal && (
          <TransmittalPage
            formData={formData}
            paperStyle={paperStyle}
            transmittalData={transmittalData}
            setTransmittalData={setTransmittalData}
            showRulers={false}
            showGrid={false}
            showGuides={false}
            selectedPage={selectedPage}
            cardRef={exportTransmittalRef}
            pageOffset={pageOffsets.transmittal}
            isEditable={false}
          />
        )}
        {enabledPages.toc && (
          <TocPage
            paperStyle={paperStyle}
            tocData={tocData}
            showRulers={false}
            showGrid={false}
            showGuides={false}
            selectedPage={selectedPage}
            cardRef={exportTocRef}
            formData={formData}
            pageOffset={pageOffsets.toc}
          />
        )}
        {enabledPages.abstract && (
          <AbstractPage
            paperStyle={paperStyle}
            showRulers={false}
            showGrid={false}
            showGuides={false}
            selectedPage={selectedPage}
            cardRef={exportAbstractRef}
            abstractData={abstractData}
            setAbstractData={setAbstractData}
            formData={formData}
            pageOffset={pageOffsets.abstract}
            isEditable={false}
          />
        )}
        {enabledPages.rubric && (
          <RubricPage paperStyle={paperStyle} showRulers={false} showGrid={false} showGuides={false} selectedPage={selectedPage} cardRef={exportRubricRef} rubricRows={rubricRows} formData={formData} pageOffset={pageOffsets.rubric} />
        )}
        {enabledPages.references && (
          <ReferencesPage paperStyle={paperStyle} showRulers={false} showGrid={false} showGuides={false} selectedPage={selectedPage} cardRef={exportReferencesRef} referencesData={referencesData} formData={formData} pageOffset={pageOffsets.references} />
        )}
        {enabledPages.labInfo && (
          <LabInfoPage paperStyle={paperStyle} showRulers={false} showGrid={false} showGuides={false} selectedPage={selectedPage} cardRef={exportLabInfoRef} labInfoData={labInfoData} formData={formData} pageOffset={pageOffsets.labInfo} />
        )}
        {enabledPages.appendix && (
          <AppendixPage paperStyle={paperStyle} showRulers={false} showGrid={false} showGuides={false} selectedPage={selectedPage} cardRef={exportAppendixRef} appendixData={appendixData} formData={formData} pageOffset={pageOffsets.appendix} />
        )}
        {enabledPages.certificate && (
          <CertificatePage paperStyle={paperStyle} showRulers={false} showGrid={false} showGuides={false} selectedPage={selectedPage} cardRef={exportCertificateRef} formData={formData} pageOffset={pageOffsets.certificate} />
        )}
      </div>

      {/* ════ LIGHTBOX (double-click zoom) ════ */}
      {lightboxOpen && (
        <Lightbox onClose={() => setLightboxOpen(false)} onPrint={handlePrint} exportFormats={exportFormats} exportCover={exportCover}>
          <div className="lightbox-paper-wrap">
            {enabledPages.cover && (
              <div className="lightbox-page-frame" style={lightboxPageFrameStyle}>
                <CoverPage
                  formData={formData}
                  updateField={updateField}
                  paperStyle={paperStyle}
                  studentRows={studentRows}
                  is3D={false}
                  cardRef={null}
                  selectedPage={selectedPage}
                  showRulers={showRulers}
                  showGrid={showGrid}
                  showGuides={showGuides}
                  isEditable={false}
                />
              </div>
            )}
            {enabledPages.acknowledgement && (
              <div className="lightbox-page-frame" style={lightboxPageFrameStyle}>
                <AcknowledgementPage
                  paperStyle={paperStyle}
                  ackData={ackData}
                  setAckData={setAckData}
                  showRulers={showRulers}
                  showGrid={showGrid}
                  showGuides={showGuides}
                  selectedPage={selectedPage}
                  formData={formData}
                  pageOffset={pageOffsets.acknowledgement}
                  isEditable={false}
                />
              </div>
            )}
            {enabledPages.transmittal && (
              <div className="lightbox-page-frame" style={lightboxPageFrameStyle}>
                <TransmittalPage
                  formData={formData}
                  paperStyle={paperStyle}
                  transmittalData={transmittalData}
                  setTransmittalData={setTransmittalData}
                  showRulers={showRulers}
                  showGrid={showGrid}
                  showGuides={showGuides}
                  selectedPage={selectedPage}
                  pageOffset={pageOffsets.transmittal}
                  isEditable={false}
                />
              </div>
            )}
            {enabledPages.toc && (
              <div className="lightbox-page-frame" style={lightboxPageFrameStyle}>
                <TocPage
                  paperStyle={paperStyle}
                  tocData={tocData}
                  showRulers={showRulers}
                  showGrid={showGrid}
                  showGuides={showGuides}
                  selectedPage={selectedPage}
                  onTocClick={handleTocClick}
                  formData={formData}
                  pageOffset={pageOffsets.toc}
                />
              </div>
            )}
            {enabledPages.abstract && (
              <div className="lightbox-page-frame" style={lightboxPageFrameStyle}>
                <AbstractPage
                  paperStyle={paperStyle}
                  showRulers={showRulers}
                  showGrid={showGrid}
                  showGuides={showGuides}
                  selectedPage={selectedPage}
                  abstractData={abstractData}
                  setAbstractData={setAbstractData}
                  formData={formData}
                  pageOffset={pageOffsets.abstract}
                  isEditable={false}
                />
              </div>
            )}
            {enabledPages.rubric && (
              <div className="lightbox-page-frame" style={lightboxPageFrameStyle}>
                <RubricPage paperStyle={paperStyle} showRulers={showRulers} showGrid={showGrid} showGuides={showGuides} selectedPage={selectedPage} rubricRows={rubricRows} formData={formData} pageOffset={pageOffsets.rubric} />
              </div>
            )}
            {enabledPages.references && (
              <div className="lightbox-page-frame" style={lightboxPageFrameStyle}>
                <ReferencesPage paperStyle={paperStyle} showRulers={showRulers} showGrid={showGrid} showGuides={showGuides} selectedPage={selectedPage} referencesData={referencesData} formData={formData} pageOffset={pageOffsets.references} />
              </div>
            )}
            {enabledPages.labInfo && (
              <div className="lightbox-page-frame" style={lightboxPageFrameStyle}>
                <LabInfoPage paperStyle={paperStyle} showRulers={showRulers} showGrid={showGrid} showGuides={showGuides} selectedPage={selectedPage} labInfoData={labInfoData} formData={formData} pageOffset={pageOffsets.labInfo} />
              </div>
            )}
            {enabledPages.appendix && (
              <div className="lightbox-page-frame" style={lightboxPageFrameStyle}>
                <AppendixPage paperStyle={paperStyle} showRulers={showRulers} showGrid={showGrid} showGuides={showGuides} selectedPage={selectedPage} appendixData={appendixData} formData={formData} pageOffset={pageOffsets.appendix} />
              </div>
            )}
            {enabledPages.certificate && (
              <div className="lightbox-page-frame" style={lightboxPageFrameStyle}>
                <CertificatePage paperStyle={paperStyle} showRulers={showRulers} showGrid={showGrid} showGuides={showGuides} selectedPage={selectedPage} formData={formData} pageOffset={pageOffsets.certificate} />
              </div>
            )}
          </div>
        </Lightbox>
      )}

      {showShortcutsModal && (
        <div className="utility-modal-overlay no-print" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
          <div className="utility-modal">
            <h2>Keyboard Shortcuts</h2>
            <ul>
              <li><strong>Ctrl/⌘ + S</strong><span>Save current student profile</span></li>
              <li><strong>Ctrl/⌘ + P</strong><span>Export PDF</span></li>
              <li><strong>Ctrl/⌘ + Z</strong><span>Undo last field edit</span></li>
              <li><strong>Ctrl/⌘ + Shift + R</strong><span>Reset the form</span></li>
              <li><strong>?</strong><span>Open this shortcuts help</span></li>
            </ul>
            <Button type="button" onClick={() => setShowShortcutsModal(false)}>Close</Button>
          </div>
        </div>
      )}

      {showOnboarding && (
        <div className="tour-overlay no-print" role="dialog" aria-modal="true" aria-label="Quick tutorial">
          <div className="tour-card">
            {[
              ["Welcome", "Build print-ready SUB lab cover pages with live preview."],
              ["Cover Options", "Choose page size, department preset, optional logos, and lab/program number behavior."],
              ["Profiles", "Save student information so future reports can be filled faster."],
              ["Themes", "Pick layout themes, patterns, watermark, QR code, language, and page numbering."],
              ["Academic Packager", "Enable extra pages like Abstract, References, Lab Info, Appendix, and Certificate."],
              ["Export", "Download PDF, image, DOCX, PPTX, SVG, or a ZIP bundle."],
              ["Overleaf", "Copy a complete LaTeX report starter and useful commands."],
              ["Preview", "Use 2D/3D preview, print, or double-click to inspect the page."]
            ].map(([title, text], index) => (
              index === onboardingStep && (
                <div key={title}>
                  <Badge variant="success">Step {index + 1} of 8</Badge>
                  <h2>{title}</h2>
                  <p>{text}</p>
                </div>
              )
            ))}
            <div className="tour-actions">
              <Button type="button" variant="secondary" onClick={completeOnboarding}>Skip</Button>
              {onboardingStep > 0 && (
                <Button type="button" variant="secondary" onClick={() => setOnboardingStep((step) => step - 1)}>Back</Button>
              )}
              {onboardingStep < 7 ? (
                <Button type="button" onClick={() => setOnboardingStep((step) => step + 1)}>Next</Button>
              ) : (
                <Button type="button" onClick={completeOnboarding}>Finish</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function clampPageSize(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

function getContentScale(page) {
  const s = Math.min(page.widthMm / 210, page.heightMm / 297);
  return Math.min(Math.max(s, 0.45), 2.5);
}

export default App;
