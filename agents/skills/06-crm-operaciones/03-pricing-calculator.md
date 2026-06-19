---
name: pricing-calculator
description: Estrategia de precios y márgenes para paquetes turísticos, cálculo de cotizaciones
category: crm-operaciones
tags: [pricing, cotizacion, margenes, proveedores, calculo]
---

# Calculadora de Precios y Márgenes

## Estructura del Pricing (QuoteDetailModal)

### Proveedores (4 slots)
Cada cotización puede tener precios de hasta 4 proveedores mayoristas:
- **Proveedor 1**: Nombre + hotel + vuelos + otros
- **Proveedor 2**: Nombre + hotel + vuelos + otros
- **Proveedor 3**: Nombre + hotel + vuelos + otros
- **Proveedor 4**: Nombre + hotel + vuelos + otros

### Por cada proveedor:
| Concepto | Descripción |
|----------|-------------|
| `hotel` | Costo del hotel (por noche o total) |
| `vuelos` | Costo de vuelos (por pasajero o total) |
| `otros` | Traslados, excursiones, asistencia |
| `subtotal` | Suma de costos (neto proveedor) |
| `markup_tipo` | 'porcentaje' o 'fijo' |
| `markup_valor` | % o monto a agregar |
| `margen_monto` | Calculado: subtotal * (markup/100) o markup_valor |
| `total_final` | subtotal + margen_monto |

### Configuración de Markup
- **Markup porcentual**: 10-25% sobre neto (común)
- **Markup fijo**: Monto fijo en USD/ARS (viajes corporativos)
- **Moneda**: USD o ARS según el proveedor

### Cálculo Automático
```
subtotal = hotel + vuelos + otros
Si markup_tipo = 'porcentaje':
    margen = subtotal * (markup_valor / 100)
Si markup_tipo = 'fijo':
    margen = markup_valor
total_final = subtotal + margen
```

### Ganador
- El asesor elige qué proveedor tiene la mejor relación precio-servicio
- Marca "Elegir Ganador" en el proveedor seleccionado
- El precio del ganador se muestra al cliente (ClientQuoteView)
- Al elegir ganador, el estado avanza a "cotizado"

## Estrategia de Precios

### Márgenes Recomendados por Producto
| Producto | Margen sobre neto | Nota |
|----------|------------------|------|
| Vuelos | 5-10% | Comisión baja, volumen |
| Hoteles sueltos | 10-15% | Competitivo |
| Paquete vuelo+hotel | 15-20% | Producto estrella |
| All Inclusive | 15-25% | Mayor margen |
| Crucero | 10-15% | Precios fijos |
| Asistencia | 20-40% | Alto margen |
| Traslados/Excursiones | 15-25% | Complementarios |

### Tácticas de Precio
- **Redondeo psicológico**: $1.999 en vez de $2.000
- **Anclaje**: Mostrar primero la opción más cara
- **Bundle**: Paquete completo parece mejor valor que suma individual
- **Oferta por tiempo**: "Vigencia 7 días" (crea urgencia)
- **Descuento estratégico**: "Descuento por pago contado"
