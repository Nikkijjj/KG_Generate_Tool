<template>
  <div class="main-container">
    <div class="header-container">
      <span style="margin-left: 5px; font-size: 20px; font-weight: bold;">
        请选择您需要知识图谱解析的数据
      </span>
      <div class="buttons-container">
        <el-button type="primary" @click="handleCreate">从操作库导入</el-button>
        <!-- <el-button type="success" @click="handleImport">批量导入</el-button> -->
        <el-button type="warning" @click="handleDownload">下载</el-button>
      </div>
    </div>
    
    <div class="table-container">
      <el-table
        ref="multipleTable"
        border
        :data="pagedTableData"
        @selection-change="handleSelectionChange"
        row-key="id"
        height="55vh"
        class="table"
        style="width: 1075px; border-radius: 10px; font-size: 15px"
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
          prop="publishTime"
          width="120"
        />
        <el-table-column
          label="股票代码"
          show-overflow-tooltip
          align="center"
          prop="summary"
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
      
      <el-pagination
        class="pagination-container"
        v-model:current-page="mainCurrentPage"
        v-model:page-size="mainPageSize"
        :page-sizes="[12, 24, 36, 48]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableData.length"
        @size-change="handleMainSizeChange"
        @current-change="handleMainCurrentChange"
      />
    </div>
    
    <!-- 从操作库导入的对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="从操作库选择数据"
      width="70%"
      :style="{ 
        // marginLeft: '100px', 
        marginTop: '10vh' 
      }"
      :modal="false" 
      append-to-body
      top="5vh"
      :close-on-click-modal="false"
      class="main-dialog"
    >
      <el-table
        ref="dialogTable"
        border
        :data="pagedDialogData"
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
          prop="publishTime"
          width="120"
        />
        <el-table-column
          label="股票代码"
          show-overflow-tooltip
          align="center"
          prop="summary"
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
    <el-descriptions-item label="发布时间">{{ detailData.publishTime }}</el-descriptions-item>
    <el-descriptions-item label="股票代码">{{ detailData.stock_num }}</el-descriptions-item>
    <el-descriptions-item label="公告内容" :span="2">
      <div class="content-box">
        {{ detailData.content }}
      </div>
    </el-descriptions-item>
  </el-descriptions>
</el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch ,toRefs} from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useRouter } from 'vue-router';
import { CirclePlus, Warning } from '@element-plus/icons-vue';
import { throttleFn_1 as throttleFn } from '@/common/debounceAndThrottle';
import userApi from '@/http/user.js';
import axios from 'axios';


// 响应式数据
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
  publishTime: '',
  stock_num: ''
});

// 使用 `defineProps` 接收 `props`
const props = defineProps<{
    eventType: string;
    projectId: string;
}>();
const { eventType, projectId } = toRefs(props);

// 计算属性修改：
const pagedTableData = computed(() => {
  const start = (mainCurrentPage.value - 1) * mainPageSize.value;
  return tableData.value.slice(start, start + mainPageSize.value);
});

const pagedDialogData = computed(() => {
  // 确保返回当前页的数据
  if (!Array.isArray(dialogTableData.value)) {
    return [];
  }
  // 这里应该直接返回当前页的数据，因为API已经做了分页
  return dialogTableData.value;
});

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
    
    // 修改数据映射，保留index但不显示
    tableData.value = (res.data || []).map((item, index) => ({
      index: index + 1, // 前端序号从1开始，但不显示
      id: item.id || '', // 使用数据库中的ID
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
      page: dialogCurrentPage.value,
      page_size: dialogPageSize.value
    };
    const res = await axios.post('http://127.0.0.1:5000/api/textPreprocess_api', {params}); 
    
    // 这里应该直接赋值返回的数据，而不是追加
    dialogTableData.value = Array.isArray(res.data?.data) 
      ? res.data.data 
      : [];
      
    totalSamples.value = res.data?.total || 0;
  } catch (error) {
    const errMsg = error?.response?.data?.msg || error.message || '获取项目列表失败';
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
      // 修改这里：调整参数结构匹配后端
      const params = {
        project_id: projectId.value,
        titles: rows.map(row => row.title) // 直接提取title数组
      };

      // 调用API
      await userApi.deleteSample(params);

      // 更新前端数据
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
  
  // 准备要导入的数据
  const newIndex = tableData.value.length > 0 ? 
    Math.max(...tableData.value.map(item => item.index)) + 1 : 1;
  
  const importedData = selectedDialogRows.value.map((row, i) => ({
    ...row,
    index: newIndex + i,
    title: row.title,
    content: row.content,
    publishTime: row.publishTime,
    summary: row.summary,
    insert_time: new Date().toISOString() // 为每条数据添加插入时间
  }));
  
  try {
    
    // 调用保存函数
    await saveSelectedData(importedData);
    
    // 更新本地数据
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

const headerCellStyle = () => ({
  fontWeight: 'bold',
  fontSize: '15px',
  textAlign: 'center',
  lineHeight: '15px',
});

// 分页处理函数修改：
const handleMainSizeChange = (size) => {
  mainPageSize.value = size;
  mainCurrentPage.value = 1;
  fetchExtractSample();
};

const handleMainCurrentChange = (page) => {
  mainCurrentPage.value = page;
  fetchExtractSample();
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
  

// 生命周期和监听
watch(projectId, (newVal) => {
  if (newVal) {
    fetchExtractSample();
  }
});

onMounted(async () => {
  // fetchOperationData();
  
  if (projectId.value) {
    await fetchExtractSample();
  }
  await getUserInfo();
});

watch([eventType, projectId], async () => {
  fetchOperationData();

  if (projectId.value) {
    await fetchExtractSample();
  }
  await getUserInfo();
}, { immediate: true });


</script>

<style lang="css" scoped>
.main-container {
  width: 1030px;
  border-radius: 5px;
  font-size: 15px;
  background-color: #fff;
  height: 65vh;
  padding: 20px;
}

.header-container {
  display: flex;
  align-items: center;
  width: 100%;
  height: 5vh;
}

.buttons-container {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-grow: 1;
  margin-right: 10px;
}

.pagination-container {
  bottom: 75px;
  margin-right: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-pagination {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
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
</style>