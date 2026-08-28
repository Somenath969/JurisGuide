import pptxgen from 'pptxgenjs';
import { writeFileSync, mkdirSync } from 'fs';

const pptx = new pptxgen();

// ─── Theme ───────────────────────────────────────────────────
const NAVY_DARK = '0D1F3D';
const NAVY_MID = '152E52';
const NAVY_LIGHT = '1E3D6A';
const GOLD = 'D4A82F';
const GOLD_LIGHT = 'EEDA87';
const WHITE = 'FFFFFF';
const NAVY_50 = 'F0F4FA';
const GRAY_TEXT = '5A6B80';
const GRAY_LIGHT = 'DBE5F3';
const RED_ACCENT = 'C0392B';
const GREEN_ACCENT = '27AE60';

pptx.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'WIDE';
pptx.author = 'JurisGuide Team';
pptx.title = 'JurisGuide - AI-Powered Legal Companion';
pptx.subject = 'Legal Information Platform';

// ─── Helpers ─────────────────────────────────────────────────
function addSlideBg(slide) {
  slide.background = { color: NAVY_DARK };
}

function addTag(slide, text) {
  slide.addText(text, {
    x: 0.6, y: 0.35, w: 3, h: 0.35,
    fontSize: 10, fontFace: 'Inter',
    color: GOLD, bold: true,
    align: 'left', valign: 'middle',
  });
}

function addTitle(slide, text, y = 0.7) {
  slide.addText(text, {
    x: 0.6, y, w: 12, h: 0.55,
    fontSize: 28, fontFace: 'Inter',
    color: WHITE, bold: true,
    align: 'left', valign: 'middle',
  });
}

function addSubtitle(slide, text, y = 1.25) {
  slide.addText(text, {
    x: 0.6, y, w: 11, h: 0.4,
    fontSize: 14, fontFace: 'Inter',
    color: GRAY_LIGHT,
    align: 'left', valign: 'top',
  });
}

function addCard(slide, x, y, w, h, opts) {
  slide.addShape('roundRect', {
    x, y, w, h,
    fill: { color: NAVY_MID },
    line: { color: NAVY_LIGHT, width: 1 },
    rectRadius: 0.1,
    ...opts,
  });
}

function addFlowArrow(slide, x, y, vertical = true) {
  slide.addText(vertical ? '↓' : '→', {
    x: x - 0.15, y, w: 0.3, h: 0.3,
    fontSize: 14, color: GOLD, align: 'center', valign: 'middle',
    fontFace: 'Inter',
  });
}

function addSlideNumber(slide, num) {
  slide.addText(`${String(num).padStart(2, '0')} / 15`, {
    x: 11.8, y: 7.0, w: 1.2, h: 0.3,
    fontSize: 9, fontFace: 'Inter', color: GRAY_TEXT,
    align: 'right', valign: 'middle',
  });
}

// ══════════════════════════════════════════════════════════════
// SLIDE 1 — TITLE
// ══════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addSlideBg(slide);

  // Decorative circles
  slide.addShape('ellipse', { x: -1, y: -1, w: 3, h: 3, fill: { color: NAVY_LIGHT, transparency: 80 }, line: { type: 'none' } });
  slide.addShape('ellipse', { x: 9, y: 4, w: 5, h: 5, fill: { color: GOLD, transparency: 92 }, line: { type: 'none' } });

  // Logo circle
  slide.addShape('roundRect', { x: 5.17, y: 1.2, w: 3, h: 3, fill: { color: NAVY_LIGHT }, line: { color: GOLD, width: 1.5 }, rectRadius: 0.3 });
  slide.addText('⚖', { x: 5.17, y: 1.2, w: 3, h: 3, fontSize: 60, color: GOLD, align: 'center', valign: 'middle' });

  // Title
  slide.addText('Juris', { x: 0, y: 4.3, w: 13.333, h: 0.8, fontSize: 48, fontFace: 'Inter', color: WHITE, bold: true, align: 'center' });
  slide.addText('Guide', { x: 0, y: 4.3, w: 13.333, h: 0.8, fontSize: 48, fontFace: 'Inter', color: GOLD, bold: true, align: 'center' });
  // Actually combine them
  slide.addText([
    { text: 'Juris', options: { color: WHITE, bold: true } },
    { text: 'Guide', options: { color: GOLD, bold: true } },
  ], { x: 0, y: 4.2, w: 13.333, h: 0.8, fontSize: 48, fontFace: 'Inter', align: 'center' });

  slide.addText('Making Legal Information Simple, Accessible and Understandable', {
    x: 1, y: 5.1, w: 11.333, h: 0.5,
    fontSize: 16, fontFace: 'Inter', color: GRAY_LIGHT,
    align: 'center', valign: 'middle',
  });

  // Feature badges
  const badges = ['📄 Legal Documents', '🤖 AI Analysis', '⚖ Rights & Duties', '🌐 Multilingual'];
  badges.forEach((badge, i) => {
    slide.addText(badge, {
      x: 2.5 + i * 2.2, y: 5.9, w: 2, h: 0.4,
      fontSize: 11, fontFace: 'Inter', color: GRAY_LIGHT,
      align: 'center', valign: 'middle',
      fill: { color: NAVY_MID, transparency: 50 },
      line: { color: NAVY_LIGHT, width: 1 },
      rectRadius: 0.2,
    });
  });

  slide.addText('AI-Powered Legal Assistance Platform', {
    x: 0, y: 6.8, w: 13.333, h: 0.3,
    fontSize: 10, fontFace: 'Inter', color: GRAY_TEXT,
    align: 'center', valign: 'middle',
  });
  addSlideNumber(slide, 1);
}

