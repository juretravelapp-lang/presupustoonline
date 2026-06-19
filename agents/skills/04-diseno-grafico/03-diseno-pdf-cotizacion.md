---
name: diseno-pdf-cotizacion
description: Diseño de PDFs profesionales para cotizaciones de viaje, propuestas y documentación
category: diseno-grafico
tags: [pdf, cotizacion, documento, propuesta, impreso]
---

# Diseño de PDF de Cotización

## Especificaciones del Documento (QoutePDF)
- **Formato**: A4 (210×297mm)
- **Render**: @react-pdf/renderer
- **Estilo**: Premium, profesional, consistente con marca

## Estructura del PDF

### 1. Header
```
┌─────────────────────────────────────────────────┐
│  [Logo]            JURE TRAVEL                    │
│                    Referencia: #001               │
│                    Fecha: 15/03/2026              │
├─────────────────────────────────────────────────┤
```

### 2. Datos del Viajero
```
┌─────────────────────────────────────────────────┐
│  👤 DATOS DEL VIAJERO                            │
│                                                   │
│  Nombre: Juan Pérez                              │
│  DNI: 12.345.678                                 │
│  Email: juan@email.com                           │
│  Celular: +54 9 381 123-4567                    │
└─────────────────────────────────────────────────┘
```

### 3. Detalle del Viaje
```
┌─────────────────────────────────────────────────┐
│  ✈️ DETALLE DEL VIAJE                            │
│                                                   │
│  Origen: Tucumán (TUC)                           │
│  Destino: Porto de Galinhas, Brasil              │
│  Salida: 15/03/2026                              │
│  Regreso: 25/03/2026                             │
│  Pasajeros: 2 Adultos, 1 Niño                    │
└─────────────────────────────────────────────────┘
```

### 4. Servicios Incluidos
```
┌─────────────────────────────────────────────────┐
│  ✨ SERVICIOS                                     │
│  ☑ Vuelo + Hotel                                 │
│  ☑ Asistencia al viajero                         │
│  ☐ Traslados                                     │
└─────────────────────────────────────────────────┘
```

### 5. Pricing (Box destacado)
```
┌─────────────────────────────────────────────────┐
│  💰 PRESUPUESTO                                   │
│                                                   │
│  Vuelos:                USD 1,200.00              │
│  Hotel (10 noches):     USD 2,500.00              │
│  Asistencia:            USD 150.00                │
│  Traslados:             USD 200.00                │
│  ─────────────────────────────────                 │
│  Subtotal:              USD 4,050.00              │
│  Descuento:            -USD 200.00                │
│  Total:                 USD 3,850.00              │
│                                                   │
│  Formas de pago: Consultar                        │
│  Vigencia: 7 días                                 │
└─────────────────────────────────────────────────┘
```

### 6. Footer
```
┌─────────────────────────────────────────────────┐
│  Jure Travel - Agencia de Viajes                  │
│  WhatsApp: +54 9 381 206-1066                   │
│  Email: info@traveljure.com                      │
│                                                   │
│  "Viajá con confianza"                            │
└─────────────────────────────────────────────────┘
```

## Estilo Visual del PDF
- **Colores**: Azul oscuro (#1E3A5F) para headers, dorado (#C9A96E) para acentos
- **Tipografía**: Helvetica/Inter (sans-serif, profesional)
- **Separadores**: Línea delgada gris claro
- **Caja de precio**: Fondo gris claro o azul muy claro con borde
- **Iconos**: Emoji (compatibles con PDF) o iconos vectoriales simples

## Consideraciones Técnicas
- Fuentes embedidas (Inter/Helvetica)
- Páginas adicionales si el contenido es largo
- Margen: 40px todos los lados
- No usar sombras (pueden no renderizar bien en @react-pdf)
- Probar en múltiples visores (Chrome, Adobe, Preview)
