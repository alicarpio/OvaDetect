import type { AnalysisResult, ImageFile, ImageFileRecord } from '@/types'

// Configuración de la API
const API_CONFIG = {
  baseURL: 'http://127.0.0.1:8000/api/v1', // URL directa a tu API
  timeout: 60000, // 1 minuto timeout para análisis de IA
  headers: {
    // No incluir Content-Type aquí para FormData
    // 'Authorization': 'Bearer your-token' // Agrega si necesitas auth
  }
}

// Tipos para las respuestas de la API
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

// Tipos específicos para tu API (usando ImageFileRecord de types/index.ts)

interface AnalysisRequest {
  imageId: string
  imageName: string
  imageSize: number
  imageType: string
}

interface AnalysisApiResponse {
  id: string
  imageId: string
  pcosProbability: number
  confidence: number
  findings: string[]
  recommendations: string[]
  analyzedAt: string
  status: 'completed' | 'processing' | 'error'
  error?: string
}

class ApiService {
  private baseURL: string
  private timeout: number
  private headers: Record<string, string>

  constructor() {
    this.baseURL = API_CONFIG.baseURL
    this.timeout = API_CONFIG.timeout
    this.headers = API_CONFIG.headers
  }

  // Método genérico para hacer peticiones HTTP
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    }

    try {
      // En desarrollo, simulamos solo los endpoints que no existen
      if (this.isDevelopmentMode() && !endpoint.includes('/image_files/upload')) {
        return this.simulateApiCall<T>(endpoint, options)
      }

      // Llamada real a la API
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        console.warn(`⚠️ Timeout después de ${this.timeout}ms para: ${url}`)
      }, this.timeout)

      try {
        console.log(`📡 Llamando API real: ${endpoint}`)
        console.log(`🔗 URL completa: ${url}`)
        console.log(`📋 Opciones de la petición:`, config)
        
        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        console.log(`📊 Respuesta HTTP:`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ Error HTTP ${response.status}:`, errorText)
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        console.log(`✅ Respuesta de API:`, data)
        console.log(`📝 Tipo de respuesta:`, typeof data)
        console.log(`🔍 Estructura de la respuesta:`, Object.keys(data))
        
        return data
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`Timeout: La API tardó más de ${this.timeout/1000} segundos en responder`)
        }
        throw error
      }

    } catch (error) {
      console.error('❌ Error en API:', error)
      throw new Error(error instanceof Error ? error.message : 'Error desconocido en la API')
    }
  }

  // Detectar si estamos en modo desarrollo (para endpoints no implementados)
  private isDevelopmentMode(): boolean {
    // Solo simular endpoints de análisis, usar API real para uploads
    return false
  }

  // Simulador de API para desarrollo (solo para análisis)
  private async simulateApiCall<T>(
    endpoint: string, 
    options: RequestInit
  ): Promise<T> {
    console.log(`🔄 Simulando llamada API: ${endpoint}`)
    
    // Simular tiempo de respuesta de la API
    const delay = 2000 + Math.random() * 3000 // 2-5 segundos
    await new Promise(resolve => setTimeout(resolve, delay))

    if (endpoint === '/analyze') {
      return this.simulateAnalysisResponse() as T
    }

    if (endpoint === '/analyze/batch') {
      return this.simulateBatchAnalysisResponse(options) as T
    }

    throw new Error(`Endpoint no simulado: ${endpoint}`)
  }

  // Simular respuesta de análisis individual
  private simulateAnalysisResponse(): ApiResponse<AnalysisApiResponse> {
    const scenarios = [
      {
        probability: 0.3,
        pcosProbability: () => 15 + Math.random() * 20, // 15-35%
        confidence: () => 80 + Math.random() * 15,
        findings: [
          'Estructura ovárica dentro de parámetros normales',
          'Folículos en número y distribución normal (<12)',
          'Volumen ovárico normal (2-10 ml)'
        ],
        recommendations: [
          'Continuar con controles ginecológicos rutinarios',
          'Mantener estilo de vida saludable',
          'Consultar si aparecen síntomas relacionados con PCOS'
        ]
      },
      {
        probability: 0.4,
        pcosProbability: () => 40 + Math.random() * 30, // 40-70%
        confidence: () => 75 + Math.random() * 15,
        findings: [
          'Folículos múltiples detectados (8-15)',
          'Distribución folicular levemente alterada',
          'Volumen ovárico en límite superior normal'
        ],
        recommendations: [
          'Repetir ecografía en fase folicular temprana',
          'Análisis hormonal para confirmar diagnóstico',
          'Evaluación de síntomas clínicos asociados'
        ]
      },
      {
        probability: 0.3,
        pcosProbability: () => 75 + Math.random() * 20, // 75-95%
        confidence: () => 85 + Math.random() * 10,
        findings: [
          'Múltiples folículos pequeños (≥12) detectados',
          'Distribución periférica característica de PCOS',
          'Volumen ovárico aumentado (>10 ml)',
          'Estroma ovárico hiperecogénico'
        ],
        recommendations: [
          'Confirmar diagnóstico con análisis hormonal completo',
          'Evaluación de resistencia a la insulina',
          'Consulta con endocrinólogo especialista',
          'Considerar tratamiento médico especializado'
        ]
      }
    ]

    const random = Math.random()
    let cumulativeProbability = 0
    let selectedScenario = scenarios[0]

    for (const scenario of scenarios) {
      cumulativeProbability += scenario.probability
      if (random <= cumulativeProbability) {
        selectedScenario = scenario
        break
      }
    }

    const result: AnalysisApiResponse = {
      id: crypto.randomUUID(),
      imageId: 'temp-id',
      pcosProbability: Math.round(selectedScenario.pcosProbability() * 10) / 10,
      confidence: Math.round(selectedScenario.confidence() * 10) / 10,
      findings: selectedScenario.findings,
      recommendations: selectedScenario.recommendations,
      analyzedAt: new Date().toISOString(),
      status: 'completed'
    }

    return {
      success: true,
      data: result,
      message: 'Análisis completado exitosamente'
    }
  }

  // Simular respuesta de análisis por lotes
  private simulateBatchAnalysisResponse(options: RequestInit): ApiResponse<AnalysisApiResponse[]> {
    const body = options.body ? JSON.parse(options.body as string) : {}
    const images = body.images || []
    
    const results: AnalysisApiResponse[] = images.map((imageData: any) => {
      const singleResult = this.simulateAnalysisResponse()
      return {
        ...singleResult.data,
        imageId: imageData.imageId
      }
    })

    return {
      success: true,
      data: results,
      message: `${results.length} análisis completados exitosamente`
    }
  }

  // API ENDPOINTS

  /**
   * Subir múltiples archivos usando tu endpoint real
   */
  async uploadFiles(files: File[]): Promise<ImageFileRecord[]> {
    console.log(`📤 Subiendo ${files.length} archivos a API real`)
    console.log(`📁 Archivos a subir:`, files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      lastModified: f.lastModified
    })))
    
    const formData = new FormData()
    
    // Agregar todos los archivos con la key "files"
    files.forEach(file => {
      formData.append('files', file)
      console.log(`➕ Agregando archivo al FormData: ${file.name}`)
    })

    // Mostrar contenido del FormData
    console.log(`📋 FormData creado con ${files.length} archivos`)
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  - ${key}: ${value.name} (${value.size} bytes, ${value.type})`)
      } else {
        console.log(`  - ${key}: ${value}`)
      }
    }

    try {
      const response = await this.request<ImageFileRecord[]>('/image_files/upload', {
        method: 'POST',
        body: formData,
        headers: {} // No establecer Content-Type para FormData
      })

      console.log(`✅ ${files.length} archivos subidos exitosamente:`, response)
      console.log(`📊 Tipo de respuesta:`, typeof response)
      console.log(`🔍 Estructura de la respuesta:`, Array.isArray(response) ? `Array con ${response.length} elementos` : 'No es un array')
      
      if (Array.isArray(response)) {
        response.forEach((record, index) => {
          console.log(`  📸 Registro ${index + 1}:`, {
            id: record.id,
            name: record.name,
            size: record.size,
            type: record.type,
            url: record.url,
            uploaded_at: record.uploaded_at,
            status: record.status,
            error: record.error,
            last_modified: record.last_modified,
            medical_analysis: record.medical_analysis,
            analysis: record.analysis
          })
        })
      }
      
      return response

    } catch (error) {
      console.error('❌ Error al subir archivos:', error)
      throw new Error(`Error al subir archivos: ${error}`)
    }
  }

  /**
   * Subir un solo archivo (wrapper para compatibilidad)
   */
  async uploadFile(file: File): Promise<ImageFileRecord> {
    const results = await this.uploadFiles([file])
    return results[0]
  }

  /**
   * Analizar una sola imagen
   */
  async analyzeImage(request: AnalysisRequest): Promise<AnalysisResult> {
    const response = await this.request<ApiResponse<AnalysisApiResponse>>('/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })

    if (!response.success) {
      throw new Error(response.error || 'Error en el análisis de imagen')
    }

    return {
      id: response.data.id,
      imageId: response.data.imageId,
      pcosProbability: response.data.pcosProbability,
      confidence: response.data.confidence,
      findings: response.data.findings,
      recommendations: response.data.recommendations,
      analyzedAt: new Date(response.data.analyzedAt),
      status: response.data.status,
      error: response.data.error
    }
  }

  /**
   * Analizar múltiples imágenes en lote
   */
  async analyzeImages(images: ImageFile[]): Promise<AnalysisResult[]> {
    console.log(`🔬 Iniciando análisis de ${images.length} imágenes`)
    console.log(`📸 Imágenes a analizar:`, images.map(img => ({
      id: img.id,
      name: img.name,
      size: img.size,
      type: img.type,
      status: img.status
    })))
    
    // Si las imágenes son blob URLs locales, primero las subimos
    const imagesToUpload: File[] = []
    const uploadedImages: ImageFile[] = []

    for (const image of images) {
      if (image.url.startsWith('blob:')) {
        // Convertir blob URL a File para subir
        console.log(`📤 Imagen ${image.name} es local, convirtiendo a File para subir`)
        const file = await this.urlToFile(image.url, image.name, image.type)
        imagesToUpload.push(file)
      } else {
        console.log(`✅ Imagen ${image.name} ya está subida, agregando a lista de análisis`)
        uploadedImages.push(image)
      }
    }

    // Subir archivos si hay algunos locales
    if (imagesToUpload.length > 0) {
      console.log(`📤 Subiendo ${imagesToUpload.length} archivos antes del análisis`)
      const uploadedRecords = await this.uploadFiles(imagesToUpload)
      
      // Convertir registros subidos a formato ImageFile
      uploadedRecords.forEach((record, index) => {
        console.log(`🔄 Convirtiendo registro subido ${index + 1}:`, record)
        uploadedImages.push({
          id: record.id.toString(),
          name: record.name || `imagen_${index}`,
          size: record.size || 0,
          type: record.type || 'application/octet-stream',
          lastModified: Date.now(),
          url: record.url || '', // o construir URL completa
          uploadedAt: record.uploaded_at ? new Date(record.uploaded_at) : new Date(),
          status: 'uploaded' as const
        })
      })
    }

    // Ahora analizar todas las imágenes
    const requests = uploadedImages.map(image => ({
      imageId: image.id,
      imageName: image.name,
      imageSize: image.size,
      imageType: image.type
    }))

    console.log(`📋 Solicitudes de análisis preparadas:`, requests)

    const response = await this.request<ApiResponse<AnalysisApiResponse[]>>('/analyze/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ images: requests })
    })

    console.log(`🔬 Respuesta del análisis por lotes:`, response)
    console.log(`📊 Tipo de respuesta:`, typeof response)
    console.log(`🔍 Estructura de la respuesta:`, Object.keys(response))

    if (!response.success) {
      console.error(`❌ Error en análisis por lotes:`, response.error)
      throw new Error(response.error || 'Error en el análisis por lotes')
    }

    console.log(`✅ Análisis exitoso, procesando ${response.data.length} resultados`)

    const results = response.data.map((apiResult, index) => {
      console.log(`📊 Procesando resultado ${index + 1}:`, {
        id: apiResult.id,
        imageId: apiResult.imageId,
        pcosProbability: apiResult.pcosProbability,
        confidence: apiResult.confidence,
        findings: apiResult.findings,
        recommendations: apiResult.recommendations,
        status: apiResult.status
      })
      
      return {
        id: apiResult.id,
        imageId: apiResult.imageId,
        pcosProbability: apiResult.pcosProbability,
        confidence: apiResult.confidence,
        findings: apiResult.findings,
        recommendations: apiResult.recommendations,
        analyzedAt: new Date(apiResult.analyzedAt),
        status: apiResult.status,
        error: apiResult.error
      }
    })

    console.log(`🎯 Análisis completado, retornando ${results.length} resultados`)
    return results
  }

  /**
   * Convertir blob URL a File
   */
  private async urlToFile(url: string, filename: string, mimeType: string): Promise<File> {
    const response = await fetch(url)
    const blob = await response.blob()
    return new File([blob], filename, { type: mimeType })
  }

  /**
   * Obtener resultado de análisis por ID
   */
  async getAnalysisResult(resultId: string): Promise<AnalysisResult> {
    const response = await this.request<ApiResponse<AnalysisApiResponse>>(`/analysis/${resultId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.success) {
      throw new Error(response.error || 'Error al obtener resultado')
    }

    return {
      id: response.data.id,
      imageId: response.data.imageId,
      pcosProbability: response.data.pcosProbability,
      confidence: response.data.confidence,
      findings: response.data.findings,
      recommendations: response.data.recommendations,
      analyzedAt: new Date(response.data.analyzedAt),
      status: response.data.status,
      error: response.data.error
    }
  }

  /**
   * Configurar URL base de la API
   */
  setBaseURL(url: string): void {
    this.baseURL = url
  }

  /**
   * Configurar headers de autenticación
   */
  setAuthToken(token: string): void {
    this.headers['Authorization'] = `Bearer ${token}`
  }
}

// Funciones adicionales para el manejo de reportes
async function getAnalysisResultByImageId(imageId: string): Promise<any> {
  try {
    console.log(`📡 Obteniendo análisis para imagen ID: ${imageId}`)
    const response = await fetch(`${API_CONFIG.baseURL}/analysis_results/${imageId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(API_CONFIG.timeout)
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`✅ Datos de análisis obtenidos:`, data)
    return data

  } catch (error) {
    console.error('❌ Error obteniendo resultado de análisis:', error)
    throw new Error(error instanceof Error ? error.message : 'Error desconocido al obtener análisis')
  }
}

