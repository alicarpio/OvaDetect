<template>
  <v-container fluid class="pa-6">
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
          <!-- Individual Result Cards -->
          <v-card 
            v-for="result in allResults" 
            :key="result.id" 
            class="mb-4 result-card"
                        elevation="2"
                        rounded="lg"
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
                </div>
                <div v-if="result.status === 'completed'" class="d-flex align-center">
                  <v-icon size="16" color="success" class="me-2">mdi-check-circle</v-icon>
                  <span class="text-caption text-success font-weight-medium">
                    Completado
                  </span>
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

              <!-- Probability Section (only for completed) -->
              <div v-if="result.status === 'completed'">
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-body-2 font-weight-medium text-grey-darken-2">
                    Probabilidad PCOS
                  </span>
                  <span 
                    class="text-h5 font-weight-bold"
                    :class="getProbabilityTextColor(result.pcosProbability)"
                  >
                    {{ result.pcosProbability.toFixed(1) }}%
                  </span>
                </div>
                
                <!-- Nivel de Confianza -->
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-body-2 font-weight-medium text-grey-darken-2">
                    Confianza del Modelo
                  </span>
                  <v-chip 
                    :color="getConfidenceColor(result.confidence)" 
                    size="small" 
                    variant="flat"
                  >
                    {{ result.confidence.toFixed(1) }}%
                  </v-chip>
                </div>
                
                            <!-- Clasificación -->
            <div class="d-flex justify-space-between align-center mb-3">
              <span class="text-body-2 font-weight-medium text-grey-darken-2">
                Clasificación
              </span>
              <v-chip 
                :color="result.pcosProbability > 50 ? 'error' : 'success'" 
                size="small" 
                variant="tonal"
              >
                {{ getClassification(result) }}
              </v-chip>
            </div>
            
            <!-- Información adicional del análisis médico -->
            <div v-if="getMedicalAnalysis(result)" class="mb-3">
              <v-chip 
                :color="getMedicalAnalysis(result)?.requires_specialist_review ? 'warning' : 'success'" 
                size="small" 
                variant="flat"
                class="mb-2"
              >
                {{ getMedicalAnalysis(result)?.requires_specialist_review ? '⚠️ Revisión Especialista' : '✅ Seguimiento Rutinario' }}
              </v-chip>
              
              <div class="text-caption text-medium-emphasis">
                <div>Modelo: {{ getMedicalAnalysis(result)?.model_validation?.model_version }}</div>
                <div>Sensibilidad: {{ (getMedicalAnalysis(result)?.model_validation?.sensitivity * 100).toFixed(1) }}%</div>
                <div>Especificidad: {{ (getMedicalAnalysis(result)?.model_validation?.specificity * 100).toFixed(1) }}%</div>
              </div>
            </div>
                
                <v-progress-linear
                  :model-value="result.pcosProbability"
                  :color="getProbabilityColor(result.pcosProbability)"
                  height="8"
                  rounded
                  class="mb-3"
                  bg-color="grey-lighten-3"
                />
                
                <div class="d-flex justify-space-between align-center">
                  <span 
                    class="text-body-2 font-weight-medium"
                    :class="getProbabilityTextColor(result.pcosProbability)"
                  >
                    {{ getRiskLevel(result.pcosProbability) }}
                  </span>
                  <div class="d-flex align-center">
                    <v-btn
                      color="primary"
                      variant="text"
                      size="small"
                      class="text-none me-2"
                      @click="showDetails(result)"
                    >
                      Ver Detalles
                    </v-btn>
                    <v-btn
                      color="grey-darken-1"
                      variant="text"
                      size="small"
                      icon="mdi-download"
                      @click="downloadReport(result)"
                    />
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Summary Statistics -->
          <v-row class="mt-8">
            <!-- Análisis Completados -->
            <v-col cols="12" md="4">
              <v-card class="summary-card text-center pa-8" elevation="1" rounded="lg" color="blue-grey-lighten-5">
                <div class="summary-number text-primary mb-2">
                  {{ completedCount }}
                </div>
                <div class="summary-label text-body-2 text-grey-darken-2">
                  Análisis completados
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
                  Alto riesgo PCOS
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
                  Bajo riesgo PCOS
                </div>
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

          <v-row class="mb-4">
            <v-col cols="6">
              <div class="text-center">
                <v-progress-circular
                  :model-value="selectedResult.pcosProbability"
                  :color="getProbabilityColor(selectedResult.pcosProbability)"
                  size="80"
                  width="8"
                >
                  <span class="text-h6 font-weight-bold">
                    {{ selectedResult.pcosProbability.toFixed(0) }}%
                  </span>
                </v-progress-circular>
                <p class="text-caption mt-2">Probabilidad PCOS</p>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="text-center">
                <v-progress-circular
                  :model-value="selectedResult.confidence"
                  :color="getConfidenceColor(selectedResult.confidence)"
                  size="80"
                  width="8"
                >
                  <span class="text-h6 font-weight-bold">
                    {{ selectedResult.confidence.toFixed(1) }}%
                  </span>
                </v-progress-circular>
                <p class="text-caption mt-2">
                  Confianza del Modelo
                  <v-chip 
                    :color="getConfidenceColor(selectedResult.confidence)" 
                    size="x-small" 
                    variant="flat"
                    class="ml-2"
                  >
                    {{ getConfidenceLevel(selectedResult.confidence) }}
                  </v-chip>
                </p>
              </div>
            </v-col>
          </v-row>
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
  imagesStore.completedAnalyses.filter(result => result.pcosProbability > 50).length
)

