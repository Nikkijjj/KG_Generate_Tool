<template>
  <div class="container" style="height: 720px;">
    <div class="card" style="height: 800px;">
      <div class="title-container">
        <h2>公告数据仓库</h2>
      </div>
      <div class="header-container">
        <h3>以下是数据库导入的数据</h3>
        <div class="buttons-container">
          <div class="search-group">
            <el-input v-model="searchKeyword" style="width: 240px" placeholder="输入股票代码搜索" :prefix-icon="Search"
              clearable @input="handleSearch" />
          </div>
          <el-button type="primary" @click="addNewDialogVisible = true">新建</el-button>
          <el-button type="success" @click="importDialogVisible = true">批量导入</el-button>
          <el-button type="warning" @click="handleDownload">下载</el-button>
          <el-button type="danger" @click="handleDelete">删除</el-button>
        </div>
      </div>
      <!-- <el-table
              ref="multipleTable"
              border
              :data="tableData"
              @selection-change="handleSelectionChange"
              row-key="index"
              :header-cell-style="headerCellStyle"
              style="height: 450px;"
          > -->
      <el-table ref="multipleTable" border :data="filteredData" @selection-change="handleSelectionChange"
        row-key="index" :header-cell-style="headerCellStyle" style="height: 450px;">
        <el-table-column type="selection" align="center" width="55" />
        <el-table-column align="center" label="公告编号" show-overflow-tooltip prop="id" width="90" fixed="left" />
        <el-table-column label="标题" show-overflow-tooltip align="center" prop="title" width="200" />
        <el-table-column label="内容" show-overflow-tooltip align="center" prop="content" width="600" />
        <el-table-column label="发布时间" show-overflow-tooltip align="center" prop="publishTime" width="120" />
        <el-table-column label="股票代码" show-overflow-tooltip align="center" prop="summary" width="200" />
        <el-table-column label="操作" width="130" fixed="right" class-name="small-padding fixed-width" align="center">
          <template #default="scope">
            <el-button link type="primary" size="large" @click="handleDetails(scope.row)">
              查看
            </el-button>
            <el-button link type="success" size="large" @click="updateDetails(scope.row)">
              修改
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--分页-->
      <div class="pagination-block">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next, jumper" :total="totalSamples" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" class="pagination-container" />
      </div>
    </div>
    <!-- 对话框 -->
    <el-dialog v-model="addNewDialogVisible" title="新建公告">
      <el-form :model="newNotice" ref="noticeForm" :rules="formRules" label-width="100px">
        <el-form-item label="公告编号" prop="id">
          <el-input v-model="newNotice.id" placeholder="请输入公告编号" clearable />
        </el-form-item>
        <el-form-item label="公告标题" prop="title">
          <el-input v-model="newNotice.title" placeholder="请输入公告标题" clearable />
        </el-form-item>
        <el-form-item label="公告内容" prop="content">
          <el-input type="textarea" v-model="newNotice.content" placeholder="请输入公告内容" :rows="4" />
        </el-form-item>
        <el-form-item label="发布时间">
          <el-date-picker v-model="newNotice.publishTime" type="date" placeholder="选择发布时间" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="股票代码">
          <el-input v-model="newNotice.stockNum" placeholder="请输入发布该公告公司的股票代码" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addNewDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAddNotice">确 定</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="importDialogVisible" title="批量导入公告数据">
      <el-form :model="filterForm" class="import-form">
        <!-- 日期范围选择 -->
        <el-form-item label="起止日期" prop="dateRange">
          <el-date-picker v-model="filterForm.dateRange" type="daterange" range-separator="-" start-placeholder="开始日期"
            end-placeholder="结束日期" value-format="YYYY-MM-DD" />
        </el-form-item>

        <!-- 股票代码输入 -->
        <el-form-item label="股票代码">
          <el-input v-model="filterForm.stockCodes" placeholder="输入股票代码，多个用逗号分隔（如: 600000,000001）" />
        </el-form-item>

        <!-- 文件上传 -->
        <el-form-item label="上传文件">
          <el-upload class="upload-demo" :auto-upload="false" :on-change="handleUpload" :show-file-list="true"
            accept=".xlsx,.xls,.json">
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持Excel/JSON格式，文件大小不超过10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitImport">开始导入</el-button>
      </template>
    </el-dialog>

    <!-- 添加查看详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="公告详情" width="50%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="公告编号" width="150">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="公告标题">{{ detailData.title }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ detailData.publishTime }}</el-descriptions-item>
        <el-descriptions-item label="公告简介" :span="2">
          {{ detailData.summary }}
        </el-descriptions-item>
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
import { ref, onMounted, computed } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';

import * as XLSX from 'xlsx';
import { useRouter } from 'vue-router';
import { CirclePlus, Warning, Search } from '@element-plus/icons-vue';
import { throttleFn_1 as throttleFn } from '@/common/debounceAndThrottle';
import axios from 'axios';

