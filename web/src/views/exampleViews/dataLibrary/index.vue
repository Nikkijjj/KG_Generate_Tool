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
                      <el-input
                        v-model="searchKeyword"
                        style="width: 240px"
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
                  <el-button type="primary" @click="addNewDialogVisible = true">新建</el-button>
                  <el-button type="success" @click="importDialogVisible = true">文件上传</el-button>
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
          <el-table
            ref="multipleTable"
            border
            :data="tableData"  
            @selection-change="handleSelectionChange"
            row-key="id"
            :header-cell-style="headerCellStyle"
            style="height: 450px;"
          >
              <el-table-column type="selection" align="center" width="55" />
              <el-table-column
                  align="center"
                  label="公告编号"
                  show-overflow-tooltip 
                  prop="id"
                  width="90"
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
                  label="发布公司"
                  show-overflow-tooltip
                  align="center"
                  prop="company"
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
                          type="success"
                          size="large"
                          @click="updateDetails(scope.row)"
                      >
                          修改
                      </el-button>
                  </template>
              </el-table-column>
          </el-table>

          <!--分页-->
        <div class="pagination-block">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[12, 24, 36, 48]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalSamples"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            class="pagination-container"
          />
        </div>
      </div>
    <!-- 对话框 -->
<el-dialog v-model="addNewDialogVisible" title="新建公告">
  <el-form 
    :model="newNotice" 
    ref="noticeForm"
    :rules="formRules"
    label-width="100px"
  >
    <el-form-item label="公告编号" prop="id">
      <el-input 
        v-model="newNotice.id" 
        placeholder="请输入公告编号"
        clearable
      />
    </el-form-item>
    <el-form-item label="公告标题" prop="title">
      <el-input 
        v-model="newNotice.title" 
        placeholder="请输入公告标题"
        clearable
      />
    </el-form-item>
    <el-form-item label="公告内容" prop="content">
      <el-input 
        type="textarea" 
        v-model="newNotice.content" 
        placeholder="请输入公告内容"
        :rows="4"
      />
    </el-form-item>
    <el-form-item label="发布时间">
      <el-date-picker
        v-model="newNotice.date"
        type="date"
        placeholder="选择发布时间"
        value-format="YYYY-MM-DD"
      />
    </el-form-item>
    <el-form-item label="股票代码">
      <el-input
        v-model="newNotice.stock_num"
        placeholder="请输入发布该公告公司的股票代码"
      />
    </el-form-item>
        <el-form-item label="发布公司">
      <el-input
        v-model="newNotice.company"
        placeholder="请输入发布该公告的公司名称"
      />
    </el-form-item>
  </el-form>
  
  <template #footer>
    <el-button @click="addNewDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="handleAddNotice">确 定</el-button>
  </template>
</el-dialog>
  <el-dialog v-model="importDialogVisible" title="上传公告数据文件">
    <el-form :model="uploadForm" class="upload-form">
      <!-- File upload -->
      <el-form-item label="选择文件">
        <el-upload
          class="upload-demo"
          drag
          :auto-upload="false"
          :on-change="handleFileChange"
          :show-file-list="true"
          :accept="allowedFileTypes"
          :before-upload="beforeUpload"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽文件到此处或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              仅支持 TXT 和 CSV 格式文件，文件大小不超过10MB
            </div>
          </template>
        </el-upload>
      </el-form-item>
      
      <!-- File format options -->
      <el-form-item label="文件格式">
        <el-radio-group v-model="uploadForm.fileType">
          <el-radio label="csv">CSV</el-radio>
          <el-radio label="txt">TXT</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <!-- Delimiter selection (for CSV) -->
      <el-form-item label="分隔符" v-if="uploadForm.fileType === 'csv'">
        <el-select v-model="uploadForm.delimiter" placeholder="选择分隔符">
          <el-option label="逗号 (,)" value=","></el-option>
          <el-option label="分号 (;)" value=";"></el-option>
          <el-option label="制表符 (Tab)" value="\t"></el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="importDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleFileUpload">开始上传</el-button>
    </template>
  </el-dialog>

