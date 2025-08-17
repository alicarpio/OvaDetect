export interface ImageFile {
  id: string
  name: string
  size: number
  type: string
  lastModified: number
  url: string
  thumbnail?: string
  width?: number
  height?: number
  uploadedAt: Date
  status: 'uploading' | 'uploaded' | 'error' | 'processing'
  error?: string
}

export interface AnalysisResult {
  id: string
  imageId: string
  pcosProbability: number
  confidence: number
  findings: string[]
  recommendations: string[]
  analyzedAt: Date
  status: 'pending' | 'processing' | 'completed' | 'error'
  error?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'doctor' | 'technician' | 'admin'
  avatar?: string
}

export interface UploadOptions {
  maxSize: number // 10MB en bytes
  allowedTypes: string[]
  maxFiles: number
}
