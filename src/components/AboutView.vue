<template>
  <v-container fluid class="pa-6">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-h3 font-weight-bold text-primary mb-4">
            OvaDetect
          </h1>
          <p class="text-h6 text-medium-emphasis">
            Sistema de Diagnóstico PCOS por Inteligencia Artificial
          </p>
          <v-chip color="primary" variant="outlined" class="mt-2">
            Versión 1.0
          </v-chip>
        </div>

        <!-- Descripción Principal -->
        <v-card class="mb-6" elevation="2">
          <v-card-text class="pa-8">
            <h2 class="text-h5 font-weight-bold mb-4 text-primary">
              ¿Qué es OvaDetect?
            </h2>
            <p class="text-body-1 mb-4">
              OvaDetect es una herramienta innovadora de apoyo diagnóstico que utiliza 
              inteligencia artificial para analizar imágenes de ultrasonido ovárico y 
              detectar patrones asociados con el Síndrome de Ovario Poliquístico (PCOS).
            </p>
            <p class="text-body-1">
              Nuestro sistema está diseñado para asistir a profesionales médicos en el 
              proceso de diagnóstico, proporcionando análisis rápidos y precisos de 
              estudios de ultrasonido.
            </p>
          </v-card-text>
        </v-card>

        <!-- Características -->
        <v-card class="mb-6" elevation="2">
          <v-card-text class="pa-8">
            <h2 class="text-h5 font-weight-bold mb-4 text-primary">
              Características Principales
            </h2>
            <v-row>
              <v-col cols="12" md="6">
                <v-list>
                  <v-list-item prepend-icon="mdi-brain" class="pa-0 mb-3">
                    <v-list-item-title class="font-weight-medium">
                      Análisis por IA Avanzada
                    </v-list-item-title>
                    <v-list-item-subtitle>
                    
                    </v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item prepend-icon="mdi-clock-fast" class="pa-0 mb-3">
                    <v-list-item-title class="font-weight-medium">
                      Resultados Rápidos
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      Análisis completo en segundos
                    </v-list-item-subtitle>
                  </v-list-item>
                  
                
                </v-list>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-list>
                  <v-list-item prepend-icon="mdi-file-multiple" class="pa-0 mb-3">
                    <v-list-item-title class="font-weight-medium">
                      Formatos
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      Soporte para JPG
                    </v-list-item-subtitle>
                  </v-list-item>
                
                  
                  <v-list-item prepend-icon="mdi-responsive" class="pa-0">
                    <v-list-item-title class="font-weight-medium">
                      Interfaz Intuitiva
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      Diseño amigable para profesionales médicos
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Equipo -->
        <v-card class="mb-6" elevation="2">
          <v-card-text class="pa-8">
            <h2 class="text-h5 font-weight-bold mb-4 text-primary">
              Equipo de Desarrollo
            </h2>
            <v-row>
              <v-col cols="12" md="">
                <v-card variant="outlined" class="h-100">
                  <v-card-text class="text-center pa-6">
                    <v-avatar size="80" color="primary" class="mb-4">
                      <v-icon size="40" color="white">mdi-account</v-icon>
                    </v-avatar>
                    <h3 class="text-h6 font-weight-bold mb-2">
                      Desarrolladores
                    </h3>
                    <p class="text-body-2 text-medium-emphasis">
                      Estudiantes de Ingeniería en Sistemas<br>
                      Escuela Superior Politécnica del Litoral (ESPOL)
                    </p>
                  </v-card-text>
                </v-card>
              </v-col>
              
             
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Institución -->
        <v-card class="mb-6" elevation="2">
          <v-card-text class="pa-8">
            <div class="d-flex align-center mb-4">
              <v-icon size="40" color="primary" class="me-4">mdi-school</v-icon>
              <div>
                <h2 class="text-h5 font-weight-bold text-primary">
                  ESPOL
                </h2>
                <p class="text-body-1 text-medium-emphasis">
                  Escuela Superior Politécnica del Litoral
                </p>
              </div>
            </div>
            <p class="text-body-1">
              Este proyecto fue desarrollado como parte del programa académico de 
              Ingeniería en Sistemas de la ESPOL, con el objetivo de aplicar 
              tecnologías de inteligencia artificial en el campo de la medicina.
            </p>
          </v-card-text>
        </v-card>

        <!-- Disclaimer -->
        <v-alert
          type="warning"
          variant="tonal"
          class="mb-6"
        >
          <template v-slot:prepend>
            <v-icon>mdi-alert-circle</v-icon>
          </template>
          <h3 class="text-h6 font-weight-bold mb-2">
            Importante - Uso Responsable
          </h3>
          <p class="text-body-2 mb-2">
            OvaDetect es una herramienta de <strong>apoyo diagnóstico</strong> y no reemplaza 
            el criterio médico profesional. Todos los resultados deben ser interpretados 
            y validados por un profesional de la salud cualificado.
          </p>
          <p class="text-body-2">
            Este sistema está en desarrollo y destinado únicamente para fines 
            educativos y de investigación.
          </p>
        </v-alert>

        <!-- Tecnologías -->
        <v-card elevation="2">
          <v-card-text class="pa-8">
            <h2 class="text-h5 font-weight-bold mb-4 text-primary">
              Tecnologías Utilizadas
            </h2>
            <v-row>
              <v-col cols="6" md="3" class="text-center">
                <v-icon size="48" color="success" class="mb-2">mdi-vuejs</v-icon>
                <p class="text-body-2 font-weight-medium">Vue.js 3</p>
              </v-col>
              <v-col cols="6" md="3" class="text-center">
                <v-icon size="48" color="blue" class="mb-2">mdi-language-typescript</v-icon>
                <p class="text-body-2 font-weight-medium">TypeScript</p>
              </v-col>
              <v-col cols="6" md="3" class="text-center">
                <v-icon size="48" color="indigo" class="mb-2">mdi-material-design</v-icon>
                <p class="text-body-2 font-weight-medium">Vuetify</p>
              </v-col>
              <v-col cols="6" md="3" class="text-center">
                <v-icon size="48" color="orange" class="mb-2">mdi-brain</v-icon>
                <p class="text-body-2 font-weight-medium">IA/ML</p>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Botón para regresar -->
        <div class="text-center mt-8">
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-arrow-left"
            @click="$router.push('/upload')"
          >
            Volver a la Aplicación
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// Componente About
</script>

<style scoped>
/* Los estilos están manejados por Vuetify */
</style>