<!-- 添加查看详情对话框 -->
<el-dialog 
  v-model="detailDialogVisible" 
  title="公告详情" 
  width="50%"
>
  <el-descriptions :column="2" border>
    <el-descriptions-item label="公告编号" width="150">{{ detailData.id }}</el-descriptions-item>
    <el-descriptions-item label="公告标题">{{ detailData.title }}</el-descriptions-item>
    <el-descriptions-item label="股票代码">{{ detailData.stock_num }}</el-descriptions-item>
    <el-descriptions-item label="发布公司">{{ detailData.company }}</el-descriptions-item>
    <el-descriptions-item label="公告内容" :span="2">
      <div class="content-box">
        {{ detailData.content }}
      </div>
    </el-descriptions-item>
    <el-descriptions-item label="发布时间">{{ detailData.date }}</el-descriptions-item>
  </el-descriptions>
</el-dialog>

  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessageBox, ElMessage }from 'element-plus';

import * as XLSX from 'xlsx';
import { UploadFilled, Search } from '@element-plus/icons-vue';
import { throttleFn_1 as throttleFn } from '@/common/debounceAndThrottle';
import axios from 'axios';

// 定义一个响应式数据用于存储选中的行
const selectedRows = ref([]);
const searchKeyword = ref('');

const totalSamples = ref(0);
const currentPage = ref(1);
const pageSize = ref(12);

