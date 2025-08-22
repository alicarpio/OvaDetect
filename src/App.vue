<script setup lang="ts">
import { ref } from 'vue'

const drawer = ref(false)
</script>

<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="primary" prominent>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      
      <v-app-bar-title class="text-h5 font-weight-bold">
        Diagnóstico SOP por IA
      </v-app-bar-title>

      <v-spacer></v-spacer>


    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item
          to="/upload"
          prepend-icon="mdi-cloud-upload"
          title="Cargar Imágenes"
          :active="$route.path === '/upload'"
        />
      </v-list>

      <v-divider class="my-4" />

      <v-list>
        <v-list-subheader>Información</v-list-subheader>
        <v-list-item
          to="/about"
          prepend-icon="mdi-information"
          title="Acerca de"
          :active="$route.path === '/about'"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style scoped>
/* Los estilos están manejados por Vuetify */
</style>
