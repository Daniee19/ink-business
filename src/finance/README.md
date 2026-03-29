# Ink Business - Modulo de Finanzas

Sistema de registro de ingresos y gastos con reconocimiento de escritura a mano y OCR de documentos.

## Caracteristicas

### Entrada de Datos

| Metodo | Descripcion |
|--------|-------------|
| **Escribir** | Dibuja una flecha hacia arriba (ingreso) o hacia abajo (gasto), luego escribe el monto y descripcion |
| **Escanear OCR** | Sube una foto de un recibo, factura o ticket y el sistema extrae automaticamente los datos |
| **Manual** | Formulario tradicional para ingresar transacciones |

### Reconocimiento de Flechas

El sistema detecta la direccion del trazo para determinar el tipo de transaccion:

- **Flecha hacia arriba** = Ingreso (verde)
- **Flecha hacia abajo** = Gasto (rojo)

La deteccion es muy tolerante y acepta:
- Flechas diagonales
- Trazos rapidos
- Flechas con o sin punta

### OCR de Documentos

Extrae automaticamente de imagenes de recibos/facturas:
- Tipo (ingreso/gasto)
- Monto total
- Concepto/titulo
- Descripcion
- Categoria sugerida
- Nivel de confianza

## Estructura de Archivos

```
src/finance/
├── FinanceApp.tsx          # Componente principal
├── InkTransactionCapture.tsx # Captura de escritura a mano
├── ManualTransactionForm.tsx # Formulario manual
├── TransactionList.tsx     # Lista de transacciones
├── FinanceReports.tsx      # Reportes y graficos
├── DocumentOCR.ts          # Servicio de OCR
├── arrowDetection.ts       # Deteccion de flechas
├── useFinanceData.ts       # Hook de datos
├── GeminiTextRecognition.ts # Reconocimiento de texto
├── types.ts                # Tipos TypeScript
└── index.ts                # Exportaciones
```

## Tipos de Datos

```typescript
type TransactionType = 'income' | 'expense';

type Category =
  // Gastos
  | 'food' | 'transport' | 'entertainment' | 'shopping'
  | 'bills' | 'health' | 'education' | 'other'
  // Ingresos
  | 'salary' | 'freelance' | 'investment' | 'gift' | 'refund' | 'bonus';

interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  description: string;
  category: Category;
  date: Date;
  source: 'manual' | 'ink';
}
```

## Configuracion

Requiere las siguientes variables de entorno en `.env`:

```env
# Para reconocimiento de escritura y OCR
INK_OPENROUTER_API_KEY=tu-api-key

# Opcional: para reconocimiento alternativo
INK_GEMINI_API_KEY=tu-gemini-key
```

## Flujo de Uso

### Escribir (Ink)

1. Toca el boton "Escribir"
2. Dibuja una flecha hacia arriba o abajo
3. El sistema detecta la direccion y muestra el tipo
4. Escribe el monto (ej: "150")
5. Escribe la descripcion (ej: "Almuerzo")
6. Confirma la transaccion

### Escanear (OCR)

1. Toca el boton "Escanear"
2. Selecciona o toma una foto del documento
3. El sistema procesa la imagen con IA
4. Revisa los datos extraidos
5. Confirma o cancela

### Manual

1. Toca el boton "Manual"
2. Selecciona tipo (Ingreso/Gasto)
3. Ingresa monto, titulo, categoria
4. Guarda la transaccion

## Pantallas

- **Home**: Balance del mes, acciones rapidas, ultimas transacciones
- **Movimientos**: Lista completa de transacciones
- **Reportes**: Graficos y estadisticas

## Diseño

- Estilo glassmorphism con colores azul electrico
- Banner con imagen de fondo
- Tarjetas de ingresos (verde) y gastos (rojo) con colores solidos
- Navegacion inferior con iconos
- Splash screen con logo "Ink Business"

## Dependencias

- React 18+
- OpenRouter API (Gemini 2.0 Flash)
- LocalStorage para persistencia
