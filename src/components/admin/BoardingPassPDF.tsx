import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { TravelQuoteRow } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf', fontWeight: 800 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: 'Inter',
    backgroundColor: '#F8FAFC',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F1E35',
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 800,
    color: '#FFFFFF',
  },
  logoHighlight: {
    color: '#FBBF24',
  },
  headerInfo: {
    fontSize: 9,
    color: '#CBD5E1',
    marginBottom: 2,
  },
  body: {
    padding: 24,
  },
  boardDate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  label: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  bigValue: {
    fontSize: 22,
    fontWeight: 800,
    color: '#0F1E35',
  },
  value: {
    fontSize: 12,
    fontWeight: 800,
    color: '#0F1E35',
  },
  medium: {
    fontSize: 10,
    color: '#475569',
  },
  badges: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  badgeBlock: {
    flexDirection: 'column',
  },
  perforation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  perforationLine: {
    flex: 1,
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    borderBottomStyle: 'dashed',
  },
  perforationNotch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#94A3B8',
  },
});

interface BoardingPassPDFProps {
  quote: TravelQuoteRow;
}

export const BoardingPassPDF: React.FC<BoardingPassPDFProps> = ({ quote }) => {
  const allDestinos = [...quote.destinos, ...(quote.destino_personalizado ? quote.destino_personalizado.split(',') : [])];
  const primaryDestino = allDestinos[0]?.trim().replace(/_/g, ' ') || 'No especificado';
  const additional = allDestinos.length > 1 ? allDestinos.slice(1).map(d => d.trim().replace(/_/g, ' ')).join(', ') : '';
  const pax = quote.adultos + (quote.ninos_2_12 || 0) + (quote.bebes_0_2 || 0);
  const ref = quote.ticket_id ? quote.ticket_id : `#${quote.id.substring(0, 8).toUpperCase()}`;
  const fechaSalida = quote.fecha_salida ? formatDate(quote.fecha_salida) : quote.mes_preferido || 'Flexible';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.logoText}>Jure <Text style={styles.logoHighlight}>Travel</Text></Text>
              <Text style={styles.headerInfo}>PASE DE ABORDAR · VOUCHER DE VIAJE</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ ...styles.headerInfo, fontWeight: 800, fontSize: 11, color: '#FBBF24' }}>{ref}</Text>
              <Text style={styles.headerInfo}>Solicitado el {new Date(quote.created_at).toLocaleDateString()}</Text>
            </View>
          </View>

          {/* Boarding block */}
          <View style={styles.body}>
            <View style={styles.boardDate}>
              <View>
                <Text style={styles.label}>Origen</Text>
                <Text style={styles.value}>{quote.ciudad_salida?.toUpperCase().replace(/_/g, ' ') || 'ARGENTINA'}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.label}>Fecha de salida</Text>
                <Text style={styles.bigValue}>{fechaSalida}</Text>
              </View>
            </View>

            {/* Passenger + Destino */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Pasajero</Text>
                <Text style={styles.bigValue}>{quote.nombre.toUpperCase()} {quote.apellido.toUpperCase()}</Text>
                <Text style={styles.medium}>DNI {quote.dni || '—'} · {pax} pasajero(s)</Text>
              </View>
              <View style={{ alignItems: 'flex-end', paddingLeft: 12 }}>
                <Text style={styles.label}>Destino</Text>
                <Text style={{ fontSize: 24, fontWeight: 800, color: '#C9A96E' }}>{primaryDestino.toUpperCase()}</Text>
                {additional ? <Text style={styles.medium}>+ {additional}</Text> : null}
              </View>
            </View>
          </View>

          {/* Badges */}
          <View style={[{ marginHorizontal: 24 }, styles.badges]}>
            <View style={styles.badgeBlock}>
              <Text style={styles.label}>Pasajeros</Text>
              <Text style={styles.value}>{quote.adultos} adultos · {quote.ninos_2_12 || 0} niños · {quote.bebes_0_2 || 0} bebés</Text>
            </View>
            <View style={styles.badgeBlock}>
              <Text style={styles.label}>Tipo de fecha</Text>
              <Text style={styles.value}>
                {quote.tipo_fecha === 'exacta' ? 'Fechas determinadas' : quote.tipo_fecha === 'mes' ? `Mes: ${quote.mes_preferido}` : 'Flexible'}
              </Text>
            </View>
            <View style={styles.badgeBlock}>
              <Text style={styles.label}>Contacto</Text>
              <Text style={styles.value}>{quote.celular}</Text>
            </View>
          </View>

          {/* Preferencias */}
          {quote.preferencias && quote.preferencias.length > 0 ? (
            <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
              <Text style={styles.label}>Preferencias del viajero</Text>
              <Text style={styles.medium}>{quote.preferencias.join(', ')}</Text>
            </View>
          ) : null}

          {/* Perforation */}
          <View style={styles.perforation}>
            <View style={styles.perforationNotch} />
            <View style={styles.perforationLine} />
            <View style={styles.perforationNotch} />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>JURE TRAVEL · San Miguel de Tucumán · contacto@juretravel.com</Text>
            <Text style={styles.footerText}>Voucher informativo - sujeto a disponibilidad y confirmación.</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};