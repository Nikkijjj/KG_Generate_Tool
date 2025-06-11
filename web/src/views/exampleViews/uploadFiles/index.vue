<template>
  <div class="container">
    <el-card class="main-card">
      <h1 class="title">知识图谱生成工具</h1>
      <p class="subtitle">请选择您需要知识图谱解析的数据</p>
      
      <el-card class="upload-card">
        <el-upload
          class="upload-demo"
          drag
          :action="uploadAction"
          :before-upload="beforeUpload"
          :on-exceed="handleExceed"
          :limit="1"
          accept=".xlsx,.csv,.txt"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持xlsx、csv、txt格式文件
            </div>
          </template>
        </el-upload>
      </el-card>

      <div class="button-group">
        <el-button 
          type="primary" 
          size="large" 
          class="parse-button"
          @click="handleParseClick"
        >
          开始解析
        </el-button>
        <el-button 
          type="primary" 
          size="large" 
          class="result-button"
          @click="handleViewResult"
        >
          查看解析结果
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

// 上传配置
const uploadAction = 'https://jsonplaceholder.typicode.com/posts/' // 替换为实际上传地址

// 文件上传前的验证
const beforeUpload = (file: File) => {
  const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'text/plain']
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  const isAllowedType = allowedTypes.includes(file.type) ||  ['xlsx', 'csv', 'txt'].includes(fileExtension || '')
  
  if (!isAllowedType) {
    ElMessage.error('只能上传xlsx、csv或txt格式的文件!')
    return false
  }
  
  return true
}

// 文件超出数量限制时的处理
const handleExceed = () => {
  ElMessage.warning('每次只能上传一个文件')
}

// 点击开始解析按钮的处理
const handleParseClick = () => {
  ElMessage.success('开始解析文件，请稍候...')
  // 这里可以添加实际的解析逻辑
}

// 点击查看结果按钮的处理
const handleViewResult = () => {

  router.push({
    name: 'visual-kg-page', // 使用路由名称跳转
  })
}
</script>

<style scoped lang="scss">
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
  box-sizing: border-box;
}

.main-card {
  width: 100%;
  max-width: 1000px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  .title {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 16px;
    color: #333;
  }
  
  .subtitle {
    font-size: 16px;
    color: #666;
    margin-bottom: 40px;
  }
}

.upload-card {
  margin: 0 auto;
  width: 100%;
  border: 5px;
  box-shadow: none;
  margin-bottom: 30px;
  
  :deep(.el-upload) {
    width: 100%;
  }
  
  :deep(.el-upload-dragger) {
    width: 100%;
    height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px;
  }
  
  .el-icon--upload {
    font-size: 60px;
    color: var(--el-color-primary);
    margin-bottom: 20px;
  }
  
  .el-upload__text {
    font-size: 18px;
    margin-bottom: 20px;
  }
  
  .el-upload__tip {
    font-size: 14px;
    color: #999;
  }
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.parse-button,
.result-button {
  width: 200px;
  height: 50px;
  font-size: 18px;
}
</style>