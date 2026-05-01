import {
  Document,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import type { PDFRenderContext } from '../services/pdfExportService';
import type { ExportTemplate, LayoutVariant } from '../../../types';

// ── Palette builder ───────────────────────────────────────
function buildPalette(template?: ExportTemplate) {
  const cs = template?.colorScheme;
  return {
    primary:      cs?.primary      ?? '#0f766e',
    primaryDark:  cs?.darkText     ?? '#134e4a',
    primaryLight: cs?.light        ?? '#ccfbf1',
    accent:       cs?.secondary    ?? '#0369a1',
    accentLight:  cs?.light        ?? '#e0f2fe',
    white:        '#ffffff',
    gray50:       '#f8fafc',
    gray100:      '#f1f5f9',
    gray200:      '#e2e8f0',
    gray400:      '#94a3b8',
    gray600:      '#475569',
    gray800:      '#1e293b',
    amber50:      '#fffbeb',
    amber200:     '#fde68a',
    amber700:     '#b45309',
  };
}

function buildStyles(C: ReturnType<typeof buildPalette>) {
  return StyleSheet.create({
    page: {
      fontFamily: 'Helvetica',
      fontSize: 9,
      backgroundColor: C.white,
      paddingTop: 28,
      paddingBottom: 48,
    },

    // ── Fixed thin header (all pages) ─────────────────────
    fixedHeader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 28,
      backgroundColor: C.primaryDark,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 28,
      gap: 8,
    },
    fixedHeaderLogo: { height: 14, objectFit: 'contain' },
    fixedHeaderClinic: { flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.white },
    fixedHeaderProgram: { fontSize: 7, color: C.accentLight },

    // ── Footer ────────────────────────────────────────────
    footer: {
      position: 'absolute',
      bottom: 16,
      left: 28,
      right: 28,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 0.5,
      borderTopColor: C.gray200,
      paddingTop: 5,
    },
    footerText: { fontSize: 7, color: C.gray400 },

    // ── Shared content wrapper ────────────────────────────
    content: { paddingHorizontal: 28, paddingTop: 14 },

    // ── Program info card (shared) ────────────────────────
    programCard: {
      backgroundColor: C.white,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: C.gray200,
      marginBottom: 10,
      overflow: 'hidden',
    },
    programCardHeader: {
      backgroundColor: C.primaryLight,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderBottomWidth: 1,
      borderBottomColor: C.gray200,
    },
    programName: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.primaryDark },
    programCardBody: { padding: 12 },
    programGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    programGridItem: { width: '50%', paddingVertical: 2.5 },
    programGridLabel: {
      fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.gray400,
      textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 1,
    },
    programGridValue: { fontSize: 9, color: C.gray800 },

    // ── Goal box (shared) ─────────────────────────────────
    goalBox: {
      backgroundColor: C.amber50,
      borderWidth: 1, borderColor: C.amber200, borderRadius: 5,
      padding: 9, marginBottom: 10,
    },
    goalLabel: {
      fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.amber700,
      textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2,
    },
    goalText: { fontSize: 9, color: C.gray800, lineHeight: 1.4 },

    // ── Empty notices ─────────────────────────────────────
    emptyNotice: {
      borderRadius: 5, borderWidth: 1, borderColor: C.gray200,
      padding: 18, alignItems: 'center', backgroundColor: C.white,
    },
    emptyNoticeText: { fontSize: 9, color: C.gray400, fontStyle: 'italic' },
    emptySessionText: { fontSize: 8, color: C.gray400, fontStyle: 'italic' },

    // ════════════════════════════════════════════════════
    // ── PROFESSIONAL style ───────────────────────────────
    // ════════════════════════════════════════════════════
    proClinicHero: {
      backgroundColor: C.primaryDark,
      paddingHorizontal: 28, paddingTop: 18, paddingBottom: 14,
      flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    },
    proClinicLogo: {
      height: 40, objectFit: 'contain',
      backgroundColor: C.white, padding: 3, borderRadius: 3,
    },
    proClinicName: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 3 },
    proClinicMeta: { fontSize: 8, color: C.accentLight },
    proReportStrip: {
      backgroundColor: C.primary, paddingHorizontal: 28, paddingVertical: 5,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    proReportTitle: {
      fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.white,
      textTransform: 'uppercase', letterSpacing: 1,
    },
    proReportDate: { fontSize: 7, color: C.accentLight },
    proSessionBlock: {
      marginBottom: 12, backgroundColor: C.white,
      borderRadius: 5, borderWidth: 1, borderColor: C.gray200, overflow: 'hidden',
    },
    proSessionHeader: {
      backgroundColor: C.accent, paddingHorizontal: 10, paddingVertical: 6,
      flexDirection: 'row', alignItems: 'center', gap: 5,
    },
    proSessionBadge: {
      fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.accentLight,
      backgroundColor: C.primaryDark, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3,
    },
    proSessionLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.white },
    tableHead: {
      flexDirection: 'row', backgroundColor: C.gray100,
      borderBottomWidth: 1, borderBottomColor: C.gray200,
    },
    tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: C.gray100 },
    tableRowEven: { backgroundColor: C.white },
    tableRowOdd:  { backgroundColor: C.gray50 },
    tableRowLast: { borderBottomWidth: 0 },
    thExercise: { flex: 3, paddingHorizontal: 8, paddingVertical: 4, fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.gray600, textTransform: 'uppercase', letterSpacing: 0.3 },
    thSmall: { width: 40, paddingHorizontal: 3, paddingVertical: 4, fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.gray600, textTransform: 'uppercase', letterSpacing: 0.3, textAlign: 'center' },
    thNotes: { flex: 2, paddingHorizontal: 8, paddingVertical: 4, fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.gray600, textTransform: 'uppercase', letterSpacing: 0.3 },
    thQR: { width: 50, paddingHorizontal: 3, paddingVertical: 4, fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.gray600, textTransform: 'uppercase', letterSpacing: 0.3, textAlign: 'center' },
    tdExercise: { flex: 3, paddingHorizontal: 8, paddingVertical: 5, fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    tdSmall: { width: 40, paddingHorizontal: 3, paddingVertical: 5, fontSize: 9, color: C.gray600, textAlign: 'center' },
    tdNotes: { flex: 2, paddingHorizontal: 8, paddingVertical: 5, fontSize: 8, color: C.gray400 },
    tdQR: { width: 50, paddingHorizontal: 3, paddingVertical: 3, alignItems: 'center', justifyContent: 'center' },
    qrImage: { width: 42, height: 42 },
    qrSpacer: { width: 42, height: 42 },

    // ════════════════════════════════════════════════════
    // ── PATIENT style ────────────────────────────────────
    // ════════════════════════════════════════════════════
    patClinicHero: {
      backgroundColor: C.primaryDark,
      paddingHorizontal: 28, paddingTop: 18, paddingBottom: 16,
      flexDirection: 'column', alignItems: 'center', gap: 4,
    },
    patClinicLogo: {
      height: 36, objectFit: 'contain',
      backgroundColor: C.white, padding: 3, borderRadius: 18,
      marginBottom: 4,
    },
    patClinicName: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: C.white, textAlign: 'center' },
    patClinicSub: { fontSize: 8, color: C.accentLight, textAlign: 'center' },
    patReportStrip: {
      backgroundColor: C.primaryLight, paddingHorizontal: 28, paddingVertical: 5,
      borderBottomWidth: 1, borderBottomColor: C.gray200,
    },
    patReportTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.primaryDark },
    patSessionBlock: { marginBottom: 12 },
    patSessionHeader: {
      borderBottomWidth: 2, borderBottomColor: C.primary,
      paddingBottom: 4, marginBottom: 6, paddingHorizontal: 28,
    },
    patSessionLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.primaryDark },
    patExCard: {
      paddingHorizontal: 28, paddingVertical: 6,
      borderBottomWidth: 0.5, borderBottomColor: C.gray100,
    },
    patExCardEven: { backgroundColor: C.white },
    patExCardOdd:  { backgroundColor: C.primaryLight },
    patExName: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.primaryDark, marginBottom: 2 },
    patExMetrics: { fontSize: 8, color: C.gray600 },
    patExNotes: { fontSize: 7, color: C.gray400, fontStyle: 'italic', marginTop: 1 },

    // ════════════════════════════════════════════════════
    // ── CHECKLIST style ──────────────────────────────────
    // ════════════════════════════════════════════════════
    chkClinicHero: {
      paddingHorizontal: 28, paddingTop: 16, paddingBottom: 12,
      borderLeftWidth: 5, borderLeftColor: C.primary,
      borderBottomWidth: 1, borderBottomColor: C.gray200,
    },
    chkClinicName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.gray800, marginBottom: 2 },
    chkClinicMeta: { fontSize: 8, color: C.gray600 },
    chkReportStrip: {
      paddingHorizontal: 28, paddingVertical: 4,
      borderBottomWidth: 1, borderBottomColor: C.gray200,
    },
    chkReportTitle: { fontSize: 7, color: C.gray400, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Helvetica-Bold' },
    chkSessionBlock: { marginBottom: 10, paddingHorizontal: 28 },
    chkSessionHeader: { paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: C.gray200, marginBottom: 4 },
    chkSessionLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    chkRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 4, gap: 8 },
    chkBox: {
      width: 11, height: 11, borderWidth: 1.2, borderColor: C.primary,
      borderRadius: 1, marginTop: 0.5, flexShrink: 0,
    },
    chkExName: { flex: 1, fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    chkExNotes: { fontSize: 7, color: C.gray400, fontStyle: 'italic', marginTop: 1 },
    chkMetric: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.primary },

    // ════════════════════════════════════════════════════
    // ── CLINICAL style ───────────────────────────────────
    // ════════════════════════════════════════════════════
    clinClinicHero: {
      paddingHorizontal: 28, paddingTop: 18, paddingBottom: 12,
      borderBottomWidth: 2, borderBottomColor: C.primary,
    },
    clinClinicName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.gray800, marginBottom: 2 },
    clinClinicMeta: { fontSize: 8, color: C.gray600 },
    clinReportStrip: {
      paddingHorizontal: 28, paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: C.gray200,
    },
    clinReportTitle: { fontSize: 7, color: C.gray600, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Helvetica-Bold' },
    clinSessionBlock: { marginBottom: 10, paddingHorizontal: 28 },
    clinSessionHeader: { paddingTop: 8, paddingBottom: 3, borderBottomWidth: 0.5, borderBottomColor: C.gray200, marginBottom: 4 },
    clinSessionLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.gray600, textTransform: 'uppercase', letterSpacing: 0.8 },
    clinRow: { paddingVertical: 3, paddingLeft: 8 },
    clinExLine: { flexDirection: 'row', gap: 4, alignItems: 'flex-start' },
    clinExNum: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.primary, width: 14 },
    clinExName: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800, flex: 1 },
    clinExDetail: { fontSize: 8, color: C.gray600, paddingLeft: 18, marginTop: 1 },
    clinExNotes: { fontSize: 7, color: C.gray400, fontStyle: 'italic', paddingLeft: 18, marginTop: 1 },

    // ════════════════════════════════════════════════════
    // ── MODERN style ─────────────────────────────────────
    // ════════════════════════════════════════════════════
    modClinicHero: {
      backgroundColor: C.primary,
      paddingHorizontal: 28, paddingTop: 22, paddingBottom: 18,
      flexDirection: 'column', alignItems: 'center', gap: 5,
    },
    modLogoBox: {
      width: 44, height: 44,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 8, alignItems: 'center', justifyContent: 'center',
      marginBottom: 4,
    },
    modClinicLogo: { height: 32, objectFit: 'contain' },
    modClinicName: { fontSize: 17, fontFamily: 'Helvetica-Bold', color: C.white, textAlign: 'center' },
    modClinicSub: { fontSize: 8, color: C.primaryLight, textAlign: 'center' },
    modAccentBar: { height: 3, backgroundColor: C.accent },
    modSessionBlock: { marginBottom: 10, paddingHorizontal: 28 },
    modSessionCard: {
      borderLeftWidth: 4, borderLeftColor: C.primary,
      paddingLeft: 10, paddingVertical: 6, paddingRight: 4,
      backgroundColor: C.gray50, marginBottom: 6,
    },
    modSessionLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    modExRow: {
      flexDirection: 'row', alignItems: 'stretch',
      borderLeftWidth: 3, borderLeftColor: C.accent,
      marginBottom: 3, overflow: 'hidden',
    },
    modExMain: { flex: 1, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: C.white },
    modExMainOdd: { flex: 1, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: C.gray50 },
    modExName: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800, marginBottom: 1 },
    modExNotes: { fontSize: 7, color: C.gray400, fontStyle: 'italic' },
    modExMetrics: {
      flexDirection: 'row', gap: 8, paddingHorizontal: 10, paddingVertical: 6,
      backgroundColor: C.primaryLight, alignItems: 'center',
    },
    modMetricBox: { alignItems: 'center' },
    modMetricNum: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.primary, lineHeight: 1 },
    modMetricLabel: { fontSize: 6, color: C.primaryDark, textTransform: 'uppercase', letterSpacing: 0.4 },

    // ════════════════════════════════════════════════════
    // ── MINIMAL style ────────────────────────────────────
    // ════════════════════════════════════════════════════
    minClinicHero: {
      paddingHorizontal: 28, paddingTop: 18, paddingBottom: 12,
      borderBottomWidth: 1, borderBottomColor: C.primary,
    },
    minClinicName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.gray800, marginBottom: 2 },
    minClinicMeta: { fontSize: 8, color: C.gray400 },
    minReportStrip: { paddingHorizontal: 28, paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: C.gray200 },
    minReportTitle: { fontSize: 7, color: C.gray400, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Helvetica-Bold' },
    minSessionBlock: { marginBottom: 10, paddingHorizontal: 28 },
    minSessionHeader: { paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: C.gray200, marginBottom: 4 },
    minSessionLabel: { fontSize: 8, color: C.gray600, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Helvetica-Bold' },
    minTableHead: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: C.gray200 },
    minTh: { paddingHorizontal: 4, paddingVertical: 3, fontSize: 7, color: C.gray400, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'Helvetica-Bold' },
    minThSmall: { width: 36, paddingHorizontal: 3, paddingVertical: 3, fontSize: 7, color: C.gray400, textTransform: 'uppercase', textAlign: 'center', fontFamily: 'Helvetica-Bold' },
    minRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: C.gray100 },
    minTd: { flex: 3, paddingHorizontal: 4, paddingVertical: 4, fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    minTdSmall: { width: 36, paddingHorizontal: 3, paddingVertical: 4, fontSize: 9, color: C.gray600, textAlign: 'center' },
    minTdNotes: { flex: 2, paddingHorizontal: 4, paddingVertical: 4, fontSize: 7, color: C.gray400, fontStyle: 'italic' },

    // ════════════════════════════════════════════════════
    // ── BOLD style ───────────────────────────────────────
    // ════════════════════════════════════════════════════
    boldClinicHero: {
      backgroundColor: C.primaryDark,
      paddingHorizontal: 28, paddingTop: 20, paddingBottom: 16,
      flexDirection: 'column', alignItems: 'center', gap: 5,
    },
    boldClinicLogo: { height: 36, objectFit: 'contain', marginBottom: 4 },
    boldClinicName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.white, textAlign: 'center' },
    boldClinicMeta: { fontSize: 8, color: C.primaryLight, textAlign: 'center' },
    boldAccentBar: { height: 4, backgroundColor: C.primary },
    boldSessionBlock: { marginBottom: 12, paddingHorizontal: 28 },
    boldSessionHeader: {
      backgroundColor: C.primary,
      paddingHorizontal: 10, paddingVertical: 7, borderRadius: 4, marginBottom: 8,
    },
    boldSessionLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.white },
    boldExRow: { marginBottom: 8, paddingBottom: 8, borderBottomWidth: 0.5, borderBottomColor: C.gray200 },
    boldExName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.gray800, marginBottom: 4 },
    boldExNotes: { fontSize: 8, color: C.gray400, fontStyle: 'italic', marginTop: 2 },
    boldPillRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    boldPill: {
      backgroundColor: C.primaryLight,
      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
      flexDirection: 'column', alignItems: 'center',
    },
    boldPillValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.primary },
    boldPillLabel: { fontSize: 6, color: C.primaryDark, textTransform: 'uppercase', letterSpacing: 0.3 },

    // ════════════════════════════════════════════════════
    // ── EXECUTIVE style ──────────────────────────────────
    // ════════════════════════════════════════════════════
    execClinicHero: {
      backgroundColor: '#1e293b',
      paddingHorizontal: 28, paddingTop: 18, paddingBottom: 14,
      flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    },
    execClinicLogo: { height: 40, objectFit: 'contain', backgroundColor: C.white, padding: 3, borderRadius: 3 },
    execClinicName: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#ffffff', marginBottom: 3 },
    execClinicMeta: { fontSize: 8, color: '#94a3b8' },
    execAccentLine: { height: 3, backgroundColor: C.primary },
    execReportStrip: {
      backgroundColor: '#0f172a',
      paddingHorizontal: 28, paddingVertical: 5,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    execReportTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
    execReportDate: { fontSize: 7, color: '#475569' },
    execSessionBlock: {
      marginBottom: 12, backgroundColor: C.white,
      borderRadius: 5, borderWidth: 1, borderColor: C.gray200, overflow: 'hidden',
    },
    execSessionHeader: {
      backgroundColor: '#1e293b',
      paddingHorizontal: 10, paddingVertical: 6,
      flexDirection: 'row', alignItems: 'center', gap: 5,
    },
    execSessionBadge: {
      fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#1e293b',
      backgroundColor: C.primary, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3,
    },
    execSessionLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#ffffff' },

    // ════════════════════════════════════════════════════
    // ── COMPACT style ────────────────────────────────────
    // ════════════════════════════════════════════════════
    compClinicHero: {
      backgroundColor: C.primary,
      paddingHorizontal: 28, paddingTop: 10, paddingBottom: 8,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    compClinicName: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.white },
    compClinicMeta: { fontSize: 7, color: C.primaryLight },
    compSessionBlock: {
      marginBottom: 6, backgroundColor: C.white,
      borderRadius: 3, borderWidth: 0.5, borderColor: C.gray200, overflow: 'hidden',
    },
    compSessionHeader: {
      backgroundColor: C.accent, paddingHorizontal: 8, paddingVertical: 3,
      flexDirection: 'row', alignItems: 'center', gap: 4,
    },
    compSessionLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.white },
    compTableHead: { flexDirection: 'row', backgroundColor: C.gray100, borderBottomWidth: 0.5, borderBottomColor: C.gray200 },
    compThEx: { flex: 3, paddingHorizontal: 4, paddingVertical: 2, fontSize: 6, fontFamily: 'Helvetica-Bold', color: C.gray600, textTransform: 'uppercase' },
    compThSm: { width: 28, paddingHorizontal: 2, paddingVertical: 2, fontSize: 6, fontFamily: 'Helvetica-Bold', color: C.gray600, textTransform: 'uppercase', textAlign: 'center' },
    compThNt: { flex: 2, paddingHorizontal: 4, paddingVertical: 2, fontSize: 6, fontFamily: 'Helvetica-Bold', color: C.gray600, textTransform: 'uppercase' },
    compRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: C.gray100 },
    compTdEx: { flex: 3, paddingHorizontal: 4, paddingVertical: 2, fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    compTdSm: { width: 28, paddingHorizontal: 2, paddingVertical: 2, fontSize: 7, color: C.gray600, textAlign: 'center' },
    compTdNt: { flex: 2, paddingHorizontal: 4, paddingVertical: 2, fontSize: 6, color: C.gray400 },

    // ════════════════════════════════════════════════════
    // ── TWOCOLUMN style ──────────────────────────────────
    // ════════════════════════════════════════════════════
    tcolClinicHero: {
      backgroundColor: C.primary,
      paddingHorizontal: 28, paddingTop: 14, paddingBottom: 12,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    tcolClinicName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.white },
    tcolClinicMeta: { fontSize: 8, color: C.primaryLight },
    tcolSessionBlock: { marginBottom: 10, paddingHorizontal: 28 },
    tcolSessionHeader: {
      paddingVertical: 5, marginBottom: 6,
      borderBottomWidth: 2, borderBottomColor: C.accent,
    },
    tcolSessionLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    tcolRow: { flexDirection: 'row', gap: 6, marginBottom: 5 },
    tcolCard: {
      flex: 1, borderWidth: 1, borderColor: C.gray200, borderRadius: 4, overflow: 'hidden',
    },
    tcolCardHeader: {
      backgroundColor: C.accent, paddingHorizontal: 8, paddingVertical: 5,
    },
    tcolCardName: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.white },
    tcolCardBody: { padding: 6, backgroundColor: C.primaryLight },
    tcolCardMetric: { fontSize: 8, color: C.primaryDark, fontFamily: 'Helvetica-Bold' },
    tcolCardNotes: { fontSize: 7, color: C.gray400, fontStyle: 'italic', marginTop: 2 },

    // ════════════════════════════════════════════════════
    // ── LEDGER style ─────────────────────────────────────
    // ════════════════════════════════════════════════════
    ledClinicHero: {
      backgroundColor: C.primaryLight,
      paddingHorizontal: 28, paddingTop: 16, paddingBottom: 12,
      borderBottomWidth: 3, borderBottomColor: C.primary,
    },
    ledClinicName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.primaryDark, marginBottom: 2 },
    ledClinicMeta: { fontSize: 8, color: C.primaryDark },
    ledSessionBlock: { marginBottom: 14, paddingHorizontal: 28 },
    ledSessionLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.primaryDark, paddingVertical: 5 },
    ledColHeader: {
      flexDirection: 'row', backgroundColor: C.primary,
    },
    ledColHNum: { width: 22, paddingVertical: 4, alignItems: 'center', justifyContent: 'center' },
    ledColHName: { flex: 3, paddingHorizontal: 8, paddingVertical: 4 },
    ledColHMeta: { flex: 2, paddingHorizontal: 8, paddingVertical: 4 },
    ledColHText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.white, textTransform: 'uppercase', letterSpacing: 0.5 },
    ledRow: { flexDirection: 'row', alignItems: 'stretch' },
    ledRowEven: { backgroundColor: C.primaryLight },
    ledRowOdd:  { backgroundColor: C.white },
    ledNumCell: { width: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary },
    ledNumText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.white },
    ledNameCell: { flex: 3, paddingHorizontal: 8, paddingVertical: 5 },
    ledNameText: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    ledNotesText: { fontSize: 7, color: C.gray400, fontStyle: 'italic', marginTop: 1 },
    ledMetaCell: { flex: 2, paddingHorizontal: 8, paddingVertical: 5 },
    ledMetaText: { fontSize: 8, color: C.gray600 },

    // ════════════════════════════════════════════════════
    // ── TIMELINE style ───────────────────────────────────
    // ════════════════════════════════════════════════════
    tlClinicHero: {
      paddingHorizontal: 28, paddingTop: 18, paddingBottom: 14,
      borderLeftWidth: 5, borderLeftColor: C.primary,
      borderBottomWidth: 1, borderBottomColor: C.gray200,
    },
    tlClinicName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.gray800, marginBottom: 2 },
    tlClinicMeta: { fontSize: 8, color: C.gray600 },
    tlReportStrip: { paddingHorizontal: 28, paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: C.gray200 },
    tlReportTitle: { fontSize: 7, color: C.gray400, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Helvetica-Bold' },
    tlSessionBlock: { marginBottom: 12, paddingHorizontal: 28 },
    tlSessionLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.gray800, paddingVertical: 6 },
    tlExRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 10 },
    tlMarkerCol: { width: 16, alignItems: 'center' },
    tlDot: {
      width: 16, height: 16, borderRadius: 8,
      backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
    },
    tlDotText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.white },
    tlLine: { width: 2, height: 12, backgroundColor: C.primary, marginTop: 1, opacity: 0.25 },
    tlContent: { flex: 1, paddingTop: 1 },
    tlExName: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800, marginBottom: 2 },
    tlExMetrics: { fontSize: 8, color: C.gray600 },
    tlExNotes: { fontSize: 7, color: C.gray400, fontStyle: 'italic', marginTop: 1 },

    // ════════════════════════════════════════════════════
    // ── HANDOUT style ────────────────────────────────────
    // ════════════════════════════════════════════════════
    hoClinicHero: {
      backgroundColor: C.primaryDark,
      paddingHorizontal: 28, paddingTop: 22, paddingBottom: 18,
      flexDirection: 'column', alignItems: 'center', gap: 6,
    },
    hoClinicLogo: { height: 40, objectFit: 'contain', marginBottom: 4 },
    hoClinicName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.white, textAlign: 'center' },
    hoClinicSub: { fontSize: 10, color: C.primaryLight, textAlign: 'center' },
    hoReportStrip: {
      backgroundColor: C.primaryLight, paddingHorizontal: 28, paddingVertical: 7,
      borderBottomWidth: 1, borderBottomColor: C.gray200,
    },
    hoReportTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.primaryDark },
    hoSessionBlock: { marginBottom: 14, paddingHorizontal: 28 },
    hoSessionHeader: {
      borderBottomWidth: 3, borderBottomColor: C.primary,
      paddingBottom: 6, marginBottom: 8,
    },
    hoSessionLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.primaryDark },
    hoExRow: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 10,
      paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: C.gray100,
    },
    hoCheckBox: {
      width: 16, height: 16, borderWidth: 2, borderColor: C.primary,
      borderRadius: 2, marginTop: 1, flexShrink: 0,
    },
    hoExName: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    hoExMetrics: { fontSize: 10, color: C.gray600, marginTop: 2 },
    hoExNotes: { fontSize: 9, color: C.gray400, fontStyle: 'italic', marginTop: 2 },

    // ════════════════════════════════════════════════════
    // ── REPORT style ─────────────────────────────────────
    // ════════════════════════════════════════════════════
    rpClinicHero: {
      paddingHorizontal: 28, paddingTop: 18, paddingBottom: 14,
      borderBottomWidth: 1, borderBottomColor: C.gray200,
    },
    rpClinicName: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: C.gray800, marginBottom: 2 },
    rpClinicMeta: { fontSize: 8, color: C.gray600 },
    rpAccentBar: { height: 2, backgroundColor: C.primary, marginHorizontal: 28 },
    rpDocTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.gray800, paddingHorizontal: 28, paddingTop: 8, paddingBottom: 2 },
    rpDocMeta: { fontSize: 8, color: C.gray400, paddingHorizontal: 28, marginBottom: 8 },
    rpSessionBlock: { marginBottom: 12, paddingHorizontal: 28 },
    rpSessionHeader: {
      backgroundColor: C.gray100,
      paddingHorizontal: 10, paddingVertical: 6,
      borderLeftWidth: 3, borderLeftColor: C.primary, marginBottom: 6,
    },
    rpSessionLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    rpExRow: { paddingVertical: 4, paddingLeft: 8, borderBottomWidth: 0.5, borderBottomColor: C.gray100 },
    rpExHeader: { flexDirection: 'row', gap: 4, alignItems: 'flex-start' },
    rpExNum: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.primary, width: 16 },
    rpExName: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800, flex: 1 },
    rpExDetail: { fontSize: 8, color: C.gray600, paddingLeft: 20, marginTop: 1 },
    rpExNotes: { fontSize: 7, color: C.gray400, fontStyle: 'italic', paddingLeft: 20, marginTop: 1 },

    // ════════════════════════════════════════════════════
    // ── CARD style ───────────────────────────────────────
    // ════════════════════════════════════════════════════
    cardClinicHero: {
      backgroundColor: C.primary,
      paddingHorizontal: 28, paddingTop: 18, paddingBottom: 14,
    },
    cardClinicLogo: { height: 36, objectFit: 'contain', marginBottom: 6 },
    cardClinicName: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 2 },
    cardClinicMeta: { fontSize: 8, color: C.primaryLight },
    cardAccentBar: { height: 3, backgroundColor: C.primaryDark },
    cardSessionBlock: { marginBottom: 12, paddingHorizontal: 28 },
    cardSessionLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.gray800, paddingTop: 8, paddingBottom: 6 },
    cardRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    cardItem: {
      flex: 1, borderWidth: 1, borderColor: C.gray200, borderRadius: 5, overflow: 'hidden',
    },
    cardItemHeader: { backgroundColor: C.primary, paddingHorizontal: 8, paddingVertical: 6 },
    cardItemName: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.white },
    cardItemBody: { padding: 8 },
    cardItemMetric: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.primary, lineHeight: 1 },
    cardItemMetricLabel: { fontSize: 6, color: C.gray400, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
    cardItemNotes: { fontSize: 7, color: C.gray400, fontStyle: 'italic', marginTop: 4 },

    // ════════════════════════════════════════════════════
    // ── STRIPED style ────────────────────────────────────
    // ════════════════════════════════════════════════════
    strClinicHero: {
      backgroundColor: C.primary,
      paddingHorizontal: 28, paddingTop: 16, paddingBottom: 12,
      flexDirection: 'row', alignItems: 'center', gap: 12,
    },
    strClinicLogo: { height: 34, objectFit: 'contain', backgroundColor: C.white, padding: 2, borderRadius: 2 },
    strClinicName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.white, flex: 1 },
    strClinicMeta: { fontSize: 7, color: C.primaryLight },
    strAccentBar: { height: 3, backgroundColor: C.primaryDark },
    strSessionBlock: { marginBottom: 12, paddingHorizontal: 28 },
    strSessionHeader: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingVertical: 5, borderBottomWidth: 2, borderBottomColor: C.primary, marginBottom: 0,
    },
    strSessionLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.primaryDark },
    strRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 5 },
    strRowEven: { backgroundColor: C.primaryLight },
    strRowOdd: { backgroundColor: C.white },
    strNum: { width: 18, fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.primary },
    strName: { flex: 3, fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    strMetric: { flex: 2, fontSize: 8, color: C.gray600 },
    strNotes: { flex: 2, fontSize: 7, color: C.gray400, fontStyle: 'italic' },

    // ════════════════════════════════════════════════════
    // ── MAGAZINE style ───────────────────────────────────
    // ════════════════════════════════════════════════════
    magClinicHero: {
      paddingHorizontal: 28, paddingTop: 20, paddingBottom: 16,
      borderBottomWidth: 4, borderBottomColor: C.primary,
    },
    magClinicName: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    magClinicMeta: { fontSize: 8, color: C.gray400 },
    magSessionBlock: { marginBottom: 14, paddingHorizontal: 28 },
    magSessionHeader: {
      backgroundColor: C.gray800, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 8,
    },
    magSessionLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.white, textTransform: 'uppercase', letterSpacing: 1 },
    magGrid: { flexDirection: 'row', gap: 8, marginBottom: 4 },
    magCard: {
      flex: 1, borderWidth: 1, borderColor: C.gray200, borderRadius: 4, overflow: 'hidden',
    },
    magCardAccent: { height: 4, backgroundColor: C.primary },
    magCardBody: { padding: 8 },
    magCardName: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800, marginBottom: 3 },
    magCardMetric: { fontSize: 8, color: C.primary, fontFamily: 'Helvetica-Bold' },
    magCardNotes: { fontSize: 7, color: C.gray400, fontStyle: 'italic', marginTop: 2 },

    // ════════════════════════════════════════════════════
    // ── SIDEBAR style ────────────────────────────────────
    // ════════════════════════════════════════════════════
    sbarClinicHero: {
      backgroundColor: C.primaryDark,
      paddingHorizontal: 28, paddingTop: 16, paddingBottom: 12,
    },
    sbarClinicName: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 2 },
    sbarClinicMeta: { fontSize: 8, color: C.accentLight },
    sbarSessionBlock: { marginBottom: 12, paddingHorizontal: 28 },
    sbarSessionHeader: {
      paddingVertical: 6, borderLeftWidth: 4, borderLeftColor: C.primary, paddingLeft: 8, marginBottom: 4,
    },
    sbarSessionLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    sbarExRow: {
      flexDirection: 'row', alignItems: 'stretch', marginBottom: 4,
      borderWidth: 0.5, borderColor: C.gray200, borderRadius: 3, overflow: 'hidden',
    },
    sbarExMain: { flex: 3, padding: 8 },
    sbarExSidebar: { width: 72, backgroundColor: C.primaryLight, padding: 6, alignItems: 'center', justifyContent: 'center' },
    sbarExName: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800, marginBottom: 2 },
    sbarExNotes: { fontSize: 7, color: C.gray400, fontStyle: 'italic' },
    sbarMetricText: { fontSize: 8, color: C.primaryDark, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
    sbarMetricLabel: { fontSize: 6, color: C.gray600, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.3 },

    // ════════════════════════════════════════════════════
    // ── ACADEMIC style ───────────────────────────────────
    // ════════════════════════════════════════════════════
    acadClinicHero: {
      paddingHorizontal: 28, paddingTop: 20, paddingBottom: 16,
      borderBottomWidth: 2, borderBottomColor: C.gray800,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    },
    acadClinicName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    acadClinicMeta: { fontSize: 8, color: C.gray600 },
    acadDocInfo: { fontSize: 8, color: C.gray400, textAlign: 'right' },
    acadSessionBlock: { marginBottom: 14, paddingHorizontal: 28 },
    acadSessionHeader: {
      paddingTop: 10, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: C.gray800, marginBottom: 6,
    },
    acadSessionLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    acadExRow: { paddingVertical: 3, paddingLeft: 4 },
    acadExLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 5 },
    acadExNum: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800, width: 20 },
    acadExName: { flex: 1, fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    acadExSpec: { fontSize: 8, color: C.gray600, paddingLeft: 25, marginTop: 1 },
    acadExNotes: { fontSize: 7, color: C.gray400, fontStyle: 'italic', paddingLeft: 25 },

    // ════════════════════════════════════════════════════
    // ── OUTLINE style ────────────────────────────────────
    // ════════════════════════════════════════════════════
    outlClinicHero: {
      paddingHorizontal: 28, paddingTop: 16, paddingBottom: 10,
      borderBottomWidth: 1, borderBottomColor: C.gray200,
    },
    outlClinicName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    outlClinicMeta: { fontSize: 8, color: C.gray400 },
    outlSessionBlock: { marginBottom: 10, paddingHorizontal: 28 },
    outlSessionLabel: {
      fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.primary,
      paddingTop: 8, paddingBottom: 3, borderBottomWidth: 0.5, borderBottomColor: C.gray200, marginBottom: 4,
    },
    outlExRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 3, paddingLeft: 12, gap: 5 },
    outlBullet: {
      width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary,
      marginTop: 3, flexShrink: 0,
    },
    outlExName: { flex: 1, fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    outlExDetail: { paddingLeft: 23, fontSize: 8, color: C.gray600, marginTop: 1 },
    outlExNotes: { paddingLeft: 23, fontSize: 7, color: C.gray400, fontStyle: 'italic' },

    // ════════════════════════════════════════════════════
    // ── RECEIPT style ────────────────────────────────────
    // ════════════════════════════════════════════════════
    rcptClinicHero: {
      paddingHorizontal: 28, paddingTop: 14, paddingBottom: 10,
      alignItems: 'center', borderBottomWidth: 1.5, borderBottomColor: C.gray800,
    },
    rcptClinicName: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.gray800, textAlign: 'center' },
    rcptClinicMeta: { fontSize: 7, color: C.gray600, textAlign: 'center' },
    rcptDash: { borderBottomWidth: 1, borderBottomColor: C.gray200, borderStyle: 'dashed', marginHorizontal: 28, marginVertical: 4 },
    rcptSessionBlock: { marginBottom: 6, paddingHorizontal: 28 },
    rcptSessionLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.gray800, textTransform: 'uppercase', letterSpacing: 1, paddingVertical: 4 },
    rcptExRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: C.gray100 },
    rcptDotLeader: { flex: 1, borderBottomWidth: 0.5, borderBottomColor: C.gray200, marginHorizontal: 4 },
    rcptExName: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    rcptExMetric: { fontSize: 8, color: C.gray600 },

    // ════════════════════════════════════════════════════
    // ── NOTEBOOK style ───────────────────────────────────
    // ════════════════════════════════════════════════════
    nbClinicHero: {
      paddingHorizontal: 28, paddingTop: 16, paddingBottom: 10,
      borderBottomWidth: 2, borderBottomColor: C.primary,
      flexDirection: 'row', alignItems: 'center', gap: 10,
    },
    nbMarginLine: {
      position: 'absolute', top: 0, bottom: 0, left: 52, width: 1, borderLeftWidth: 1, borderLeftColor: C.primary,
    },
    nbClinicName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    nbClinicMeta: { fontSize: 7, color: C.gray400 },
    nbSessionBlock: { marginBottom: 8, paddingHorizontal: 28 },
    nbSessionLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.primary, paddingVertical: 6, textTransform: 'uppercase', letterSpacing: 0.8 },
    nbRuledRow: { paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: C.gray200, paddingLeft: 32 },
    nbExName: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    nbExDetail: { fontSize: 8, color: C.gray600, marginTop: 1 },
    nbExNotes: { fontSize: 7, color: C.gray400, fontStyle: 'italic' },

    // ════════════════════════════════════════════════════
    // ── POSTER style ─────────────────────────────────────
    // ════════════════════════════════════════════════════
    postClinicHero: {
      backgroundColor: C.primary,
      paddingHorizontal: 28, paddingTop: 24, paddingBottom: 20,
      alignItems: 'center',
    },
    postClinicLogo: { height: 48, objectFit: 'contain', marginBottom: 6 },
    postClinicName: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: C.white, textAlign: 'center', marginBottom: 4 },
    postClinicMeta: { fontSize: 9, color: C.primaryLight, textAlign: 'center' },
    postSessionBlock: { marginBottom: 16, paddingHorizontal: 28 },
    postSessionBanner: {
      backgroundColor: C.primaryDark, paddingHorizontal: 16, paddingVertical: 10,
      borderRadius: 5, marginBottom: 10,
    },
    postSessionLabel: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.white, textAlign: 'center' },
    postExRow: { marginBottom: 10, paddingHorizontal: 4 },
    postExName: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.gray800, marginBottom: 3 },
    postExMetric: { fontSize: 10, color: C.primary, fontFamily: 'Helvetica-Bold' },
    postExNotes: { fontSize: 9, color: C.gray400, fontStyle: 'italic', marginTop: 2 },

    // ════════════════════════════════════════════════════
    // ── PLAIN style ──────────────────────────────────────
    // ════════════════════════════════════════════════════
    plnClinicHero: { paddingHorizontal: 28, paddingTop: 16, paddingBottom: 8 },
    plnClinicName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    plnClinicMeta: { fontSize: 8, color: C.gray600 },
    plnSessionBlock: { marginBottom: 8, paddingHorizontal: 28 },
    plnSessionLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800, paddingTop: 8, paddingBottom: 3 },
    plnExRow: { paddingVertical: 3, paddingLeft: 8 },
    plnExName: { fontSize: 9, color: C.gray800 },
    plnExDetail: { fontSize: 8, color: C.gray600 },
    plnExNotes: { fontSize: 7, color: C.gray400 },

    // ════════════════════════════════════════════════════
    // ── ROUNDED style ────────────────────────────────────
    // ════════════════════════════════════════════════════
    rndClinicHero: {
      backgroundColor: C.primary, borderRadius: 0,
      paddingHorizontal: 28, paddingTop: 18, paddingBottom: 14,
      flexDirection: 'column', alignItems: 'center', gap: 4,
    },
    rndClinicLogo: { height: 36, objectFit: 'contain', marginBottom: 4 },
    rndClinicName: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: C.white, textAlign: 'center' },
    rndClinicMeta: { fontSize: 8, color: C.primaryLight, textAlign: 'center' },
    rndSessionBlock: { marginBottom: 12, paddingHorizontal: 28 },
    rndSessionBubble: {
      backgroundColor: C.primaryLight, borderRadius: 20,
      paddingHorizontal: 14, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 8,
    },
    rndSessionLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.primaryDark },
    rndExCard: {
      borderRadius: 8, borderWidth: 1, borderColor: C.gray200,
      marginBottom: 6, overflow: 'hidden',
    },
    rndExCardTop: { backgroundColor: C.primaryLight, paddingHorizontal: 10, paddingVertical: 6 },
    rndExName: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.primaryDark },
    rndExCardBottom: { padding: 8 },
    rndPillRow: { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },
    rndPill: {
      backgroundColor: C.primary, borderRadius: 10,
      paddingHorizontal: 8, paddingVertical: 2,
    },
    rndPillText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.white },
    rndExNotes: { fontSize: 7, color: C.gray400, fontStyle: 'italic', marginTop: 4 },

    // ════════════════════════════════════════════════════
    // ── HIGHLIGHT style ──────────────────────────────────
    // ════════════════════════════════════════════════════
    hlgtClinicHero: {
      paddingHorizontal: 28, paddingTop: 16, paddingBottom: 12,
      borderBottomWidth: 3, borderBottomColor: C.primary,
    },
    hlgtClinicName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.gray800, marginBottom: 2 },
    hlgtClinicMeta: { fontSize: 8, color: C.gray600 },
    hlgtSessionBlock: { marginBottom: 12, paddingHorizontal: 28 },
    hlgtSessionHeader: {
      backgroundColor: C.primary, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 6,
    },
    hlgtSessionLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.white },
    hlgtExRow: { marginBottom: 6 },
    hlgtHlBox: {
      backgroundColor: C.primaryLight, paddingHorizontal: 10, paddingVertical: 5,
      borderLeftWidth: 3, borderLeftColor: C.primary,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    hlgtExName: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.primaryDark, flex: 1 },
    hlgtMetricBadge: {
      backgroundColor: C.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3,
    },
    hlgtMetricText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.white },
    hlgtExNotes: { fontSize: 7, color: C.gray400, fontStyle: 'italic', paddingLeft: 10, paddingTop: 2 },

    // ════════════════════════════════════════════════════
    // ── COLUMNS style ────────────────────────────────────
    // ════════════════════════════════════════════════════
    colsClinicHero: {
      backgroundColor: C.primaryDark,
      paddingHorizontal: 28, paddingTop: 14, paddingBottom: 12,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    colsClinicName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.white },
    colsClinicMeta: { fontSize: 7, color: C.accentLight },
    colsSessionBlock: { marginBottom: 12, paddingHorizontal: 28 },
    colsSessionHeader: {
      flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5,
      borderBottomWidth: 1, borderBottomColor: C.primary, marginBottom: 6,
    },
    colsSessionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary },
    colsSessionLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    colsGrid: { flexDirection: 'row', gap: 6, marginBottom: 4 },
    colsCard: {
      flex: 1, borderWidth: 0.5, borderColor: C.gray200, borderRadius: 4, overflow: 'hidden',
    },
    colsCardHead: { backgroundColor: C.accent, paddingHorizontal: 6, paddingVertical: 4 },
    colsCardName: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.white },
    colsCardBody: { padding: 5, backgroundColor: C.gray50 },
    colsCardMetric: { fontSize: 8, color: C.primary, fontFamily: 'Helvetica-Bold' },
    colsCardNotes: { fontSize: 6, color: C.gray400, fontStyle: 'italic', marginTop: 2 },

    // ════════════════════════════════════════════════════
    // ── DIVIDER style ────────────────────────────────────
    // ════════════════════════════════════════════════════
    divClinicHero: {
      paddingHorizontal: 28, paddingTop: 16, paddingBottom: 12,
      borderBottomWidth: 1, borderBottomColor: C.gray200,
    },
    divClinicName: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: C.gray800, marginBottom: 2 },
    divClinicMeta: { fontSize: 8, color: C.gray400 },
    divSessionBlock: { marginBottom: 14, paddingHorizontal: 28 },
    divSessionDivider: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 8 },
    divDividerLine: { flex: 1, height: 1, backgroundColor: C.primary },
    divSessionBadge: {
      backgroundColor: C.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 2,
    },
    divSessionLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.white, textTransform: 'uppercase', letterSpacing: 0.8 },
    divExRow: { paddingVertical: 4, paddingLeft: 4 },
    divExName: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800, marginBottom: 1 },
    divExDetail: { fontSize: 8, color: C.gray600 },
    divExNotes: { fontSize: 7, color: C.gray400, fontStyle: 'italic', marginTop: 1 },
    divExSep: { height: 0.5, backgroundColor: C.gray100, marginTop: 4 },

    // ════════════════════════════════════════════════════
    // ── SCHEDULE style ───────────────────────────────────
    // ════════════════════════════════════════════════════
    schedClinicHero: {
      backgroundColor: C.primary,
      paddingHorizontal: 28, paddingTop: 14, paddingBottom: 10,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    schedClinicName: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.white },
    schedClinicMeta: { fontSize: 7, color: C.primaryLight },
    schedSessionBlock: { marginBottom: 12, paddingHorizontal: 28 },
    schedSessionHeader: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.gray100, borderWidth: 0.5, borderColor: C.gray200, overflow: 'hidden',
    },
    schedSessionTab: {
      backgroundColor: C.primaryDark, width: 8, alignSelf: 'stretch',
    },
    schedSessionLabelBox: { flex: 1, paddingHorizontal: 8, paddingVertical: 5 },
    schedSessionLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    schedSessionCount: { fontSize: 7, color: C.gray400 },
    schedTableHead: {
      flexDirection: 'row', backgroundColor: C.primary, marginTop: 2,
    },
    schedThNum: { width: 24, paddingVertical: 3, paddingLeft: 6, fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.white },
    schedThName: { flex: 3, paddingVertical: 3, paddingLeft: 4, fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.white },
    schedThSpec: { flex: 2, paddingVertical: 3, paddingLeft: 4, fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.white },
    schedRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: C.gray100 },
    schedRowEven: { backgroundColor: C.gray50 },
    schedRowOdd: { backgroundColor: C.white },
    schedTdNum: { width: 24, paddingVertical: 4, paddingLeft: 6, fontSize: 8, color: C.primary, fontFamily: 'Helvetica-Bold' },
    schedTdName: { flex: 3, paddingVertical: 4, paddingLeft: 4, fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    schedTdSpec: { flex: 2, paddingVertical: 4, paddingLeft: 4, fontSize: 8, color: C.gray600 },

    // ════════════════════════════════════════════════════
    // ── COMPACTCARD style ────────────────────────────────
    // ════════════════════════════════════════════════════
    ccClinicHero: {
      backgroundColor: C.accent,
      paddingHorizontal: 28, paddingTop: 10, paddingBottom: 8,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    ccClinicName: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.white },
    ccClinicMeta: { fontSize: 6, color: C.primaryLight },
    ccSessionBlock: { marginBottom: 6, paddingHorizontal: 28 },
    ccSessionHeader: {
      backgroundColor: C.primaryDark,
      paddingHorizontal: 6, paddingVertical: 2, marginBottom: 3,
    },
    ccSessionLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.white, textTransform: 'uppercase', letterSpacing: 0.5 },
    ccGrid: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
    ccCard: {
      width: '31%', borderWidth: 0.5, borderColor: C.gray200, borderRadius: 3, marginBottom: 4, overflow: 'hidden',
    },
    ccCardHead: { backgroundColor: C.primary, paddingHorizontal: 5, paddingVertical: 3 },
    ccCardName: { fontSize: 6, fontFamily: 'Helvetica-Bold', color: C.white },
    ccCardBody: { padding: 4 },
    ccCardMetric: { fontSize: 7, color: C.primary, fontFamily: 'Helvetica-Bold' },
    ccCardNotes: { fontSize: 5, color: C.gray400, fontStyle: 'italic', marginTop: 1 },
  });
}

