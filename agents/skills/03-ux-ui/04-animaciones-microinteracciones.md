---
name: animaciones-microinteracciones
description: Micro-interacciones y animaciones UI para experiencia de viaje premium
category: ux-ui
tags: [animaciones, motion, microinteracciones, transiciones, framer-motion]
---

# Animaciones y Micro-interacciones para Travel Jure

## Filosofía de Animación
- **Premium pero no distractivo**: Animaciones sutiles que guían, no que entretienen
- **Propósito claro**: Cada animación tiene un objetivo (feedback, orientación, deleite)
- **Rendimiento**: Preferir CSS transforms/opacity, evitar animar layout
- **Respetar prefers-reduced-motion**: Desactivar animaciones complejas

## Micro-interacciones por Componente

### Wizard General
| Elemento | Animación | Timing |
|----------|-----------|--------|
| Transición pasos | Slide X + blur fade | 300ms ease-in-out |
| Barra de progreso | Fill animado entre pasos | 400ms spring |
| Check paso completado | Scale + rotate check | 200ms spring |
| Badge contador pasajeros | Number count-up | 150ms per digit |
| Error validación | Shake horizontal | 300ms 2 ciclos |

### Paso 1 - Destino
| Elemento | Animación |
|----------|-----------|
| Chip seleccionado | Scale up 1.05 → bounce back |
| Chip removido | Scale down + fade out |
| Resultados búsqueda | Stagger fade in (50ms delay each) |
| Tag destino agregado | Slide in desde izquierda |

### Paso 3 - Pasajeros
| Elemento | Animación |
|----------|-----------|
| Contador + | Scale pulse up |
| Contador - | Scale pulse down |
| Total viajeros | Number tween (count-up/down) |
| Badge "GRATIS" | Pulse glow suave |

### Paso 6 - Resumen
| Elemento | Animación |
|----------|-----------|
| Secciones | Stagger slide up (100ms delay) |
| Checkboxes confianza | Check draw animation |
| Botón enviar | Pulse sutil (llamado atención) |

### Success Modal
| Elemento | Animación |
|----------|-----------|
| Overlay | Fade in 300ms |
| Card modal | Scale up 0.8→1 + fade |
| Confeti | Particles canvas (20-30 particles) |
| Avión despegando | Scale + translateY up + fade out |
| Check badge | Rotate + scale + glow |
| Texto "Recibida" | Typewriter o fade-up |
| WhatsApp CTA | Pulse animación (llamado) |
| Elementos en secuencia | Stagger delays (100ms each) |

### Admin - Kanban
| Elemento | Animación |
|----------|-----------|
| Drag start | Scale up 1.05 + shadow + opacity |
| Drag over columna | Highlight + pill indicator |
| Drop | Spring snap to position |
| Nueva tarjeta | Slide down + fade |

### Admin - Métricas
| Elemento | Animación |
|----------|-----------|
| Stat cards | Count-up al cargar |
| Charts | Recharts default (animado al montar) |
| Tabla filas | Stagger fade in |
| Filtros | Slide down panel (si hay) |

### Loading States
| Contexto | Animación |
|----------|-----------|
| Submit wizard | Skeleton de resumen + spinner en botón |
| Carga admin | Skeleton cards (5 cards pulse) |
| Carga detalle lead | Skeleton modal (header + body) |
| Carga PDF | Spinner + "Generando PDF..." |