const loadingOperationData = ref(false);
// 定义响应式数据
const taskType = ref('');
// 定义一个响应式数据用于存储选中的行
const selectedRows = ref([]);
const router = useRouter();
// const tableData = ref([]);

// const pageSize = ref(5);
// const currentPage = ref(1);
const searchKeyword = ref('');

const totalSamples = ref(0);
const currentPage = ref(1);
const pageSize = ref(12);

const detailDialogVisible = ref(false);
const detailData = ref({
  id: '',
  title: '',
  content: '',
  publishTime: '',
  summary: ''
});

const mockData = ref([
  {
    id: "11111111",
    title: '2023年度报告',
    content: '本公司2023年度财务报告及审计结果',
    publishTime: '2023-04-15',
    summary: '600000',
    detailUrl: '#'
  },
  {
    id: "22222222",
    title: '董事会决议公告',
    content: '关于公司董事会第五次会议决议的公告',
    publishTime: '2023-05-20',
    summary: '000001',
    detailUrl: '#'
  },
  {
    id: "33333333",
    title: '重大资产重组公告',
    content: '关于公司拟进行重大资产重组的提示性公告',
    publishTime: '2023-06-10',
    summary: '600519',
    detailUrl: '#'
  },
  {
    id: "44444444",
    title: '分红方案公告',
    content: '2022年度利润分配方案公告',
    publishTime: '2023-07-05',
    summary: '000002',
    detailUrl: '#'
  },
  {
    id: "55555555",
    title: '季度报告',
    content: '2023年第三季度财务报告',
    publishTime: '2023-10-15',
    summary: '600000',
    detailUrl: '#'
  },
]);

const tableData = ref([]);
const filteredData = ref([]);

const handleSearch = () => {
  if (!searchKeyword.value) {
    filteredData.value = [...tableData.value];
    return;
  }

  const keyword = searchKeyword.value.trim();
  filteredData.value = tableData.value.filter(item =>
    item.summary.includes(keyword)
  );
};


// // 过滤和分页计算属性
// const filteredData = computed(() => {
// if (!searchKeyword.value) return tableData.value;
// const keyword = searchKeyword.value.toLowerCase();
// return tableData.value.filter(item => 
//   item.title.toLowerCase().includes(keyword)
// );
// });

const formRules = {
  title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
  content: [{ required: true, message: '内容不能为空', trigger: 'blur' }]
};



const newNotice = ref({
  id: '',
  title: '',
  content: '',
  publishTime: '', // 自动生成
  stockNum: ''
});

// const pagedData = computed(() => {
// const start = (currentPage.value - 1) * pageSize.value;
// return filteredData.value.slice(start, start + pageSize.value);
// });
const addNewDialogVisible = ref(false);

// 行选择变更时的处理函数
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection;
  console.log('选中的行:', selectedRows.value);
};

// // 分页改变时的处理函数
// const handlePageChange = (page: number) => {
//   ElMessage.success(`当前第${page}页`);
//   currentPage.value = page;
// };

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchOperationData();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchOperationData();
};

// 从后端获取数据
// const fetchOperationData = throttleFn(async () => {
//     if (loadingOperationData.value) return;
//     loadingOperationData.value = true;
//     try {
//       const res = await axios.get('http://127.0.0.1:5000/api/textPreprocess_api', {
//         params: {
//           page: currentPage.value,
//           page_size: pageSize.value
//         }
//       });

//       if (res.data.error) {
//         throw new Error(res.data.msg || '获取数据失败');
//       }

//       tableData.value = res.data.data || [];
//       totalSamples.value = res.data.total || 0;
//     } catch (error) {
//       ElMessage.error(error.message);
//       console.error('Error:', error);
//     } finally {
//       loadingOperationData.value = false;
//     }
// }, 500);

const fetchOperationData = throttleFn(async () => {
  if (loadingOperationData.value) return;
  loadingOperationData.value = true;

  try {
    // Comment out the actual API call for now
    /*
    const res = await axios.get('http://127.0.0.1:5000/api/textPreprocess_api', {
      params: {
        page: currentPage.value,
        page_size: pageSize.value
      }
    });
    
    if (res.data.error) {
      throw new Error(res.data.msg || '获取数据失败');
    }
    
    tableData.value = res.data.data || [];
    totalSamples.value = res.data.total || 0;
    */

    // Use mock data instead
    tableData.value = mockData.value;
    filteredData.value = [...mockData.value];
    totalSamples.value = mockData.value.length;

  } catch (error) {
    ElMessage.error(error.message);
    console.error('Error:', error);
  } finally {
    loadingOperationData.value = false;
  }
}, 500);

onMounted(fetchOperationData);

