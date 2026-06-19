---
name: conversion-rate-optimization
description: Optimización de tasa de conversión específica para formularios de viaje y embudos de venta
category: ventas-conversion
tags: [cro, conversion, optimizacion, a/b-testing, funnel]
---

# Conversión Rate Optimization (CRO) para Presupuestador de Viajes

## Embudo de Conversión Travel Jure

### Etapas del Embudo
```
Landing → Inicia Wizard → Paso 1 → Paso 2 → ... → Paso 6 → Submit → WhatsApp
  100%       60-70%       50-60%   45-55%    ...    25-30%    20-25%    15-20%
```

### Puntos de Fricción Identificados

1. **Inicio del Wizard** (Dropdown del banner)
   - ✅ CTA claro y visible
   - ❌ Múltiples CTAs pueden confundir
   - Mejora: Un solo CTA primario, máximo 1 secundario

2. **Paso 1 - Destino** (búsqueda)
   - ✅ Autocomplete + chips populares
   - ❌ Muchas opciones pueden abrumar
   - Mejora: Categorizar (playa, ciudad, aventura) o preguntar primero "tipo de viaje"

3. **Paso 5 - Contacto** (datos personales)
   - ❌ Principal punto de abandono (solicitar datos personales)
   - ✅ Explicar por qué: "para enviarte la propuesta"
   - Mejora: Validación en tiempo real, indicar campos obligatorios

### Estrategias de Optimización

#### Reducción de Fricción
- **Progressive profiling**: Pedir datos gradualmente (no todo en paso 1)
- **Default values**: Adultos=2, sugerir destinos populares
- **Smart defaults**: Seleccionar "Vuelo+Hotel" por defecto (opción más vendida)
- **Autocomplete**: Ciudades, aeropuertos con búsqueda predictiva

#### Aumento de Confianza
- Trust badges visibles en todo el wizard
- Contador de viajeros asesorados
- Testimonios cerca del botón de envío
- Icono de candado en paso de datos personales
- "Sin compromiso" en el resumen

#### Urgencia Estratégica
- Ofertas por tiempo limitado en banner
- "Consultá ahora, las tarifas pueden cambiar"
- Contador de disponibilidad en destinos populares

#### A/B Testing Sugerido
1. **Wizard 6 pasos vs 8 pasos** (original)
2. **Con barra de progreso vs sin ella**
3. **Paso de contacto al inicio vs al final**
4. **Con imágenes vs sin imágenes por paso**
5. **Single destination vs multi-destination first**

### KPIs a Monitorear
- **Tasa de abandono por paso** (Google Analytics eventos)
- **Tiempo por paso** (cuello de botella)
- **Tasa de submit** (completaron wizard / iniciaron)
- **Tasa de conversión a WhatsApp** (submit / contacto WhatsApp)
- **Tasa de leads calificados** (los que llegan a cotizado)
