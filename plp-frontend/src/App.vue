<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const currentRoute = ref('')

    router.afterEach((to) => {
      currentRoute.value = to.path
    })

    return {
      currentRoute
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', Arial, sans-serif;
  height: 100vh;
  overflow: hidden;
}
</style>