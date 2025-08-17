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
              <div class="d-flex align-center justify-space-between mb-4">
                <span class="text-body-1 font-weight-medium text-grey-darken-4">
                  {{ getImageName(result.imageId) }}
                </span>
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
                  color="success"
                  size="80"
                  width="8"
                >
                  <span class="text-h6 font-weight-bold">
                    {{ selectedResult.confidence.toFixed(0) }}%
                  </span>
                </v-progress-circular>
                <p class="text-caption mt-2">Confianza</p>
              </div>
            </v-col>
          </v-row>

          <!-- Findings -->
          <v-expansion-panels variant="accordion" class="mb-4">
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon start>mdi-magnify</v-icon>
                Hallazgos Detectados
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-list density="compact">
                  <v-list-item
                    v-for="finding in selectedResult.findings"
                    :key="finding"
                    prepend-icon="mdi-check-circle"
                    color="success"
                  >
                    <v-list-item-title class="text-body-2">
                      {{ finding }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon start>mdi-lightbulb</v-icon>
                Recomendaciones
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-list density="compact">
                  <v-list-item
                    v-for="recommendation in selectedResult.recommendations"
                    :key="recommendation"
                    prepend-icon="mdi-arrow-right"
                    color="primary"
                  >
                    <v-list-item-title class="text-body-2">
                      {{ recommendation }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
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
const allResults = computed(() => imagesStore.analysisResults)

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

function downloadReport(result: AnalysisResult): void {
  // Esta función será implementada cuando tengamos la API
  console.log('Descargando reporte para:', result.id)
  // Aquí iría la lógica para generar y descargar el reporte PDF
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
