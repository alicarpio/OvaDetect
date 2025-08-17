<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const drawer = ref(false)
</script>

<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="primary" prominent>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      
      <v-app-bar-title class="text-h5 font-weight-bold">
        Diagnóstico PCOS por IA
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- User Menu -->
      <v-menu v-if="userStore.isAuthenticated">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon
          >
            <v-avatar size="32">
              <v-img :src="userStore.userAvatar" />
            </v-avatar>
          </v-btn>
        </template>

        <v-list>
          <v-list-item>
            <v-list-item-title>{{ userStore.userName }}</v-list-item-title>
            <v-list-item-subtitle>{{ userStore.userEmail }}</v-list-item-subtitle>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="userStore.logout">
            <template v-slot:prepend>
              <v-icon>mdi-logout</v-icon>
            </template>
            <v-list-item-title>Cerrar Sesión</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn
        v-else
        color="white"
        variant="outlined"
        @click="userStore.loginDemo"
        :loading="userStore.loading"
      >
        <v-icon start>mdi-login</v-icon>
        Login Demo
      </v-btn>
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