const detailDialogVisible = ref(false);
const detailData = ref({
id:'',
title: '',
content: '',
date: '',
stock_num: '',
company: ''
});
const importDialogVisible = ref(false);
const allowedFileTypes = '.txt,.csv';
const uploadForm = ref({
  file: null as File | null,
  fileType: 'csv',
  delimiter: ',',
  encoding: 'utf-8'
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

const tableData = ref<any[]>([]);
const filteredData = ref<any[]>([]);

const loadingSearch = ref(false);

const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    fetchOperationData(); // 重新获取全部数据
    return;
  }
  
  const keyword = searchKeyword.value.trim();
  loadingSearch.value = true;
  
  axios.post('http://127.0.0.1:5000/api/textPreprocess_api/search', {
    keyword: keyword,
    page: currentPage.value,
    page_size: pageSize.value
  }).then(response => {
    tableData.value = response.data.data || [];
    totalSamples.value = response.data.total || 0;
  }).catch(error => {
    ElMessage.error('搜索失败: ' + error.message);
  }).finally(() => {
    loadingSearch.value = false;
  });
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
date: '', 
stock_num: '',
company: ''
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
const fetchOperationData = throttleFn(async () => {
  try {
    const response = await axios({
      method: 'post',
      url: 'http://127.0.0.1:5000/api/textPreprocess_api',
      data: {
        page: currentPage.value,
        page_size: pageSize.value
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('API 响应:', response.data);
    
    // 直接使用后端返回的分页数据
    tableData.value = response.data.data?.data || response.data.data || [];
    totalSamples.value = response.data.data?.total || response.data.total || 0;
    
  } catch (error) {
    console.error('获取数据错误:', error);
    ElMessage.error('数据加载失败');
  }
}, 500);

// const fetchOperationData = throttleFn(async () => {
//     if (loadingOperationData.value) return;
//     loadingOperationData.value = true;
    
//     try {
//       // Comment out the actual API call for now
//       /*
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
//       */
      
//       // Use mock data instead
//       tableData.value = mockData.value;
//       filteredData.value = [...mockData.value];
//       totalSamples.value = mockData.value.length;
      
//     } catch (error) {
//       ElMessage.error(error.message);
//       console.error('Error:', error);
//     } finally {
//       loadingOperationData.value = false;
//     }
// }, 500);

onMounted(fetchOperationData);

//查看详情
const handleDetails = (row: any) => {
detailData.value = {
  id: row.id,
  title: row.title,
  content: row.content,
  date: row.date,
  stock_num: row.stock_num,
  company: row.company
};
detailDialogVisible.value = true;
};

const handleDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的数据');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条数据吗？`, 
      '删除确认', 
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    // 提取要删除的公告ID数组
    const idsToDelete = selectedRows.value.map(row => row.id);
    console.log('要删除的ID:', idsToDelete); // 调试日志
    
    // 调用后端API删除数据
    const response = await axios.post(
      'http://127.0.0.1:5000/api/textPreprocess_api/deleteAnnouncements', 
      { ids: idsToDelete },  // 修正数据格式
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('删除响应:', response.data); // 调试日志

    if (response.data.success) {
      ElMessage.success('删除成功');
      tableData.value = tableData.value.filter(
        item => !idsToDelete.includes(item.id)
      );
      selectedRows.value = [];
      fetchOperationData();
    } else {
      throw new Error(response.data.message || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除错误详情:', error.response?.data || error.message);
      ElMessage.error(`删除失败: ${error.message}`);
    }
  }
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
const filterForm = ref({
dateRange: [],
stockCodes: '',
});
const uploadFile = ref<File>();

const handleFileChange = (file: UploadFile) => {
  uploadForm.value.file = file.raw;
  // 检测文件类型
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.csv')) {
    uploadForm.value.fileType = 'csv';
  } else if (fileName.endsWith('.txt')) {
    uploadForm.value.fileType = 'txt';
  }
  return false; // 阻止默认行为
};

const beforeUpload = (file: File) => {
  const isAllowed = file.name.endsWith('.txt') || file.name.endsWith('.csv');
  const isLt10M = file.size / 1024 / 1024 < 10;

  if (!isAllowed) {
    ElMessage.error('只能上传 TXT 或 CSV 格式的文件!');
    return false;
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!');
    return false;
  }
  return true;
};

const handleFileUpload = async () => {
  if (!uploadForm.value.file) {
    ElMessage.warning('请先选择文件');
    return;
  }

  try {
    // Create FormData for the upload
    const formData = new FormData();
    formData.append('file', uploadForm.value.file);
    formData.append('fileType', uploadForm.value.fileType);
    formData.append('delimiter', uploadForm.value.delimiter);
    
    // 加载动画
    // const loading = ElLoading.service({
    //   lock: true,
    //   text: '文件上传中，请稍候...',
    //   background: 'rgba(0, 0, 0, 0.7)'
    // });
    
    // Here you would typically make an API call to upload the file
    // For example:
    // const response = await axios.post('/api/upload-notices', formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data'
    //   }
    // });
    
    // 模拟上传文件的延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 处理文件内容
    const fileContent = await readFileContent(uploadForm.value.file);
    const parsedData = parseFileContent(fileContent);
    
    // 将解析的数据添加到表格
    tableData.value.unshift(...parsedData);
    filteredData.value = [...tableData.value];
    totalSamples.value = tableData.value.length;
    
    ElMessage.success('文件上传成功!');
    importDialogVisible.value = false;
  } catch (error) {
    ElMessage.error('文件上传失败: ' + error.message);
  } finally {
    loading.close();
  }
};

// 辅助函数用于读取文件内容
const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsText(file, uploadForm.value.encoding);
  });
};

// 辅助函数用于解析文件内容
const parseFileContent = (content: string): any[] => {
  if (uploadForm.value.fileType === 'csv') {
    return parseCSV(content);
  } else {
    return parseTXT(content);
  }
};

// 辅助函数用于解析CSV内容
const parseCSV = (content: string): any[] => {
  const lines = content.split('\n');
  const headers = lines[0].split(uploadForm.value.delimiter);
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(uploadForm.value.delimiter);
    const entry: any = {};
    
    for (let j = 0; j < headers.length; j++) {
      entry[headers[j].trim()] = values[j] ? values[j].trim() : '';
    }
    
    // Add required fields if not present
    if (!entry.id) entry.id = `auto_${Date.now()}_${i}`;
    if (!entry.publishTime) entry.publishTime = new Date().toISOString().split('T')[0];
    
    result.push(entry);
  }
  
  return result;
};