// ══════════════════════════════════════════════════════════════
// SLIDE 2 — THE REAL-WORLD PROBLEM
// ══════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addTag(slide, '⚠  THE PROBLEM');
  addTitle(slide, 'People struggle to understand legal documents');
  addSubtitle(slide, 'A person receives a property agreement full of complicated legal terms. They sign it without fully understanding the conditions.');

  // Scenario card (left)
  addCard(slide, 0.6, 1.9, 5.5, 4.8, { line: { color: GOLD, width: 1 } });
  slide.addText('A Real Scenario', { x: 0.8, y: 2.05, w: 5, h: 0.35, fontSize: 13, fontFace: 'Inter', color: GOLD, bold: true });

  const steps = [
    { num: '1', text: 'Receives a 15-page property agreement', color: NAVY_LIGHT },
    { num: '2', text: 'Cannot understand legal terminology', color: NAVY_LIGHT },
    { num: '3', text: 'Signs without knowing the full implications', color: RED_ACCENT },
  ];
  steps.forEach((step, i) => {
    const sy = 2.5 + i * 0.9;
    slide.addShape('roundRect', { x: 0.85, y: sy, w: 0.35, h: 0.35, fill: { color: step.color }, line: { type: 'none' }, rectRadius: 0.05 });
    slide.addText(step.num, { x: 0.85, y: sy, w: 0.35, h: 0.35, fontSize: 11, color: GOLD, bold: true, align: 'center', valign: 'middle' });
    slide.addText(step.text, { x: 1.35, y: sy, w: 4.5, h: 0.35, fontSize: 11, fontFace: 'Inter', color: GRAY_LIGHT, valign: 'middle' });
    if (i < 2) addFlowArrow(slide, 1.0, sy + 0.4);
  });

  slide.addShape('roundRect', { x: 0.85, y: 5.2, w: 4.8, h: 0.6, fill: { color: RED_ACCENT, transparency: 75 }, line: { color: RED_ACCENT, width: 1 }, rectRadius: 0.08 });
  slide.addText('Consequence: Hidden clauses, financial risk, or missed obligations', {
    x: 1, y: 5.2, w: 4.5, h: 0.6, fontSize: 10, fontFace: 'Inter', color: 'F1948A', valign: 'middle',
  });

  // Problems grid (right)
  const problems = [
    'Complex legal language in contracts',
    'Lack of legal awareness',
    'Difficulty understanding clauses',
    'Finding reliable information is hard',
    'Language barriers prevent understanding',
    'Confusion about court procedures',
    'Fear of missing court dates',
    'Unaware of rights, duties & consequences',
  ];
  problems.forEach((p, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    addCard(slide, 6.5 + col * 3.1, 1.9 + row * 1.2, 2.9, 1.0);
    slide.addText('•', { x: 6.6 + col * 3.1, y: 1.95 + row * 1.2, w: 0.2, h: 0.3, fontSize: 14, color: GOLD, valign: 'top' });
    slide.addText(p, { x: 6.8 + col * 3.1, y: 1.95 + row * 1.2, w: 2.5, h: 0.9, fontSize: 10, fontFace: 'Inter', color: GRAY_LIGHT, valign: 'middle' });
  });
  addSlideNumber(slide, 2);
}

// ══════════════════════════════════════════════════════════════
// SLIDE 3 — WHY THIS PROBLEM MATTERS
// ══════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addTag(slide, '💡  WHY IT MATTERS');
  addTitle(slide, 'The real-world impact of legal confusion');

  const impacts = [
    'People may sign documents without understanding them',
    'Important conditions and hidden clauses can be overlooked',
    'People depend on unreliable online information or hearsay',
    'Legal procedures feel confusing and intimidating',
    'Language becomes a barrier to accessing legal help',
    'People may not know their basic rights and responsibilities',
  ];

  impacts.forEach((impact, i) => {
    const y = 1.8 + i * 0.7;
    addCard(slide, 0.6, y, 6.5, 0.55);
    slide.addShape('roundRect', { x: 0.75, y: y + 0.08, w: 0.4, h: 0.4, fill: { color: GOLD, transparency: 85 }, line: { color: GOLD, width: 1 }, rectRadius: 0.05 });
    slide.addText(String(i + 1), { x: 0.75, y: y + 0.08, w: 0.4, h: 0.4, fontSize: 11, color: GOLD, bold: true, align: 'center', valign: 'middle' });
    slide.addText(impact, { x: 1.3, y, w: 5.7, h: 0.55, fontSize: 12, fontFace: 'Inter', color: GRAY_LIGHT, valign: 'middle' });
  });

  // Key insight card
  addCard(slide, 7.5, 1.8, 5.2, 4.5, { line: { color: GOLD, width: 1.5 }, fill: { color: NAVY_MID } });
  slide.addText('✨', { x: 7.7, y: 2.0, w: 0.5, h: 0.4, fontSize: 20, align: 'center' });
  slide.addText('The Key Insight', { x: 8.2, y: 2.0, w: 4, h: 0.4, fontSize: 13, fontFace: 'Inter', color: GOLD, bold: true, valign: 'middle' });
  slide.addText('"People do not always need more legal information; they need legal information explained in a way they can understand."', {
    x: 7.8, y: 2.6, w: 4.6, h: 2.5,
    fontSize: 15, fontFace: 'Inter', color: WHITE, bold: true, valign: 'top', lineSpacingMultiple: 1.4,
  });
  slide.addShape('roundRect', { x: 7.8, y: 5.3, w: 1.2, h: 0.04, fill: { color: GOLD }, line: { type: 'none' } });
  slide.addText('This is what JurisGuide aims to solve', {
    x: 7.8, y: 5.5, w: 4.6, h: 0.3, fontSize: 10, fontFace: 'Inter', color: GRAY_TEXT,
  });
  addSlideNumber(slide, 3);
}