// ── Helpers ───────────────────────────────────────────────

interface SocialLink {
  label: string;
  display: string;
  href: string;
}

function buildSocialLinks(clinic: PDFRenderContext['clinic']): SocialLink[] {
  const strip = (phone: string) =>
    phone.replace(/[^\d+]/g, '').replace(/(?<!^)\+/g, '');
  return [
    clinic.clinicWhatsApp ? { label: 'WhatsApp', display: `WhatsApp: ${clinic.clinicWhatsApp}`, href: `https://wa.me/${strip(clinic.clinicWhatsApp)}` } : null,
    clinic.clinicGmail    ? { label: 'Gmail', display: `Gmail: ${clinic.clinicGmail}`, href: `mailto:${clinic.clinicGmail}` } : null,
    clinic.clinicInstagram ? { label: 'Instagram', display: 'Instagram', href: clinic.clinicInstagram } : null,
    clinic.clinicFacebook  ? { label: 'Facebook', display: 'Facebook', href: clinic.clinicFacebook } : null,
  ].filter(Boolean) as SocialLink[];
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return iso; }
}

function dash(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return '—';
  return String(value);
}

function metricStr(pe: { sets?: number; reps?: string; holdTime?: number; restSeconds?: number }): string {
  const parts: string[] = [];
  if (pe.sets != null)        parts.push(`${pe.sets} sets`);
  if (pe.reps != null)        parts.push(`${pe.reps} reps`);
  if (pe.holdTime != null)    parts.push(`hold ${pe.holdTime}s`);
  if (pe.restSeconds != null) parts.push(`rest ${pe.restSeconds}s`);
  return parts.join(' · ');
}

