import type { AnalysisResult, ImageFile } from '@/types'

// Configuración de la API
const API_CONFIG = {
  baseURL: 'http://localhost:3000/api', // Cambia esto por tu URL real cuando tengas la API
  timeout: 30000, // 30 segundos timeout
  headers: {
    'Content-Type': 'application/json',
    // Agrega aquí headers de autenticación cuando los necesites
    // 'Authorization': 'Bearer your-token'
  }
}

// Tipos para las respuestas de la API
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

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
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    }

    try {
      // En desarrollo, simulamos la llamada a la API
      if (this.isDevelopmentMode()) {
        return this.simulateApiCall<T>(endpoint, options)
      }

      // Llamada real a la API (cuando esté disponible)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data

    } catch (error) {
      console.error('API request failed:', error)
      throw new Error(error instanceof Error ? error.message : 'Error desconocido en la API')
    }
  }

  // Detectar si estamos en modo desarrollo
  private isDevelopmentMode(): boolean {
    return import.meta.env.DEV || !this.baseURL.includes('http')
  }

  // Simulador de API para desarrollo
  private async simulateApiCall<T>(
    endpoint: string, 
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    console.log(` Simulando llamada API: ${endpoint}`)
    
    // Simular tiempo de respuesta de la API
    const delay = 2000 + Math.random() * 3000 // 2-5 segundos
    await new Promise(resolve => setTimeout(resolve, delay))

    if (endpoint === '/analyze') {
      return this.simulateAnalysisResponse() as ApiResponse<T>
    }

    if (endpoint === '/analyze/batch') {
      return this.simulateBatchAnalysisResponse(options) as ApiResponse<T>
    }

    throw new Error(`Endpoint no simulado: ${endpoint}`)
  }

  // Simular respuesta de análisis individual
  private simulateAnalysisResponse(): ApiResponse<AnalysisApiResponse> {
    // Simular diferentes escenarios basados en probabilidades
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

    // Seleccionar escenario basado en probabilidades
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
      imageId: 'temp-id', // Se reemplazará por el ID real
      pcosProbability: Math.round(selectedScenario.pcosProbability() * 10) / 10,
      confidence: Math.round(selectedScenario.confidence() * 10) / 10,
      findings: selectedScenario.findings,
      recommendations: selectedScenario.recommendations,
      analyzedAt: new Date().toISOString(),
      status: 'completed'
    }

    console.log(' Resultado simulado:', result)

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
   * Analizar una sola imagen
   */
  async analyzeImage(request: AnalysisRequest): Promise<AnalysisResult> {
    const response = await this.request<AnalysisApiResponse>('/analyze', {
      method: 'POST',
      body: JSON.stringify(request)
    })

    if (!response.success) {
      throw new Error(response.error || 'Error en el análisis de imagen')
    }

    // Convertir respuesta de API a formato interno
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
    const requests = images.map(image => ({
      imageId: image.id,
      imageName: image.name,
      imageSize: image.size,
      imageType: image.type
    }))

    const response = await this.request<AnalysisApiResponse[]>('/analyze/batch', {
      method: 'POST',
      body: JSON.stringify({ images: requests })
    })

    if (!response.success) {
      throw new Error(response.error || 'Error en el análisis por lotes')
    }

    // Convertir respuestas de API a formato interno
    return response.data.map(apiResult => ({
      id: apiResult.id,
      imageId: apiResult.imageId,
      pcosProbability: apiResult.pcosProbability,
      confidence: apiResult.confidence,
      findings: apiResult.findings,
      recommendations: apiResult.recommendations,
      analyzedAt: new Date(apiResult.analyzedAt),
      status: apiResult.status,
      error: apiResult.error
    }))
  }

  /**
   * Subir imagen (si tu API requiere subir archivos por separado)
   */
  async uploadImage(file: File): Promise<{ imageId: string; url: string }> {
    const formData = new FormData()
    formData.append('image', file)

    // Para desarrollo, simulamos la subida
    if (this.isDevelopmentMode()) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return {
        imageId: crypto.randomUUID(),
        url: URL.createObjectURL(file)
      }
    }

    const response = await this.request<{ imageId: string; url: string }>('/upload', {
      method: 'POST',
      body: formData,
      headers: {} // No establecer Content-Type para FormData
    })

    if (!response.success) {
      throw new Error(response.error || 'Error al subir imagen')
    }

    return response.data
  }

  /**
   * Obtener resultado de análisis por ID
   */
  async getAnalysisResult(resultId: string): Promise<AnalysisResult> {
    const response = await this.request<AnalysisApiResponse>(`/analysis/${resultId}`)

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
   * Configurar URL base de la API (útil para cambiar entre desarrollo y producción)
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

// Instancia singleton del servicio API
export const apiService = new ApiService()

// Exportar tipos para uso en otros archivos
export type { AnalysisRequest, AnalysisApiResponse, ApiResponse }