// ══════════════════════════════════════════════════════════════
// SLIDE 4 — OUR SOLUTION
// ══════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addTag(slide, '✨  OUR SOLUTION');
  addTitle(slide, 'JurisGuide: One platform for legal understanding');
  addSubtitle(slide, 'A single digital platform combining AI document analysis, legal chatbot, multilingual support, and legal domain guidance.');

  // Central hub
  slide.addShape('ellipse', { x: 5.17, y: 2.0, w: 3, h: 3, fill: { color: NAVY_LIGHT }, line: { color: GOLD, width: 2 } });
  slide.addText('⚖', { x: 5.17, y: 2.1, w: 3, h: 1.2, fontSize: 40, color: GOLD, align: 'center', valign: 'middle' });
  slide.addText('JurisGuide', { x: 5.17, y: 3.2, w: 3, h: 0.5, fontSize: 16, fontFace: 'Inter', color: WHITE, bold: true, align: 'center' });

  // Feature cards around hub
  const features = [
    { label: 'AI Document\nUnderstanding', x: 0.6, y: 1.8 },
    { label: 'Legal\nChatbot', x: 0.6, y: 3.6 },
    { label: 'Multilingual\nExplanations', x: 0.6, y: 5.4 },
    { label: 'Crime &\nPunishment', x: 9.7, y: 1.8 },
    { label: 'Court\nGuidance', x: 9.7, y: 3.6 },
    { label: 'Court\nReminders', x: 9.7, y: 5.4 },
    { label: 'Secure\nStorage', x: 3.3, y: 5.6 },
    { label: 'Legal Domain\nSelection', x: 6.7, y: 5.6 },
  ];

  features.forEach((f) => {
    addCard(slide, f.x, f.y, 2.6, 0.9);
    slide.addText(f.label, { x: f.x, y: f.y, w: 2.6, h: 0.9, fontSize: 10, fontFace: 'Inter', color: GRAY_LIGHT, align: 'center', valign: 'middle', lineSpacingMultiple: 1.2 });
  });
  addSlideNumber(slide, 4);
}

// ══════════════════════════════════════════════════════════════
// SLIDE 5 — USER JOURNEY
// ══════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addTag(slide, '👥  USER JOURNEY');
  addTitle(slide, 'How a citizen uses JurisGuide');

  const steps = [
    'Register / Login',
    'Select Language',
    'Select Legal Domain',
    'Upload / Scan Document or Ask a Question',
    'AI Analyzes the Information',
    'Simple Explanation Generated',
    'Understand Rights, Duties & Consequences',
    'Save Document / Ask Chatbot / Set Reminder',
  ];

  const colWidth = 5.8;
  const rowHeight = 0.65;
  const gap = 0.15;

  steps.forEach((step, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 1.5 + col * (colWidth + 0.8);
    const y = 1.8 + row * (rowHeight + gap + 0.15);

    addCard(slide, x, y, colWidth, rowHeight);
    // Number badge
    slide.addShape('roundRect', { x: x + 0.1, y: y + 0.08, w: 0.4, h: 0.4, fill: { color: GOLD, transparency: 85 }, line: { color: GOLD, width: 1 }, rectRadius: 0.05 });
    slide.addText(String(i + 1), { x: x + 0.1, y: y + 0.08, w: 0.4, h: 0.4, fontSize: 11, color: GOLD, bold: true, align: 'center', valign: 'middle' });
    slide.addText(step, { x: x + 0.6, y, w: colWidth - 0.7, h: rowHeight, fontSize: 11, fontFace: 'Inter', color: GRAY_LIGHT, valign: 'middle' });

    // Arrow between columns
    if (i % 2 === 0 && i < steps.length - 1) {
      slide.addText('→', { x: x + colWidth + 0.05, y, w: 0.6, h: rowHeight, fontSize: 16, color: GOLD, align: 'center', valign: 'middle' });
    }
  });

  // Bottom card
  addCard(slide, 2.5, 6.3, 8.3, 0.6, { line: { color: GOLD, width: 1 } });
  slide.addText('From confusion to clarity — in the user\'s own language, at their own pace.', {
    x: 2.5, y: 6.3, w: 8.3, h: 0.6, fontSize: 12, fontFace: 'Inter', color: WHITE, align: 'center', valign: 'middle',
  });
  addSlideNumber(slide, 5);
}