const lowRiskCount = computed(() => 
  imagesStore.completedAnalyses.filter(result => result.pcosProbability <= 50).length
)

// Helper functions
function getImageName(imageId: string): string {
  const image = imagesStore.images.find(img => img.id === imageId)
  return image?.name || 'Imagen desconocida'
}

function getImageById(imageId: string) {
  return imagesStore.images.find(img => img.id === imageId)
}

function getProbabilityColor(probability: number): string {
  if (probability > 50) return 'red'
  return 'green'
}

function getProbabilityTextColor(probability: number): string {
  if (probability > 50) return 'text-red'
  return 'text-green'
}

function getRiskLevel(probability: number): string {
  if (probability > 50) return 'Alto riesgo PCOS'
  return 'Bajo riesgo PCOS'
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
    console.log('📄 Iniciando descarga de reporte para:', result.imageId)
    
    // Obtener información de la imagen
    const imageInfo = getImageById(result.imageId)
    
                    // Crear reporte usando los datos que ya tenemos
                const medicalAnalysis = getMedicalAnalysis(result)
                
                const reportData = {
                  generatedAt: new Date().toISOString(),
                  reportTitle: 'Reporte de Análisis PCOS',
                  imageInfo: {
                    id: result.imageId,
                    name: imageInfo?.name || 'Imagen sin nombre',
                    size: imageInfo?.size || 0,
                    type: imageInfo?.type || 'unknown',
                    dimensions: getImageDimensions(result.imageId),
                    uploadedAt: imageInfo?.uploadedAt?.toISOString() || new Date().toISOString()
                  },
                  analysisResults: {
                    id: result.id,
                    pcosProbability: result.pcosProbability,
                    confidence: result.confidence,
                    classification: getClassification(result),
                    riskLevel: result.pcosProbability > 50 ? 'Alto Riesgo' : 'Bajo Riesgo',
                    analyzedAt: result.analyzedAt.toISOString(),
                    status: result.status
                  },
                  medicalAnalysis: medicalAnalysis ? {
                    diagnosis: medicalAnalysis.diagnosis,
                    confidenceScore: medicalAnalysis.confidence_score,
                    requiresSpecialistReview: medicalAnalysis.requires_specialist_review,
                    clinicalRecommendations: medicalAnalysis.clinical_recommendations,
                    modelValidation: {
                      threshold: medicalAnalysis.model_validation?.threshold,
                      sensitivity: medicalAnalysis.model_validation?.sensitivity,
                      specificity: medicalAnalysis.model_validation?.specificity,
                      auc: medicalAnalysis.model_validation?.auc,
                      modelVersion: medicalAnalysis.model_validation?.model_version
                    },
                    clinicalInterpretation: {
                      confidenceLevel: medicalAnalysis.clinical_interpretation?.confidence_level,
                      clinicalAction: medicalAnalysis.clinical_interpretation?.clinical_action,
                      reliability: medicalAnalysis.clinical_interpretation?.reliability
                    }
                  } : null,
                  summary: {
                    probability: `${result.pcosProbability.toFixed(1)}%`,
                    confidence: `${result.confidence.toFixed(1)}%`,
                    confidenceLevel: getConfidenceLevel(result.confidence),
                    riskAssessment: result.pcosProbability > 50 ? 'Se requiere seguimiento médico' : 'Resultado dentro de parámetros normales'
                  },
                  metadata: {
                    generatedBy: 'Sistema de Diagnóstico PCOS por IA',
                    version: '1.0.0',
                    processingTime: `Procesado ${formatRelativeTime(result.analyzedAt)}`
                  }
                }
    
    // Convertir a JSON para descarga
    const jsonBlob = new Blob(
      [JSON.stringify(reportData, null, 2)], 
      { type: 'application/json' }
    )
    
    // Crear enlace de descarga
    const url = window.URL.createObjectURL(jsonBlob)
    const link = document.createElement('a')
    link.href = url
    
    // Nombre del archivo con timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const imageName = getImageName(result.imageId).replace(/\.[^/.]+$/, '') // Quitar extensión
    link.download = `reporte_analisis_${imageName}_${timestamp}.json`
    
    // Simular click para descargar
    document.body.appendChild(link)
    link.click()
    
    // Limpiar
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log('✅ Reporte descargado exitosamente usando datos locales')
    
  } catch (error) {
    console.error('❌ Error al descargar reporte:', error)
    alert('Error al generar el reporte. Por favor, inténtalo nuevamente.')
  }
}

// Funciones auxiliares para mostrar datos adicionales de la API
function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return 'success'
  if (confidence >= 70) return 'warning'
  return 'error'
}

function getConfidenceLevel(confidence: number): string {
  if (confidence >= 90) return 'Alta'
  if (confidence >= 70) return 'Media'
  return 'Baja'
}

function getClassification(result: AnalysisResult): string {
  // Buscar en findings si viene la clasificación de tu API
  const finding = result.findings.find(f => f.includes('Infectado') || f.includes('No Infectado'))
  if (finding) return finding
  
  // Fallback basado en probabilidad
  return result.pcosProbability > 50 ? 'Alto Riesgo PCOS' : 'Bajo Riesgo PCOS'
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
