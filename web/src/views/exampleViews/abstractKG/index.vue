<template>
  <div class="page-container" :key="layoutKey">
    <!-- 上半部分：表格卡片 -->
<div class="top-section">
      <div class="card table-card">
        <div class="main-container">
          <div class="header-container">
            <span class="header-title">
              请选择您需要知识图谱解析的数据
            </span>
            <div class="buttons-container">
              <el-button type="primary" @click="handleCreate">从操作库导入</el-button>
              <el-button type="warning" @click="handleDownload">下载</el-button>
            </div>
          </div>
          
           <div class="table-wrapper">
            <el-table
              ref="multipleTable"
              border
              :data="tableData"
              @selection-change="handleSelectionChange"
              row-key="id"
              height="42vh"
              class="custom-table"
              :header-cell-style="headerCellStyle"
            >
              <el-table-column
                prop="id"
                align="center"
                label="公告编号"
                width="120"
                fixed="left"
              />
              <el-table-column
                label="标题"
                show-overflow-tooltip
                align="center"
                prop="title"
                width="200"
              />
              <el-table-column
                label="内容"
                show-overflow-tooltip
                align="center"
                prop="content"
                width="600"
              />
              <el-table-column
                label="发布时间"
                show-overflow-tooltip
                align="center"
                prop="date"
                width="120"
              />
              <el-table-column
                label="股票代码"
                show-overflow-tooltip
                align="center"
                prop="stock_num"
                width="200"
              />
              <el-table-column
                label="操作"
                width="130"
                fixed="right"
                class-name="small-padding fixed-width"
                align="center"
              >
                <template #default="scope">
                  <el-button
                    link
                    type="primary"
                    size="large"
                    @click="handleDetails(scope.row)"
                  >
                    查看
                  </el-button>
                  <el-button
                    link
                    size="large"
                    type="danger"
                    @click="handleDelete([scope.row])"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <el-pagination
            class="pagination-container"
            v-model:current-page="mainCurrentPage"
            v-model:page-size="mainPageSize"
            :page-sizes="[12, 24, 36, 48]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="tableData.length"
          />
          
          <!-- 从操作库导入的对话框 -->
          <el-dialog
            v-model="dialogVisible"
            title="从操作库选择数据"
            width="70%"
            :style="{ 
              marginTop: '10vh' 
            }"
            :modal="false" 
            append-to-body
            top="5vh"
            :close-on-click-modal="false"
            class="main-dialog"
          >

            <div class="dialog-header">
              <div class="search-group" style="padding: 10px 20px;">
                      <el-input
                        v-model="searchKeyword"
                        style="width: 240px; "
                        placeholder="输入股票代码搜索"
                        :prefix-icon="Search"
                        clearable
                        @keyup.enter="handleSearch" 
                      />
                      <el-button 
                        type="primary" 
                        @click="handleSearch"
                        style="margin-left: 10px"
                        :loading="loadingSearch"
                      >
                        搜索
                      </el-button>
                </div>
            </div>
          
            <el-table
              ref="dialogTable"
              border
              :data="dialogTableData"
              @selection-change="handleDialogSelectionChange"
              row-key="id"
              height="60vh"
              style="width: 100%; border-radius: 10px; font-size: 15px"
              :header-cell-style="headerCellStyle"
            >
              <el-table-column 
                type="selection" 
                align="center" 
                width="55" 
                :selectable="checkSelectable"
              />
              <el-table-column
                prop="id"
                align="center"
                label="公告编号"
                show-overflow-tooltip
                width="120"
                fixed="left"
              />
              <el-table-column
                label="标题"
                show-overflow-tooltip
                align="center"
                prop="title"
                width="200"
              />
              <el-table-column
                label="内容"
                show-overflow-tooltip
                align="center"
                prop="content"
                width="600"
              />
              <el-table-column
                label="发布时间"
                show-overflow-tooltip
                align="center"
                prop="date"
                width="120"
              />
              <el-table-column
                label="股票代码"
                show-overflow-tooltip
                align="center"
                prop="stock_num"
                width="200"
              />
            </el-table>
            
            <div class="dialog-pagination">
              <el-pagination
                v-model:current-page="dialogCurrentPage"
                v-model:page-size="dialogPageSize"
                :page-sizes="[12, 24, 36, 48]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalSamples"
                @size-change="handleDialogSizeChange"
                @current-change="handleDialogCurrentChange"
              />
            </div>

            <template #footer>
              <div class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button 
                  type="primary" 
                  @click="confirmImport"
                  :disabled="selectedDialogRows.length === 0"
                >
                  导入选中数据 ({{ selectedDialogRows.length }})
                </el-button>
              </div>
            </template>
          </el-dialog>

          <!-- 添加查看详情对话框 -->
          <el-dialog 
            v-model="detailDialogVisible" 
            title="公告详情" 
            width="60%"
          >
            <el-descriptions :column="2" border>
              <el-descriptions-item label="公告编号" width="150">{{ detailData.id }}</el-descriptions-item>
              <el-descriptions-item label="公告标题">{{ detailData.title }}</el-descriptions-item>
              <el-descriptions-item label="发布时间">{{ detailData.date }}</el-descriptions-item>
              <el-descriptions-item label="股票代码">{{ detailData.stock_num }}</el-descriptions-item>
              <el-descriptions-item label="公告内容" :span="2">
                <div class="content-box">
                  {{ detailData.content }}
                </div>
              </el-descriptions-item>
            </el-descriptions>
          </el-dialog>
        </div>
      </div>
    </div>

    <!-- 下半部分：抽取控制面板 -->
    <div class="bottom-section">
      <div class="card">
        <div class="card-header">
          <h2>抽取控制面板</h2>
        </div>
        <div class="card-content control-panel">
          <div class="panel-left">
            <div class="control-group">
              <div class="control-header">
                <el-icon><MagicStick /></el-icon>
                <h3>抽取方法</h3>
              </div>
              <el-select 
                v-model="extractionMethod" 
                placeholder="请选择抽取方法"
                class="enhanced-select"
              >
                <el-option
                  v-for="item in extractionMethods"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
                
            <div class="control-group">
              <div class="control-header">
                <el-icon><Cpu /></el-icon>
                <h3>模型基座</h3>
              </div>
              <el-select 
                v-model="modelBase" 
                placeholder="请选择模型基座"
                class="enhanced-select"
              >
                <el-option
                  v-for="item in modelBases"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
          </div>
            
          <div class="panel-right">
            <el-button 
              type="primary" 
              @click="startExtraction"
              class="action-button"
            >
              <el-icon><VideoPlay /></el-icon>
              <span>开始抽取</span>
            </el-button>
            <el-button 
              @click="viewResults"
              class="action-button"
            >
              <el-icon><View /></el-icon>
              <span>查看抽取结果</span>
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <!-- 抽取进度条 -->
    <el-dialog
      v-model="progressDialogVisible"
      title="抽取进度"
      width="400px"
      :before-close="handleClose"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      align-center
    >
      <div class="progress-dialog-content">
        <el-progress 
          :percentage="progressPercentage" 
          :status="progressStatus"
          :stroke-width="16"
          :text-inside="true"
          class="custom-progress"
        />
        <div class="progress-details">
          <div class="progress-message">
            <el-icon v-if="progressStatus === 'success'" class="success-icon"><CircleCheckFilled /></el-icon>
            <span v-if="progressPercentage < 100">正在抽取数据，请稍候...</span>
            <span v-else>数据抽取完成！</span>
          </div>
          <div class="progress-percentage">{{ progressPercentage }}%</div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button 
            @click="cancelExtraction" 
            :disabled="progressPercentage === 100"
            class="cancel-btn"
          >
            {{ progressPercentage === 100 ? '已完成' : '取消抽取' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, nextTick , watch, toRefs } from 'vue';
import { ElMessageBox, ElMessage, ElLoading } from 'element-plus';
import * as XLSX from 'xlsx';
import { useRouter } from 'vue-router';
import { MagicStick, Cpu, VideoPlay, View, CircleCheckFilled } from '@element-plus/icons-vue';
import { throttleFn_1 as throttleFn } from '@/common/debounceAndThrottle';
import userApi from '@/http/user.js';
import axios from 'axios';
import { useRoute } from 'vue-router'

// 表格相关数据
const loadingExtractSample = ref(false);
const loadingOperationData = ref(false);
const savingSelectedData = ref(false);
const totalSamples = ref(0);
const currentPage = ref(1);
const pageSize = ref(12);
const currUserName = ref("");
const selectedRows = ref([]);
const tableData = ref([]);
const dialogTableData = ref([]);
const router = useRouter();

const searchKeyword = ref('');
const loadingSearch = ref(false);

const route = useRoute()
const layoutKey = ref(0)

// 对话框相关数据
const dialogVisible = ref(false);
const selectedDialogRows = ref([]);
const mainCurrentPage = ref(1);
const mainPageSize = ref(12);
const dialogCurrentPage = ref(1);
const dialogPageSize = ref(12);
const detailDialogVisible = ref(false);
const detailData = ref({
  index: 0,
  id: '',
  title: '',
  content: '',
  date: '',
  stock_num: ''
});

// 抽取控制面板相关
const extractionMethod = ref('')
const extractionMethods = ref([
  { value: 'method1', label: '时序关系抽取' },
  { value: 'method2', label: '因果关系抽取' },
  { value: 'method3', label: '子图抽取' },
  { value: 'method4', label: '共指关系抽取' },
])

const modelBase = ref('')
const modelBases = ref([
  { value: 'base1', label: 'LLM' },
  { value: 'base2', label: '抽取模型1' },
  { value: 'base3', label: '抽取模型2' },
])

// 进度条相关
const progressDialogVisible = ref(false)
const progressPercentage = ref(0)
const progressStatus = ref('')
let progressInterval: number | null = null

// 使用 `defineProps` 接收 `props`
const props = defineProps<{
    eventType: string;
    projectId: string;
}>();
const { eventType, projectId } = toRefs(props);


// 方法
const getUserInfo = async () => {
  try {
    const res = await userApi.getUserInfo();
    currUserName.value = res.data.userName;
  } catch (error) {
    const errMsg = error?.response?.data?.msg || error.message || '获取用户信息失败';
    ElMessage.error(errMsg);
    console.error('Error getting userInfo:', error);
  }
};

const handleDialogSizeChange = (size) => {
  dialogPageSize.value = size;
  dialogCurrentPage.value = 1;
  fetchOperationData();
};

const handleDialogCurrentChange = (page) => {
  dialogCurrentPage.value = page;
  fetchOperationData();
};

const fetchExtractSample = throttleFn(async () => {
  if (loadingExtractSample.value) return;
  loadingExtractSample.value = true;
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      project_id: projectId.value
    };
    const res = await userApi.loadExtractText(params);
    
    tableData.value = (res.data || []).map((item, index) => ({
      index: index + 1,
      id: item.id || '',
      title: item.title || '',
      content: item.content || '',
      publishTime: item.publishTime || '',
      stock_num: item.stock_num || '',
    }));
    
    console.log("格式化后的表格数据:", tableData.value);
    totalSamples.value = res.count || 0;
    
  } catch (error) {
    // 错误处理保持不变...
  } finally {
    loadingExtractSample.value = false;
  }
}, 500);