// ══════════════════════════════════════════════════════════════
// SLIDE 6 — CORE FEATURES
// ══════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addTag(slide, '📊  CORE FEATURES');
  addTitle(slide, 'The JurisGuide dashboard');
  addSubtitle(slide, 'Eleven integrated features accessible from a single, clean dashboard.');

  const features = [
    { icon: '💬', label: 'AI Legal Chatbot', desc: 'Ask legal questions in plain language' },
    { icon: '📷', label: 'Document Scanner', desc: 'Scan documents using camera' },
    { icon: '📤', label: 'Upload Documents', desc: 'Upload PDFs and images' },
    { icon: '📁', label: 'View Documents', desc: 'Manage previously uploaded files' },
    { icon: '🤖', label: 'AI Legal Agent', desc: 'AI-powered document analysis' },
    { icon: '⚖', label: 'Crime & Punishment', desc: 'Understand offences and consequences' },
    { icon: '📖', label: 'Court Guidance', desc: 'Learn how court procedures work' },
    { icon: '📅', label: 'Court Reminders', desc: 'Never miss a hearing date' },
    { icon: '🌐', label: 'Language Selection', desc: 'Choose your preferred language' },
    { icon: '🗂', label: 'Legal Domains', desc: 'Focus on your specific legal area' },
    { icon: '🔒', label: 'Secure Account', desc: 'Protected personal legal workspace' },
  ];

  const cardW = 3.7;
  const cardH = 1.25;
  const gapX = 0.2;
  const gapY = 0.2;
  const startX = 0.6;
  const startY = 1.8;

  features.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);

    addCard(slide, x, y, cardW, cardH);
    slide.addText(f.icon, { x: x + 0.15, y: y + 0.2, w: 0.5, h: 0.5, fontSize: 20, align: 'center', valign: 'middle' });
    slide.addText(f.label, { x: x + 0.7, y: y + 0.15, w: cardW - 0.8, h: 0.35, fontSize: 12, fontFace: 'Inter', color: WHITE, bold: true, valign: 'middle' });
    slide.addText(f.desc, { x: x + 0.7, y: y + 0.5, w: cardW - 0.8, h: 0.35, fontSize: 9, fontFace: 'Inter', color: GRAY_TEXT, valign: 'middle' });
  });
  addSlideNumber(slide, 6);
}

// ══════════════════════════════════════════════════════════════
// SLIDE 7 — AI DOCUMENT ANALYSIS
// ══════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addTag(slide, '🔍  AI DOCUMENT ANALYSIS');
  addTitle(slide, 'From legal jargon to plain language');

  // Flow steps
  const flowSteps = ['Upload PDF/Image', 'OCR if required', 'Text extraction', 'AI analysis', 'Clause identification', 'Terms explained', 'Risky clauses highlighted', 'Simple-language output', 'Multilingual output'];
  const flowW = 1.35;
  flowSteps.forEach((step, i) => {
    const x = 0.5 + i * (flowW + 0.15);
    addCard(slide, x, 1.8, flowW, 0.6);
    slide.addText(step, { x, y: 1.8, w: flowW, h: 0.6, fontSize: 8, fontFace: 'Inter', color: GRAY_LIGHT, align: 'center', valign: 'middle', lineSpacingMultiple: 1.1 });
    if (i < flowSteps.length - 1) {
      slide.addText('→', { x: x + flowW - 0.02, y: 1.8, w: 0.2, h: 0.6, fontSize: 12, color: GOLD, align: 'center', valign: 'middle' });
    }
  });

  // Example - Original
  addCard(slide, 0.6, 2.8, 5.8, 1.8, { line: { color: RED_ACCENT, width: 1 } });
  slide.addText('📄  ORIGINAL CLAUSE', { x: 0.8, y: 2.9, w: 5, h: 0.3, fontSize: 10, fontFace: 'Inter', color: 'E74C3C', bold: true });
  slide.addText('"Party of the first part shall indemnify and hold harmless the party of the second part from all claims, damages, and liabilities arising out of..."', {
    x: 0.8, y: 3.25, w: 5.4, h: 1.2, fontSize: 11, fontFace: 'Inter', color: GRAY_LIGHT, italic: true, valign: 'top', lineSpacingMultiple: 1.3,
  });

  // Example - JurisGuide
  addCard(slide, 6.7, 2.8, 5.8, 1.8, { line: { color: GREEN_ACCENT, width: 1 } });
  slide.addText('✨  JURISGUIDE EXPLANATION', { x: 6.9, y: 2.9, w: 5, h: 0.3, fontSize: 10, fontFace: 'Inter', color: '2ECC71', bold: true });
  slide.addText('"This means the first party may have to compensate the other party for certain losses. If something goes wrong, you could be responsible for covering their costs."', {
    x: 6.9, y: 3.25, w: 5.4, h: 1.2, fontSize: 11, fontFace: 'Inter', color: WHITE, valign: 'top', lineSpacingMultiple: 1.3,
  });

  // Disclaimer
  addCard(slide, 0.6, 5.0, 12, 0.7, { line: { color: GOLD, width: 1 }, fill: { color: NAVY_MID, transparency: 80 } });
  slide.addText('⚠  JurisGuide provides general legal information and does not replace a qualified lawyer. Always consult a legal professional for advice specific to your situation.', {
    x: 0.8, y: 5.0, w: 11.6, h: 0.7, fontSize: 10, fontFace: 'Inter', color: GOLD_LIGHT, valign: 'middle',
  });
  addSlideNumber(slide, 7);
}

