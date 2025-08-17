import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ImageFile, AnalysisResult, UploadOptions } from '@/types'
import { apiService } from '@/services/api'

export const useImagesStore = defineStore('images', () => {
  // State
  const images = ref<ImageFile[]>([])
  const analysisResults = ref<AnalysisResult[]>([])
  const uploadStatus = ref<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const selectedImages = ref<string[]>([])
  const isAnalyzing = ref(false)

  // Upload options
  const uploadOptions: UploadOptions = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/dicom'],
    maxFiles: 10
  }

  // Getters
  const uploadedImages = computed(() => 
    images.value.filter(img => img.status === 'uploaded')
  )

  const processingImages = computed(() => 
    images.value.filter(img => img.status === 'processing')
  )

  const errorImages = computed(() => 
    images.value.filter(img => img.status === 'error')
  )

  const completedAnalyses = computed(() => 
    analysisResults.value.filter(result => result.status === 'completed')
  )

  const pendingAnalyses = computed(() => 
    analysisResults.value.filter(result => result.status === 'pending' || result.status === 'processing')
  )

  const highRiskCount = computed(() => 
    completedAnalyses.value.filter(result => result.pcosProbability > 50).length
  )

  const lowRiskCount = computed(() => 
    completedAnalyses.value.filter(result => result.pcosProbability <= 50).length
  )

  // Actions
  function addImage(file: File): Promise<ImageFile> {
    return new Promise((resolve, reject) => {
      const imageFile: ImageFile = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        url: URL.createObjectURL(file),
        uploadedAt: new Date(),
        status: 'uploading'
      }

      // Validar archivo
      if (file.size > uploadOptions.maxSize) {
        imageFile.status = 'error'
        imageFile.error = 'El archivo excede el tamaño máximo de 10MB'
        images.value.push(imageFile)
        reject(new Error(imageFile.error))
        return
      }

      if (!uploadOptions.allowedTypes.includes(file.type)) {
        imageFile.status = 'error'
        imageFile.error = 'Tipo de archivo no soportado'
        images.value.push(imageFile)
        reject(new Error(imageFile.error))
        return
      }

      // Simular carga
      setTimeout(() => {
        imageFile.status = 'uploaded'
        images.value.push(imageFile)
        resolve(imageFile)
      }, 1000)
    })
  }

  function removeImage(imageId: string) {
    const index = images.value.findIndex(img => img.id === imageId)
    if (index > -1) {
      const image = images.value[index]
      URL.revokeObjectURL(image.url)
      images.value.splice(index, 1)
      
      // También remover resultados de análisis asociados
      const resultIndex = analysisResults.value.findIndex(result => result.imageId === imageId)
      if (resultIndex > -1) {
        analysisResults.value.splice(resultIndex, 1)
      }
    }
  }

  function selectImage(imageId: string) {
    const index = selectedImages.value.indexOf(imageId)
    if (index > -1) {
      selectedImages.value.splice(index, 1)
    } else {
      selectedImages.value.push(imageId)
    }
  }

  function clearSelection() {
    selectedImages.value = []
  }

  /**
   * Analizar múltiples imágenes usando la API
   */
  async function analyzeImages(imageIds: string[]): Promise<AnalysisResult[]> {
    if (imageIds.length === 0) {
      throw new Error('No hay imágenes para analizar')
    }

    isAnalyzing.value = true
    console.log('🔄 Iniciando análisis de', imageIds.length, 'imágenes')

    try {
      // Obtener las imágenes a analizar
      const imagesToAnalyze = images.value.filter(img => imageIds.includes(img.id))
      
      if (imagesToAnalyze.length === 0) {
        throw new Error('No se encontraron imágenes válidas para analizar')
      }

      // Crear resultados pendientes para cada imagen
      const pendingResults: AnalysisResult[] = imagesToAnalyze.map(image => ({
        id: crypto.randomUUID(),
        imageId: image.id,
        pcosProbability: 0,
        confidence: 0,
        findings: [],
        recommendations: [],
        analyzedAt: new Date(),
        status: 'processing' as const
      }))

      // Agregar resultados pendientes al store
      analysisResults.value.push(...pendingResults)

      // Llamar a la API para analizar las imágenes
      console.log('📡 Enviando imágenes a la API...')
      const apiResults = await apiService.analyzeImages(imagesToAnalyze)

      // Actualizar los resultados con los datos de la API
      for (const apiResult of apiResults) {
        const existingResultIndex = analysisResults.value.findIndex(
          result => result.imageId === apiResult.imageId && result.status === 'processing'
        )

        if (existingResultIndex > -1) {
          // Actualizar resultado existente
          analysisResults.value[existingResultIndex] = {
            ...analysisResults.value[existingResultIndex],
            ...apiResult,
            analyzedAt: new Date(apiResult.analyzedAt)
          }
        } else {
          // Agregar nuevo resultado si no existe
          analysisResults.value.push(apiResult)
        }
      }

      console.log('✅ Análisis completado exitosamente')
      return apiResults

    } catch (error) {
      console.error('❌ Error durante el análisis:', error)
      
      // Marcar resultados pendientes como error
      analysisResults.value.forEach(result => {
        if (imageIds.includes(result.imageId) && result.status === 'processing') {
          result.status = 'error'
          result.error = error instanceof Error ? error.message : 'Error desconocido en el análisis'
        }
      })

      throw error
    } finally {
      isAnalyzing.value = false
    }
  }

  /**
   * Analizar una sola imagen usando la API
   */
  async function analyzeImage(imageId: string): Promise<AnalysisResult> {
    const image = images.value.find(img => img.id === imageId)
    if (!image) {
      throw new Error('Imagen no encontrada')
    }

    console.log('🔄 Analizando imagen individual:', image.name)

    try {
      // Crear resultado pendiente
      const pendingResult: AnalysisResult = {
        id: crypto.randomUUID(),
        imageId: image.id,
        pcosProbability: 0,
        confidence: 0,
        findings: [],
        recommendations: [],
        analyzedAt: new Date(),
        status: 'processing'
      }

      analysisResults.value.push(pendingResult)

      // Llamar a la API
      const apiResult = await apiService.analyzeImage({
        imageId: image.id,
        imageName: image.name,
        imageSize: image.size,
        imageType: image.type
      })

      // Actualizar resultado
      const resultIndex = analysisResults.value.findIndex(r => r.id === pendingResult.id)
      if (resultIndex > -1) {
        analysisResults.value[resultIndex] = {
          ...pendingResult,
          ...apiResult,
          analyzedAt: new Date(apiResult.analyzedAt)
        }
      }

      console.log('✅ Análisis individual completado')
      return apiResult

    } catch (error) {
      console.error('❌ Error en análisis individual:', error)
      
      // Actualizar resultado con error
      const result = analysisResults.value.find(r => r.imageId === imageId && r.status === 'processing')
      if (result) {
        result.status = 'error'
        result.error = error instanceof Error ? error.message : 'Error desconocido'
      }

      throw error
    }
  }

  /**
   * Obtener resultado de análisis actualizado desde la API
   */
  async function refreshAnalysisResult(resultId: string): Promise<AnalysisResult> {
    try {
      const updatedResult = await apiService.getAnalysisResult(resultId)
      
      // Actualizar en el store
      const index = analysisResults.value.findIndex(r => r.id === resultId)
      if (index > -1) {
        analysisResults.value[index] = updatedResult
      }

      return updatedResult
    } catch (error) {
      console.error('Error al actualizar resultado:', error)
      throw error
    }
  }

  function clearResults() {
    analysisResults.value = []
  }

  function clearAllData() {
    // Limpiar URLs de objetos para evitar memory leaks
    images.value.forEach(image => {
      if (image.url.startsWith('blob:')) {
        URL.revokeObjectURL(image.url)
      }
    })
    
    images.value = []
    analysisResults.value = []
    selectedImages.value = []
    uploadStatus.value = 'idle'
    isAnalyzing.value = false
  }

  return {
    // State
    images,
    analysisResults,
    uploadStatus,
    selectedImages,
    isAnalyzing,
    uploadOptions,
    // Getters
    uploadedImages,
    processingImages,
    errorImages,
    completedAnalyses,
    pendingAnalyses,
    highRiskCount,
    lowRiskCount,
    // Actions
    addImage,
    removeImage,
    selectImage,
    clearSelection,
    analyzeImages,
    analyzeImage,
    refreshAnalysisResult,
    clearResults,
    clearAllData
  }
})