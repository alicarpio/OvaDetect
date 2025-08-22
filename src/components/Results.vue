<template>
  <v-container fluid class="pa-6 mx-4 md:mx-8 lg:mx-16">
    <v-row>
      <v-col cols="12">
        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-h4 font-weight-bold text-grey-darken-3">
            Resultados del Análisis
          </h1>
        </div>

        <!-- Loading State -->
        <div v-if="imagesStore.isAnalyzing" class="text-center py-12">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
            class="mb-4"
          />
          <h3 class="text-h5 font-weight-medium mb-2">
            Analizando imágenes...
          </h3>
          <p class="text-body-1 text-medium-emphasis">
            Nuestro modelo de IA está procesando las imágenes
          </p>
        </div>

        <!-- Results -->
        <div v-else-if="allResults.length > 0">
          <!-- Summary Statistics -->
          <v-row class="mb-8">
            <!-- Análisis Completados -->
            <v-col cols="12" md="4">
              <v-card class="summary-card text-center pa-8" elevation="1" rounded="lg" color="blue-grey-lighten-5">
                <div class="summary-number text-primary mb-2">
                  {{ completedCount }}
                </div>
                <div class="summary-label text-body-2 text-grey-darken-2">
                  Imágenes analizadas
                </div>
              </v-card>
            </v-col>

            <!-- Alto Riesgo PCOS -->
            <v-col cols="12" md="4">
              <v-card class="summary-card text-center pa-8" elevation="1" rounded="lg" color="red-lighten-5">
                <div class="summary-number text-red mb-2">
                  {{ highRiskCount }}
                </div>
                <div class="summary-label text-body-2 text-grey-darken-2">
                  Riesgo de SOP
                </div>
              </v-card>
            </v-col>

            <!-- Bajo Riesgo PCOS -->
            <v-col cols="12" md="4">
              <v-card class="summary-card text-center pa-8" elevation="1" rounded="lg" color="green-lighten-5">
                <div class="summary-number text-green mb-2">
                  {{ lowRiskCount }}
                </div>
                <div class="summary-label text-body-2 text-grey-darken-2">
                  Sin riesgo de SOP
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Individual Result Cards -->
          <v-row class="mb-4">
            <v-col 
              v-for="result in allResults" 
              :key="result.id" 
              cols="12" 
              md="6" 
              lg="4"
              class="mb-4"
            >
              <v-card 
                class="result-card h-100"
                elevation="2"
                rounded="lg"
                style="max-width: 100%;"
              >
                <v-card-text class="pa-6">
                  <!-- Image Name with Status -->
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div>
                      <div class="text-body-1 font-weight-medium text-grey-darken-4">
                        {{ getImageName(result.imageId) }}
                      </div>
                      <!-- Información adicional del archivo -->
                      <div class="text-caption text-medium-emphasis mt-1">
                        {{ formatFileSize(getImageById(result.imageId)?.size || 0) }} • 
                        {{ getImageDimensions(result.imageId) }} •
                        Procesado {{ formatRelativeTime(result.analyzedAt) }}
                      </div>
                      <div v-if="result.status === 'completed'" class="text-caption text-success font-weight-medium mt-1">
                        <v-icon size="14" color="success" class="me-1">mdi-check-circle</v-icon>
                        Completado
                      </div>
                    </div>
                    <div v-if="result.status === 'completed'" class="d-flex align-center">
                      <v-chip 
                        :color="result.pcosProbability > 70 ? 'error' : result.pcosProbability > 30 ? 'warning' : 'success'"
                        size="large" 
                        variant="tonal"
                        class="font-bold"
                      >
                        {{ getClassification(result) }}
                      </v-chip>
                    </div>
                    <div v-else-if="result.status === 'processing'" class="d-flex align-center">
                      <v-progress-circular
                        indeterminate
                        color="orange"
                        size="16"
                        width="2"
                        class="me-2"
                      />
                      <span class="text-caption text-orange font-weight-medium">
                      Procesando...
                    </span>
                    </div>
                  </div>

                  <!-- Divisor visual -->
                  <v-divider class="my-4"></v-divider>

                  <div>
                    <v-row class="mb-4 justify-center">
                <v-col cols="auto" class="mx-4">
                  <div class="text-center">
                    <v-progress-circular
                      :model-value="getInfectionProbability(result.pcosProbability)"
                      :color="getProbabilityColor(result.pcosProbability)"
                      size="115"
                      width="8"
                    >
                      <div class="text-center">
                        <span class="text-h6 font-weight-bold d-block">
                          {{ getInfectionProbability(result.pcosProbability).toFixed(1) }}%
                        </span>
                        <span class="text-caption text-grey-darken-1 font-weight-medium">
                          {{ getRiskLevel(result.pcosProbability) }}
                        </span>
                      </div>
                    </v-progress-circular>
                    <p class="text-md font-medium mt-2">Probabilidad de Infección</p>
                  </div>
                </v-col>
                <v-col cols="auto" class="mx-4">
                  <div class="text-center">
                    <v-progress-circular
                      :model-value="result.confidence"
                      :color="getConfidenceColor(result.confidence)"
                      size="115"
                      width="8"
                    >
                      <div class="text-center">
                        <span class="text-h6 font-weight-bold d-block">
                          {{ result.confidence.toFixed(1) }}%
                        </span>
                        <span class="text-caption text-grey-darken-1 font-medium">
                          {{ getConfidenceLevel(result.confidence) }}
                        </span>
                      </div>
                    </v-progress-circular>
                    <p class="text-md font-medium mt-2">Confianza Clínica</p>
                  </div>
                </v-col>
              </v-row>
                  </div>

                  <!-- Action Buttons (only for completed) -->
                  <div v-if="result.status === 'completed'" class="mt-4">
                    <div class="d-flex justify-end align-center">
                      <!-- <v-btn
                        color="primary"
                        variant="text"
                        size="small"
                        class="text-none me-2"
                        @click="showDetails(result)"
                      >
                        Ver Detalles
                      </v-btn> -->
                      <v-btn
                        color="grey-darken-1"
                        variant="text"
                        size="medium"
                        icon="mdi-download"
                        @click="downloadReport(result)"
                      />
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>


        </div>

        <!-- No Results -->
        <div v-else class="text-center py-12">
          <v-icon size="64" color="grey" class="mb-4">
            mdi-chart-line
          </v-icon>
          <h3 class="text-h5 font-weight-medium mb-2">
            No hay resultados disponibles
          </h3>
          <p class="text-body-1 text-medium-emphasis mb-4">
            Carga algunas imágenes y analízalas para ver los resultados
          </p>
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-upload"
            @click="$router.push('/upload')"
          >
            Cargar Imágenes
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="600">
      <v-card v-if="selectedResult">
        <v-card-title class="d-flex align-center justify-space-between">
          <span>Detalles del Análisis</span>
          <v-btn icon @click="detailsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-divider />
        
        <v-card-text class="pa-6">
          <div class="mb-4">
            <h3 class="text-h6 mb-2">{{ getImageName(selectedResult.imageId) }}</h3>
            <p class="text-caption text-medium-emphasis">
              Analizado: {{ formatDate(selectedResult.analyzedAt) }}
            </p>
          </div>

          
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-download"
            @click="downloadReport(selectedResult)"
          >
            Descargar Reporte
          </v-btn>
          <v-btn
            color="primary"
            @click="detailsDialog = false"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useImagesStore } from '@/stores/images'