// ══════════════════════════════════════════════════════════════
// SLIDE 8 — CRIME, PUNISHMENT, RIGHTS & DUTIES
// ══════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addTag(slide, '⚖  CRIME, PUNISHMENT, RIGHTS & DUTIES');
  addTitle(slide, 'Understanding offences and their consequences');
  addSubtitle(slide, 'Users can search or explore an offence and understand what it means and what may follow.');

  const items = [
    { icon: '⚖', label: 'Meaning of the offence', desc: 'What the offence means in simple terms' },
    { icon: '📖', label: 'Relevant law / section', desc: 'Which law or section applies, where known' },
    { icon: '⚠', label: 'Possible punishment', desc: 'What consequences may apply' },
    { icon: '📋', label: 'Basic legal procedure', desc: 'What steps are generally involved' },
    { icon: '🛡', label: 'Rights & responsibilities', desc: 'Your related rights and duties' },
  ];

  const cardW = 3.7;
  items.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.6 + col * (cardW + 0.2);
    const y = 1.8 + row * 1.5;

    addCard(slide, x, y, cardW, 1.3);
    slide.addText(item.icon, { x: x + 0.15, y: y + 0.2, w: 0.5, h: 0.5, fontSize: 22, align: 'center', valign: 'middle' });
    slide.addText(item.label, { x: x + 0.7, y: y + 0.15, w: cardW - 0.8, h: 0.35, fontSize: 12, fontFace: 'Inter', color: WHITE, bold: true, valign: 'middle' });
    slide.addText(item.desc, { x: x + 0.7, y: y + 0.5, w: cardW - 0.8, h: 0.35, fontSize: 9, fontFace: 'Inter', color: GRAY_TEXT, valign: 'middle' });
  });

  // Disclaimer
  addCard(slide, 0.6, 5.0, 12, 0.8, { line: { color: GOLD, width: 1 }, fill: { color: NAVY_MID, transparency: 80 } });
  slide.addText('⚠  Disclaimer: Possible legal consequences depend on the applicable law, jurisdiction and facts of the case. JurisGuide provides general legal information, not a final legal judgment.', {
    x: 0.8, y: 5.0, w: 11.6, h: 0.8, fontSize: 11, fontFace: 'Inter', color: GOLD_LIGHT, valign: 'middle', lineSpacingMultiple: 1.3,
  });
  addSlideNumber(slide, 8);
}

// ══════════════════════════════════════════════════════════════
// SLIDE 9 — MULTILINGUAL & ACCESSIBILITY
// ══════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addTag(slide, '🌐  MULTILINGUAL & ACCESSIBILITY');
  addTitle(slide, 'Legal understanding in your own language');
  addSubtitle(slide, 'Language should never be a barrier to understanding your rights and documents.');

  // Flow (left)
  const flowSteps = [
    { label: 'Legal document (any language)', color: GRAY_LIGHT },
    { label: 'AI explanation generated', color: GOLD },
    { label: 'Translated to preferred language', color: GOLD },
    { label: 'Simple, understandable output', color: GREEN_ACCENT },
  ];

  flowSteps.forEach((step, i) => {
    const y = 1.9 + i * 0.95;
    addCard(slide, 0.6, y, 5.5, 0.6, { line: { color: step.color, width: 1 } });
    slide.addText(step.label, { x: 0.8, y, w: 5.1, h: 0.6, fontSize: 12, fontFace: 'Inter', color: WHITE, valign: 'middle' });
    if (i < 3) addFlowArrow(slide, 3.35, y + 0.62);
  });

  // Languages (right)
  const languages = ['English', 'हिन्दी (Hindi)', 'বাংলা (Bengali)', 'தமிழ் (Tamil)', 'తెలుగు (Telugu)', 'मराठी (Marathi)'];

  languages.forEach((lang, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 6.7 + col * 2.8;
    const y = 1.9 + row * 1.0;

    addCard(slide, x, y, 2.6, 0.8);
    slide.addText('🌐', { x: x + 0.1, y: y + 0.15, w: 0.5, h: 0.5, fontSize: 18, align: 'center', valign: 'middle' });
    slide.addText(lang, { x: x + 0.6, y, w: 1.9, h: 0.8, fontSize: 11, fontFace: 'Inter', color: WHITE, valign: 'middle' });
  });

  // Bottom card
  addCard(slide, 6.7, 5.0, 5.4, 0.8, { line: { color: GOLD, width: 1 } });
  slide.addText('Users can access explanations in languages they are comfortable with, making legal information accessible to more citizens.', {
    x: 6.9, y: 5.0, w: 5.0, h: 0.8, fontSize: 10, fontFace: 'Inter', color: GRAY_LIGHT, valign: 'middle', lineSpacingMultiple: 1.3,
  });
  addSlideNumber(slide, 9);
}

