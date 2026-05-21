# SUB Lab Report Cover Page Generator

Professional lab report cover page and academic document generator for students of State University of Bangladesh (SUB).

[![React](https://img.shields.io/badge/React-UI-149eca?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Build-646cff?style=for-the-badge&logo=vite)](https://vite.dev/)
[![License](https://img.shields.io/badge/License-MIT-16a34a?style=for-the-badge)](#license)
[![Live Demo](https://img.shields.io/badge/Live-Demo-2563eb?style=for-the-badge)](https://ashikurbijoy3043.github.io/SUB-LAB-COVER-LETTER/)

## Overview

SUB Lab Report Cover Page Generator is a browser-based React application that helps students create clean, branded, print-ready lab report cover pages and starter academic documents. It supports official SUB branding, multiple department presets, live page preview, advanced cover customization, Overleaf/LaTeX helpers, and exports to PDF, image, Word, PowerPoint, SVG, and ZIP.

Live application: [https://ashikurbijoy3043.github.io/SUB-LAB-COVER-LETTER/](https://ashikurbijoy3043.github.io/SUB-LAB-COVER-LETTER/)

<p align="center">
  <img src="public/sub-logo.jpg" alt="State University of Bangladesh logo" width="180" />
</p>

## Table of Contents

- [Highlights](#highlights)
- [What You Can Generate](#what-you-can-generate)
- [Export Options](#export-options)
- [Department Support](#department-support)
- [Overleaf Builder](#overleaf-builder)
- [Smart Editor Tools](#smart-editor-tools)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Privacy](#privacy)
- [Deployment](#deployment)
- [Credits](#credits)
- [License](#license)

## Highlights

- Official SUB cover page layout with university branding.
- Department presets with local logo assets for major SUB departments.
- Real-time A4-style live preview with mobile edit/preview tabs.
- Custom page sizes: A4, A5, Letter, Legal, and manual dimensions.
- CSE-friendly **Lab / Program No.** label with optional/required behavior.
- Multi-page academic packager for complete report front matter.
- Export to PDF, PNG, JPG, SVG, DOCX, PPTX, and ZIP.
- Overleaf-ready LaTeX generator with searchable command snippets.
- Bengali and English cover labels.
- Student profile saving, group mode, signature upload, and signature drawing.
- Smart validation, required-field highlighting, auto-save restore, deadline countdown, and onboarding.

## What You Can Generate

The app can generate more than a single cover page. Students can build a complete academic starter package:

- Cover Page
- Acknowledgement
- Letter of Transmittal
- Table of Contents
- Abstract
- References
- Lab Partner & Equipment / Lab Information
- Appendix Divider
- Certificate of Originality
- Teacher Grading Rubric & Feedback

## Cover Customization

The cover page can be customized without editing code:

- Department preset and optional department logo
- Custom university/report logo
- Custom signature upload or drawn signature
- Layout theme selection
- Accent color picker
- Heading and body font pairing
- Background pattern: plain, dots, lines, crosshatch, or grid
- Custom banner/header image
- Dark cover mode
- Watermark or draft stamp
- QR code in the cover corner
- Page numbering style: Arabic, Roman, or none

## Export Options

| Format | Best For |
| --- | --- |
| PDF | Direct submission, printing, and final sharing |
| PNG | High-quality image sharing |
| JPG | Smaller image file export |
| SVG | Vector-style cover output |
| DOCX | Editable Microsoft Word cover page |
| PPTX | Presentation or slide-ready cover |
| ZIP | PDF, DOCX, and `main.tex` bundled together |

## Department Support

Built-in presets currently include:

- Computer Science and Engineering
- Architecture
- Business Studies
- English Studies
- Environmental Science
- Food Engineering and Nutrition Science
- Journalism, Communication and Media Studies
- Law
- Pharmacy
- Public Health
- Custom department

Custom departments can use a manually entered department name and optional logo URL or uploaded logo.

## Overleaf Builder

The Overleaf Builder helps students move from cover page generation to full report writing:

- Generates a complete `main.tex` starter document.
- Builds department-specific report sections.
- Provides a cover-only LaTeX block.
- Includes quick LaTeX snippets for figures, tables, equations, code blocks, chemistry, charts, references, appendices, and procedures.
- Supports copy and download actions with SweetAlert feedback.

## Smart Editor Tools

- Live preview updates while typing.
- Auto-save with restore prompt.
- Single-step undo for field edits.
- Required-field validation before export.
- Red highlight for missing required fields.
- Word counters for report title, acknowledgement, transmittal, and abstract.
- Optional submission deadline countdown.
- First-visit onboarding tour.
- Student profiles with import/export.
- Quick-fill example profiles.
- Group submission mode.
- Print preview modal with margin guide support.

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl` / `Command` + `S` | Save current student profile |
| `Ctrl` / `Command` + `P` | Export PDF |
| `Ctrl` / `Command` + `Z` | Undo last field edit |
| `Ctrl` / `Command` + `Shift` + `R` | Reset form |
| `?` | Open keyboard shortcut help |

## Getting Started

### Requirements

- Node.js 20 or newer recommended
- npm

### Install and Run

```bash
git clone https://github.com/ashikurbijoy3043/SUB-LAB-COVER-LETTER.git
cd SUB-LAB-COVER-LETTER
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```text
.
├── public/              # SUB and department logo assets
├── src/
│   ├── components/ui/   # shadcn-style reusable UI primitives
│   ├── lib/             # Utility helpers
│   ├── App.jsx          # Main application logic and UI
│   ├── main.jsx         # React entry point
│   └── styles.css       # App, preview, print, and responsive styles
├── index.html
├── package.json
└── vite.config.js
```

## Tech Stack

- React
- Vite
- Vanilla CSS with responsive and print-specific styling
- shadcn-style UI primitives
- SweetAlert2
- html2canvas
- html-to-image
- jsPDF
- docx
- PptxGenJS
- JSZip
- Lucide icons

## Privacy

This app is designed as a client-side tool. Form editing, previewing, and exports run in the browser. Student profile saving and auto-save use the browser's local storage on the user's own device.

## Deployment

The project can be deployed to GitHub Pages, Vercel, Netlify, Cloudflare Pages, or any static hosting provider.

### GitHub Pages

```bash
npm run deploy
```

### Generic Static Hosting

```bash
npm run build
```

Then deploy the generated `dist/` directory.

## Quality Checks

Before publishing changes:

```bash
npm run build
```

Recommended manual checks:

- Open the app locally.
- Verify the cover preview renders.
- Enable extra academic pages.
- Try PDF and image export.
- Check mobile edit/preview tabs.
- Confirm logos load correctly.

## Credits

- Built for students of State University of Bangladesh.
- University and department logo assets are based on public SUB resources from [sub.ac.bd](https://www.sub.ac.bd).
- Icon set from [Lucide](https://lucide.dev).

## License

MIT License. Free to use, modify, and share.