const fetchOperationData = throttleFn(async () => {
  if (loadingOperationData.value) return;
  loadingOperationData.value = true;
  try {
    const params = {
      page: dialogCurrentPage.value,  // 确保使用当前对话框的页码
      page_size: dialogPageSize.value // 确保使用当前对话框的页大小
    };
    console.log('Fetching operation data with params:', params); // 调试日志
    
   const res = await axios({
      method: 'post',
      url: 'http://127.0.0.1:5000/textPreprocess_api',
      data: {
        page: dialogCurrentPage.value,
        page_size: dialogPageSize.value
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log("原始对话框数据:", res.data);
    
    dialogTableData.value = res.data.data?.data || res.data.data || [];
    totalSamples.value = res.data.data?.total || res.data.total || 0;

    console.log("格式化后的对话框数据:", dialogTableData.value);
  } catch (error) {
    const errMsg = error?.res?.data?.msg || error.message || '获取项目列表失败';
    ElMessage.error(errMsg);
    console.error('Error fetching projects:', error);
  } finally {
    loadingOperationData.value = false;
  }
}, 500);

const handleDetails = (row: any) => {
  detailData.value = {
    index: row.index,
    title: row.title,
    content: row.content,
    publishTime: row.publishTime,
    summary: row.summary
  };
  detailDialogVisible.value = true;
};

const handleDelete = (rows) => {
  ElMessageBox.confirm(
    `是否确定要删除选中的${rows.length}条数据？`, 
    '删除确认', 
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    const loading = ElLoading.service({
      lock: true,
      text: '正在删除中...',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    try {
      const params = {
        project_id: projectId.value,
        titles: rows.map(row => row.title)
      };

      await userApi.deleteSample(params);

      const rowSet = new Set(rows);
      tableData.value = tableData.value.filter(row => !rowSet.has(row));
      selectedRows.value = [];
      
      ElMessage.success({
        message: `成功删除 ${rows.length} 条数据`,
        duration: 3000
      });
    } catch (error) {
      console.error('删除操作失败:', error);
      ElMessage.error({
        message: `删除失败: ${error.response?.data?.msg || error.message || '未知错误'}`,
        duration: 5000
      });
    } finally {
      loading.close();
    }
  }).catch(() => {
    ElMessage.info({
      message: '已取消删除',
      duration: 2000
    });
  });
};

const handleDownload = () => {
  ElMessageBox.confirm('是否确定要下载当前表格内容为Excel文件？', '下载确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    const data = tableData.value;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'tableData.xlsx');
    ElMessage.success('下载成功');
  }).catch(() => {
    ElMessage.info('下载已取消');
  });
};

const handleCreate = () => {
  fetchOperationData();
  dialogVisible.value = true;
};

const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows;
};

const handleDialogSelectionChange = (rows: any[]) => {
  selectedDialogRows.value = rows;
};

const checkSelectable = (row: any) => {
  return true;
};

const confirmImport = async () => {
  if (selectedDialogRows.value.length === 0) {
    ElMessage.warning('请至少选择一条数据导入');
    return;
  }
  
  const newIndex = tableData.value.length > 0 ? 
    Math.max(...tableData.value.map(item => item.index)) + 1 : 1;
  
  const importedData = selectedDialogRows.value.map((row, i) => ({
    ...row,
    index: newIndex + i,
    title: row.title,
    content: row.content,
    publishTime: row.publishTime,
    summary: row.summary,
    insert_time: new Date().toISOString()
  }));
  
  try {
    await saveSelectedData(importedData);
    tableData.value = [...tableData.value, ...importedData];
    dialogVisible.value = false;
    ElMessage.success(`成功导入${selectedDialogRows.value.length}条数据`);
    selectedDialogRows.value = [];
    
  } catch (error) {
    console.error('导入失败:', error);
    ElMessage.error('数据导入失败，请重试');
  }
};

const saveSelectedData = throttleFn(async (dataToSave) => {
  if (savingSelectedData.value) return;
  savingSelectedData.value = true;
  
  try {
    const currentTime = new Date().toISOString();

    const params = {
      project_id: projectId.value,
      event_type: eventType.value,
      operator: currUserName.value,
      data: dataToSave.map(item => ({
        title: item.title,
        content: item.content,
        publish_time: item.publishTime,
        summary: item.summary,
        insert_time: item.insert_time
      }))
    };
    
    const res = await userApi.saveSelectedData(params); 
    console.log("保存参数:", params);
    console.log("res", res)
    
    return res;
    
  } catch (error) {
    const errMsg = error?.res?.data?.msg || error.message || '该数据已导入';
    ElMessage.warning(errMsg);
    console.error('Error save selected data:', error);
  } finally {
    savingSelectedData.value = false;
  }
}, 500);

defineExpose({
  saveSelectedData
});

const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    fetchOperationData(); // 重新获取全部数据
    return;
  }
  
  const keyword = searchKeyword.value.trim();
  loadingSearch.value = true;
  
  axios.post('http://127.0.0.1:5000/textPreprocess_api/search', {
    keyword: keyword,
    page: dialogCurrentPage.value,
    page_size: dialogPageSize.value
  }).then(response => {
    dialogTableData.value = response.data.data || [];
    totalSamples.value = response.data.total || 0;
  }).catch(error => {
    ElMessage.error('搜索失败: ' + error.message);
  }).finally(() => {
    loadingSearch.value = false;
  });
};

