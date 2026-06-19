---
name: multistep-wizard-ux
description: Diseño UX para formularios multi-paso de viajes, navegación, validación y progreso
category: ux-ui
tags: [wizard, formularios, multi-paso, navegacion, progreso, validacion]
---

# UX para Wizard Multi-Paso de Viajes

## Principios de Diseño de Wizards

### Estructura Ideal (Travel Jure: 6 pasos)
1. Destino (qué)
2. Fechas (cuándo)
3. Pasajeros (quién)
4. Preferencias (cómo)
5. Contacto (quién eres)
6. Resumen (confirmación)

### Barra de Progreso
- **Desktop**: Círculos numerados con nombre + línea conectora
  - Pasado: Completado (check + color)
  - Actual: Activo (resaltado, animación pulse)
  - Futuro: Gris/bloqueado
- **Mobile**: Puntos simples sin texto + indicador "Paso N de 6"
- **Ubicación**: Siempre visible, arriba del contenido

### Navegación
| Elemento | Desktop | Mobile |
|----------|---------|--------|
| Botón "Anterior" | Izquierda abajo | Izquierda abajo |
| Botón "Siguiente" | Derecha abajo | Derecha abajo (sticky) |
| Clic en paso completado | Ir a ese paso | No (solo swipe) |
| Swipe horizontal | No | Sí (con indicador) |
| Teclado Enter | Avanzar paso | Avanzar paso |

### Transiciones entre Pasos
- **Dirección**: Siguiente → slide left, Anterior → slide right
- **Duración**: 300ms ease-in-out
- **Efecto**: Slide + fade blur (no solo fade)
- **Altura**: Auto (contenido variable, sin scroll jump)

### Validación por Paso
- **Tiempo real**: Errores visibles al escribir (no al perder foco)
- **Al hacer clic en Siguiente**: Validar todo el paso
  - ✅ Ok → animación de confirmación + avance
  - ❌ Error → scroll al primer error + shake en campo inválido
- **Campos opcionales**: Marcados como "(opcional)"
- **Errores no bloqueantes**: Mostrar warning, permitir avanzar

### Estados de Botón "Siguiente"
| Estado | Comportamiento |
|--------|----------------|
| Sin datos | Habilitado (validación al click) |
| Datos inválidos | Mostrar error, no avanza |
| Válido | Avanzar con micro-animación |
| Cargando | Spinner + "Guardando..." |
| Último paso | Texto cambia a "Enviar Solicitud" |

### Auto-save y Recuperación
- Guardar en localStorage al escribir (debounce 1s)
- Mostrar toast "Recuperamos tu borrador" al volver
- Caducidad: 7 días sin actividad
- Botón "Empezar de nuevo" en el toast

### Mobile First
- Inputs de tipo correcto (tel, email, number)
- Botones con suficiente altura táctil (min 48px)
- Teclado no cubre inputs (scrollIntoView)
- Gestos swipe para navegar
- Sticky bottom para botón "Siguiente"
