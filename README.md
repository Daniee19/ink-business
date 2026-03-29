# Ink Business - Control de Gastos con Escritura a Mano

Aplicacion de finanzas personales que permite registrar ingresos y gastos mediante escritura a mano o formulario tradicional, con reconocimiento de texto y reportes estadisticos.

![Finance App](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple)

## Caracteristicas Principales

### Registro con Escritura a Mano (Ink Mode)
- Dibuja una **flecha hacia arriba** para registrar un ingreso
- Dibuja una **flecha hacia abajo** para registrar un gasto
- Escribe el titulo, monto y descripcion a mano
- Reconocimiento automatico de texto usando Vision AI

### Registro Manual
- Formulario intuitivo con selector de tipo (Ingreso/Gasto)
- Categorias predefinidas con iconos visuales
- Validacion en tiempo real

### Categorias Disponibles

**Ingresos:**
- Salario, Freelance, Inversiones, Ventas, Regalo, Otros

**Gastos:**
- Comida, Transporte, Entretenimiento, Compras, Servicios, Salud, Educacion, Hogar, Otros

### Reportes y Estadisticas
- Balance mensual en tiempo real
- Graficos de gastos por categoria (Doughnut)
- Graficos de ingresos por categoria
- Tendencia diaria de movimientos (Barras)
- Resumen de totales

### Almacenamiento
- Datos guardados localmente en el navegador (localStorage)
- Sin necesidad de cuenta o servidor externo
- Privacidad total de tus datos financieros

## Instalacion

### Requisitos
- Node.js v18+
- npm

### Pasos

```bash
# Clonar repositorio
git clone <repo-url>
cd ink-business

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

### Variables de Entorno

| Variable | Descripcion | Requerido |
|----------|-------------|-----------|
| `INK_OPENROUTER_API_KEY` | API key de OpenRouter para reconocimiento de texto | Si (para modo Ink) |
| `INK_RECOGNITION_API_URL` | URL del servicio de reconocimiento | Opcional |

Obtener API key en: [OpenRouter](https://openrouter.ai/)

### Ejecutar

```bash
# Desarrollo
npm run dev

# Produccion
npm run build
npm run preview
```

Acceder a la app de finanzas: `http://localhost:5173/#finance`

## Uso

### Modo Ink (Escritura a Mano)

1. Presiona el boton **+** central o "Escribir"
2. Dibuja una flecha:
   - **Arriba** = Ingreso
   - **Abajo** = Gasto
3. Escribe el titulo del movimiento
4. Escribe el monto (numero)
5. Escribe una descripcion (opcional, puedes omitir)
6. Selecciona una categoria

### Modo Manual

1. Presiona "Manual" en acciones rapidas o el icono de lapiz
2. Selecciona tipo: Ingreso o Gasto
3. Ingresa el monto
4. Escribe la descripcion
5. Selecciona categoria
6. Guarda

### Ver Reportes

1. Navega a "Reportes" en la barra inferior
2. Visualiza:
   - Resumen de ingresos, gastos y balance
   - Grafico de movimientos diarios
   - Distribucion por categorias

## Tecnologias

- **Frontend:** React 18, TypeScript, Vite
- **Graficos:** Chart.js, react-chartjs-2
- **Reconocimiento:** OpenRouter API (Gemini Vision)
- **Almacenamiento:** localStorage
- **Estilos:** CSS-in-JS con glassmorphism

## Estructura del Proyecto

```
src/finance/
├── FinanceApp.tsx          # Componente principal
├── ManualTransactionForm.tsx   # Formulario manual
├── InkTransactionCapture.tsx   # Captura con ink
├── TransactionList.tsx     # Lista de transacciones
├── FinanceReports.tsx      # Graficos y reportes
├── arrowDetection.ts       # Deteccion de flechas
├── GeminiTextRecognition.ts    # Reconocimiento de texto
├── useFinanceData.ts       # Hook de estado
├── storage.ts              # Persistencia localStorage
└── types.ts                # Tipos TypeScript
```

## Licencia

MIT

---

Desarrollado para Hackathon 2024