const headerCellStyle = () => ({
  fontWeight: 'bold',
  fontSize: '15px',
  textAlign: 'center',
  lineHeight: '15px',
});

// 分页处理函数
const handleMainSizeChange = (size) => {
  mainPageSize.value = size;
  mainCurrentPage.value = 1;
  fetchExtractSample();
};

const handleMainCurrentChange = (page) => {
  mainCurrentPage.value = page;
  fetchExtractSample();
};


// 抽取控制面板方法
const startExtraction = () => {
  if (!extractionMethod.value || !modelBase.value) {
    ElMessage.warning('请先选择抽取方法和模型基座')
    return
  }
  
  progressDialogVisible.value = true
  progressPercentage.value = 0
  progressStatus.value = ''
  
  // 模拟进度更新
  progressInterval = setInterval(() => {
    if (progressPercentage.value < 100) {
      progressPercentage.value += 10
    } else {
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }
      progressStatus.value = 'success'
    }
  }, 500)
}

const cancelExtraction = () => {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
  progressDialogVisible.value = false
}

const handleClose = (done: () => void) => {
  if (progressPercentage.value < 100) {
    ElMessageBox.confirm('确定要取消抽取吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      cancelExtraction()
      done()
    }).catch(() => {
      // 取消关闭
    })
  } else {
    done()
  }
}