import type { AnalysisResult } from '@/types'

const imagesStore = useImagesStore()

// Reactive state for dialog
const detailsDialog = ref(false)
const selectedResult = ref<AnalysisResult | null>(null)

// Computed properties
  const allResults = computed(() => {
    return imagesStore.analysisResults
  })

const completedCount = computed(() => 
  imagesStore.completedAnalyses.length
)

const highRiskCount = computed(() => 
  imagesStore.completedAnalyses.filter(result => result.pcosProbability > 30).length // ✅ Corregido: > 70 para alto riesgo (infectado)
)

const lowRiskCount = computed(() => 
  imagesStore.completedAnalyses.filter(result => result.pcosProbability <= 30).length // ✅ Corregido: <= 70 para bajo riesgo (no infectado)
)

// Helper functions
function getImageName(imageId: string): string {
  // Primero buscar en images
  const image = imagesStore.images.find(img => img.id === imageId)
  if (image) {
    return image.name
  }
  
  // Si no está en images, buscar en analysisResults
  const result = imagesStore.analysisResults.find(r => r.imageId === imageId)
  if (result && (result as any).imageInfo) {
    return (result as any).imageInfo.name
  }
  
  return 'Imagen desconocida'
}

function getImageById(imageId: string) {
  // Primero buscar en images
  const image = imagesStore.images.find(img => img.id === imageId)
  if (image) {
    return image
  }
  
  // Si no está en images, buscar en analysisResults
  const result = imagesStore.analysisResults.find(r => r.imageId === imageId)
  if (result && (result as any).imageInfo) {
    return (result as any).imageInfo
  }
  
  return null
}

