import { useMemo, useState, useRef, useEffect, useCallback } from "react";

const SUB_LOGO_URL = "https://www.sub.ac.bd/uploads/logo/cdcbff91d69b664eef72.jpg";
const CSE_IMAGE_URL = "https://www.sub.ac.bd/uploads/department/a2149fac87112b19d2ad.jpg";

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

const pageSizes = [
  { id: "a4",     label: "A4",     widthMm: 210, heightMm: 297 },
  { id: "letter", label: "Letter", widthMm: 216, heightMm: 279 },
  { id: "legal",  label: "Legal",  widthMm: 216, heightMm: 356 },
  { id: "a5",     label: "A5",     widthMm: 148, heightMm: 210 },
  { id: "custom", label: "Custom", widthMm: 210, heightMm: 297 }
];

const departments = [
  { id: "architecture",        label: "Architecture",                          logoUrl: "https://www.sub.ac.bd/uploads/department/e435a8d703c649c9bc41.jpg" },
  { id: "business-studies",    label: "Business Studies",                      logoUrl: "https://www.sub.ac.bd/uploads/department/cb94f2ee37f713473e6f.jpg" },
  { id: "cse",                 label: "Computer Science and Engineering",       logoUrl: CSE_IMAGE_URL },
  { id: "english-studies",     label: "English Studies",                        logoUrl: "https://www.sub.ac.bd/uploads/department/e9a37aac8fada78655e3.jpg" },
  { id: "environmental-science", label: "Environmental Science",               logoUrl: "https://www.sub.ac.bd/uploads/department/5dde26b7fbe3a4786046.jpg" },
  { id: "food-engineering",    label: "Food Engineering and Nutrition Science", logoUrl: "https://www.sub.ac.bd/uploads/department/0531c77c74134ff49c15.jpg" },
  { id: "journalism",          label: "Journalism, Communication and Media Studies", logoUrl: "https://www.sub.ac.bd/uploads/department/8785f6f3c0d63dbea3af.jpg" },
  { id: "law",                 label: "Law",                                   logoUrl: "https://www.sub.ac.bd/uploads/department/45aa41cdbccd45cddb16.jpg" },
  { id: "pharmacy",            label: "Pharmacy",                              logoUrl: "https://www.sub.ac.bd/uploads/department/a49148f4a236041b563d.JPG" },
  { id: "public-health",       label: "Public Health",                         logoUrl: "https://www.sub.ac.bd/uploads/department/cdaa54b85e45d0abe356.jpg" },
  { id: "custom",              label: "Custom department",                     logoUrl: "" }
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
    fields: [["university","University name"],["department","Department name"]]
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
        <p><strong>Course Code:</strong> {formData.courseCode}</p>
        <p><strong>Course Title:</strong> {formData.courseTitle}</p>
        <p><strong>Experiment No.:</strong> {formData.experimentNo}</p>
        <p><strong>Experiment Date:</strong> {formData.experimentDate}</p>
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
function EditorForm({ formData, activeSection, toggleSection, updateField, updateDepartmentPreset, selectedPage }) {
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
            {formData.showDepartmentLogo && (
              <label><span>Department logo URL <small>Optional</small></span>
                <input value={formData.departmentLogoUrl} onChange={(e) => updateField("departmentLogoUrl", e.target.value)} placeholder="Paste image URL…" />
              </label>
            )}
            <p className="form-hint">Preview updates live. Page: <strong>{selectedPage.label} ({selectedPage.widthMm}×{selectedPage.heightMm}mm)</strong></p>
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
                  <span>{label}{optionalFields.has(key) && <small>Optional</small>}</span>
                  {key === "reportTitle"
                    ? <textarea value={formData[key]} onChange={(e) => updateField(key, e.target.value)} rows="3" />
                    : <input value={formData[key]} onChange={(e) => updateField(key, e.target.value)} />}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}

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

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const cW = containerRef.current.clientWidth  - 48;
      const cH = containerRef.current.clientHeight - 80;
      const pW = 794 * (selectedPage.widthMm  / 210);
      const pH = 794 * (selectedPage.heightMm / 210);
      let s = Math.min(cW / pW, cH / pH);
      if (formData.previewMode === "large") s = cW / pW;
      setScaleFactor(Math.max(s, 0.12));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    const obs = new ResizeObserver(handleResize);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => { window.removeEventListener("resize", handleResize); obs.disconnect(); };
  }, [selectedPage.widthMm, selectedPage.heightMm, formData.previewMode]);

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

  function updateField(k, v) { setFormData((c) => ({ ...c, [k]: v })); }
  function updateDepartmentPreset(v) {
    const d = departments.find((x) => x.id === v);
    setFormData((c) => {
      if (!d || d.id === "custom") return { ...c, departmentPreset: "custom" };
      const dn = `Department of ${d.label}`;
      return { ...c, departmentPreset: v, department: dn, teacherDepartment: dn, departmentLogoUrl: d.logoUrl };
    });
  }
  function resetForm() { setFormData(defaultData); }
  function handlePrint() { setTimeout(() => window.print(), 60); }

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
            <button type="button" id="print-btn" onClick={handlePrint}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
              </svg>
              Print / Save PDF
            </button>
            <button type="button" className="secondary" onClick={resetForm}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3" />
              </svg>
              Reset
            </button>
          </div>

          <EditorForm
            formData={formData}
            activeSection={activeSection}
            toggleSection={toggleSection}
            updateField={updateField}
            updateDepartmentPreset={updateDepartmentPreset}
            selectedPage={selectedPage}
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
