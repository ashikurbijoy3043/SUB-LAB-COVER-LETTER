import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "./components/ui/card";

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
  experimentDate: "17 May 2026",
  teacherName: "SAKIB AL HASAN",
  teacherTitle: "Associate Professor",
  teacherDepartment: "Department of Computer Science and Engineering",
  submittedByName: "SAKIB AL HASAN",
  status: "Undergraduate Student",
  year: "3rd",
  semester: "1st",
  group: "",
  session: "",
  roll: "UG02-69-26-xxx",
  registration: "",
  submissionDate: "20 May 2026",
  showDepartmentLogo: false,
  departmentLogoUrl: CSE_IMAGE_URL
};

const optionalFields = new Set(["group", "session", "registration", "departmentLogoUrl"]);

function getExperimentNoLabel(formData) {
  return formData.departmentPreset === "cse" ? "Lab / Program No." : "Experiment No.";
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
    ["Course Code", formData.courseCode, false],
    ["Course Title", formData.courseTitle, false],
    [getExperimentNoLabel(formData), formData.experimentNo, formData.experimentNoOptional],
    ["Experiment Date", formData.experimentDate, false]
  ].filter(([, value, optional]) => !optional || value.trim());
}

const exportFormats = [
  { id: "pdf", label: "PDF", hint: "Best for direct submission" },
  { id: "png", label: "PNG image", hint: "Sharp image for sharing" },
  { id: "jpg", label: "JPG image", hint: "Small image file" },
  { id: "svg", label: "SVG vector", hint: "Editable vector preview" },
  { id: "docx", label: "Word DOCX", hint: "Editable Word cover" },
  { id: "pptx", label: "PowerPoint PPTX", hint: "Slide-ready cover" }
];

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

const hasDepartmentLogo = (f) => f.showDepartmentLogo && f.departmentLogoUrl.trim();

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
        new Table({
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
                  children: [
                    makeDocxParagraph(docx, "Submitted By:", { bold: true }),
                    new Table({
                      width: { size: 100, type: WidthType.PERCENTAGE },
                      rows: makeKeyValueRows(studentRows)
                    })
                  ]
                })
              ]
            })
          ]
        }),
        makeDocxParagraph(docx, `Date of Submission: ${formData.submissionDate}`, { alignment: AlignmentType.CENTER, bold: true, spacing: { before: 420, after: 420 } }),
        makeDocxParagraph(docx, formData.department, { alignment: AlignmentType.CENTER, bold: true, size: 20 }),
        makeDocxParagraph(docx, formData.university, { alignment: AlignmentType.CENTER, bold: true, size: 20 })
      ]
    }]
  });
}

