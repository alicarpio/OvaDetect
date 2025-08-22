<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <!-- Header -->
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold text-primary mb-2">
              Diagnóstico SOP por IA
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Análisis automático de ultrasonidos ováricos
            </p>
          </div>
          <v-chip color="primary" variant="outlined">
            Portal Médico v1.0
          </v-chip>
        </div>

        <!-- Upload Area -->
        <v-card class="pa-8 mb-6">
          <v-card-title class="text-h5 font-weight-bold text-center mb-4">
            Cargar Ultrasonidos
          </v-card-title>

          <!-- Drag & Drop Zone -->
          <v-card
            class="upload-zone pa-8 text-center"
            :class="{ 'upload-zone--dragover': isDragOver }"
            @drop="handleDrop"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @click="triggerFileInput"
          >
            <v-icon size="64" color="primary" class="mb-4">
              mdi-cloud-upload
            </v-icon>
            
            <h3 class="text-h6 font-weight-medium mb-2">
              Arrastra las imágenes aquí
            </h3>
            <p class="text-body-1 text-medium-emphasis mb-6">
              o haz clic para seleccionar archivos
            </p>

            <!-- Action Buttons -->
            <div class="d-flex gap-4 justify-center flex-wrap">
              <v-btn
                color="primary"
                size="large"
                prepend-icon="mdi-file-document"
                @click.stop="triggerFileInput"
              >
                Seleccionar Archivos
              </v-btn>
              
              <v-btn
                color="secondary"
                size="large"
                variant="outlined"
                prepend-icon="mdi-folder"
                @click.stop="triggerFolderInput"
              >
                Seleccionar Carpeta
              </v-btn>
            </div>

            <!-- File Input (hidden) -->
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*,.dcm"
              class="d-none"
              @change="handleFileSelect"
            />
          </v-card>

          <!-- Supported Formats -->
          <div class="text-center mt-4">
            <p class="text-body-2 text-medium-emphasis">
              Formatos soportados: JPG, PNG, DICOM • Máximo 10MB por archivo
            </p>
          </div>
        </v-card>

        <!-- Uploaded Images -->
        <div v-if="imagesStore.uploadedImages.length > 0" class="mb-6">
          <h3 class="text-h6 font-weight-medium mb-4">
            Imágenes Cargadas ({{ imagesStore.uploadedImages.length }})
          </h3>
          
          <v-row>
            <v-col
              v-for="image in imagesStore.uploadedImages"
              :key="image.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card class="image-card">
                <v-img
                  :src="image.url"
                  height="200"
                  cover
                  class="image-preview"
                />
                <v-card-text class="pa-3">
                  <div class="d-flex justify-space-between align-center">
                    <div class="text-truncate">
                      <p class="text-body-2 font-weight-medium text-truncate">
                        {{ image.name }}
                      </p>
                      <p class="text-caption text-medium-emphasis">
                        {{ formatFileSize(image.size) }}
                      </p>
                    </div>
                    <v-btn
                      icon="mdi-delete"
                      variant="text"
                      color="error"
                      size="small"
                      @click="imagesStore.removeImage(image.id)"
                    />
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Analyze Button -->
          <div class="text-center mt-6">
            <v-btn
              color="success"
              size="large"
              prepend-icon="mdi-brain"
              :loading="imagesStore.isAnalyzing"
              :disabled="imagesStore.uploadedImages.length === 0"
              @click="analyzeImages"
            >
              {{ imagesStore.isAnalyzing ? 'Analizando...' : 'Analizar Imágenes' }}
            </v-btn>
          </div>
        </div>

        <!-- Error Images -->
        <div v-if="imagesStore.errorImages.length > 0" class="mb-6">
          <h3 class="text-h6 font-weight-medium mb-4 text-error">
            Errores de Carga ({{ imagesStore.errorImages.length }})
          </h3>
          
          <v-alert
            v-for="image in imagesStore.errorImages"
            :key="image.id"
            type="error"
            variant="tonal"
            class="mb-2"
          >
            <div class="d-flex justify-space-between align-center">
              <span>{{ image.name }}: {{ image.error }}</span>
              <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                @click="imagesStore.removeImage(image.id)"
              />
            </div>
          </v-alert>
        </div>

        <!-- Analysis Information -->
        <v-card class="pa-6">
          <v-card-title class="text-h5 font-weight-bold mb-4">
            Información del Análisis
          </v-card-title>

          <v-row>
            <v-col cols="12" md="4">
              <v-alert
                type="info"
                variant="tonal"
                class="h-100"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-information</v-icon>
                </template>
                <h4 class="text-h6 font-weight-medium mb-2">¿Cómo funciona?</h4>
                <p class="text-body-2">
                  Nuestro modelo de IA analiza imágenes de ultrasonido ovárico para detectar patrones asociados con el Síndrome de Ovario Poliquístico (SOP).
                </p>
              </v-alert>
            </v-col>

            <v-col cols="12" md="4">
              <v-alert
                type="warning"
                variant="tonal"
                class="h-100"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-lightbulb</v-icon>
                </template>
                <h4 class="text-h6 font-weight-medium mb-2">Recomendaciones de imagen</h4>
                <ul class="text-body-2">
                  <li>Imágenes claras y de alta resolución</li>
                  <li>Vista transversal y longitudinal de ovarios</li>
                  <li>Sin texto superpuesto en el área ovárica</li>
                  <li>Formato DICOM preferido para mayor precisión</li>
                </ul>
              </v-alert>
            </v-col>

            <v-col cols="12" md="4">
              <v-alert
                type="error"
                variant="tonal"
                class="h-100"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-alert</v-icon>
                </template>
                <h4 class="text-h6 font-weight-medium mb-2">Importante</h4>
                <p class="text-body-2">
                  Este análisis es una herramienta de apoyo diagnóstico. Siempre debe ser validado por un profesional médico cualificado.
                </p>
              </v-alert>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useImagesStore } from '@/stores/images'

const router = useRouter()
const imagesStore = useImagesStore()

const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)

// File handling
function triggerFileInput() {
  fileInput.value?.click()
}

function triggerFolderInput() {
  // En un entorno real, esto abriría un selector de carpetas
  triggerFileInput()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    handleFiles(Array.from(target.files))
  }
}

function handleDrop(event: DragEvent) {
  isDragOver.value = false
  if (event.dataTransfer?.files) {
    handleFiles(Array.from(event.dataTransfer.files))
  }
}

async function handleFiles(files: File[]) {
  for (const file of files) {
    try {
      // Solo agregar al store para mostrar, no subir todavía
      imagesStore.addFileToStore(file)
    } catch (error) {
      console.error('Error adding file to store:', error)
    }
  }
}

async function analyzeImages() {
  const imageIds = imagesStore.uploadedImages.map(img => img.id)
  if (imageIds.length > 0) {
    console.log('🚀 Iniciando análisis de imágenes...')
    console.log('📸 Imágenes a analizar:', imageIds)
    
    await imagesStore.analyzeImages(imageIds)
    
    console.log('✅ Análisis completado, limpiando imágenes del upload...')
    // Limpiar imágenes del upload después de analizarlas
    imagesStore.clearUploadedImages()
    
    console.log('🧹 Imágenes limpiadas, navegando a results...')
    router.push('/results')
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.upload-zone {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-zone:hover {
  border-color: #1976d2;
  background-color: #f5f5f5;
}

.upload-zone--dragover {
  border-color: #1976d2;
  background-color: #e3f2fd;
}

.image-card {
  transition: transform 0.2s ease;
}

.image-card:hover {
  transform: translateY(-2px);
}

.image-preview {
  object-fit: cover;
}
</style>
