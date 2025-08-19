import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ImageFile, AnalysisResult, UploadOptions, ImageFileRecord } from '@/types'
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

  /**
   * Agregar archivo al store para mostrar (sin subir a API todavía)
   */
  function addFileToStore(file: File): ImageFile {
    console.log(`📁 Agregando archivo al store: ${file.name}`)
    
    // Crear objeto de imagen temporal
    const imageFile: ImageFile = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      url: URL.createObjectURL(file),
      uploadedAt: new Date(),
      status: 'uploaded', // Marcar como "uploaded" para poder seleccionar
      tempFile: file // Guardar el archivo original para subir después
    }

    // Validar archivo
    if (file.size > uploadOptions.maxSize) {
      imageFile.status = 'error'
      imageFile.error = 'El archivo excede el tamaño máximo de 10MB'
      images.value.push(imageFile)
      return imageFile
    }

    if (!uploadOptions.allowedTypes.includes(file.type)) {
      imageFile.status = 'error'
      imageFile.error = 'Tipo de archivo no soportado'
      images.value.push(imageFile)
      return imageFile
    }

    // Agregar al store
    images.value.push(imageFile)
    console.log(`✅ Archivo agregado al store: ${imageFile.name}`)
    return imageFile
  }

  /**
   * Agregar imagen con upload real a la API
   */
  async function addImage(file: File): Promise<ImageFile> {
    console.log(`📤 Agregando imagen: ${file.name}`)
    
    // Crear objeto de imagen temporal
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
      throw new Error(imageFile.error)
    }

    if (!uploadOptions.allowedTypes.includes(file.type)) {
      imageFile.status = 'error'
      imageFile.error = 'Tipo de archivo no soportado'
      images.value.push(imageFile)
      throw new Error(imageFile.error)
    }

    // Agregar al store con estado "uploading"
    images.value.push(imageFile)

    try {
      // Subir a la API real
      console.log(`🔄 Subiendo ${file.name} a la API...`)
      const uploadedRecord: ImageFileRecord = await apiService.uploadFile(file)
      
      console.log(`🔍 Datos recibidos de la API:`, uploadedRecord)
      
      // Actualizar con datos del servidor (estructura real de tu API)
      if (uploadedRecord && typeof uploadedRecord === 'object') {
        // Tu API devuelve estos campos exactos
        imageFile.id = uploadedRecord.id?.toString() || imageFile.id
        imageFile.name = uploadedRecord.name || file.name
        imageFile.size = uploadedRecord.size || file.size
        imageFile.type = uploadedRecord.type || file.type
        imageFile.url = uploadedRecord.url || ''
        imageFile.uploadedAt = uploadedRecord.uploaded_at ? new Date(uploadedRecord.uploaded_at) : new Date()
        imageFile.status = uploadedRecord.status || 'uploaded'
        
        // ¡Tu API ya procesa la imagen con IA! Guardar el resultado directamente
        if (uploadedRecord.analysis) {
          const analysisResult: AnalysisResult = {
            id: uploadedRecord.analysis.id?.toString() || crypto.randomUUID(),
            imageId: imageFile.id,
            pcosProbability: uploadedRecord.analysis.pcos_probability * 100, // Convertir a porcentaje
            confidence: uploadedRecord.analysis.confidence * 100, // Convertir a porcentaje
            findings: Array.isArray(uploadedRecord.analysis.findings) 
              ? uploadedRecord.analysis.findings 
              : [uploadedRecord.analysis.prediction || 'Análisis completado'],
            recommendations: Array.isArray(uploadedRecord.analysis.recommendations) 
              ? uploadedRecord.analysis.recommendations 
              : ['Consultar con especialista para evaluación completa'],
            analyzedAt: new Date(),
            status: 'completed',
            riskLevel: uploadedRecord.analysis.pcos_probability > 0.5 ? 'alto' : 'bajo'
          }
          
          // Agregar el resultado al store
          analysisResults.value.push(analysisResult)
          console.log(`🧠 Análisis IA completado: ${uploadedRecord.analysis.pcos_probability.toFixed(2)} probabilidad PCOS`)
        }
        
        console.log(`✅ Imagen subida y analizada exitosamente: ${imageFile.name}`)
      } else {
        console.warn(`⚠️ Respuesta de API inesperada:`, uploadedRecord)
        imageFile.status = 'uploaded'
      }
      
      return imageFile

    } catch (error) {
      console.error(`❌ Error al subir ${file.name}:`, error)
      imageFile.status = 'error'
      imageFile.error = error instanceof Error ? error.message : 'Error desconocido al subir'
      throw error
    }
  }

  /**
   * Subir múltiples archivos de una vez
   */
  async function addMultipleImages(files: File[]): Promise<ImageFile[]> {
    console.log(`📤 Subiendo ${files.length} archivos en lote`)
    
    const imageFiles: ImageFile[] = []
    const validFiles: File[] = []

    // Validar todos los archivos primero
    for (const file of files) {
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
        continue
      }

      if (!uploadOptions.allowedTypes.includes(file.type)) {
        imageFile.status = 'error'
        imageFile.error = 'Tipo de archivo no soportado'
        images.value.push(imageFile)
        continue
      }

      imageFiles.push(imageFile)
      validFiles.push(file)
      images.value.push(imageFile)
    }

    if (validFiles.length === 0) {
      throw new Error('No hay archivos válidos para subir')
    }

    try {
      // Subir todos los archivos válidos de una vez
      console.log(`🔄 Subiendo ${validFiles.length} archivos válidos a la API...`)
      const uploadedRecords: ImageFileRecord[] = await apiService.uploadFiles(validFiles)
      
      console.log(`🔍 Datos recibidos de la API (lote):`, uploadedRecords)
      
      // Actualizar cada imagen con los datos del servidor (estructura real de tu API)
      uploadedRecords.forEach((record, index) => {
        const imageFile = imageFiles[index]
        if (imageFile && record && typeof record === 'object') {
          // Tu API devuelve estos campos exactos
          imageFile.id = record.id?.toString() || imageFile.id
          imageFile.name = record.name || imageFile.name
          imageFile.size = record.size || imageFile.size
          imageFile.type = record.type || imageFile.type
          imageFile.url = record.url || ''
          imageFile.uploadedAt = record.uploaded_at ? new Date(record.uploaded_at) : new Date()
          imageFile.status = record.status || 'uploaded'
          
          // ¡Tu API ya procesa cada imagen con IA! Guardar los resultados
          if (record.analysis) {
            const analysisResult: AnalysisResult = {
              id: record.analysis.id?.toString() || crypto.randomUUID(),
              imageId: imageFile.id,
              pcosProbability: record.analysis.pcos_probability * 100, // Convertir a porcentaje
              confidence: record.analysis.confidence * 100, // Convertir a porcentaje
              findings: Array.isArray(record.analysis.findings) 
                ? record.analysis.findings 
                : [record.analysis.prediction || 'Análisis completado'],
              recommendations: Array.isArray(record.analysis.recommendations) 
                ? record.analysis.recommendations 
                : ['Consultar con especialista para evaluación completa'],
              analyzedAt: new Date(),
              status: 'completed',
              riskLevel: record.analysis.pcos_probability > 0.5 ? 'alto' : 'bajo'
            }
            
            // Agregar el resultado al store
            analysisResults.value.push(analysisResult)
            console.log(`🧠 Análisis IA completado para ${imageFile.name}: ${record.analysis.pcos_probability.toFixed(2)} probabilidad PCOS`)
          }
        } else {
          console.warn(`⚠️ Respuesta de API inesperada para archivo ${index}:`, record)
          if (imageFile) {
            imageFile.status = 'uploaded'
          }
        }
      })
      
      console.log(`✅ ${uploadedRecords.length} archivos subidos exitosamente`)
      return imageFiles

    } catch (error) {
      console.error(`❌ Error al subir archivos en lote:`, error)
      
      // Marcar todos los archivos como error
      imageFiles.forEach(imageFile => {
        imageFile.status = 'error'
        imageFile.error = error instanceof Error ? error.message : 'Error desconocido al subir'
      })
      
      throw error
    }
  }

  function removeImage(imageId: string) {
    const index = images.value.findIndex(img => img.id === imageId)
    if (index > -1) {
      const image = images.value[index]
      if (image.url.startsWith('blob:')) {
        URL.revokeObjectURL(image.url)
      }
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
   * Subir y analizar imágenes seleccionadas usando tu API
   * (Ahora sí sube a la API cuando se hace clic en "Analizar")
   */
  async function analyzeImages(imageIds: string[]): Promise<AnalysisResult[]> {
    if (imageIds.length === 0) {
      throw new Error('No hay imágenes para analizar')
    }

    isAnalyzing.value = true
    console.log('🔄 Iniciando upload y análisis de', imageIds.length, 'imágenes...')

    try {
      // Obtener las imágenes a procesar
      const imagesToProcess = images.value.filter(img => 
        imageIds.includes(img.id) && img.tempFile && img.status !== 'error'
      )
      
      if (imagesToProcess.length === 0) {
        throw new Error('No se encontraron archivos válidos para procesar')
      }

      // Subir archivos a la API (tu API ya hace el análisis automáticamente)
      const filesToUpload = imagesToProcess.map(img => img.tempFile!).filter(Boolean)
      
      if (filesToUpload.length > 0) {
        console.log(`📤 Subiendo ${filesToUpload.length} archivos a tu API...`)
        const uploadedRecords: ImageFileRecord[] = await apiService.uploadFiles(filesToUpload)
        
        // Procesar cada respuesta y actualizar el store
        uploadedRecords.forEach((record, index) => {
          const imageFile = imagesToProcess[index]
          if (imageFile && record && typeof record === 'object') {
            // Actualizar imagen con datos reales de la API
            imageFile.id = record.id?.toString() || imageFile.id
            imageFile.name = record.name || imageFile.name
            imageFile.size = record.size || imageFile.size
            imageFile.type = record.type || imageFile.type
            imageFile.url = record.url || imageFile.url
            imageFile.uploadedAt = record.uploaded_at ? new Date(record.uploaded_at) : new Date()
            imageFile.status = record.status || 'uploaded'
            
            // Limpiar el archivo temporal
            if (imageFile.tempFile) {
              URL.revokeObjectURL(imageFile.url) // Limpiar blob URL
              delete imageFile.tempFile
            }
            
            // Procesar resultado del análisis IA
            if (record.analysis) {
              const analysisResult: AnalysisResult = {
                id: record.analysis.id?.toString() || crypto.randomUUID(),
                imageId: imageFile.id,
                pcosProbability: record.analysis.pcos_probability * 100, // Convertir a porcentaje
                confidence: record.analysis.confidence * 100, // Convertir a porcentaje
                findings: Array.isArray(record.analysis.findings) 
                  ? record.analysis.findings 
                  : [record.analysis.prediction || 'Análisis completado'],
                recommendations: Array.isArray(record.analysis.recommendations) 
                  ? record.analysis.recommendations 
                  : ['Consultar con especialista para evaluación completa'],
                analyzedAt: new Date(),
                status: 'completed',
                riskLevel: record.analysis.pcos_probability > 0.5 ? 'alto' : 'bajo'
              }
              
              // Agregar resultado al store
              analysisResults.value.push(analysisResult)
              console.log(`🧠 Análisis IA completado para ${imageFile.name}: ${record.analysis.pcos_probability.toFixed(2)} probabilidad PCOS`)
            }
          }
        })
      }

      // Retornar todos los resultados de análisis para las imágenes procesadas
      const results = analysisResults.value.filter(result => 
        imageIds.includes(result.imageId) && result.status === 'completed'
      )

      console.log(`✅ Análisis completado para ${results.length} imágenes`)
      return results

    } catch (error) {
      console.error('❌ Error durante el análisis:', error)
      throw error
    } finally {
      isAnalyzing.value = false
    }
  }

  /**
   * ¡Tu API ya analiza automáticamente al subir!
   * Esta función solo retorna el resultado ya existente
   */
  async function analyzeImage(imageId: string): Promise<AnalysisResult> {
    const image = images.value.find(img => img.id === imageId)
    if (!image) {
      throw new Error('Imagen no encontrada')
    }

    console.log('🔍 Verificando resultado de análisis para:', image.name)

    // Tu API ya procesó la imagen al subirla, solo buscar el resultado
    const existingResult = analysisResults.value.find(result => 
      result.imageId === imageId && result.status === 'completed'
    )

    if (!existingResult) {
      console.log('❌ No se encontró resultado de análisis. ¿La imagen se subió correctamente?')
      throw new Error('No hay resultado de análisis disponible. Asegúrate de que la imagen se haya subido correctamente.')
    }

    console.log(`✅ Resultado encontrado para ${image.name}`)
    return existingResult
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
    addFileToStore,
    addImage,
    addMultipleImages,
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