// 辅助函数用于解析TXT内容
const parseTXT = (content: string): any[] => {
  // Split into entries (if there are multiple announcements in one file)
  const entries = content.split('\n\n').filter(e => e.trim());
  
  return entries.map((entry, index) => {
    // Initialize default values
    const result: any = {
      id: `auto_${Date.now()}_${index}`,
      title: '无标题公告',
      content: '',
      date: new Date().toISOString().split('T')[0],
      stock_num: '未知股票代码',
      company: '未知公司名称'
    };

    // Split the entry into lines and process each line
    const lines = entry.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      // Check for each field pattern
      if (line.startsWith('公告标题：')) {
        result.title = line.replace('公告标题：', '').trim();
      } else if (line.startsWith('公告内容：')) {
        result.content = line.replace('公告内容：', '').trim();
      } else if (line.startsWith('发布时间：')) {
        result.date = line.replace('发布时间：', '').trim();
      } else if (line.startsWith('股票代码：')) {
        result.stock_num = line.replace('股票代码：', '').trim();
      } else if (line.startsWith('发布公司')) {
        result.company = line.replace('发布公司', '').trim();
      }
      // Handle multi-line content (if content spans multiple lines)
      else if (result.content && !line.includes('：')) {
        result.content += '\n' + line.trim();
      }
    });

    return result;
  });
};


try {
  // 这里调用后端API
  // const res = await importDataApi(params);
  ElMessage.success('导入请求已提交');
  importDialogVisible.value = false;
} catch (error) {
  ElMessage.error('导入失败');
}


// 表头单元格样式
const headerCellStyle = (column: any) => {
  return {
      fontWeight: 'bold', // 设置字体加粗
      fontSize: '15px', // 设置字体大小
      textAlign: 'center', // 设置文本居中
      lineHeight: '15px',
  };
};

const handleAddNotice = async () => {
  try {
    // 1. 表单验证
    if (!newNotice.value.title || !newNotice.value.content) {
      ElMessage.warning('请填写标题和内容');
      return;
    }

    // 2. 准备请求数据 - 确保日期是字符串格式
    const noticeData = {
      id: newNotice.value.id || undefined,
      title: newNotice.value.title,
      content: newNotice.value.content,
      // 确保日期是 "YYYY-MM-DD" 格式的字符串
      date: newNotice.value.date ? 
            (typeof newNotice.value.date === 'string' ? 
             newNotice.value.date : 
             newNotice.value.date.format('YYYY-MM-DD')) : 
            new Date().toISOString().split('T')[0],
      stock_num: newNotice.value.stock_num || '未知',
      company: newNotice.value.company || '未知'
    };

    // 3. 调用后端API
    const response = await axios.post(
      'http://127.0.0.1:5000/api/textPreprocess_api/addAnnouncement',
      noticeData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // 4. 处理响应
    if (response.data.success) {
      ElMessage.success('公告添加成功');
      
      // 关闭对话框
      addNewDialogVisible.value = false;
      
      // 重置表单
      newNotice.value = {
        id: '',
        title: '',
        content: '',
        date: '',
        stock_num: '',
        company: ''
      };
      
      // 刷新表格数据
      fetchOperationData();
    } else {
      throw new Error(response.data.message || '添加公告失败');
    }
  } catch (error) {
    console.error('添加公告错误:', error);
    ElMessage.error(`添加公告失败: ${error.message}`);
  }
};
</script>

<style lang="css">
.header-container {
  display: flex;
  align-items: center;
  height: 6vh; /* 适当增加高度 */
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
  gap: 10px; /* 按钮之间的间隔 */
  justify-content: flex-end; /* 将按钮排列到容器的右侧 */
  flex-grow: 1; /* 让按钮容器占据剩余的空间 */
  margin-right: 10px;
}

.pagination-container {
  bottom: 20px; /* 距离底部20px */
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin:20px;
}

.search-group {
  display: flex;
  align-items: center;
  margin-right: 10px;
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
  height: 600px; /* 增加表格高度 */
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
  margin-top: 20px; /* 与表格的间距 */
  display: flex;
  justify-content: center;
  width: 100%;
}


</style>