// ══════════════════════════════════════════════════════════════
// SLIDE 10 — BACKEND ARCHITECTURE
// ══════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addTag(slide, '🖥  BACKEND ARCHITECTURE');
  addTitle(slide, 'Technical architecture of JurisGuide');

  const centerX = 4.5;
  const flowW = 4.3;

  // Top layers
  const topLayers = [
    { label: 'USER', color: '5DADE2' },
    { label: 'REACT FRONTEND', color: '48C9B0' },
    { label: 'APPLICATION LOGIC / TYPESCRIPT', color: '1ABC9C' },
  ];

  topLayers.forEach((layer, i) => {
    const y = 1.6 + i * 0.65;
    addCard(slide, centerX, y, flowW, 0.5);
    slide.addText(layer.label, { x: centerX, y, w: flowW, h: 0.5, fontSize: 11, fontFace: 'Inter', color: layer.color, bold: true, align: 'center', valign: 'middle' });
    addFlowArrow(slide, centerX + flowW / 2, y + 0.5);
  });

  // Supabase box
  const sbY = 3.5;
  addCard(slide, centerX - 0.5, sbY, flowW + 1, 1.8, { line: { color: GOLD, width: 1.5 } });
  slide.addText('🗄  SUPABASE', { x: centerX - 0.5, y: sbY + 0.05, w: flowW + 1, h: 0.35, fontSize: 12, fontFace: 'Inter', color: GOLD, bold: true, align: 'center' });

  const sbServices = ['Supabase Authentication', 'PostgreSQL Database', 'Supabase Storage', 'Row Level Security', 'Edge Functions'];
  sbServices.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    slide.addShape('roundRect', { x: centerX - 0.3 + col * 2.6, y: sbY + 0.45 + row * 0.4, w: 2.4, h: 0.35, fill: { color: NAVY_DARK }, line: { color: NAVY_LIGHT, width: 1 }, rectRadius: 0.05 });
    slide.addText(s, { x: centerX - 0.3 + col * 2.6, y: sbY + 0.45 + row * 0.4, w: 2.4, h: 0.35, fontSize: 8, fontFace: 'Inter', color: GRAY_LIGHT, align: 'center', valign: 'middle' });
  });

  addFlowArrow(slide, centerX + flowW / 2, sbY + 1.8);

  // AI
  addCard(slide, centerX, 5.4, flowW, 0.5);
  slide.addText('🤖  AI / EXTERNAL SERVICES', { x: centerX, y: 5.4, w: flowW, h: 0.5, fontSize: 11, fontFace: 'Inter', color: 'BB8FCE', bold: true, align: 'center', valign: 'middle' });
  addFlowArrow(slide, centerX + flowW / 2, 5.9);

  // Result
  addCard(slide, centerX, 6.2, flowW, 0.5, { line: { color: GREEN_ACCENT, width: 1 } });
  slide.addText('✅  RESULT  →  USER', { x: centerX, y: 6.2, w: flowW, h: 0.5, fontSize: 11, fontFace: 'Inter', color: '58D68D', bold: true, align: 'center', valign: 'middle' });

  // Explanation panel (right)
  const explanations = [
    'Frontend: React + TypeScript/TSX',
    'Application: Components, pages, hooks, API calls',
    'Authentication: Supabase Auth handles login securely',
    'Database: PostgreSQL stores profiles, documents, reminders',
    'Storage: Supabase Storage for uploaded PDFs/images',
    'Security: RLS ensures users access only their data',
    'Edge Functions: Server-side ops, protect API keys',
    'AI: Processes text and questions for explanations',
  ];

  explanations.forEach((exp, i) => {
    const y = 1.6 + i * 0.65;
    addCard(slide, 9.3, y, 3.5, 0.55);
    slide.addText('•', { x: 9.4, y, w: 0.2, h: 0.55, fontSize: 12, color: GOLD, valign: 'middle' });
    slide.addText(exp, { x: 9.6, y, w: 3.1, h: 0.55, fontSize: 9, fontFace: 'Inter', color: GRAY_LIGHT, valign: 'middle', lineSpacingMultiple: 1.2 });
  });
  addSlideNumber(slide, 10);
}

// ══════════════════════════════════════════════════════════════
// SLIDE 11 — DATABASE DESIGN
// ══════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addTag(slide, '🗄  DATABASE DESIGN');
  addTitle(slide, 'Relational database structure');
  addSubtitle(slide, 'PostgreSQL stores all structured data with user-specific relationships.');

  const tables = [
    { name: 'users', fields: ['id (PK)', 'full_name', 'email', 'mobile', 'location', 'preferred_language'], highlight: true },
    { name: 'documents', fields: ['id (PK)', 'user_id (FK)', 'name', 'type', 'extracted_text', 'analysis'] },
    { name: 'reminders', fields: ['id (PK)', 'user_id (FK)', 'title', 'case_number', 'date', 'time', 'court'] },
    { name: 'court_cases', fields: ['id (PK)', 'user_id (FK)', 'case_name', 'status', 'notes'] },
    { name: 'chat_history', fields: ['id (PK)', 'user_id (FK)', 'title', 'created_at'] },
    { name: 'legal_queries', fields: ['id (PK)', 'user_id (FK)', 'query', 'response', 'domain'] },
  ];

  // Users table (center, highlighted)
  const usersX = 0.6, usersY = 1.8, usersW = 3.5, usersH = 3.5;
  addCard(slide, usersX, usersY, usersW, usersH, { line: { color: GOLD, width: 1.5 } });
  slide.addText('👤  users', { x: usersX + 0.15, y: usersY + 0.1, w: usersW - 0.3, h: 0.4, fontSize: 13, fontFace: 'Inter', color: GOLD, bold: true });
  slide.addShape('roundRect', { x: usersX + 0.15, y: usersY + 0.5, w: usersW - 0.3, h: 0.02, fill: { color: GOLD, transparency: 50 }, line: { type: 'none' } });
  tables[0].fields.forEach((f, i) => {
    slide.addText(f, { x: usersX + 0.25, y: usersY + 0.6 + i * 0.4, w: usersW - 0.5, h: 0.35, fontSize: 10, fontFace: 'Inter', color: f.includes('PK') ? GOLD : GRAY_LIGHT, valign: 'middle' });
  });
  slide.addText('Central user record', { x: usersX + 0.15, y: usersY + usersH - 0.4, w: usersW - 0.3, h: 0.3, fontSize: 9, fontFace: 'Inter', color: GRAY_TEXT, valign: 'middle' });

  // Other tables
  const otherTables = tables.slice(1);
  otherTables.forEach((table, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 4.5 + col * 4.1;
    const y = 1.8 + row * 1.7;
    const w = 3.8;
    const h = 1.5;

    addCard(slide, x, y, w, h);
    slide.addText(table.name, { x: x + 0.15, y: y + 0.05, w: w - 0.3, h: 0.3, fontSize: 11, fontFace: 'Inter', color: WHITE, bold: true });
    table.fields.forEach((f, fi) => {
      slide.addText(f, { x: x + 0.25, y: y + 0.35 + fi * 0.2, w: w - 0.5, h: 0.18, fontSize: 8, fontFace: 'Inter', color: f.includes('FK') ? GOLD : GRAY_TEXT, valign: 'middle' });
    });
  });

  // Connection note
  addCard(slide, 4.5, 5.4, 8.2, 0.7, { line: { color: GOLD, width: 1 } });
  slide.addText('🔑  Each user has a unique account. All records are connected through user IDs. Documents, reminders, and chat history belong to individual users.', {
    x: 4.7, y: 5.4, w: 7.8, h: 0.7, fontSize: 10, fontFace: 'Inter', color: GRAY_LIGHT, valign: 'middle',
  });
  addSlideNumber(slide, 11);
}

