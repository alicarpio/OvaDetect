import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import pinia from './stores'
import vuetify from './plugins/vuetify'
import './style.css'

const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(vuetify)

app.mount('#app')