function escapeLatex(value = "") {
  return String(value)
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
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
        \\begin{tabular}{rl}
${rows}
        \\end{tabular}
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
function Lightbox({ children, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Preview enlarged">
      <button className="lightbox-close" onClick={onClose} aria-label="Close enlarged preview">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div className="lightbox-hint">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        Double-click or press <kbd>Esc</kbd> to close
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
function CoverPage({ formData, paperStyle, studentRows, is3D, cardRef }) {
  return (
    <div className="paper" style={paperStyle} ref={cardRef}>
      {is3D && <div className="paper-glare" />}
      <div className="paper-texture" />
      <div className="paper-edge-left" />
      <div className="paper-edge-bottom" />
      <div className="paper-top-bar" />
      <div className="paper-bottom-bar" />
      <div className="paper-border-frame" />
      <div className="paper-watermark">SUB</div>

      <div className="title-block">
        <p>{formData.reportPrefix}</p>
        <h2>{formData.reportTitle}</h2>
      </div>

      <div className={`logos ${hasDepartmentLogo(formData) ? "" : "logos-single"}`}>
        <img src={SUB_LOGO_URL} alt="State University of Bangladesh logo" />
        {hasDepartmentLogo(formData) && (
          <img className="department-logo" src={formData.departmentLogoUrl} alt={`${formData.department} logo`} />
        )}
      </div>

      <div className="course-info">
        {getCourseRows(formData).map(([label, value]) => (
          <p key={label}><strong>{label}:</strong> {value}</p>
        ))}
      </div>

      <div className="section-divider"><span>Academic Submission</span></div>

      <div className="submission-grid">
        <div>
          <h3>Submitted To:</h3>
          <div className="rule" />
          <p className="person-name">{formData.teacherName}</p>
          <p><em>{formData.teacherTitle}</em></p>
          <p>{formData.teacherDepartment}</p>
          <p>{formData.university}</p>
        </div>
        <div>
          <h3>Submitted By:</h3>
          <div className="rule" />
          <dl>
            {studentRows.map(([label, value]) => (
              <div key={label}><dt>{label}:</dt><dd>{value}</dd></div>
            ))}
          </dl>
        </div>
      </div>

      <p className="date-line"><strong>Date of Submission:</strong> {formData.submissionDate}</p>

      <footer>
        <div className="footer-rule" />
        <p>{formData.department}</p>
        <p>{formData.university}</p>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════
   EDITOR FORM  — proper named component
   so React correctly re-renders on state
════════════════════════════════════ */
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
  exportCover
}) {
  const [commandQuery, setCommandQuery] = useState("");
  const [commandCategory, setCommandCategory] = useState("all");
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
      {fieldGroups.map((group) => (
        <div key={group.id} className={`accordion-item ${activeSection === group.id ? "active" : ""}`}>
          <button type="button" className="accordion-header" onClick={() => toggleSection(group.id)}>
            <span className="accordion-title-wrapper">{group.icon}<span>{group.title}</span></span>
            <svg className="accordion-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {activeSection === group.id && (
            <div className="accordion-content">
              {group.fields.map(([key, label]) => (
                <label key={key}>
                  <span>
                    {getFieldLabel(formData, key, label)}
                    {isOptionalField(formData, key) && <Badge>Optional</Badge>}
                    {isRequiredField(formData, key) && <Badge variant="success">Required</Badge>}
                  </span>
                  {key === "reportTitle"
                    ? <textarea value={formData[key]} onChange={(e) => updateField(key, e.target.value)} rows="3" />
                    : <input
                        value={formData[key]}
                        onChange={(e) => updateField(key, e.target.value)}
                        required={isRequiredField(formData, key)}
                        aria-required={isRequiredField(formData, key)}
                      />}
                </label>
              ))}
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

            <p className="form-hint">
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
    </form>
  );
}

/* ════════════════════════════════════
   MAIN APP
════════════════════════════════════ */
function App() {
  const [formData, setFormData] = useState(defaultData);
  const cardRef = useRef(null);
  const exportCardRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [is3D, setIs3D] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [activeSection, setActiveSection] = useState("report");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState("editor");

  useParticles(canvasRef);

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

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const isMobilePreview = window.matchMedia("(max-width: 768px)").matches;
      const cW = containerRef.current.clientWidth - (isMobilePreview ? 24 : 48);
      const cH = containerRef.current.clientHeight - (isMobilePreview ? 132 : 80);
      const pW = 794 * (selectedPage.widthMm  / 210);
      const pH = 794 * (selectedPage.heightMm / 210);
      let s = Math.min(cW / pW, cH / pH);
      if (formData.previewMode === "large" && !isMobilePreview) s = cW / pW;
      setScaleFactor(Math.min(Math.max(s, 0.12), 1.05));
    };
    const frame = requestAnimationFrame(handleResize);
    window.addEventListener("resize", handleResize);
    const obs = new ResizeObserver(handleResize);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", handleResize); obs.disconnect(); };
  }, [selectedPage.widthMm, selectedPage.heightMm, formData.previewMode, mobileTab]);

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

  // Single paperStyle — used for both preview and lightbox
  const paperStyle = useMemo(() => ({
    "--content-scale": getContentScale(selectedPage),
    "--paper-width-px":  `${794 * (selectedPage.widthMm  / 210)}px`,
    "--paper-height-px": `${794 * (selectedPage.heightMm / 210)}px`,
    width:  "var(--paper-width-px)",
    height: "var(--paper-height-px)"
  }), [selectedPage]);

  const studentRows = useMemo(() => [
    ["Name",     formData.submittedByName],
    ["Status",   formData.status],
    ["Year",     formData.year],
    ["Semester", formData.semester],
    ["Group",    formData.group],
    ["Session",  formData.session],
    ["Roll No.", formData.roll],
    ["Reg. No.", formData.registration]
  ].filter(([,v]) => v.trim()), [formData]);

  const overleafCode = useMemo(
    () => buildOverleafDocument(formData, studentRows, selectedPage, selectedTemplate),
    [formData, studentRows, selectedPage, selectedTemplate]
  );

  function updateField(k, v) {
    setFormData((c) => {
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
  function resetForm() { setFormData(defaultData); }
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

  async function exportCover(format) {
    const baseName = getExportBaseName(formData);
    const label = exportFormats.find((item) => item.id === format)?.label ?? format.toUpperCase();

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
        const { jsPDF } = await import("jspdf");
        const image = await getCoverImageDataUrl("png", 2.4);
        const pdf = new jsPDF({
          orientation: selectedPage.widthMm > selectedPage.heightMm ? "landscape" : "portrait",
          unit: "mm",
          format: [selectedPage.widthMm, selectedPage.heightMm]
        });
        pdf.addImage(image, "PNG", 0, 0, selectedPage.widthMm, selectedPage.heightMm);
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
          <p className="eyebrow">SUB Lab Report</p>
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
          <div className="toolbar-divider" />
          <button type="button" className="toolbar-btn" onClick={handlePrint} title="Print or save as PDF">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
            </svg>
            Print
          </button>
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
              cursor: "zoom-in"
            }}
            onDoubleClick={() => setLightboxOpen(true)}
            title="Double-click to enlarge"
          >
            <CoverPage
              formData={formData}
              paperStyle={paperStyle}
              studentRows={studentRows}
              is3D={is3D}
              cardRef={cardRef}
            />
          </div>
        </div>

        {/* Status bar */}
        <div className="status-bar no-print">
          <span className="dot" />
          Live Preview · {selectedPage.label} · {selectedPage.widthMm}×{selectedPage.heightMm}mm
        </div>
      </section>

      <div className="export-stage" aria-hidden="true">
        <CoverPage
          formData={formData}
          paperStyle={paperStyle}
          studentRows={studentRows}
          is3D={false}
          cardRef={exportCardRef}
        />
      </div>

      {/* ════ LIGHTBOX (double-click zoom) ════ */}
      {lightboxOpen && (
        <Lightbox onClose={() => setLightboxOpen(false)}>
          <div className="lightbox-paper-wrap">
            <CoverPage
              formData={formData}
              paperStyle={paperStyle}
              studentRows={studentRows}
              is3D={false}
              cardRef={null}
            />
          </div>
        </Lightbox>
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