function getProbabilityColor(probability: number): string {
  if (probability > 70) return 'red'   // ✅ Alto riesgo de infección
  if (probability > 30) return 'orange' // Riesgo medio
  return 'green'  // ✅ Bajo riesgo
}

function getProbabilityTextColor(probability: number): string {
  if (probability > 70) return 'text-red'   // ✅ Alto riesgo
  if (probability > 30) return 'text-orange'
  return 'text-green'  // ✅ Bajo riesgo
}

function getRiskLevel(probability: number): string {
  if (probability > 70) return 'Alto'   // ✅ >70 para alto riesgo
  if (probability > 30) return 'Media'
  return 'Bajo'  // ✅ <=30 para bajo riesgo
}

// ✅ Función corregida: pcosProbability ya ES la probabilidad de infección
function getInfectionProbability(probability: number): number {
  return probability // No necesitas invertir
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function showDetails(result: AnalysisResult): void {
  selectedResult.value = result
  detailsDialog.value = true
}

async function downloadReport(result: AnalysisResult): Promise<void> {
  try {
    console.log('📄 Iniciando generación de PDF para:', result.imageId)
    
    // Importar jsPDF dinámicamente
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    
    // Obtener información de la imagen (desde analysisResults o desde images)
    let imageInfo = getImageById(result.imageId)
    const medicalAnalysis = getMedicalAnalysis(result)
    
    // Si no hay imageInfo en images (porque se limpió), usar la guardada en analysisResults
    if (!imageInfo && (result as any).imageInfo) {
      imageInfo = (result as any).imageInfo
    }
    
    // Obtener la URL de la imagen para incluirla en el PDF
    let imageUrl = imageInfo?.url || ''
    if (!imageUrl && (result as any).imageInfo?.url) {
      imageUrl = (result as any).imageInfo.url
    }
    
    // Crear nuevo documento PDF
    const doc = new jsPDF()
    
    // Configurar estilos
    const titleFontSize = 20
    const subtitleFontSize = 14
    const normalFontSize = 12
    const smallFontSize = 10
    
    // Título principal
    doc.setFontSize(titleFontSize)
    doc.setFont('helvetica', 'bold')
    doc.text('Reporte de Análisis Médico', 105, 25, { align: 'center' })
    
    // Línea divisoria
    doc.setDrawColor(200, 200, 200)
    doc.line(20, 35, 190, 35)
    
    // Información básica
    doc.setFontSize(subtitleFontSize)
    doc.setFont('helvetica', 'bold')
    doc.text('Información del Análisis', 20, 50)
    
    doc.setFontSize(normalFontSize)
    doc.setFont('helvetica', 'normal')
    doc.text(`Nombre: ${imageInfo?.name || 'Imagen sin nombre'}`, 20, 65)
    doc.text(`Fecha de Análisis: ${formatDate(result.analyzedAt)}`, 20, 75)
    doc.text(`Tamaño: ${formatFileSize(imageInfo?.size || 0)}`, 20, 85)
    
    // Agregar la imagen al PDF si está disponible
    if (imageUrl) {
      try {
        // Cargar la imagen
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = imageUrl
        })
        
        // Calcular dimensiones para la imagen (máximo 80px de alto)
        const maxHeight = 80
        const maxWidth = 120
        let imgWidth = img.width
        let imgHeight = img.height
        
        // Redimensionar manteniendo proporción
        if (imgHeight > maxHeight) {
          const ratio = maxHeight / imgHeight
          imgHeight = maxHeight
          imgWidth = imgWidth * ratio
        }
        
        if (imgWidth > maxWidth) {
          const ratio = maxWidth / imgWidth
          imgWidth = maxWidth
          imgHeight = imgHeight * ratio
        }
        
        // Crear canvas para convertir la imagen
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = imgWidth
        canvas.height = imgHeight
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, imgWidth, imgHeight)
          const imageData = canvas.toDataURL('image/jpeg', 0.8)
          
          // Agregar imagen al PDF
          doc.addImage(imageData, 'JPEG', 20, 95, imgWidth, imgHeight)
          console.log('🖼️ Imagen agregada al PDF exitosamente')
        }
      } catch (error) {
        console.warn('⚠️ No se pudo agregar la imagen al PDF:', error)
      }
    }
    
    // Resultados clínicos con tabla
    doc.setFontSize(subtitleFontSize)
    doc.setFont('helvetica', 'bold')
    doc.text('Resultados Clínicos', 20, 185)
    
    // Tabla de resultados clínicos
    autoTable(doc, {
      startY: 195,
      head: [['Métrica', 'Valor', 'Estado']],
      body: [
        ['Diagnóstico', getClassification(result), result.pcosProbability > 70 ? 'Alto Riesgo' : result.pcosProbability > 30 ? 'Medio Riesgo' : 'Bajo Riesgo'],
        ['Probabilidad PCOS', `${result.pcosProbability.toFixed(1)}%`, getRiskLevel(result.pcosProbability)],
        ['Confianza del Modelo', `${result.confidence.toFixed(1)}%`, getConfidenceLevel(result.confidence)]
      ],
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 10 }
    })
    
    // Requiere revisión especialista
    if (medicalAnalysis?.requires_specialist_review) {
      doc.setFontSize(normalFontSize)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 0, 0)
      doc.text('⚠️ REVISIÓN ESPECIALISTA REQUERIDA', 20, 250)
      doc.setTextColor(0, 0, 0)
    }
    
    // Recomendaciones clínicas
    if (medicalAnalysis?.clinical_recommendations) {
      doc.setFontSize(subtitleFontSize)
      doc.setFont('helvetica', 'bold')
      doc.text('Recomendaciones Clínicas', 20, 270)
      
      doc.setFontSize(normalFontSize)
      doc.setFont('helvetica', 'normal')
      let yPos = 285
      medicalAnalysis.clinical_recommendations.forEach((rec: string, index: number) => {
        if (yPos < 270) { // Evitar salirse de la página
          doc.text(`${index + 1}. ${rec}`, 20, yPos)
          yPos += 10
        }
      })
    }
    
    // Validación del modelo
    if (medicalAnalysis?.model_validation) {
      doc.setFontSize(subtitleFontSize)
      doc.setFont('helvetica', 'bold')
      doc.text('Validación del Modelo', 20, 310)
      
      doc.setFontSize(normalFontSize)
      doc.setFont('helvetica', 'normal')
      doc.text(`Versión: ${medicalAnalysis.model_validation.model_version || 'N/A'}`, 20, 325)
      doc.text(`Sensibilidad: ${(medicalAnalysis.model_validation.sensitivity * 100).toFixed(1)}%`, 20, 335)
      doc.text(`Especificidad: ${(medicalAnalysis.model_validation.specificity * 100).toFixed(1)}%`, 20, 345)
    }
    
    // Pie de página
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(smallFontSize)
      doc.setFont('helvetica', 'italic')
      doc.text(`Generado por Sistema de Diagnóstico SOP por IA - Página ${i} de ${pageCount}`, 105, 280, { align: 'center' })
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')} - Hora: ${new Date().toLocaleTimeString('es-ES')}`, 105, 285, { align: 'center' })
    }
    
    // Generar nombre del archivo
    const timestamp = new Date().toISOString().split('T')[0]
    const imageName = getImageName(result.imageId).replace(/\.[^/.]+$/, '')
    const fileName = `reporte_medico_${imageName}_${timestamp}.pdf`
    
    // Descargar PDF
    doc.save(fileName)
    
    console.log('✅ PDF generado exitosamente:', fileName)
    
  } catch (error) {
    console.error('❌ Error al generar PDF:', error)
    alert('Error al generar el reporte PDF. Por favor, inténtalo nuevamente.')
  }
}