async function downloadAnalysisReport(imageId: string): Promise<Blob> {
  try {
    console.log(`📄 Generando reporte para imagen ID: ${imageId}`)
    
    // Obtener los datos del análisis desde tu API
    const analysisData = await getAnalysisResultByImageId(imageId)
    
    // Crear reporte estructurado
    const reportData = {
      generatedAt: new Date().toISOString(),
      reportTitle: 'Reporte de Análisis PCOS',
      imageId: imageId,
      analysis: analysisData,
      summary: {
        probability: `${(analysisData.pcos_probability * 100).toFixed(1)}%`,
        confidence: `${(analysisData.confidence * 100).toFixed(1)}%`,
        classification: analysisData.pcos_probability > 0.5 ? 'Alto Riesgo PCOS' : 'Bajo Riesgo PCOS',
        recommendations: analysisData.recommendations || []
      },
      metadata: {
        generatedBy: 'Sistema de Diagnóstico PCOS por IA',
        version: '1.0.0'
      }
    }
    
    // Convertir a JSON para descarga
    const jsonBlob = new Blob(
      [JSON.stringify(reportData, null, 2)], 
      { type: 'application/json' }
    )
    
    console.log(`✅ Reporte generado para imagen ${imageId}`)
    return jsonBlob

  } catch (error) {
    console.error('❌ Error generando reporte:', error)
    throw new Error(error instanceof Error ? error.message : 'Error desconocido al generar reporte')
  }
}

// Instancia singleton del servicio API
export const apiService = new ApiService()

// Exportar funciones de reportes
export { getAnalysisResultByImageId, downloadAnalysisReport }

// Exportar tipos para uso en otros archivos
export type { AnalysisRequest, AnalysisApiResponse, ApiResponse, ImageFileRecord }