//查看详情
const handleDetails = (row: any) => {
  detailData.value = {
    id: row.id,
    title: row.title,
    content: row.content,
    publishTime: row.publishTime,
    summary: row.summary
  };
  detailDialogVisible.value = true;
};

const handleDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的数据');
    return;
  }

  ElMessageBox.confirm(`确定要删除选中的${selectedRows.value.length}条数据吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      tableData.value = tableData.value.filter(
        item => !selectedRows.value.includes(item)
      );
      selectedRows.value = [];
      ElMessage.success('删除成功');
    })
    .catch(() => {
      ElMessage.info('取消删除');
    });
};
// 下载表格内容的方法
const handleDownload = () => {
  ElMessageBox.confirm('是否确定要下载当前表格内容为Excel文件？', '下载确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 用户点击确定，执行下载操作
      const data = tableData.value; // 获取表格数据
      const worksheet = XLSX.utils.json_to_sheet(data); // 将数据转换为工作表
      const workbook = XLSX.utils.book_new(); // 创建一个新的工作簿
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1'); // 将工作表添加到工作簿
      XLSX.writeFile(workbook, 'tableData.xlsx'); // 保存工作簿为Excel文件
      ElMessage.success('下载成功');
    })
    .catch(() => {
      // 用户点击取消，取消操作
      ElMessage.info('下载已取消');
    });
};


// 在script中添加响应式数据和相关方法
const importDialogVisible = ref(false);
const filterForm = ref({
  dateRange: [],
  stockCodes: '',
});
const uploadFile = ref<File>();

// 处理文件上传
const handleUpload = (file: UploadFile) => {
  uploadFile.value = file.raw;
  return false; // 关闭自动上传
};

// 提交导入
const handleSubmitImport = async () => {
  if (!filterForm.value.dateRange?.length) {
    ElMessage.warning('请选择日期范围');
    return;
  }

  const params = {
    startDate: filterForm.value.dateRange[0],
    endDate: filterForm.value.dateRange[1],
    stockCodes: filterForm.value.stockCodes.split(',').map(code => code.trim()),
    file: uploadFile.value
  };

  try {
    // 这里调用后端API
    // const res = await importDataApi(params);
    ElMessage.success('导入请求已提交');
    importDialogVisible.value = false;
  } catch (error) {
    ElMessage.error('导入失败');
  }
};

// 表头单元格样式
const headerCellStyle = (column: any) => {
  return {
    fontWeight: 'bold', // 设置字体加粗
    fontSize: '15px', // 设置字体大小
    textAlign: 'center', // 设置文本居中
    lineHeight: '15px',
  };
};

const handleAddNotice = () => {
  // 生成发布时间
  // const now = new Date();
  // newNotice.value.publishTime = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}`;

  // // 自动生成index
  // const newIndex = tableData.value.length + 1;

  // 添加数据
  tableData.value.unshift({
    index: newIndex,
    ...newNotice.value
  });

  // 重置表单
  newNotice.value = {
    title: '',
    content: '',
    summary: '',
    publishTime: '',
    detailUrl: '#'
  };

  // 关闭对话框
  addNewDialogVisible.value = false;
  ElMessage.success('添加成功');
};
</script>

<style lang="css">
.header-container {
  display: flex;
  align-items: center;
  height: 6vh;
  /* 适当增加高度 */
  padding: 20px;
}

.title-container {
  font-size: 20px;
  font-weight: bold;
  padding-bottom: 20px;
  text-align: center;
}

.buttons-container {
  display: flex;
  gap: 10px;
  /* 按钮之间的间隔 */
  justify-content: flex-end;
  /* 将按钮排列到容器的右侧 */
  flex-grow: 1;
  /* 让按钮容器占据剩余的空间 */
  margin-right: 10px;
}

.pagination-container {
  bottom: 20px;
  /* 距离底部20px */
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px;
}


.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  flex: 1;
  min-height: 0;
}

.el-table {
  font-family: 'Arial', sans-serif;
  font-weight: normal;
  font-size: 14px;
  line-height: 4;
  text-align: center;
  height: 600px;
  /* 增加表格高度 */
}

/* 添加样式 */
.import-form {
  padding: 20px;
}

.upload-demo {
  width: 100%;
}

.el-upload__tip {
  margin-top: 8px;
  color: #666;
  font-size: 12px;
}

/* 添加搜索输入框的样式 */
.el-input {
  margin-right: 10px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  :deep(.el-input__wrapper) {
    border-radius: 20px;
    padding: 2px 15px;
  }
}

.content-box {
  white-space: pre-wrap;
  line-height: 1.6;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

/* 调整描述列表样式 */
.el-descriptions__body {
  background: #fff;
}

.el-descriptions-item__label {
  width: 120px;
  text-align: center;
  background: #f5f7fa;
}

.pagination-block {
  margin-top: 20px;
  /* 与表格的间距 */
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>