const viewResults = () => {
    router.push({
    name: 'visual-kg-page', // 使用路由名称跳转
  })
}

// 生命周期和监听
watch(projectId, (newVal) => {
  if (newVal) {
    fetchExtractSample();
  }
});

watch(() => route.path, async () => {
  // 强制重新渲染布局
  layoutKey.value++
  
  // 等待DOM更新
  await nextTick()
  
  // 触发浏览器重绘
  if (document.body) {
    document.body.style.overflow = 'hidden'
    setTimeout(() => {
      document.body.style.overflow = ''
    }, 50)
  }
})

onMounted(async () => {
  if (projectId.value) {
    await fetchExtractSample();
  }
  await getUserInfo();
  await fetchOperationData();
});

watch([eventType, projectId], async () => {
  fetchOperationData();

  if (projectId.value) {
    await fetchExtractSample();
  }
  await getUserInfo();
}, { immediate: true });

</script>

<style lang="scss" scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 10px;
  box-sizing: border-box;
  gap: 20px;
  overflow: hidden;
  position: relative;

  // 确保所有直接子元素使用flex布局
  > * {
    flex: none;
  }
}

.top-section {
  flex: 1;
  max-height: 55vh;
  display: flex;
  flex-direction: column;
  
  .table-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0; // 关键：允许flex项收缩
  }
}