// ══════════════════════════════════════════════════════════════
// SLIDE 12 — SECURITY & PRIVACY
// ══════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addTag(slide, '🔒  SECURITY & PRIVACY');
  addTitle(slide, 'Security is part of the product');
  addSubtitle(slide, 'Legal information is sensitive. JurisGuide is built with security at its core.');

  const items = [
    { icon: '🛡', label: 'Supabase Authentication', desc: 'Secure user authentication handled by Supabase Auth' },
    { icon: '🔑', label: 'Secure Password Handling', desc: 'Passwords managed through the auth service' },
    { icon: '🔒', label: 'Row Level Security', desc: 'Users can only access their own records' },
    { icon: '📄', label: 'Secure Document Storage', desc: 'Uploaded documents stored in private storage' },
    { icon: '👁', label: 'Access Control', desc: 'Each user sees only their own documents and data' },
    { icon: '⚙', label: 'Environment Variables', desc: 'Secret keys kept server-side, never in frontend' },
  ];

  const cardW = 5.8;
  items.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.6 + col * (cardW + 0.3);
    const y = 1.8 + row * 1.15;

    addCard(slide, x, y, cardW, 1.0);
    slide.addText(item.icon, { x: x + 0.15, y: y + 0.2, w: 0.5, h: 0.5, fontSize: 20, align: 'center', valign: 'middle' });
    slide.addText(item.label, { x: x + 0.7, y: y + 0.1, w: cardW - 0.8, h: 0.35, fontSize: 12, fontFace: 'Inter', color: WHITE, bold: true, valign: 'middle' });
    slide.addText(item.desc, { x: x + 0.7, y: y + 0.45, w: cardW - 0.8, h: 0.35, fontSize: 9, fontFace: 'Inter', color: GRAY_TEXT, valign: 'middle' });
  });

  // Quote
  addCard(slide, 0.6, 5.5, 12, 0.8, { line: { color: GOLD, width: 1.5 }, fill: { color: NAVY_MID } });
  slide.addText('🛡  "Legal information is sensitive information, so security is part of the product — not an optional feature."', {
    x: 0.8, y: 5.5, w: 11.6, h: 0.8, fontSize: 14, fontFace: 'Inter', color: WHITE, bold: true, valign: 'middle',
  });
  addSlideNumber(slide, 12);
}

// ══════════════════════════════════════════════════════════════
// SLIDE 13 — TECHNOLOGY STACK
// ══════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addTag(slide, '🗂  TECHNOLOGY STACK');
  addTitle(slide, 'Built with a modern, scalable stack');

  const stacks = [
    { icon: '🖥', title: 'Frontend', color: '5DADE2', items: ['React', 'TypeScript', 'TSX', 'Tailwind CSS', 'Vite'] },
    { icon: '🗄', title: 'Backend / BaaS', color: GOLD, items: ['Supabase', 'Supabase Auth', 'PostgreSQL', 'Supabase Storage', 'Edge Functions'] },
    { icon: '⚙', title: 'Development', color: '48C9B0', items: ['npm', 'Git / GitHub'] },
    { icon: '🤖', title: 'AI Layer', color: 'BB8FCE', items: ['AI model / API', 'Document processing / OCR'] },
  ];

  const cardW = 5.8;
  stacks.forEach((stack, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.6 + col * (cardW + 0.3);
    const y = 1.8 + row * 2.3;

    addCard(slide, x, y, cardW, 2.0);
    slide.addText(stack.icon, { x: x + 0.15, y: y + 0.15, w: 0.5, h: 0.5, fontSize: 20, align: 'center', valign: 'middle' });
    slide.addText(stack.title, { x: x + 0.7, y: y + 0.15, w: cardW - 0.8, h: 0.4, fontSize: 13, fontFace: 'Inter', color: stack.color, bold: true, valign: 'middle' });

    stack.items.forEach((item, si) => {
      slide.addShape('roundRect', { x: x + 0.2 + (si % 3) * 1.85, y: y + 0.7 + Math.floor(si / 3) * 0.5, w: 1.7, h: 0.4, fill: { color: NAVY_DARK }, line: { color: NAVY_LIGHT, width: 1 }, rectRadius: 0.05 });
      slide.addText(item, { x: x + 0.2 + (si % 3) * 1.85, y: y + 0.7 + Math.floor(si / 3) * 0.5, w: 1.7, h: 0.4, fontSize: 9, fontFace: 'Inter', color: GRAY_LIGHT, align: 'center', valign: 'middle' });
    });
  });

  // Note
  addCard(slide, 0.6, 6.5, 12, 0.5, { line: { color: GOLD, width: 1 }, fill: { color: NAVY_MID, transparency: 80 } });
  slide.addText('⚠  AI provider details are abstracted through an edge function layer, allowing the AI model to be changed without affecting the frontend.', {
    x: 0.8, y: 6.5, w: 11.6, h: 0.5, fontSize: 9, fontFace: 'Inter', color: GOLD_LIGHT, valign: 'middle',
  });
  addSlideNumber(slide, 13);
}

