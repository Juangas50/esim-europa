import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'

const styles = StyleSheet.create({
  page: { backgroundColor: '#FFFFFF', padding: 40, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, paddingBottom: 20, borderBottom: '2px solid #C9973A' },
  logoRuta: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: '#1B2F4E' },
  logo34: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: '#C9973A' },
  logoSub: { fontSize: 8, color: '#888888', letterSpacing: 4, marginTop: 2 },
  headerRight: { alignItems: 'flex-end' },
  invoiceTitle: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#1B2F4E', marginBottom: 4 },
  invoiceRef: { fontSize: 12, color: '#888888', marginBottom: 2 },
  statusBadge: { marginTop: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#888888', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },
  infoGrid: { flexDirection: 'row', gap: 12 },
  infoBlock: { flex: 1, backgroundColor: '#F8F8F8', padding: 14, borderRadius: 6 },
  infoLabel: { fontSize: 9, color: '#888888', marginBottom: 3 },
  infoValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1B2F4E' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1B2F4E', paddingVertical: 8, paddingHorizontal: 12 },
  tableHeaderText: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#FFFFFF' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderBottom: '1px solid #EEEEEE' },
  tableRowAlt: { backgroundColor: '#FAFAFA' },
  tableCell: { fontSize: 11, color: '#333333' },
  colTariff: { flex: 3 },
  colUnits: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 1, textAlign: 'right' },
  colTotal: { flex: 1, textAlign: 'right' },
  totalSection: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  totalBox: { backgroundColor: '#1B2F4E', padding: 16, borderRadius: 6, minWidth: 200, alignItems: 'flex-end' },
  totalLabel: { fontSize: 10, color: '#888888', marginBottom: 4 },
  totalAmount: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: '#C9973A' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: '1px solid #EEEEEE', paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 9, color: '#AAAAAA' },
})

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: '#FFF8E6', text: '#D97706', label: 'PENDIENTE' },
  paid:    { bg: '#ECFDF5', text: '#059669', label: 'PAGADA' },
  overdue: { bg: '#FEF2F2', text: '#DC2626', label: 'VENCIDA' },
}

type InvoiceLine = { tariff_name: string; units: number; cost_price: number; total: number }
type Props = {
  invoiceRef: string; agencyName: string; agencyEmail: string
  periodStart: string; periodEnd: string; dueDate: string
  status: string; lines: InvoiceLine[]; totalAmount: number
}

const fmt = (d: string) => new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })

export default function FacturaPDF({ invoiceRef, agencyName, agencyEmail, periodStart, periodEnd, dueDate, status, lines, totalAmount }: Props) {
  const st = STATUS_COLORS[status] || STATUS_COLORS.pending
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.logoRuta}>RUTA</Text>
              <Text style={styles.logo34}>34</Text>
            </View>
            <Text style={styles.logoSub}>TELECOM</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>FACTURA</Text>
            <Text style={styles.invoiceRef}>{invoiceRef}</Text>
            <Text style={styles.invoiceRef}>Vence: {fmt(dueDate)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
              <Text style={[styles.statusText, { color: st.text }]}>{st.label}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Facturado a</Text>
              <Text style={styles.infoValue}>{agencyName}</Text>
              <Text style={[styles.infoLabel, { marginTop: 4 }]}>{agencyEmail}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Período</Text>
              <Text style={styles.infoValue}>{fmt(periodStart)} — {fmt(periodEnd)}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Vencimiento</Text>
              <Text style={styles.infoValue}>{fmt(dueDate)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle de servicios</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colTariff]}>Tarifa</Text>
            <Text style={[styles.tableHeaderText, styles.colUnits]}>Unidades</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Precio unit.</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
          </View>
          {lines.map((line, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tableCell, styles.colTariff]}>{line.tariff_name}</Text>
              <Text style={[styles.tableCell, styles.colUnits]}>{line.units}</Text>
              <Text style={[styles.tableCell, styles.colPrice]}>${line.cost_price.toFixed(2)}</Text>
              <Text style={[styles.tableCell, styles.colTotal]}>${line.total.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalSection}>
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>TOTAL A PAGAR</Text>
              <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>RUTA34 Telecom · ruta34telecom.com</Text>
          <Text style={styles.footerText}>{invoiceRef} · {new Date().toLocaleDateString('es-AR')}</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generateInvoicePDF(props: Props): Promise<Buffer> {
  return renderToBuffer(createElement(FacturaPDF, props) as any) as Promise<Buffer>
}
