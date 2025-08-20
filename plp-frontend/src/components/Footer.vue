<template>
  <footer class="footer">
    <div class="footer-content">
      <p class="report-email">举报邮箱：usury43@qq.com</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterComponent'
}
</script>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 10px 20px;
  height: 50px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.report-email {
  color: #ffffff;
  font-size: 14px;
  margin: 0;
  text-align: center;
}
</style>