// ══════════════════════════════════════════════════════════════
// SLIDE 14 — REAL-WORLD IMPACT
// ══════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addTag(slide, '❤  REAL-WORLD IMPACT');
  addTitle(slide, 'How JurisGuide helps different people');

  const groups = [
    { icon: '👥', title: 'For Citizens', color: '5DADE2', items: ['Better legal awareness', 'Easier document understanding', 'Easier access to legal information', 'Regional language support'] },
    { icon: '⚖', title: 'For People in Court Matters', color: GOLD, items: ['Better understanding of procedures', 'Hearing reminders', 'Organized document storage'] },
    { icon: '🛡', title: 'For Society', color: '48C9B0', items: ['Improved legal literacy', 'Better awareness of rights and duties', 'Easier access to general legal information'] },
  ];

  const cardW = 3.9;
  groups.forEach((group, i) => {
    const x = 0.6 + i * (cardW + 0.25);
    const y = 1.8;
    const h = 4.5;

    addCard(slide, x, y, cardW, h);
    slide.addShape('roundRect', { x: x + 0.2, y: y + 0.2, w: 0.6, h: 0.6, fill: { color: NAVY_DARK }, line: { type: 'none' }, rectRadius: 0.08 });
    slide.addText(group.icon, { x: x + 0.2, y: y + 0.2, w: 0.6, h: 0.6, fontSize: 24, align: 'center', valign: 'middle' });
    slide.addText(group.title, { x: x + 0.9, y: y + 0.2, w: cardW - 1.1, h: 0.6, fontSize: 13, fontFace: 'Inter', color: group.color, bold: true, valign: 'middle' });

    group.items.forEach((item, si) => {
      slide.addText('✓', { x: x + 0.25, y: y + 1.1 + si * 0.7, w: 0.3, h: 0.35, fontSize: 14, color: GOLD, valign: 'top' });
      slide.addText(item, { x: x + 0.6, y: y + 1.1 + si * 0.7, w: cardW - 0.8, h: 0.5, fontSize: 11, fontFace: 'Inter', color: GRAY_LIGHT, valign: 'middle', lineSpacingMultiple: 1.2 });
    });
  });
  addSlideNumber(slide, 14);
}

// ══════════════════════════════════════════════════════════════
// SLIDE 15 — FUTURE SCOPE & CONCLUSION
// ══════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addTag(slide, '✨  FUTURE SCOPE & CONCLUSION');
  addTitle(slide, 'Where JurisGuide goes next');

  // Future scope (left)
  slide.addText('FUTURE POSSIBILITIES', { x: 0.6, y: 1.7, w: 5.5, h: 0.35, fontSize: 11, fontFace: 'Inter', color: GOLD, bold: true });

  const future = [
    'More Indian and regional languages',
    'Improved document OCR accuracy',
    'Better legal-domain-specific AI',
    'Integration with official legal sources',
    'Court case tracking where feasible',
    'Lawyer and legal-aid referral',
    'Voice-based legal assistance',
    'Personalized legal information',
    'Advanced document risk detection',
  ];

  future.forEach((item, i) => {
    const y = 2.1 + i * 0.5;
    slide.addText('•', { x: 0.7, y, w: 0.2, h: 0.35, fontSize: 14, color: GOLD, valign: 'top' });
    slide.addText(item, { x: 0.95, y, w: 5, h: 0.35, fontSize: 11, fontFace: 'Inter', color: GRAY_LIGHT, valign: 'middle' });
  });

  // Conclusion (right)
  addCard(slide, 6.7, 1.8, 6, 2.2, { line: { color: GOLD, width: 1.5 }, fill: { color: NAVY_MID } });
  slide.addText('⚖', { x: 6.9, y: 1.95, w: 0.5, h: 0.4, fontSize: 20, align: 'center' });
  slide.addText('"JurisGuide does not aim to replace lawyers. It aims to make legal information easier to understand before people take their next step."', {
    x: 7.5, y: 1.9, w: 5, h: 2.0, fontSize: 13, fontFace: 'Inter', color: WHITE, bold: true, valign: 'middle', lineSpacingMultiple: 1.4,
  });

  // Tagline
  slide.addShape('roundRect', { x: 6.9, y: 4.3, w: 0.8, h: 0.03, fill: { color: GOLD }, line: { type: 'none' } });
  slide.addText('Understand the law. Know your rights. Take informed decisions.', {
    x: 6.7, y: 4.5, w: 6, h: 0.5, fontSize: 14, fontFace: 'Inter', color: GOLD, bold: true, align: 'center', valign: 'middle',
  });

  // Disclaimer
  addCard(slide, 6.7, 5.3, 6, 0.6, { line: { color: NAVY_LIGHT, width: 1 }, fill: { color: NAVY_MID, transparency: 50 } });
  slide.addText('⚠  JurisGuide is an AI-powered legal information platform, not a substitute for professional legal advice.', {
    x: 6.9, y: 5.3, w: 5.6, h: 0.6, fontSize: 9, fontFace: 'Inter', color: GRAY_TEXT, valign: 'middle',
  });

  // Thank you
  slide.addText('Thank You', {
    x: 6.7, y: 6.2, w: 6, h: 0.5, fontSize: 16, fontFace: 'Inter', color: WHITE, bold: true, align: 'center', valign: 'middle',
  });
  addSlideNumber(slide, 15);
}

// ─── Generate ────────────────────────────────────────────────
const outDir = 'public';
mkdirSync(outDir, { recursive: true });

pptx.writeFile({ fileName: 'JurisGuide-Presentation.pptx' }).then(() => {
  console.log('PPTX generated: JurisGuide-Presentation.pptx');
}).catch((err) => {
  console.error('Error generating PPTX:', err);
  process.exit(1);
});