.bottom-section {
  flex: none;
  height: auto;
  max-height: 30vh;
  
  .card {
    display: flex;
    flex-direction: column;
  }
}

.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  .card-header {
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
    flex-shrink: 0;
    
    h2 {
      margin: 0;
      font-size: 18px;
      color: #303133;
    }
  }
  
  .card-content {
    flex: 1;
    padding: 20px;
    overflow: auto;
  }
}


.main-container {
  display: flex;
  flex-direction: column;
  min-height: 0; // 关键
}


.header-container {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  
  .header-title {
    margin-left: 20px;
    font-size: 18px;
    font-weight: bold;
    flex-grow: 1;
    margin-top: 10px;
  }
}

.table-wrapper {
 
  min-height: 0;
  position: relative; // 为绝对定位的表格提供参照
  margin-left: 10px;
  margin-right: 10px;

  .custom-table {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    
    :deep(.el-table__body-wrapper) {
      overflow-x: hidden;
    }
  }
}

.pagination-container {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

.control-panel {
  display: flex;
  min-height: 0;
  gap: 20px;
  
  .panel-left {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 25px;
    padding-right: 20px;
    border-right: 1px solid #ebeef5;
  }
  
  .panel-right {
    flex: none;
    width: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 15px;
  }
}

.control-group {
  .control-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    
    h3 {
      margin: 0;
      font-size: 16px;
      color: #606266;
      font-weight: 500;
    }
    
    .el-icon {
      color: var(--el-color-primary);
      font-size: 18px;
    }
  }
}

.enhanced-select {
  width: 100%;
  
  :deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }
  }
}

.action-button {
  width: 100%;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  .el-icon {
    font-size: 16px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.progress-dialog-content {
  padding: 0 20px;
  
  .custom-progress {
    margin: 20px 0;
    
    :deep(.el-progress-bar__inner) {
      transition: width 0.5s ease;
    }
  }
  
  .progress-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    
    .progress-message {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: var(--el-text-color-regular);
      
      .el-icon {
        margin-right: 8px;
      }
      
      .success-icon {
        color: var(--el-color-success);
      }
    }
    
    .progress-percentage {
      font-size: 16px;
      font-weight: bold;
      color: var(--el-color-primary);
    }
  }
}

.dialog-footer {
  text-align: center;
  
  .cancel-btn {
    width: 120px;
    
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
}

.header-container {
  display: flex;
  align-items: center;
}

.buttons-container {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-grow: 1;
  margin-right: 40px;
  margin-top: 10px;
}

.pagination-container {
  bottom: 75px;
  margin-right: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-pagination {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

.content-box {
  white-space: pre-wrap;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  width: 80%;
}


/* Dialog z-index fixes */
:deep(.main-dialog) {
  z-index: 2001 !important;
}

:deep(.detail-dialog) {
  z-index: 2002 !important;
}

// 响应式调整
@media (max-width: 768px) {
  .page-container {
    height: auto;
    min-height: 100vh;
  }
  
  .top-section {
    max-height: none;
  }
  
  .control-panel {
    flex-direction: column;
    
    .panel-left {
      padding-right: 0;
      border-right: none;
      border-bottom: 1px solid #ebeef5;
      padding-bottom: 20px;
    }
    
    .panel-right {
      width: 100%;
      flex-direction: row;
      justify-content: space-around;
      
      .action-button {
        width: 48%;
      }
    }
  }
}
</style>