// ── Component ─────────────────────────────────────────────

export default function ProgramPDF({
  program,
  clientName,
  exerciseMap,
  qrCodeMap,
  clinic,
  template,
}: PDFRenderContext) {
  const C = buildPalette(template);
  const S = buildStyles(C);
  const layout: LayoutVariant = template?.layoutVariant ?? 'professional';

  const hasQR = qrCodeMap.size > 0;
  const hasClinic = Boolean(clinic.clinicName);
  const socialLinks = buildSocialLinks(clinic);
  const exportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const clinicContactParts: string[] = [
    clinic.therapistName ? `Therapist: ${clinic.therapistName}` : null,
    clinic.clinicEmail   ? clinic.clinicEmail   : null,
    clinic.clinicAddress ? clinic.clinicAddress : null,
    clinic.clinicWebsite ? clinic.clinicWebsite : null,
  ].filter(Boolean) as string[];

  // ── Shared: program info card ──────────────────────────
  const ProgramInfoCard = () => (
    <View style={S.programCard}>
      <View style={S.programCardHeader}>
        <Text style={S.programName}>{program.name}</Text>
      </View>
      <View style={S.programCardBody}>
        <View style={S.programGrid}>
          {([
            ['Client', clientName],
            ['Condition', program.condition],
            ['Duration', `${program.durationWeeks} week${program.durationWeeks !== 1 ? 's' : ''}`],
            ['Start Date', formatDate(program.startDate)],
            ...(clinic.therapistName ? [['Therapist', clinic.therapistName]] : []),
            ['Sessions', String(program.sessions.length)],
          ] as [string, string][]).map(([label, value]) => (
            <View key={label} style={S.programGridItem}>
              <Text style={S.programGridLabel}>{label}</Text>
              <Text style={S.programGridValue}>{value}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const GoalBox = () =>
    program.goal ? (
      <View style={S.goalBox}>
        <Text style={S.goalLabel}>Program Goal</Text>
        <Text style={S.goalText}>{program.goal}</Text>
      </View>
    ) : null;

  // ════════════════════════════════════════════════════
  // ── PROFESSIONAL ─────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'professional') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {/* Repeating thin header */}
          {hasClinic && (
            <View fixed style={S.fixedHeader}>
              {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.fixedHeaderLogo} />}
              <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
              <Text style={S.fixedHeaderProgram}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>

          {/* Hero */}
          <View style={S.proClinicHero}>
            {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.proClinicLogo} />}
            <View style={{ flex: 1 }}>
              <Text style={S.proClinicName}>{clinic.clinicName || 'Rehabilitation Program Report'}</Text>
              {clinicContactParts.length > 0 && (
                <Text style={S.proClinicMeta}>{clinicContactParts.join('  ·  ')}</Text>
              )}
              {socialLinks.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {socialLinks.map((link) => (
                    <Link key={link.label} src={link.href} style={{ fontSize: 8, color: C.accentLight, textDecoration: 'underline' }}>
                      {link.display}
                    </Link>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Report strip */}
          <View style={S.proReportStrip}>
            <Text style={S.proReportTitle}>Rehabilitation Program Report</Text>
            <Text style={S.proReportDate}>Exported {exportDate}</Text>
          </View>

          {/* Content */}
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : (
              program.sessions.map((session, si) => {
                const sessionHasQR = hasQR && session.exercises.some((pe) => qrCodeMap.has(pe.exerciseId));
                return (
                  <View key={session.id} style={S.proSessionBlock}>
                    <View wrap={false}>
                      <View style={S.proSessionHeader}>
                        <Text style={S.proSessionBadge}>{si + 1}</Text>
                        <Text style={S.proSessionLabel}>{session.label}</Text>
                      </View>
                      {session.exercises.length === 0 ? (
                        <View style={{ padding: 8 }}><Text style={S.emptySessionText}>Empty session</Text></View>
                      ) : (
                        <>
                          <View style={S.tableHead}>
                            <Text style={S.thExercise}>Exercise</Text>
                            <Text style={S.thSmall}>Sets</Text>
                            <Text style={S.thSmall}>Reps</Text>
                            <Text style={S.thSmall}>Hold (s)</Text>
                            <Text style={S.thSmall}>Rest (s)</Text>
                            <Text style={S.thNotes}>Notes</Text>
                            {sessionHasQR && <Text style={S.thQR}>Video</Text>}
                          </View>
                          {(() => {
                            const pe = session.exercises[0];
                            const exEntry = exerciseMap.get(pe.exerciseId);
                            const qrDataUrl = qrCodeMap.get(pe.exerciseId);
                            return (
                              <View style={[S.tableRow, S.tableRowEven]}>
                                <View style={S.tdExercise}>
                                  <Text>{exEntry?.name ?? 'Unknown exercise'}</Text>
                                  {exEntry?.videoUrl && <Link src={exEntry.videoUrl} style={{ fontSize: 7, color: C.primary, marginTop: 1 }}>Watch video ▶</Link>}
                                </View>
                                <Text style={S.tdSmall}>{dash(pe.sets)}</Text>
                                <Text style={S.tdSmall}>{dash(pe.reps)}</Text>
                                <Text style={S.tdSmall}>{dash(pe.holdTime)}</Text>
                                <Text style={S.tdSmall}>{dash(pe.restSeconds)}</Text>
                                <Text style={S.tdNotes}>{pe.notes ?? ''}</Text>
                                {sessionHasQR && (
                                  <View style={S.tdQR}>
                                    {qrDataUrl ? <Image src={qrDataUrl} style={S.qrImage} /> : <View style={S.qrSpacer} />}
                                  </View>
                                )}
                              </View>
                            );
                          })()}
                        </>
                      )}
                    </View>
                    {/* Remaining table rows */}
                    {session.exercises.length > 1 && session.exercises.slice(1).map((pe, ei) => {
                      const exEntry = exerciseMap.get(pe.exerciseId);
                      const qrDataUrl = qrCodeMap.get(pe.exerciseId);
                      const sessionHasQR2 = hasQR && session.exercises.some((p) => qrCodeMap.has(p.exerciseId));
                      const isLast = ei === session.exercises.length - 2;
                      const isOdd = (ei + 1) % 2 !== 0;
                      return (
                        <View key={pe.id} style={[S.tableRow, isOdd ? S.tableRowOdd : S.tableRowEven, isLast ? S.tableRowLast : {}]} wrap={false}>
                          <View style={S.tdExercise}>
                            <Text>{exEntry?.name ?? 'Unknown exercise'}</Text>
                            {exEntry?.videoUrl && <Link src={exEntry.videoUrl} style={{ fontSize: 7, color: C.primary, marginTop: 1 }}>Watch video ▶</Link>}
                          </View>
                          <Text style={S.tdSmall}>{dash(pe.sets)}</Text>
                          <Text style={S.tdSmall}>{dash(pe.reps)}</Text>
                          <Text style={S.tdSmall}>{dash(pe.holdTime)}</Text>
                          <Text style={S.tdSmall}>{dash(pe.restSeconds)}</Text>
                          <Text style={S.tdNotes}>{pe.notes ?? ''}</Text>
                          {sessionHasQR2 && (
                            <View style={S.tdQR}>
                              {qrDataUrl ? <Image src={qrDataUrl} style={S.qrImage} /> : <View style={S.qrSpacer} />}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                );
              })
            )}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── PATIENT ──────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'patient') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={S.fixedHeader}>
              {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.fixedHeaderLogo} />}
              <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
              <Text style={S.fixedHeaderProgram}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>

          {/* Centered hero */}
          <View style={S.patClinicHero}>
            {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.patClinicLogo} />}
            <Text style={S.patClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
            {clinicContactParts.length > 0 && (
              <Text style={S.patClinicSub}>{clinicContactParts.slice(0, 2).join('  ·  ')}</Text>
            )}
            {socialLinks.length > 0 && (
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
                {socialLinks.map((link) => (
                  <Link key={link.label} src={link.href} style={{ fontSize: 8, color: C.accentLight, textDecoration: 'underline' }}>
                    {link.display}
                  </Link>
                ))}
              </View>
            )}
          </View>
          <View style={S.patReportStrip}>
            <Text style={S.patReportTitle}>Your Rehabilitation Program · {exportDate}</Text>
          </View>

          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : (
              program.sessions.map((session, si) => (
                <View key={session.id} style={S.patSessionBlock}>
                  <View style={S.patSessionHeader}>
                    <Text style={S.patSessionLabel}>Session {si + 1}: {session.label}</Text>
                  </View>
                  {session.exercises.length === 0 ? (
                    <View style={{ paddingHorizontal: 28 }}><Text style={S.emptySessionText}>Empty session</Text></View>
                  ) : (
                    session.exercises.map((pe, ei) => {
                      const exEntry = exerciseMap.get(pe.exerciseId);
                      const isEven = ei % 2 === 0;
                      return (
                        <View key={pe.id} style={[S.patExCard, isEven ? S.patExCardEven : S.patExCardOdd]} wrap={false}>
                          <Text style={S.patExName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                          <Text style={S.patExMetrics}>{metricStr(pe) || '—'}</Text>
                          {pe.notes ? <Text style={S.patExNotes}>{pe.notes}</Text> : null}
                          {exEntry?.videoUrl && (
                            <Link src={exEntry.videoUrl} style={{ fontSize: 8, color: C.primary, marginTop: 2 }}>Watch video ▶</Link>
                          )}
                        </View>
                      );
                    })
                  )}
                </View>
              ))
            )}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── CHECKLIST ────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'checklist') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={[S.fixedHeader, { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.gray200, borderLeftWidth: 4, borderLeftColor: C.primary }]}>
              <Text style={[S.fixedHeaderClinic, { color: C.gray800 }]}>{clinic.clinicName}</Text>
              <Text style={[S.fixedHeaderProgram, { color: C.gray600 }]}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>

          <View style={S.chkClinicHero}>
            {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={{ height: 36, objectFit: 'contain', marginBottom: 4 }} />}
            <Text style={S.chkClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
            {clinicContactParts.length > 0 && (
              <Text style={S.chkClinicMeta}>{clinicContactParts.join('  ·  ')}</Text>
            )}
          </View>
          <View style={S.chkReportStrip}>
            <Text style={S.chkReportTitle}>Rehabilitation Program · {exportDate}</Text>
          </View>

          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : (
              program.sessions.map((session, si) => (
                <View key={session.id} style={S.chkSessionBlock}>
                  <View style={S.chkSessionHeader}>
                    <Text style={S.chkSessionLabel}>Session {si + 1}: {session.label}</Text>
                  </View>
                  {session.exercises.length === 0 ? (
                    <Text style={S.emptySessionText}>Empty session</Text>
                  ) : (
                    session.exercises.map((pe) => {
                      const exEntry = exerciseMap.get(pe.exerciseId);
                      const metric = [
                        pe.sets != null ? `${pe.sets}×${pe.reps ?? '?'}` : null,
                        pe.holdTime != null ? `hold ${pe.holdTime}s` : null,
                        pe.restSeconds != null ? `rest ${pe.restSeconds}s` : null,
                      ].filter(Boolean).join(' · ');
                      return (
                        <View key={pe.id} style={S.chkRow} wrap={false}>
                          <View style={S.chkBox} />
                          <View style={{ flex: 1 }}>
                            <Text style={S.chkExName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                            {pe.notes ? <Text style={S.chkExNotes}>{pe.notes}</Text> : null}
                          </View>
                          <Text style={S.chkMetric}>{metric}</Text>
                        </View>
                      );
                    })
                  )}
                </View>
              ))
            )}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── CLINICAL ─────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'clinical') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={[S.fixedHeader, { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.gray200 }]}>
              <Text style={[S.fixedHeaderClinic, { color: C.gray800 }]}>{clinic.clinicName}</Text>
              <Text style={[S.fixedHeaderProgram, { color: C.gray400 }]}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>

          <View style={S.clinClinicHero}>
            <Text style={S.clinClinicName}>{clinic.clinicName || 'Rehabilitation Program Report'}</Text>
            {clinicContactParts.length > 0 && (
              <Text style={S.clinClinicMeta}>{clinicContactParts.join('  ·  ')}</Text>
            )}
          </View>
          <View style={S.clinReportStrip}>
            <Text style={S.clinReportTitle}>
              Rehabilitation Program Report  ·  {exportDate}
            </Text>
          </View>

          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : (
              program.sessions.map((session, si) => (
                <View key={session.id} style={S.clinSessionBlock}>
                  <View style={S.clinSessionHeader}>
                    <Text style={S.clinSessionLabel}>Session {si + 1}: {session.label.toUpperCase()}</Text>
                  </View>
                  {session.exercises.length === 0 ? (
                    <Text style={S.emptySessionText}>Empty session</Text>
                  ) : (
                    session.exercises.map((pe, ei) => {
                      const exEntry = exerciseMap.get(pe.exerciseId);
                      const detail = metricStr(pe);
                      return (
                        <View key={pe.id} style={S.clinRow} wrap={false}>
                          <View style={S.clinExLine}>
                            <Text style={S.clinExNum}>{ei + 1}.</Text>
                            <Text style={S.clinExName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                          </View>
                          {detail ? <Text style={S.clinExDetail}>{detail}</Text> : null}
                          {pe.notes ? <Text style={S.clinExNotes}>Note: {pe.notes}</Text> : null}
                          {exEntry?.videoUrl && (
                            <Link src={exEntry.videoUrl} style={{ fontSize: 7, color: C.primary, paddingLeft: 18, marginTop: 1 }}>Video reference ▶</Link>
                          )}
                        </View>
                      );
                    })
                  )}
                </View>
              ))
            )}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── MINIMAL ──────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'minimal') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={[S.fixedHeader, { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.gray200 }]}>
              <Text style={[S.fixedHeaderClinic, { color: C.gray800 }]}>{clinic.clinicName}</Text>
              <Text style={[S.fixedHeaderProgram, { color: C.gray400 }]}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.minClinicHero}>
            <Text style={S.minClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
            {clinicContactParts.length > 0 && (
              <Text style={S.minClinicMeta}>{clinicContactParts.join('  ·  ')}</Text>
            )}
          </View>
          <View style={S.minReportStrip}>
            <Text style={S.minReportTitle}>Rehabilitation Program · {exportDate}</Text>
          </View>
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : (
              program.sessions.map((session, si) => (
                <View key={session.id} style={S.minSessionBlock}>
                  <View style={S.minSessionHeader}>
                    <Text style={S.minSessionLabel}>Session {si + 1}: {session.label.toUpperCase()}</Text>
                  </View>
                  {session.exercises.length === 0 ? (
                    <Text style={S.emptySessionText}>Empty session</Text>
                  ) : (
                    <>
                      <View style={S.minTableHead}>
                        <Text style={[S.minTh, { flex: 3 }]}>Exercise</Text>
                        <Text style={S.minThSmall}>Sets</Text>
                        <Text style={S.minThSmall}>Reps</Text>
                        <Text style={S.minThSmall}>Hold</Text>
                        <Text style={S.minThSmall}>Rest</Text>
                        <Text style={[S.minTh, { flex: 2 }]}>Notes</Text>
                      </View>
                      {session.exercises.map((pe) => {
                        const exEntry = exerciseMap.get(pe.exerciseId);
                        return (
                          <View key={pe.id} style={S.minRow} wrap={false}>
                            <View style={S.minTd}><Text>{exEntry?.name ?? 'Unknown exercise'}</Text></View>
                            <Text style={S.minTdSmall}>{dash(pe.sets)}</Text>
                            <Text style={S.minTdSmall}>{dash(pe.reps)}</Text>
                            <Text style={S.minTdSmall}>{dash(pe.holdTime)}</Text>
                            <Text style={S.minTdSmall}>{dash(pe.restSeconds)}</Text>
                            <Text style={S.minTdNotes}>{pe.notes ?? ''}</Text>
                          </View>
                        );
                      })}
                    </>
                  )}
                </View>
              ))
            )}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── BOLD ─────────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'bold') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={S.fixedHeader}>
              {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.fixedHeaderLogo} />}
              <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
              <Text style={S.fixedHeaderProgram}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.boldClinicHero}>
            {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.boldClinicLogo} />}
            <Text style={S.boldClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
            {clinicContactParts.length > 0 && (
              <Text style={S.boldClinicMeta}>{clinicContactParts.slice(0, 2).join('  ·  ')}</Text>
            )}
          </View>
          <View style={S.boldAccentBar} />
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : (
              program.sessions.map((session, si) => (
                <View key={session.id} style={S.boldSessionBlock}>
                  <View style={S.boldSessionHeader} wrap={false}>
                    <Text style={S.boldSessionLabel}>Session {si + 1}: {session.label}</Text>
                  </View>
                  {session.exercises.length === 0 ? (
                    <Text style={S.emptySessionText}>Empty session</Text>
                  ) : (
                    session.exercises.map((pe) => {
                      const exEntry = exerciseMap.get(pe.exerciseId);
                      const pills: [string, string][] = [];
                      if (pe.sets != null)        pills.push(['Sets', String(pe.sets)]);
                      if (pe.reps != null)        pills.push(['Reps', pe.reps]);
                      if (pe.holdTime != null)    pills.push(['Hold', `${pe.holdTime}s`]);
                      if (pe.restSeconds != null) pills.push(['Rest', `${pe.restSeconds}s`]);
                      return (
                        <View key={pe.id} style={S.boldExRow} wrap={false}>
                          <Text style={S.boldExName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                          <View style={S.boldPillRow}>
                            {pills.map(([label, value]) => (
                              <View key={label} style={S.boldPill}>
                                <Text style={S.boldPillValue}>{value}</Text>
                                <Text style={S.boldPillLabel}>{label}</Text>
                              </View>
                            ))}
                          </View>
                          {pe.notes ? <Text style={S.boldExNotes}>{pe.notes}</Text> : null}
                          {exEntry?.videoUrl && (
                            <Link src={exEntry.videoUrl} style={{ fontSize: 7, color: C.primary, marginTop: 2 }}>Watch video ▶</Link>
                          )}
                        </View>
                      );
                    })
                  )}
                </View>
              ))
            )}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── EXECUTIVE ────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'executive') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={[S.fixedHeader, { backgroundColor: '#1e293b' }]}>
              {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.fixedHeaderLogo} />}
              <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
              <Text style={S.fixedHeaderProgram}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.execClinicHero}>
            {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.execClinicLogo} />}
            <View style={{ flex: 1 }}>
              <Text style={S.execClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
              {clinicContactParts.length > 0 && (
                <Text style={S.execClinicMeta}>{clinicContactParts.join('  ·  ')}</Text>
              )}
            </View>
          </View>
          <View style={S.execAccentLine} />
          <View style={S.execReportStrip}>
            <Text style={S.execReportTitle}>Rehabilitation Program Report</Text>
            <Text style={S.execReportDate}>Exported {exportDate}</Text>
          </View>
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : (
              program.sessions.map((session, si) => (
                <View key={session.id} style={S.execSessionBlock}>
                  <View wrap={false}>
                    <View style={S.execSessionHeader}>
                      <Text style={S.execSessionBadge}>{si + 1}</Text>
                      <Text style={S.execSessionLabel}>{session.label}</Text>
                    </View>
                    {session.exercises.length === 0 ? (
                      <View style={{ padding: 8 }}><Text style={S.emptySessionText}>Empty session</Text></View>
                    ) : (
                      <>
                        <View style={S.tableHead}>
                          <Text style={S.thExercise}>Exercise</Text>
                          <Text style={S.thSmall}>Sets</Text>
                          <Text style={S.thSmall}>Reps</Text>
                          <Text style={S.thSmall}>Hold (s)</Text>
                          <Text style={S.thSmall}>Rest (s)</Text>
                          <Text style={S.thNotes}>Notes</Text>
                        </View>
                        {session.exercises.slice(0, 1).map((pe) => {
                          const exEntry = exerciseMap.get(pe.exerciseId);
                          return (
                            <View key={pe.id} style={[S.tableRow, S.tableRowEven]}>
                              <Text style={S.tdExercise}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                              <Text style={S.tdSmall}>{dash(pe.sets)}</Text>
                              <Text style={S.tdSmall}>{dash(pe.reps)}</Text>
                              <Text style={S.tdSmall}>{dash(pe.holdTime)}</Text>
                              <Text style={S.tdSmall}>{dash(pe.restSeconds)}</Text>
                              <Text style={S.tdNotes}>{pe.notes ?? ''}</Text>
                            </View>
                          );
                        })}
                      </>
                    )}
                  </View>
                  {session.exercises.length > 1 && session.exercises.slice(1).map((pe, ei) => {
                    const exEntry = exerciseMap.get(pe.exerciseId);
                    const isOdd = (ei + 1) % 2 !== 0;
                    const isLast = ei === session.exercises.length - 2;
                    return (
                      <View key={pe.id} style={[S.tableRow, isOdd ? S.tableRowOdd : S.tableRowEven, isLast ? S.tableRowLast : {}]} wrap={false}>
                        <Text style={S.tdExercise}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                        <Text style={S.tdSmall}>{dash(pe.sets)}</Text>
                        <Text style={S.tdSmall}>{dash(pe.reps)}</Text>
                        <Text style={S.tdSmall}>{dash(pe.holdTime)}</Text>
                        <Text style={S.tdSmall}>{dash(pe.restSeconds)}</Text>
                        <Text style={S.tdNotes}>{pe.notes ?? ''}</Text>
                      </View>
                    );
                  })}
                </View>
              ))
            )}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── COMPACT ──────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'compact') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={[S.fixedHeader, { backgroundColor: C.primary, height: 20, paddingHorizontal: 20 }]}>
              <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
              <Text style={S.fixedHeaderProgram}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.compClinicHero}>
            <Text style={S.compClinicName}>{clinic.clinicName || 'Rehab Program'}</Text>
            <Text style={S.compClinicMeta}>{exportDate}</Text>
          </View>
          <View style={[S.content, { paddingTop: 8 }]}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : (
              program.sessions.map((session, si) => (
                <View key={session.id} style={S.compSessionBlock}>
                  <View wrap={false}>
                    <View style={S.compSessionHeader}>
                      <Text style={S.compSessionLabel}>S{si + 1}: {session.label}</Text>
                    </View>
                    {session.exercises.length === 0 ? (
                      <View style={{ padding: 4 }}><Text style={S.emptySessionText}>Empty session</Text></View>
                    ) : (
                      <>
                        <View style={S.compTableHead}>
                          <Text style={S.compThEx}>Exercise</Text>
                          <Text style={S.compThSm}>Sets</Text>
                          <Text style={S.compThSm}>Reps</Text>
                          <Text style={S.compThSm}>Hold</Text>
                          <Text style={S.compThSm}>Rest</Text>
                          <Text style={S.compThNt}>Notes</Text>
                        </View>
                        {session.exercises.slice(0, 1).map((pe) => {
                          const exEntry = exerciseMap.get(pe.exerciseId);
                          return (
                            <View key={pe.id} style={[S.compRow, { backgroundColor: C.white }]}>
                              <Text style={S.compTdEx}>{exEntry?.name ?? 'Unknown'}</Text>
                              <Text style={S.compTdSm}>{dash(pe.sets)}</Text>
                              <Text style={S.compTdSm}>{dash(pe.reps)}</Text>
                              <Text style={S.compTdSm}>{dash(pe.holdTime)}</Text>
                              <Text style={S.compTdSm}>{dash(pe.restSeconds)}</Text>
                              <Text style={S.compTdNt}>{pe.notes ?? ''}</Text>
                            </View>
                          );
                        })}
                      </>
                    )}
                  </View>
                  {session.exercises.length > 1 && session.exercises.slice(1).map((pe, ei) => {
                    const exEntry = exerciseMap.get(pe.exerciseId);
                    const isOdd = (ei + 1) % 2 !== 0;
                    return (
                      <View key={pe.id} style={[S.compRow, isOdd ? { backgroundColor: C.gray50 } : { backgroundColor: C.white }]} wrap={false}>
                        <Text style={S.compTdEx}>{exEntry?.name ?? 'Unknown'}</Text>
                        <Text style={S.compTdSm}>{dash(pe.sets)}</Text>
                        <Text style={S.compTdSm}>{dash(pe.reps)}</Text>
                        <Text style={S.compTdSm}>{dash(pe.holdTime)}</Text>
                        <Text style={S.compTdSm}>{dash(pe.restSeconds)}</Text>
                        <Text style={S.compTdNt}>{pe.notes ?? ''}</Text>
                      </View>
                    );
                  })}
                </View>
              ))
            )}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── TWOCOLUMN ────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'twoColumn') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={[S.fixedHeader, { backgroundColor: C.primary }]}>
              {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.fixedHeaderLogo} />}
              <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
              <Text style={S.fixedHeaderProgram}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.tcolClinicHero}>
            <View>
              <Text style={S.tcolClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
              {clinicContactParts.length > 0 && (
                <Text style={S.tcolClinicMeta}>{clinicContactParts.slice(0, 2).join('  ·  ')}</Text>
              )}
            </View>
            <Text style={{ fontSize: 8, color: C.primaryLight }}>{exportDate}</Text>
          </View>
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : (
              program.sessions.map((session, si) => {
                const pairs: typeof session.exercises[] = [];
                for (let i = 0; i < session.exercises.length; i += 2) {
                  pairs.push(session.exercises.slice(i, i + 2));
                }
                return (
                  <View key={session.id} style={S.tcolSessionBlock}>
                    <View style={S.tcolSessionHeader}>
                      <Text style={S.tcolSessionLabel}>Session {si + 1}: {session.label}</Text>
                    </View>
                    {session.exercises.length === 0 ? (
                      <Text style={S.emptySessionText}>Empty session</Text>
                    ) : (
                      pairs.map((pair, pi) => (
                        <View key={pi} style={S.tcolRow}>
                          {pair.map((pe) => {
                            const exEntry = exerciseMap.get(pe.exerciseId);
                            return (
                              <View key={pe.id} style={S.tcolCard} wrap={false}>
                                <View style={S.tcolCardHeader}>
                                  <Text style={S.tcolCardName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                                </View>
                                <View style={S.tcolCardBody}>
                                  <Text style={S.tcolCardMetric}>{metricStr(pe) || '—'}</Text>
                                  {pe.notes ? <Text style={S.tcolCardNotes}>{pe.notes}</Text> : null}
                                </View>
                              </View>
                            );
                          })}
                          {pair.length === 1 && <View style={{ flex: 1 }} />}
                        </View>
                      ))
                    )}
                  </View>
                );
              })
            )}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── LEDGER ───────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'ledger') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={[S.fixedHeader, { backgroundColor: C.primaryLight, borderBottomWidth: 1, borderBottomColor: C.primary }]}>
              <Text style={[S.fixedHeaderClinic, { color: C.primaryDark }]}>{clinic.clinicName}</Text>
              <Text style={[S.fixedHeaderProgram, { color: C.primaryDark }]}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.ledClinicHero}>
            {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={{ height: 30, objectFit: 'contain', marginBottom: 4 }} />}
            <Text style={S.ledClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
            {clinicContactParts.length > 0 && (
              <Text style={S.ledClinicMeta}>{clinicContactParts.join('  ·  ')}</Text>
            )}
          </View>
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : (
              program.sessions.map((session, si) => (
                <View key={session.id} style={S.ledSessionBlock}>
                  <Text style={S.ledSessionLabel}>Session {si + 1}: {session.label}</Text>
                  {session.exercises.length === 0 ? (
                    <Text style={S.emptySessionText}>Empty session</Text>
                  ) : (
                    <>
                      <View style={S.ledColHeader} wrap={false}>
                        <View style={S.ledColHNum} />
                        <View style={S.ledColHName}><Text style={S.ledColHText}>Exercise</Text></View>
                        <View style={S.ledColHMeta}><Text style={S.ledColHText}>Metrics</Text></View>
                        <View style={S.ledColHMeta}><Text style={S.ledColHText}>Notes</Text></View>
                      </View>
                      {session.exercises.map((pe, ei) => {
                        const exEntry = exerciseMap.get(pe.exerciseId);
                        const isEven = ei % 2 === 0;
                        return (
                          <View key={pe.id} style={[S.ledRow, isEven ? S.ledRowEven : S.ledRowOdd]} wrap={false}>
                            <View style={S.ledNumCell}>
                              <Text style={S.ledNumText}>{ei + 1}</Text>
                            </View>
                            <View style={S.ledNameCell}>
                              <Text style={S.ledNameText}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                              {exEntry?.videoUrl && (
                                <Link src={exEntry.videoUrl} style={{ fontSize: 7, color: C.primary, marginTop: 1 }}>Video ▶</Link>
                              )}
                            </View>
                            <View style={S.ledMetaCell}>
                              <Text style={S.ledMetaText}>{metricStr(pe) || '—'}</Text>
                            </View>
                            <View style={S.ledMetaCell}>
                              {pe.notes ? <Text style={S.ledNotesText}>{pe.notes}</Text> : null}
                            </View>
                          </View>
                        );
                      })}
                    </>
                  )}
                </View>
              ))
            )}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── TIMELINE ─────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'timeline') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={[S.fixedHeader, { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.gray200, borderLeftWidth: 4, borderLeftColor: C.primary }]}>
              <Text style={[S.fixedHeaderClinic, { color: C.gray800 }]}>{clinic.clinicName}</Text>
              <Text style={[S.fixedHeaderProgram, { color: C.gray400 }]}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.tlClinicHero}>
            <Text style={S.tlClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
            {clinicContactParts.length > 0 && (
              <Text style={S.tlClinicMeta}>{clinicContactParts.join('  ·  ')}</Text>
            )}
          </View>
          <View style={S.tlReportStrip}>
            <Text style={S.tlReportTitle}>Rehabilitation Program · {exportDate}</Text>
          </View>
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : (
              program.sessions.map((session, si) => (
                <View key={session.id} style={S.tlSessionBlock}>
                  <Text style={S.tlSessionLabel}>Session {si + 1}: {session.label}</Text>
                  {session.exercises.length === 0 ? (
                    <Text style={S.emptySessionText}>Empty session</Text>
                  ) : (
                    session.exercises.map((pe, ei) => {
                      const exEntry = exerciseMap.get(pe.exerciseId);
                      const isLast = ei === session.exercises.length - 1;
                      return (
                        <View key={pe.id} style={S.tlExRow} wrap={false}>
                          <View style={S.tlMarkerCol}>
                            <View style={S.tlDot}>
                              <Text style={S.tlDotText}>{ei + 1}</Text>
                            </View>
                            {!isLast && <View style={S.tlLine} />}
                          </View>
                          <View style={S.tlContent}>
                            <Text style={S.tlExName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                            <Text style={S.tlExMetrics}>{metricStr(pe) || '—'}</Text>
                            {pe.notes ? <Text style={S.tlExNotes}>{pe.notes}</Text> : null}
                            {exEntry?.videoUrl && (
                              <Link src={exEntry.videoUrl} style={{ fontSize: 7, color: C.primary, marginTop: 2 }}>Watch video ▶</Link>
                            )}
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              ))
            )}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── HANDOUT ──────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'handout') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={S.fixedHeader}>
              {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.fixedHeaderLogo} />}
              <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
              <Text style={S.fixedHeaderProgram}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.hoClinicHero}>
            {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.hoClinicLogo} />}
            <Text style={S.hoClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
            {clinicContactParts.length > 0 && (
              <Text style={S.hoClinicSub}>{clinicContactParts.slice(0, 2).join('  ·  ')}</Text>
            )}
          </View>
          <View style={S.hoReportStrip}>
            <Text style={S.hoReportTitle}>Your Rehabilitation Program · {exportDate}</Text>
          </View>
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : (
              program.sessions.map((session, si) => (
                <View key={session.id} style={S.hoSessionBlock}>
                  <View style={S.hoSessionHeader}>
                    <Text style={S.hoSessionLabel}>Session {si + 1}: {session.label}</Text>
                  </View>
                  {session.exercises.length === 0 ? (
                    <Text style={S.emptySessionText}>Empty session</Text>
                  ) : (
                    session.exercises.map((pe) => {
                      const exEntry = exerciseMap.get(pe.exerciseId);
                      return (
                        <View key={pe.id} style={S.hoExRow} wrap={false}>
                          <View style={S.hoCheckBox} />
                          <View style={{ flex: 1 }}>
                            <Text style={S.hoExName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                            <Text style={S.hoExMetrics}>{metricStr(pe) || '—'}</Text>
                            {pe.notes ? <Text style={S.hoExNotes}>{pe.notes}</Text> : null}
                            {exEntry?.videoUrl && (
                              <Link src={exEntry.videoUrl} style={{ fontSize: 9, color: C.primary, marginTop: 3 }}>Watch video ▶</Link>
                            )}
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              ))
            )}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── REPORT ───────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'report') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={[S.fixedHeader, { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.gray200 }]}>
              <Text style={[S.fixedHeaderClinic, { color: C.gray800 }]}>{clinic.clinicName}</Text>
              <Text style={[S.fixedHeaderProgram, { color: C.gray400 }]}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.rpClinicHero}>
            <Text style={S.rpClinicName}>{clinic.clinicName || 'Rehabilitation Program Report'}</Text>
            {clinicContactParts.length > 0 && (
              <Text style={S.rpClinicMeta}>{clinicContactParts.join('  ·  ')}</Text>
            )}
          </View>
          <View style={S.rpAccentBar} />
          <Text style={S.rpDocTitle}>Rehabilitation Program Report</Text>
          <Text style={S.rpDocMeta}>Exported {exportDate} · {program.sessions.length} Session{program.sessions.length !== 1 ? 's' : ''}</Text>
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : (
              program.sessions.map((session, si) => (
                <View key={session.id} style={S.rpSessionBlock}>
                  <View style={S.rpSessionHeader} wrap={false}>
                    <Text style={S.rpSessionLabel}>Section {si + 1}: {session.label}</Text>
                  </View>
                  {session.exercises.length === 0 ? (
                    <Text style={S.emptySessionText}>Empty session</Text>
                  ) : (
                    session.exercises.map((pe, ei) => {
                      const exEntry = exerciseMap.get(pe.exerciseId);
                      const detail = metricStr(pe);
                      return (
                        <View key={pe.id} style={S.rpExRow} wrap={false}>
                          <View style={S.rpExHeader}>
                            <Text style={S.rpExNum}>{ei + 1}.</Text>
                            <Text style={S.rpExName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                          </View>
                          {detail ? <Text style={S.rpExDetail}>{detail}</Text> : null}
                          {pe.notes ? <Text style={S.rpExNotes}>Note: {pe.notes}</Text> : null}
                          {exEntry?.videoUrl && (
                            <Link src={exEntry.videoUrl} style={{ fontSize: 7, color: C.primary, paddingLeft: 20, marginTop: 1 }}>Video reference ▶</Link>
                          )}
                        </View>
                      );
                    })
                  )}
                </View>
              ))
            )}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── CARD ─────────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'card') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={[S.fixedHeader, { backgroundColor: C.primary }]}>
              {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.fixedHeaderLogo} />}
              <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
              <Text style={S.fixedHeaderProgram}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.cardClinicHero}>
            {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.cardClinicLogo} />}
            <Text style={S.cardClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
            {clinicContactParts.length > 0 && (
              <Text style={S.cardClinicMeta}>{clinicContactParts.join('  ·  ')}</Text>
            )}
          </View>
          <View style={S.cardAccentBar} />
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : (
              program.sessions.map((session, si) => {
                const pairs: typeof session.exercises[] = [];
                for (let i = 0; i < session.exercises.length; i += 2) {
                  pairs.push(session.exercises.slice(i, i + 2));
                }
                return (
                  <View key={session.id} style={S.cardSessionBlock}>
                    <Text style={S.cardSessionLabel}>Session {si + 1}: {session.label}</Text>
                    {session.exercises.length === 0 ? (
                      <Text style={S.emptySessionText}>Empty session</Text>
                    ) : (
                      pairs.map((pair, pi) => (
                        <View key={pi} style={S.cardRow}>
                          {pair.map((pe) => {
                            const exEntry = exerciseMap.get(pe.exerciseId);
                            return (
                              <View key={pe.id} style={S.cardItem} wrap={false}>
                                <View style={S.cardItemHeader}>
                                  <Text style={S.cardItemName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                                </View>
                                <View style={S.cardItemBody}>
                                  {pe.sets != null && (
                                    <>
                                      <Text style={S.cardItemMetricLabel}>Sets · Reps</Text>
                                      <Text style={S.cardItemMetric}>{pe.sets} × {pe.reps ?? '—'}</Text>
                                    </>
                                  )}
                                  {pe.restSeconds != null && (
                                    <Text style={[S.cardItemMetricLabel, { marginTop: 4 }]}>Rest: {pe.restSeconds}s</Text>
                                  )}
                                  {pe.notes ? <Text style={S.cardItemNotes}>{pe.notes}</Text> : null}
                                  {exEntry?.videoUrl && (
                                    <Link src={exEntry.videoUrl} style={{ fontSize: 7, color: C.primary, marginTop: 4 }}>Video ▶</Link>
                                  )}
                                </View>
                              </View>
                            );
                          })}
                          {pair.length === 1 && <View style={{ flex: 1 }} />}
                        </View>
                      ))
                    )}
                  </View>
                );
              })
            )}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── STRIPED ──────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'striped') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={S.fixedHeader}>
              {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.fixedHeaderLogo} />}
              <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
              <Text style={S.fixedHeaderProgram}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.strClinicHero}>
            {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.strClinicLogo} />}
            <View style={{ flex: 1 }}>
              <Text style={S.strClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
              {clinicContactParts.length > 0 && <Text style={S.strClinicMeta}>{clinicContactParts.join('  ·  ')}</Text>}
            </View>
          </View>
          <View style={S.strAccentBar} />
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : program.sessions.map((session, si) => (
              <View key={session.id} style={S.strSessionBlock}>
                <View style={S.strSessionHeader}>
                  <Text style={S.strSessionLabel}>Session {si + 1}: {session.label}</Text>
                </View>
                {session.exercises.length === 0 ? (
                  <Text style={S.emptySessionText}>Empty session</Text>
                ) : session.exercises.map((pe, ei) => {
                  const exEntry = exerciseMap.get(pe.exerciseId);
                  return (
                    <View key={pe.id} style={[S.strRow, ei % 2 === 0 ? S.strRowEven : S.strRowOdd]} wrap={false}>
                      <Text style={S.strNum}>{ei + 1}</Text>
                      <Text style={S.strName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                      <Text style={S.strMetric}>{metricStr(pe) || '—'}</Text>
                      <Text style={S.strNotes}>{pe.notes ?? ''}</Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── MAGAZINE ─────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'magazine') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={S.fixedHeader}>
              {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.fixedHeaderLogo} />}
              <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
              <Text style={S.fixedHeaderProgram}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.magClinicHero}>
            <Text style={S.magClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
            {clinicContactParts.length > 0 && <Text style={S.magClinicMeta}>{clinicContactParts.join('  ·  ')}</Text>}
          </View>
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : program.sessions.map((session, si) => {
              const pairs: typeof session.exercises[] = [];
              for (let i = 0; i < session.exercises.length; i += 2) pairs.push(session.exercises.slice(i, i + 2));
              return (
                <View key={session.id} style={S.magSessionBlock}>
                  <View style={S.magSessionHeader} wrap={false}>
                    <Text style={S.magSessionLabel}>Session {si + 1} — {session.label}</Text>
                  </View>
                  {session.exercises.length === 0 ? (
                    <Text style={S.emptySessionText}>Empty session</Text>
                  ) : pairs.map((pair, pi) => (
                    <View key={pi} style={S.magGrid}>
                      {pair.map((pe) => {
                        const exEntry = exerciseMap.get(pe.exerciseId);
                        return (
                          <View key={pe.id} style={S.magCard} wrap={false}>
                            <View style={S.magCardAccent} />
                            <View style={S.magCardBody}>
                              <Text style={S.magCardName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                              <Text style={S.magCardMetric}>{metricStr(pe) || '—'}</Text>
                              {pe.notes ? <Text style={S.magCardNotes}>{pe.notes}</Text> : null}
                            </View>
                          </View>
                        );
                      })}
                      {pair.length === 1 && <View style={{ flex: 1 }} />}
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── SIDEBAR ──────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'sidebar') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={S.fixedHeader}>
              {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.fixedHeaderLogo} />}
              <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
              <Text style={S.fixedHeaderProgram}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.sbarClinicHero}>
            <Text style={S.sbarClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
            {clinicContactParts.length > 0 && <Text style={S.sbarClinicMeta}>{clinicContactParts.join('  ·  ')}</Text>}
          </View>
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : program.sessions.map((session, si) => (
              <View key={session.id} style={S.sbarSessionBlock}>
                <View style={S.sbarSessionHeader}>
                  <Text style={S.sbarSessionLabel}>Session {si + 1}: {session.label}</Text>
                </View>
                {session.exercises.length === 0 ? (
                  <Text style={S.emptySessionText}>Empty session</Text>
                ) : session.exercises.map((pe) => {
                  const exEntry = exerciseMap.get(pe.exerciseId);
                  const parts: string[] = [];
                  if (pe.sets != null) parts.push(`${pe.sets} sets`);
                  if (pe.reps != null) parts.push(`${pe.reps} reps`);
                  if (pe.holdTime != null) parts.push(`hold ${pe.holdTime}s`);
                  if (pe.restSeconds != null) parts.push(`rest ${pe.restSeconds}s`);
                  return (
                    <View key={pe.id} style={S.sbarExRow} wrap={false}>
                      <View style={S.sbarExMain}>
                        <Text style={S.sbarExName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                        {pe.notes ? <Text style={S.sbarExNotes}>{pe.notes}</Text> : null}
                      </View>
                      <View style={S.sbarExSidebar}>
                        {parts.map((p, i) => <Text key={i} style={S.sbarMetricText}>{p}</Text>)}
                        {parts.length === 0 && <Text style={S.sbarMetricLabel}>—</Text>}
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── ACADEMIC ─────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'academic') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={S.fixedHeader}>
              {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.fixedHeaderLogo} />}
              <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
              <Text style={S.fixedHeaderProgram}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.acadClinicHero}>
            <View>
              <Text style={S.acadClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
              {clinic.therapistName && <Text style={S.acadClinicMeta}>{clinic.therapistName}</Text>}
            </View>
            <Text style={S.acadDocInfo}>{`Program: ${program.name}\nExported: ${exportDate}`}</Text>
          </View>
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : program.sessions.map((session, si) => (
              <View key={session.id} style={S.acadSessionBlock}>
                <View style={S.acadSessionHeader}>
                  <Text style={S.acadSessionLabel}>{si + 1}. {session.label}</Text>
                </View>
                {session.exercises.length === 0 ? (
                  <Text style={S.emptySessionText}>Empty session</Text>
                ) : session.exercises.map((pe, ei) => {
                  const exEntry = exerciseMap.get(pe.exerciseId);
                  return (
                    <View key={pe.id} style={S.acadExRow} wrap={false}>
                      <View style={S.acadExLine}>
                        <Text style={S.acadExNum}>{si + 1}.{ei + 1}</Text>
                        <Text style={S.acadExName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                      </View>
                      {metricStr(pe) && <Text style={S.acadExSpec}>{metricStr(pe)}</Text>}
                      {pe.notes ? <Text style={S.acadExNotes}>{pe.notes}</Text> : null}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── OUTLINE ──────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'outline') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={S.fixedHeader}>
              {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.fixedHeaderLogo} />}
              <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
              <Text style={S.fixedHeaderProgram}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.outlClinicHero}>
            <Text style={S.outlClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
            {clinicContactParts.length > 0 && <Text style={S.outlClinicMeta}>{clinicContactParts.join('  ·  ')}</Text>}
          </View>
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : program.sessions.map((session, si) => (
              <View key={session.id} style={S.outlSessionBlock}>
                <Text style={S.outlSessionLabel}>▸ Session {si + 1}: {session.label}</Text>
                {session.exercises.length === 0 ? (
                  <Text style={S.emptySessionText}>Empty session</Text>
                ) : session.exercises.map((pe) => {
                  const exEntry = exerciseMap.get(pe.exerciseId);
                  return (
                    <View key={pe.id} wrap={false}>
                      <View style={S.outlExRow}>
                        <View style={S.outlBullet} />
                        <Text style={S.outlExName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                      </View>
                      {metricStr(pe) && <Text style={S.outlExDetail}>{metricStr(pe)}</Text>}
                      {pe.notes ? <Text style={S.outlExNotes}>{pe.notes}</Text> : null}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── RECEIPT ──────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'receipt') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.rcptClinicHero}>
            <Text style={S.rcptClinicName}>{clinic.clinicName || 'REHABILITATION PROGRAM'}</Text>
            {clinicContactParts.length > 0 && <Text style={S.rcptClinicMeta}>{clinicContactParts[0]}</Text>}
            <Text style={S.rcptClinicMeta}>{program.name}</Text>
          </View>
          <View style={S.rcptDash} />
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : program.sessions.map((session, si) => (
              <View key={session.id} style={S.rcptSessionBlock}>
                <View style={S.rcptDash} />
                <Text style={S.rcptSessionLabel}>— Session {si + 1}: {session.label} —</Text>
                {session.exercises.length === 0 ? (
                  <Text style={S.emptySessionText}>Empty session</Text>
                ) : session.exercises.map((pe) => {
                  const exEntry = exerciseMap.get(pe.exerciseId);
                  return (
                    <View key={pe.id} style={S.rcptExRow} wrap={false}>
                      <Text style={S.rcptExName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                      <View style={S.rcptDotLeader} />
                      <Text style={S.rcptExMetric}>{metricStr(pe) || '—'}</Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── NOTEBOOK ─────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'notebook') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={S.fixedHeader}>
              {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.fixedHeaderLogo} />}
              <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
              <Text style={S.fixedHeaderProgram}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.nbClinicHero}>
            <View>
              <Text style={S.nbClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
              {clinicContactParts.length > 0 && <Text style={S.nbClinicMeta}>{clinicContactParts.join('  ·  ')}</Text>}
            </View>
          </View>
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : program.sessions.map((session, si) => (
              <View key={session.id} style={S.nbSessionBlock}>
                <Text style={S.nbSessionLabel}>— Session {si + 1}: {session.label}</Text>
                {session.exercises.length === 0 ? (
                  <Text style={S.emptySessionText}>Empty session</Text>
                ) : session.exercises.map((pe) => {
                  const exEntry = exerciseMap.get(pe.exerciseId);
                  return (
                    <View key={pe.id} style={S.nbRuledRow} wrap={false}>
                      <Text style={S.nbExName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                      {metricStr(pe) && <Text style={S.nbExDetail}>{metricStr(pe)}</Text>}
                      {pe.notes ? <Text style={S.nbExNotes}>{pe.notes}</Text> : null}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── POSTER ───────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'poster') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.postClinicHero}>
            {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.postClinicLogo} />}
            <Text style={S.postClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
            {clinic.therapistName && <Text style={S.postClinicMeta}>{clinic.therapistName}</Text>}
          </View>
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : program.sessions.map((session, _si) => (
              <View key={session.id} style={S.postSessionBlock}>
                <View style={S.postSessionBanner} wrap={false}>
                  <Text style={S.postSessionLabel}>{session.label}</Text>
                </View>
                {session.exercises.length === 0 ? (
                  <Text style={S.emptySessionText}>Empty session</Text>
                ) : session.exercises.map((pe) => {
                  const exEntry = exerciseMap.get(pe.exerciseId);
                  return (
                    <View key={pe.id} style={S.postExRow} wrap={false}>
                      <Text style={S.postExName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                      {metricStr(pe) && <Text style={S.postExMetric}>{metricStr(pe)}</Text>}
                      {pe.notes ? <Text style={S.postExNotes}>{pe.notes}</Text> : null}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── PLAIN ────────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'plain') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.plnClinicHero}>
            <Text style={S.plnClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
            {clinicContactParts.length > 0 && <Text style={S.plnClinicMeta}>{clinicContactParts.join('  ·  ')}</Text>}
          </View>
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : program.sessions.map((session, si) => (
              <View key={session.id} style={S.plnSessionBlock}>
                <Text style={S.plnSessionLabel}>Session {si + 1}: {session.label}</Text>
                {session.exercises.length === 0 ? (
                  <Text style={S.emptySessionText}>Empty session</Text>
                ) : session.exercises.map((pe, ei) => {
                  const exEntry = exerciseMap.get(pe.exerciseId);
                  return (
                    <View key={pe.id} style={S.plnExRow} wrap={false}>
                      <Text style={S.plnExName}>{ei + 1}. {exEntry?.name ?? 'Unknown exercise'}</Text>
                      {metricStr(pe) && <Text style={S.plnExDetail}>{metricStr(pe)}</Text>}
                      {pe.notes ? <Text style={S.plnExNotes}>{pe.notes}</Text> : null}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── ROUNDED ──────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'rounded') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={[S.fixedHeader, { backgroundColor: C.primary }]}>
              {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.fixedHeaderLogo} />}
              <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
              <Text style={S.fixedHeaderProgram}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.rndClinicHero}>
            {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.rndClinicLogo} />}
            <Text style={S.rndClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
            {clinic.therapistName && <Text style={S.rndClinicMeta}>{clinic.therapistName}</Text>}
          </View>
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : program.sessions.map((session, si) => (
              <View key={session.id} style={S.rndSessionBlock}>
                <View style={S.rndSessionBubble} wrap={false}>
                  <Text style={S.rndSessionLabel}>Session {si + 1}: {session.label}</Text>
                </View>
                {session.exercises.length === 0 ? (
                  <Text style={S.emptySessionText}>Empty session</Text>
                ) : session.exercises.map((pe) => {
                  const exEntry = exerciseMap.get(pe.exerciseId);
                  const pills: string[] = [];
                  if (pe.sets != null) pills.push(`${pe.sets} sets`);
                  if (pe.reps != null) pills.push(`${pe.reps} reps`);
                  if (pe.holdTime != null) pills.push(`hold ${pe.holdTime}s`);
                  if (pe.restSeconds != null) pills.push(`rest ${pe.restSeconds}s`);
                  return (
                    <View key={pe.id} style={S.rndExCard} wrap={false}>
                      <View style={S.rndExCardTop}>
                        <Text style={S.rndExName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                      </View>
                      <View style={S.rndExCardBottom}>
                        <View style={S.rndPillRow}>
                          {pills.map((p, i) => (
                            <View key={i} style={S.rndPill}>
                              <Text style={S.rndPillText}>{p}</Text>
                            </View>
                          ))}
                        </View>
                        {pe.notes ? <Text style={S.rndExNotes}>{pe.notes}</Text> : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── HIGHLIGHT ────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'highlight') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={S.fixedHeader}>
              {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.fixedHeaderLogo} />}
              <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
              <Text style={S.fixedHeaderProgram}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.hlgtClinicHero}>
            <Text style={S.hlgtClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
            {clinicContactParts.length > 0 && <Text style={S.hlgtClinicMeta}>{clinicContactParts.join('  ·  ')}</Text>}
          </View>
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : program.sessions.map((session, si) => (
              <View key={session.id} style={S.hlgtSessionBlock}>
                <View style={S.hlgtSessionHeader} wrap={false}>
                  <Text style={S.hlgtSessionLabel}>Session {si + 1}: {session.label}</Text>
                </View>
                {session.exercises.length === 0 ? (
                  <Text style={S.emptySessionText}>Empty session</Text>
                ) : session.exercises.map((pe) => {
                  const exEntry = exerciseMap.get(pe.exerciseId);
                  return (
                    <View key={pe.id} style={S.hlgtExRow} wrap={false}>
                      <View style={S.hlgtHlBox}>
                        <Text style={S.hlgtExName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                        {metricStr(pe) ? (
                          <View style={S.hlgtMetricBadge}>
                            <Text style={S.hlgtMetricText}>{metricStr(pe)}</Text>
                          </View>
                        ) : null}
                      </View>
                      {pe.notes ? <Text style={S.hlgtExNotes}>{pe.notes}</Text> : null}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── COLUMNS ──────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'columns') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={S.fixedHeader}>
              {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.fixedHeaderLogo} />}
              <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
              <Text style={S.fixedHeaderProgram}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.colsClinicHero}>
            <Text style={S.colsClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
            {clinicContactParts.length > 0 && <Text style={S.colsClinicMeta}>{clinicContactParts[0]}</Text>}
          </View>
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : program.sessions.map((session, si) => {
              const triplets: typeof session.exercises[] = [];
              for (let i = 0; i < session.exercises.length; i += 3) triplets.push(session.exercises.slice(i, i + 3));
              return (
                <View key={session.id} style={S.colsSessionBlock}>
                  <View style={S.colsSessionHeader} wrap={false}>
                    <View style={S.colsSessionDot} />
                    <Text style={S.colsSessionLabel}>Session {si + 1}: {session.label}</Text>
                  </View>
                  {session.exercises.length === 0 ? (
                    <Text style={S.emptySessionText}>Empty session</Text>
                  ) : triplets.map((triplet, ti) => (
                    <View key={ti} style={S.colsGrid}>
                      {triplet.map((pe) => {
                        const exEntry = exerciseMap.get(pe.exerciseId);
                        return (
                          <View key={pe.id} style={S.colsCard} wrap={false}>
                            <View style={S.colsCardHead}>
                              <Text style={S.colsCardName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                            </View>
                            <View style={S.colsCardBody}>
                              <Text style={S.colsCardMetric}>{metricStr(pe) || '—'}</Text>
                              {pe.notes ? <Text style={S.colsCardNotes}>{pe.notes}</Text> : null}
                            </View>
                          </View>
                        );
                      })}
                      {triplet.length < 3 && Array.from({ length: 3 - triplet.length }).map((_, i) => (
                        <View key={`spacer-${i}`} style={{ flex: 1 }} />
                      ))}
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── DIVIDER ──────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'divider') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={S.fixedHeader}>
              {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.fixedHeaderLogo} />}
              <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
              <Text style={S.fixedHeaderProgram}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.divClinicHero}>
            <Text style={S.divClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
            {clinicContactParts.length > 0 && <Text style={S.divClinicMeta}>{clinicContactParts.join('  ·  ')}</Text>}
          </View>
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : program.sessions.map((session, si) => (
              <View key={session.id} style={S.divSessionBlock}>
                <View style={S.divSessionDivider} wrap={false}>
                  <View style={S.divDividerLine} />
                  <View style={S.divSessionBadge}>
                    <Text style={S.divSessionLabel}>Session {si + 1} · {session.label}</Text>
                  </View>
                  <View style={S.divDividerLine} />
                </View>
                {session.exercises.length === 0 ? (
                  <Text style={S.emptySessionText}>Empty session</Text>
                ) : session.exercises.map((pe, ei) => {
                  const exEntry = exerciseMap.get(pe.exerciseId);
                  const isLast = ei === session.exercises.length - 1;
                  return (
                    <View key={pe.id} style={S.divExRow} wrap={false}>
                      <Text style={S.divExName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                      {metricStr(pe) && <Text style={S.divExDetail}>{metricStr(pe)}</Text>}
                      {pe.notes ? <Text style={S.divExNotes}>{pe.notes}</Text> : null}
                      {!isLast && <View style={S.divExSep} />}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── SCHEDULE ─────────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'schedule') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={S.fixedHeader}>
              {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.fixedHeaderLogo} />}
              <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
              <Text style={S.fixedHeaderProgram}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.schedClinicHero}>
            <Text style={S.schedClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
            {clinicContactParts.length > 0 && <Text style={S.schedClinicMeta}>{clinicContactParts[0]}</Text>}
          </View>
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : program.sessions.map((session, si) => (
              <View key={session.id} style={S.schedSessionBlock}>
                <View style={S.schedSessionHeader} wrap={false}>
                  <View style={S.schedSessionTab} />
                  <View style={S.schedSessionLabelBox}>
                    <Text style={S.schedSessionLabel}>Session {si + 1}: {session.label}</Text>
                    <Text style={S.schedSessionCount}>{session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}</Text>
                  </View>
                </View>
                {session.exercises.length === 0 ? (
                  <Text style={S.emptySessionText}>Empty session</Text>
                ) : (
                  <>
                    <View style={S.schedTableHead}>
                      <Text style={S.schedThNum}>#</Text>
                      <Text style={S.schedThName}>Exercise</Text>
                      <Text style={S.schedThSpec}>Prescription</Text>
                    </View>
                    {session.exercises.map((pe, ei) => {
                      const exEntry = exerciseMap.get(pe.exerciseId);
                      return (
                        <View key={pe.id} style={[S.schedRow, ei % 2 === 0 ? S.schedRowEven : S.schedRowOdd]} wrap={false}>
                          <Text style={S.schedTdNum}>{ei + 1}</Text>
                          <Text style={S.schedTdName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                          <Text style={S.schedTdSpec}>{metricStr(pe) || '—'}</Text>
                        </View>
                      );
                    })}
                  </>
                )}
              </View>
            ))}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── COMPACTCARD ──────────────────────────────────────
  // ════════════════════════════════════════════════════
  if (layout === 'compactCard') {
    return (
      <Document>
        <Page size="A4" style={S.page}>
          {hasClinic && (
            <View fixed style={[S.fixedHeader, { backgroundColor: C.accent }]}>
              {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.fixedHeaderLogo} />}
              <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
              <Text style={S.fixedHeaderProgram}>{program.name}</Text>
            </View>
          )}
          <View fixed style={S.footer}>
            <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
            <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <View style={S.ccClinicHero}>
            <Text style={S.ccClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
            {clinicContactParts.length > 0 && <Text style={S.ccClinicMeta}>{clinicContactParts[0]}</Text>}
          </View>
          <View style={S.content}>
            <ProgramInfoCard />
            <GoalBox />
            {program.sessions.length === 0 ? (
              <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
            ) : program.sessions.map((session, si) => (
              <View key={session.id} style={S.ccSessionBlock}>
                <View style={S.ccSessionHeader} wrap={false}>
                  <Text style={S.ccSessionLabel}>Session {si + 1}: {session.label}</Text>
                </View>
                {session.exercises.length === 0 ? (
                  <Text style={S.emptySessionText}>Empty session</Text>
                ) : (
                  <View style={S.ccGrid}>
                    {session.exercises.map((pe) => {
                      const exEntry = exerciseMap.get(pe.exerciseId);
                      return (
                        <View key={pe.id} style={S.ccCard} wrap={false}>
                          <View style={S.ccCardHead}>
                            <Text style={S.ccCardName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                          </View>
                          <View style={S.ccCardBody}>
                            <Text style={S.ccCardMetric}>{metricStr(pe) || '—'}</Text>
                            {pe.notes ? <Text style={S.ccCardNotes}>{pe.notes}</Text> : null}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            ))}
          </View>
        </Page>
      </Document>
    );
  }

  // ════════════════════════════════════════════════════
  // ── MODERN ───────────────────────────────────────────
  // ════════════════════════════════════════════════════
  // layout === 'modern'
  return (
    <Document>
      <Page size="A4" style={S.page}>
        {hasClinic && (
          <View fixed style={[S.fixedHeader, { backgroundColor: C.primary }]}>
            {clinic.clinicLogo && <Image src={clinic.clinicLogo} style={S.fixedHeaderLogo} />}
            <Text style={S.fixedHeaderClinic}>{clinic.clinicName}</Text>
            <Text style={S.fixedHeaderProgram}>{program.name}</Text>
          </View>
        )}
        <View fixed style={S.footer}>
          <Text style={S.footerText}>{hasClinic ? clinic.clinicName : 'Full Range Lab'} · Generated {exportDate}</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

        {/* Large centered banner */}
        <View style={S.modClinicHero}>
          {clinic.clinicLogo ? (
            <Image src={clinic.clinicLogo} style={S.modClinicLogo} />
          ) : (
            <View style={S.modLogoBox}>
              <Text style={{ fontSize: 8, color: C.white, fontFamily: 'Helvetica-Bold' }}>LOGO</Text>
            </View>
          )}
          <Text style={S.modClinicName}>{clinic.clinicName || 'Rehabilitation Program'}</Text>
          {clinic.therapistName && (
            <Text style={S.modClinicSub}>{clinic.therapistName}</Text>
          )}
          {clinicContactParts.filter((_, i) => i === 0).map((p, i) => (
            <Text key={i} style={S.modClinicSub}>{p}</Text>
          ))}
          {socialLinks.length > 0 && (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 3 }}>
              {socialLinks.map((link) => (
                <Link key={link.label} src={link.href} style={{ fontSize: 8, color: C.primaryLight, textDecoration: 'underline' }}>
                  {link.display}
                </Link>
              ))}
            </View>
          )}
        </View>
        <View style={S.modAccentBar} />

        <View style={S.content}>
          <ProgramInfoCard />
          <GoalBox />
          {program.sessions.length === 0 ? (
            <View style={S.emptyNotice}><Text style={S.emptyNoticeText}>No sessions added</Text></View>
          ) : (
            program.sessions.map((session, si) => (
              <View key={session.id} style={S.modSessionBlock}>
                <View style={S.modSessionCard} wrap={false}>
                  <Text style={S.modSessionLabel}>Session {si + 1}: {session.label}</Text>
                </View>
                {session.exercises.length === 0 ? (
                  <Text style={S.emptySessionText}>Empty session</Text>
                ) : (
                  session.exercises.map((pe, ei) => {
                    const exEntry = exerciseMap.get(pe.exerciseId);
                    const isOdd = ei % 2 !== 0;
                    return (
                      <View key={pe.id} style={S.modExRow} wrap={false}>
                        <View style={isOdd ? S.modExMainOdd : S.modExMain}>
                          <Text style={S.modExName}>{exEntry?.name ?? 'Unknown exercise'}</Text>
                          {pe.notes ? <Text style={S.modExNotes}>{pe.notes}</Text> : null}
                          {exEntry?.videoUrl && (
                            <Link src={exEntry.videoUrl} style={{ fontSize: 7, color: C.primary, marginTop: 2 }}>Watch ▶</Link>
                          )}
                        </View>
                        <View style={S.modExMetrics}>
                          {pe.sets != null && (
                            <View style={S.modMetricBox}>
                              <Text style={S.modMetricNum}>{pe.sets}</Text>
                              <Text style={S.modMetricLabel}>sets</Text>
                            </View>
                          )}
                          {pe.reps != null && (
                            <View style={S.modMetricBox}>
                              <Text style={S.modMetricNum}>{pe.reps}</Text>
                              <Text style={S.modMetricLabel}>reps</Text>
                            </View>
                          )}
                          {pe.holdTime != null && (
                            <View style={S.modMetricBox}>
                              <Text style={S.modMetricNum}>{pe.holdTime}</Text>
                              <Text style={S.modMetricLabel}>hold/s</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            ))
          )}
        </View>
      </Page>
    </Document>
  );
}
