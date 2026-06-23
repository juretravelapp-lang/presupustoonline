import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { TravelQuoteRow } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

// Register fonts
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
    padding: 40,
    fontFamily: 'Inter',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: '#C9A96E',
    paddingBottom: 20,
    marginBottom: 30,
  },
  logoContainer: {
    flexDirection: 'column',
  },
  logoText: {
    fontSize: 26,
    fontWeight: 800,
    color: '#0F1E35',
  },
  logoHighlight: {
    color: '#C9A96E',
  },
  subtitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#64748B',
    letterSpacing: 1,
    marginTop: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerInfo: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 800,
    textTransform: 'uppercase',
    color: '#0F1E35',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    borderBottomStyle: 'dashed',
    paddingBottom: 4,
  },
  gridLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: 600,
  },
  gridValue: {
    fontSize: 11,
    color: '#0F1E35',
    fontWeight: 800,
    maxWidth: '60%',
    textAlign: 'right',
  },
  preferencesText: {
    fontSize: 11,
    color: '#0F1E35',
    fontWeight: 600,
    marginTop: 4,
  },
  commentsBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
  },
  commentsText: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.5,
  },
  priceBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  priceTitle: {
    fontSize: 11,
    textTransform: 'uppercase',
    color: '#64748B',
    fontWeight: 800,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: 800,
    color: '#C9A96E',
  },
  priceDisclaimer: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 9,
    color: '#94A3B8',
    marginBottom: 4,
  },
});

interface QuotePDFProps {
  quote: TravelQuoteRow;
  pricing: import('@/lib/supabase').PricingDetalles;
  precioFinal: number;
}

export const QuotePDF: React.FC<QuotePDFProps> = ({ quote, pricing, precioFinal }) => {
  const symbol = pricing.moneda === 'USD' ? 'USD $' : 'ARS $';
  
  const allDestinos = [...quote.destinos, ...(quote.destino_personalizado ? quote.destino_personalizado.split(',') : [])];
  const destinationsText = allDestinos.map(d => d.trim().replace(/_/g, ' ')).join(', ');
  
  const dateText = quote.tipo_fecha === 'exacta' 
    ? `${quote.fecha_salida ? formatDate(quote.fecha_salida) : '—'} al ${quote.fecha_regreso ? formatDate(quote.fecha_regreso) : '—'}`
    : quote.mes_preferido || '—';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Jure <Text style={styles.logoHighlight}>Travel</Text></Text>
            <Text style={styles.subtitle}>Presupuesto a medida</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerInfo}>Fecha: {new Date().toLocaleDateString()}</Text>
            <Text style={styles.headerInfo}>Nº Referencia: {quote.ticket_id ? quote.ticket_id : `#${quote.id.substring(0, 8).toUpperCase()}`}</Text>
          </View>
        </View>

        {/* Datos del Viajero */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Datos del Viajero</Text>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Nombre Completo</Text>
            <Text style={styles.gridValue}>{quote.nombre} {quote.apellido}</Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Documento DNI</Text>
            <Text style={styles.gridValue}>{quote.dni}</Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Correo Electrónico</Text>
            <Text style={styles.gridValue}>{quote.email}</Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Celular de Contacto</Text>
            <Text style={styles.gridValue}>{quote.celular}</Text>
          </View>
        </View>

        {/* Planificación de Viaje */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✈️ Planificación de Viaje</Text>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Salida</Text>
            <Text style={styles.gridValue}>{quote.ciudad_salida?.toUpperCase().replace(/_/g, ' ') || 'No especificada'}</Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Destino(s)</Text>
            <Text style={styles.gridValue}>{destinationsText}</Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Fechas Estimadas</Text>
            <Text style={styles.gridValue}>{dateText}</Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Pasajeros</Text>
            <Text style={styles.gridValue}>{quote.adultos} Adultos {quote.edades_adultos ? `(Edades: ${quote.edades_adultos}) ` : ''}| {quote.ninos_2_12} Niños | {quote.bebes_0_2} Bebés</Text>
          </View>
        </View>

        {/* Servicios Incluidos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Servicios Incluidos</Text>
          {pricing.servicios && pricing.servicios.length > 0 ? (
            pricing.servicios.map(serv => (
              <View key={serv.id} style={styles.gridRow}>
                <Text style={styles.gridLabel}>{serv.tipo}</Text>
                <Text style={styles.gridValue}>{serv.descripcion || 'Sin descripción detallada'}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.preferencesText}>No se detallaron servicios específicos.</Text>
          )}
        </View>

        {/* Observaciones */}
        {quote.comentarios ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Observaciones del Cliente</Text>
            <View style={styles.commentsBox}>
              <Text style={styles.commentsText}>{quote.comentarios}</Text>
            </View>
          </View>
        ) : null}

        {/* Precio Final */}
        <View style={styles.priceBox}>
          <Text style={styles.priceTitle}>Importe Final Presupuestado</Text>
          <Text style={styles.priceValue}>{symbol}{precioFinal.toLocaleString()}</Text>
          <Text style={styles.priceDisclaimer}>Precios vigentes al día de la fecha. Sujeto a disponibilidad.</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Jure Travel - Legajo Nº 12345 · San Miguel de Tucumán · Correo: contacto@juretravel.com</Text>
          <Text style={styles.footerText}>¡Gracias por confiar tu próximo viaje en nosotros!</Text>
        </View>
      </Page>
    </Document>
  );
};