// Funciones auxiliares para mostrar datos adicionales de la API
function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return 'success'
  if (confidence >= 65) return 'warning'
  return 'error'
}

function getConfidenceLevel(confidence: number): string {
  if (confidence >= 90) return 'Alta'
  if (confidence >= 65) return 'Media'
  return 'Baja'
}

function getClassification(result: AnalysisResult): string {
  // ✅ PRIMERO: Usar directamente el diagnóstico del backend
  const medicalAnalysis = getMedicalAnalysis(result)
  if (medicalAnalysis?.diagnosis) {
    return medicalAnalysis.diagnosis // "Infectado" o "No Infectado" del backend
  }
  
  // ✅ Fallback: Basado en probabilidad corregida
  if (result.pcosProbability > 70) return 'Infectado'
  if (result.pcosProbability > 30) return 'Posible Infección'
  return 'No Infectado'
}

function getImageDimensions(imageId: string): string {
  const image = getImageById(imageId)
  if (image?.width && image?.height) {
    return `${image.width}×${image.height}px`
  }
  return '224×224px' // Dimensión por defecto de tu API
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

            function formatRelativeTime(date: Date): string {
              const now = new Date()
              const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
              
              if (diffInMinutes < 1) return 'ahora mismo'
              if (diffInMinutes < 60) return `hace ${diffInMinutes}m`
              
              const diffInHours = Math.floor(diffInMinutes / 60)
              if (diffInHours < 24) return `hace ${diffInHours}h`
              
              const diffInDays = Math.floor(diffInHours / 24)
              return `hace ${diffInDays}d`
            }

            // Función para obtener información médica adicional
            function getMedicalAnalysis(result: AnalysisResult): any {
              const image = imagesStore.images.find(img => img.id === result.imageId)
              if (!image) return null
              
              // Buscar en el store por el ID del análisis
              const analysisRecord = imagesStore.analysisResults.find(ar => ar.id === result.id)
              if (analysisRecord) {
                // Si tenemos datos médicos en el store, los retornamos
                return (analysisRecord as any).medical_analysis || null
              }
              
              return null
}
</script>

<style scoped>
.result-card {
  transition: all 0.3s ease;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.summary-card {
  transition: all 0.3s ease;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.summary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
}

.summary-number {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1;
  font-family: 'Roboto', sans-serif;
}

.summary-label {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.2;
}

.v-expansion-panels {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

/* Progress bar styling */
.v-progress-linear {
  border-radius: 4px;
}

/* Better spacing for status indicators */
.status-indicator {
  gap: 8px;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .summary-number {
    font-size: 2.5rem;
  }
  
  .summary-card {
    min-height: 120px;
  }
}

/* Better button spacing */
.v-btn + .v-btn {
  margin-left: 8px;
}
</style>
