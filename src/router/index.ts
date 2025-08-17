import { createRouter, createWebHistory } from 'vue-router'
import UploadImages from '@components/UploadImages.vue'
import Results from '@components/Results.vue'
import AboutView from '@components/AboutView.vue'

const routes = [
  { 
    path: '/', 
    redirect: '/upload' 
  },
  { 
    path: '/upload', 
    name: 'UploadImages', 
    component: UploadImages,
    meta: { title: 'Cargar Imágenes' }
  },
  { 
    path: '/results', 
    name: 'Results', 
    component: Results,
    meta: { title: 'Resultados' }
  },
  { 
    path: '/about', 
    name: 'About', 
    component: AboutView,
    meta: { title: 'Acerca de' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
