<template>
  <div class="page-container" :key="layoutKey">
    <!-- 上半部分：表格卡片 -->
    <div class="top-section">
      <div class="card table-cardc">
        <div class="main-container">
          <div class="header-container">
            <span class="header-title">
              请选择您需要知识图谱解析的数据
            </span>
            <div class="buttons-container">
              <el-button type="primary" @click="handleCreate">从操作库导入</el-button>
              <el-button 
                type="danger" 
                @click="handleDelete(selectedRows)" 
                :disabled="selectedRows.length === 0"
              >
                批量删除 ({{ selectedRows.length }})
              </el-button>
              <el-button type="warning" @click="handleDownload">下载</el-button>

              <el-dropdown :teleported="false">
                <el-button type="success" :disabled="tableData.length === 0">
                  <el-icon><Position /></el-icon>
                  <span>节点操作</span>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      @click="openExtractionMethodDialog"
                      :disabled="tableData.length === 0 || isNodeExtracted"
                    >
                      <el-icon><MagicStick /></el-icon>
                      <span>节点抽取</span>
                    </el-dropdown-item>
                    <el-dropdown-item
                      @click="showNodeResults"
                      :disabled="!isNodeExtracted"
                      divided
                    >
                      <el-icon><View /></el-icon>
                      <span>查看抽取结果</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>

            </div>
          </div>
          
          <div class="table-wrapper">
            <el-table
              ref="multipleTable"
              border
              :data="currentPageData" 
              @selection-change="handleSelectionChange"
              row-key="id"
              height="42vh"
              class="custom-table"
              :header-cell-style="headerCellStyle"
            >
              <!-- 添加多选列 -->
              <el-table-column
                type="selection"
                width="55"
                align="center"
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
                align="center"
                prop="content"
                width="600"
              >
                <template #default="{row}">
                  {{ row.content.length > 50 ? row.content.substring(0, 50) + '...' : row.content }}
                </template>
              </el-table-column>
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
                align="center"
                prop="content"
                width="600"
              >
                <template #default="{row}">
                  {{ row.content.length > 50 ? row.content.substring(0, 50) + '...' : row.content }}
                </template>
              </el-table-column>
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

          <!-- 查看详情对话框 -->
          <el-dialog 
            v-model="detailDialogVisible" 
            title="公告详情" 
            width="55%"
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

          <!-- 节点抽取结果对话框 -->
<el-dialog 
  v-model="nodeResultDialogVisible" 
  title="节点抽取结果" 
  width="55%"
  class="node-result-dialog"
  :close-on-click-modal="false"
  :close-on-press-escape="false"
>
  <!-- 加载动画覆盖层 -->
  <div v-if="extractionLoading" class="loading-overlay">
    <div class="loading-content">
      <div class="progress-container">
        <el-progress
          :percentage="extractionProgress"
          :stroke-width="18"
          :text-inside="true"
          :color="customColors"
          class="linear-progress"
        />
        <div class="progress-text">
          <h3>正在抽取节点数据...</h3>
          <p>已完成 {{ extractionProgress }}%，请稍候...</p>
        </div>
      </div>
    </div>
  </div>
        
         <div v-else>
    <div v-if="nodeResults.length > 0" class="node-result-content">
      <div class="node-result-header">
        <el-tag type="success" size="large" >
          共抽取到 {{ nodeResults.length }} 个节点
        </el-tag>
        <div class="header-actions">
          <el-button type="primary" size="small" @click="exportNodeResults">
            导出结果
          </el-button>
        </div>
      </div>
      
      <el-table
        :data="nodeResults"
        border
        height="60vh"
        style="width: 100%"
      >
      <el-table-column
        prop="type"
        width="100"
        align="center"
        header-align="center"
        sortable
      >
        <template #default="{row}">
          <div style="text-align: center; width: 100%;">
            <el-tag 
              :type="row.type === '事件' ? 'primary' : 'success'"
              style="display: inline-flex; align-items: center; justify-content: center;"
            >
              {{ row.type }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
        <el-table-column
          prop="id"
          label="节点ID"
          show-overflow-tooltip
          width="120"
          sortable
        />
        <el-table-column
          prop="value"
          label="节点名称"
          width="160"
          sortable
        />
        <el-table-column
          prop="key"
          label="节点类型"
          width="140"
          sortable
        />
        <el-table-column
          label="节点属性"
        >
          <template #default="{row}">
            <div class="properties-container">
              <div 
                v-for="(value, key) in row.properties" 
                :key="key"
                class="property-item"
              >
                <span class="property-key">{{ key }}:</span>
                <span class="property-value">{{ value }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <div v-else class="no-results">
      <el-empty description="没有找到节点抽取结果" />
    </div>
  </div>
  
<template #footer>
  <div class="dialog-footer">
    <el-button 
      type="danger"
      @click="cancelNodeResults"
      :disabled="buttonsDisabled || extractionLoading"
    >
      取消抽取结果
    </el-button>
    <el-button 
      type="primary"
      @click="nodeResultDialogVisible = false"
      :disabled="buttonsDisabled || extractionLoading"
    >
      确认
    </el-button>
  </div>
</template>
</el-dialog>
        </div>
      </div>
    </div>

    <!-- 下半部分：抽取控制面板 -->
    <div class="bottom-section" :class="{ 'disabled-panel': !isNodeExtracted }">
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

    <!-- 抽取方法选择对话框 -->
  <el-dialog
    v-model="extractionMethodDialogVisible"
    title="选择抽取方法"
    width="400px"
    :close-on-click-modal="false"
  >
    <div class="extraction-method-container">
      <el-radio-group v-model="selectedExtractionMethod">
        <el-radio label="llm" size="large">
          <div class="method-option">
            <el-icon><Connection /></el-icon>
            <span>LLM智能抽取</span>
            <el-tag type="info" size="small">高精度</el-tag>
          </div>
        </el-radio>
        <el-radio label="algorithm" size="large">
          <div class="method-option">
            <el-icon><Cpu /></el-icon>
            <span>抽取算法</span>
            <el-tag type="info" size="small">高性能</el-tag>
          </div>
        </el-radio>
      </el-radio-group>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="extractionMethodDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="confirmExtractionMethod"
        >
          确认选择
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 关系抽取结果对话框 -->
<el-dialog
    v-model="relationResultDialogVisible" 
    title="关系抽取结果" 
    width="55%"
    class="relation-result-dialog"
    :close-on-click-modal="false"
  >
    <div v-if="relationExtractionLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="progress-container">
          <el-progress
            :percentage="relationExtractionProgress"
            :stroke-width="18"
            :text-inside="true"
            :color="customColors"
            class="linear-progress"
          />
          <div class="progress-text">
            <h3>正在抽取关系数据...</h3>
            <p>已完成 {{ relationExtractionProgress }}%，请稍候...</p>
          </div>
        </div>
      </div>
    </div>
          
    <div v-else>
      <div v-if="relationResults.length > 0" class="relation-result-content">
        <div class="relation-result-header">
          <el-tag type="success" size="large">
            共抽取到 {{ relationResults.length }} 条关系
          </el-tag>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="exportRelationResults">
              导出结果
            </el-button>
          </div>
        </div>
        
        <el-table
          :data="relationResults"
          border
          height="60vh"
          style="width: 100%"
        >
          <el-table-column
            prop="type"
            label="关系类型"
            width="110"
            align="center"
            sortable
          >
            <template #default="{row}">
              <el-tag :type="getRelationTagType(row.type)">
                {{ row.type }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="fromNode.value"
            label="源节点"
            width="150"
            sortable
          />
          <el-table-column
            prop="value"
            label="关系"
            width="120"
            align="center"
          />
          <el-table-column
            prop="toNode.value"
            label="目标节点"
            width="150"
            sortable
          />
          <el-table-column
            label="关系属性"
          >
            <template #default="{row}">
              <div class="properties-container">
                <div 
                  v-for="(value, key) in row.properties" 
                  :key="key"
                  class="property-item"
                >
                  <span class="property-key">{{ key }}:</span>
                  <span class="property-value">{{ value }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div v-else class="no-results">
        <el-empty description="没有找到关系抽取结果" />
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button 
          type="danger"
          @click="cancelRelationResults"
          :disabled="buttonsDisabled || relationExtractionLoading"
        >
          取消抽取结果
        </el-button>
        <el-button 
          type="primary"
          @click="relationResultDialogVisible = false"
          :disabled="buttonsDisabled || relationExtractionLoading"
        >
          确认
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
import { MagicStick, Cpu, VideoPlay, View, Position, CircleCheckFilled, Connection } from '@element-plus/icons-vue';
import { throttleFn_1 as throttleFn } from '@/common/debounceAndThrottle';
import userApi from '@/http/user.js';
import { useRoute } from 'vue-router'


// 表格相关数据
const loadingExtractSample = ref(false);
const loadingOperationData = ref(false);
const savingSelectedData = ref(false);
const totalSamples = ref(0);
const currUserName = ref("");
const selectedRows = ref([]);
const tableData = ref([]);
const dialogTableData = ref([]);
const router = useRouter();
const route = useRoute()
const multipleTable = ref(null);

const searchKeyword = ref('');
const loadingSearch = ref(false);

const layoutKey = ref(0)
const buttonsDisabled = ref(false);

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
  { value: 'temporal', label: '时序关系抽取' },
  { value: 'causal', label: '因果关系抽取' },
  { value: 'general', label: '通用关系抽取' },
])
const extractionLoading = ref(false);
const extractionProgress = ref(0);
const customColors = ref([
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 }
]);

const modelBase = ref('')
const modelBases = ref([
  { value: 'llm', label: 'LLM' },
  { value: 'bert', label: 'BERT' },
])

const projectId = ref(route.params.projectId)

// 新增的状态变量
const isNodeExtracted = ref(false);
const nodeResultDialogVisible = ref(false);
const nodeResults = ref([]);
const extractionMethodDialogVisible = ref(false);
const selectedExtractionMethod = ref('llm'); // 默认选择LLM

// 关系抽取相关状态
const relationExtractionLoading = ref(false);
const relationExtractionProgress = ref(0);
const relationResultDialogVisible = ref(false);
const relationResults = ref([]);
const showKgDialog = ref(false);
const network = ref(null);




// 导出节点结果
const exportNodeResults = () => {
  const exportData = nodeResults.value.map(node => ({
    "节点ID": node.id,
    "节点类型": node.type,
    "节点值": node.value,
    "节点键": node.key,
    ...node.properties
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '节点抽取结果');
  XLSX.writeFile(workbook, '节点抽取结果.xlsx');
  ElMessage.success('导出成功');
};


const showNodeResults = () => {
  if (nodeResults.value.length > 0) {
    buttonsDisabled.value = true;
    nodeResultDialogVisible.value = true; 
  } else {
    ElMessage.warning('没有可显示的节点结果');
  }
};


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


const fetchOperationData = throttleFn(async () => {
  if (loadingOperationData.value) return;
  loadingOperationData.value = true;
  try {
    const params = {
      page: dialogCurrentPage.value,  // 确保使用当前对话框的页码
      page_size: dialogPageSize.value // 确保使用当前对话框的页大小
    };
    console.log('Fetching operation data with params:', params); // 调试日志

    const res = await userApi.loadOperationData(params);

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
    id: row.id,
    title: row.title,
    content: row.content,
    date: row.date,
    stock_num: row.stock_num,
  };
  detailDialogVisible.value = true;
};


const handleDelete = async (rowsToDelete) => {
  if (!rowsToDelete || rowsToDelete.length === 0) {
    ElMessage.warning('请先选择要删除的数据');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${rowsToDelete.length} 条数据吗？`, 
      '删除确认', 
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const response = await userApi.deleteSelectedData({
      project_id: projectId.value,
      ids: rowsToDelete.map(row => row.id)
    });

    if (response.status === 200) { 

      await fetchExtractSample();
      // 清空选中项
      selectedRows.value = [];
      ElMessage.success('删除成功');
    } else {
      throw new Error(response.msg || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除错误详情:', error.response?.data || error.message);
      ElMessage.error(`删除失败: ${error.message}`);
    }
  }
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
  
  try {
    // 直接传递选中的行数据
    await saveSelectedData(selectedDialogRows.value);
    dialogVisible.value = false;
    ElMessage.success(`成功导入${selectedDialogRows.value.length}条数据`);
    selectedDialogRows.value = [];
    
  } catch (error) {
    console.error('导入失败:', error);
    ElMessage.error('数据导入失败，请重试');
  }
};


// 保存选中的数据
const saveSelectedData = async (dataToSave) => {
  if (savingSelectedData.value) return;
  savingSelectedData.value = true;
  
  try {
    // 只传递ID数组
    const params = {
      project_id: projectId.value,
      announcement_ids: dataToSave.map(item => item.id)
    };
    
    const res = await userApi.saveSelectData(params);
    
    if (res.status === 200) {
      // 保存成功后刷新表格数据
      await fetchExtractSample();
      return res.data;
    } else {
      throw new Error(res.msg || '导入失败');
    }
    
  } catch (error) {
    const errMsg = error?.response?.data?.msg || error.message || '该数据已导入';
    ElMessage.warning(errMsg);
    console.error('Error save selected data:', error);
    throw error;
  } finally {
    savingSelectedData.value = false;
  }
};


// 获取项目所有公告详细数据
const fetchExtractSample = throttleFn(async () => {
  if (loadingExtractSample.value) return;
  loadingExtractSample.value = true;
  try {
    // 使用新接口获取项目公告数据
    const res = await userApi.getProjectAnnouncements({
      project_id: projectId.value
    });
    
    tableData.value = (res.data || []).map((item, index) => ({
      index: index + 1,
      id: item.id || '',
      title: item.title || '',
      content: item.content || '',
      date: item.date || '',
      stock_num: item.stock_num || '',
    }));
    
    totalSamples.value = res.count || tableData.value.length;
    
  } catch (error) {
    const errMsg = error?.response?.data?.msg || error.message || '获取数据失败';
    ElMessage.error(errMsg);
    console.error('Error fetching extract samples:', error);
  } finally {
    loadingExtractSample.value = false;
  }
}, 500);


const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    fetchOperationData(); // 重新获取全部数据
    return;
  }
  
  const keyword = searchKeyword.value.trim();
  loadingSearch.value = true;
  
  try {
    const response = await userApi.searchAnnouncements({
      keyword: keyword,
      page: dialogCurrentPage.value,  // 使用对话框当前页码
      page_size: dialogPageSize.value // 使用对话框页大小
    });
    console.log('搜索结果:', response.data);

    dialogTableData.value = response.data.data || response.data || [];
    totalSamples.value = response.data.total || response.data.data?.total || 0;
  } catch (error) {
    ElMessage.error('搜索失败: ' + error.message);
  } finally {
    loadingSearch.value = false;
  }
};


const headerCellStyle = () => ({
  fontWeight: 'bold',
  fontSize: '15px',
  textAlign: 'center',
  lineHeight: '15px',
});


// 开始关系抽取
const startExtraction = async () => {
  if (!extractionMethod.value || !modelBase.value) {
    ElMessage.warning('请先选择抽取方法和模型基座');
    return;
  }

  try {
    relationExtractionLoading.value = true;
    relationExtractionProgress.value = 0;
    relationResultDialogVisible.value = true;
    
    // 调用API
    const response = await userApi.extractRelations({
      project_id: projectId.value,
      relation_type: extractionMethod.value,
      model_base: modelBase.value
    });

    if (response.data?.edges?.length > 0) {
      // 获取节点数据用于显示
      const nodesResponse = await userApi.getNodesByProject({
        project_id: projectId.value
      });
      
      const nodesMap = new Map();
      if (nodesResponse.data?.nodes) {
        nodesResponse.data.nodes.forEach(node => {
          nodesMap.set(node.id, node);
        });
      }
      
      // 处理关系结果
      relationResults.value = response.data.edges.map(edge => ({
        ...edge,
        fromNode: nodesMap.get(edge.from) || { value: '未知节点' },
        toNode: nodesMap.get(edge.to) || { value: '未知节点' },
        properties: typeof edge.properties === 'string' 
          ? JSON.parse(edge.properties || "{}") 
          : edge.properties || {}
      }));
      
      ElMessage.success(`成功抽取 ${relationResults.value.length} 条关系`);
    } else {
      ElMessage.warning('没有抽取到关系');
    }
    
  } catch (error) {
    console.error('API请求错误详情:', error);
    ElMessage.error(`关系抽取失败: ${error.message}`);
  } finally {
    relationExtractionLoading.value = false;
    relationExtractionProgress.value = 100;
  }
};


const getRelationTagType = (type) => {
  const typeMap = {
    '因果关系': 'danger',
    '时序关系': 'success',
    '通用关系': 'info'
  };
  return typeMap[type] || 'info';
};

const exportRelationResults = () => {
  const exportData = relationResults.value.map(rel => ({
    "关系类型": rel.type,
    "源节点": rel.fromNode.value,
    "关系": rel.value,
    "目标节点": rel.toNode.value,
    ...rel.properties
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '关系抽取结果');
  XLSX.writeFile(workbook, '关系抽取结果.xlsx');
  ElMessage.success('导出成功');
};


// 取消节点抽取
const cancelNodeResults = async () => {
  if (extractionLoading.value) {
    ElMessage.warning('正在抽取中，请稍候...');
    return;
  }
  
  await ElMessageBox.confirm('确定要取消当前抽取结果并删除所有节点数据吗？', '确认取消', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  });
  
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在删除节点数据...',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  
  const response = await userApi.deleteNodesByProject({
    project_id: projectId.value
  });
  
  loadingInstance.close();
  
  if (!response.success) {
    throw new Error(response.message || '删除节点失败');
  }
  
  isNodeExtracted.value = false;
  nodeResults.value = [];
  nodeResultDialogVisible.value = false;
  extractionProgress.value = 0;
  ElMessage.success('已取消抽取结果并删除节点数据');
};


// 打开抽取方法选择对话框
const openExtractionMethodDialog = () => {
  extractionMethodDialogVisible.value = true;
  // 提前打开结果对话框
  nodeResultDialogVisible.value = true;
};


// 确认选择的抽取方法
const confirmExtractionMethod = async () => {
  extractionMethodDialogVisible.value = false;
  
  // 确保对话框已经打开
  if (!nodeResultDialogVisible.value) {
    nodeResultDialogVisible.value = true;
  }
  
  if (selectedExtractionMethod.value === 'llm') {
    await extractNodesWithLLM();
  } else {
    await extractNodesWithAlgorithm();
  }
};


// 使用LLM抽取节点
const extractNodesWithLLM = async () => {
  extractionLoading.value = true;
  extractionProgress.value = 0;
  
  try {
    const response = await userApi.extractNodesWithLLM({
      project_id: projectId.value,
      announcement_ids: tableData.value.map(item => item.id)
    }, {
      onDownloadProgress: (progressEvent) => {
        // 处理流式数据
        const rawData = progressEvent.event.target.responseText;
        
        // 按行分割数据
        const lines = rawData.split('\n').filter(line => line.trim() !== '');
        
        // 处理每一行
        for (const line of lines) {
          try {
            const message = JSON.parse(line);
            
            // 更新进度
            if (message.progress !== undefined) {
              extractionProgress.value = message.progress;
            }
            
            // 处理完成状态
            if (message.status === 'complete') {
              processFinalNodes(message.data?.nodes || []);
            }
          } catch (e) {
            console.warn('解析进度消息失败:', e, '原始数据:', line);
          }
        }
      }
    });

    // 处理非流式响应（如果后端没有使用流式）
    if (response.data && typeof response.data === 'string') {
      const lines = response.data.split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        try {
          const message = JSON.parse(line);
          if (message.status === 'complete') {
            processFinalNodes(message.data?.nodes || []);
          }
        } catch (e) {
          console.warn('解析响应数据失败:', e);
        }
      }
    }
    
  } catch (error) {
    // 错误处理逻辑
    if (error.response) {
      // 尝试解析可能的多条JSON数据
      const rawData = error.response.data;
      if (typeof rawData === 'string') {
        const lines = rawData.split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          try {
            const message = JSON.parse(line);
            if (message.status === 'complete') {
              processFinalNodes(message.data?.nodes || []);
              return;
            }
          } catch (e) {
            console.warn('解析错误响应失败:', e);
          }
        }
      }
    }
    console.error('API请求错误详情:', error);

  } finally {
    extractionLoading.value = false;
  }
};



// 提取节点处理逻辑
const processFinalNodes = (nodes) => {
  nodeResults.value = nodes.map(node => ({
    id: node.id,
    type: node.type === 1 ? "事件" : "实体",
    value: node.value,
    key: node.key,
    properties: typeof node.properties === 'string' 
      ? JSON.parse(node.properties || "{}") 
      : node.properties || {}
  }));

  console.log('抽取结果:', nodeResults.value.map(node => node.type));
  
  isNodeExtracted.value = true;
  ElMessage.success('节点抽取成功');
};


// 使用算法抽取节点
const extractNodesWithAlgorithm = async () => {
  extractionLoading.value = true;
  extractionProgress.value = 0;
  
  try {
    // 模拟进度
    const simulateProgress = () => {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          extractionProgress.value += 5;
          if (extractionProgress.value >= 100) {
            clearInterval(interval);
            resolve(true);
          }
        }, 200);
      });
    };
    
    await simulateProgress();
    
    // 实际API调用
    // const response = await userApi.extractNodesWithAlgorithm({
    //   project_id: projectId.value,
    //   announcement_ids: tableData.value.map(item => item.id)
    // });
    
    // 模拟响应
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    ElMessage.warning('该功能暂未开放，敬请期待');
  } catch (error) {
    ElMessage.error(`算法抽取失败: ${error.message}`);
  } finally {
    extractionLoading.value = false;
    extractionProgress.value = 100;
    setTimeout(() => extractionProgress.value = 0, 500);
  }
};


const currentPageData = computed(() => {
  const start = (mainCurrentPage.value - 1) * mainPageSize.value
  const end = start + mainPageSize.value
  return tableData.value.slice(start, end)
})

// const viewResults = () => {
//     router.push({
//     name: 'visual-kg-page', // 使用路由名称跳转
//   })
// }

// 查看关系抽取结果
const viewResults = async () => {
  try {
    const loading = ElLoading.service({
      lock: true,
      text: '正在获取关系数据...',
      background: 'rgba(0, 0, 0, 0.7)'
    });
    
    // 获取关系数据
    const response = await userApi.getEdgesByProject({
      project_id: projectId.value
    });
    
    if (response.data?.edges?.length > 0) {
      // 获取节点数据用于显示
      const nodesResponse = await userApi.getNodesByProject({
        project_id: projectId.value
      });
      
      const nodesMap = new Map();
      if (nodesResponse.data?.nodes) {
        nodesResponse.data.nodes.forEach(node => {
          nodesMap.set(node.id, node);
        });
      }
      
      // 处理关系结果
      relationResults.value = response.data.edges.map(edge => ({
        ...edge,
        fromNode: nodesMap.get(edge.from) || { value: '未知节点' },
        toNode: nodesMap.get(edge.to) || { value: '未知节点' },
        properties: typeof edge.properties === 'string' 
          ? JSON.parse(edge.properties || "{}") 
          : edge.properties || {}
      }));
      
      relationResultDialogVisible.value = true;
    } else {
      ElMessage.warning('没有找到关系数据');
    }
    
    loading.close();
  } catch (error) {
    ElMessage.error(`获取关系数据失败: ${error.message}`);
    console.error('获取关系数据错误详情:', error);
  }
};


// 取消关系抽取结果
const cancelRelationResults = async () => {
  if (relationExtractionLoading.value) {
    ElMessage.warning('正在抽取中，请稍候...');
    return;
  }
  
  try {
    await ElMessageBox.confirm('确定要取消当前抽取结果并删除所有关系数据吗？', '确认取消', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '正在删除关系数据...',
      background: 'rgba(0, 0, 0, 0.7)'
    });
    
    // 调用API删除关系数据
    const response = await userApi.deleteEdgesByProject({
      project_id: projectId.value
    });
    
    loadingInstance.close();
    
    if (!response.success) {
      throw new Error(response.message || '删除关系失败');
    }
    
    relationResults.value = [];
    relationResultDialogVisible.value = false;
    relationExtractionProgress.value = 0;
    ElMessage.success('已取消抽取结果并删除关系数据');
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`取消关系抽取失败: ${error.message}`);
      console.error('取消关系抽取错误:', error);
    }
  }
};


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
  console.log('Received projectId:', projectId.value)
  if (projectId.value) {
    ElMessage.success(`接收到的项目ID：${projectId.value}`)
    await fetchExtractSample() // 使用新的数据获取方法
  }
  await getUserInfo()
  await fetchOperationData()
})


watch(projectId, async () => {
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

.extraction-method-container {
  padding: 20px;
}

.method-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
}

.el-radio {
  margin-bottom: 15px;
  width: 100%;
}

.el-radio:deep(.el-radio__label) {
  display: flex;
  align-items: center;
  width: 100%;
}

.el-dropdown {
  margin-left: 10px;
  
  .el-button {
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.el-dropdown-menu {
  .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    
    &.is-disabled {
      .el-icon, span {
        opacity: 0.5;
      }
    }
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  
  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    
    :deep(.el-progress-circle) {
      path:first-child {
        stroke: #f5f5f5;
      }
    }
    
    .loading-text {
      text-align: center;
      
      h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
        color: #606266;
      }
      
      p {
        margin: 0;
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

// 添加动画效果
@keyframes progress-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

:deep(.el-progress__text) {
  font-size: 18px !important;
  font-weight: bold;
  animation: progress-pulse 1.5s infinite;
}

// 当加载时模糊表格内容
.node-result-dialog {
  :deep(.el-dialog__body) {
    position: relative;
    
    > *:not(.loading-overlay) {
      transition: filter 0.3s ease;
    }
  }
  
  &.loading-active :deep(.el-dialog__body) {
    > *:not(.loading-overlay) {
      filter: blur(2px);
    }
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

.node-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  margin-top: 10px;

}

.header-actions {
  display: flex;
  gap: 10px;
}

.properties-container {
  max-height: 120px;
  overflow-y: auto;
  padding: 5px;
  
  .property-item {
    margin-bottom: 5px;
    display: flex;
    line-height: 1.5;
    
    .property-key {
      font-weight: bold;
      margin-right: 5px;
      color: var(--el-color-primary);
      min-width: 80px;
    }
    
    .property-value {
      color: var(--el-text-color-regular);
      word-break: break-all;
    }
  }
}

.node-result-dialog {
  :deep(.el-dialog__body) {
    padding-top: 10px;
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

// 新增样式
.node-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 0 10px;
}

.properties-container {
  max-height: 100px;
  overflow-y: auto;
  padding: 5px;
  
  .property-item {
    margin-bottom: 5px;
    line-height: 1.5;
    
    .property-key {
      font-weight: bold;
      margin-right: 5px;
      color: var(--el-color-primary);
    }
    
    .property-value {
      color: var(--el-text-color-regular);
    }
  }
}

.node-properties {
  .property-row {
    margin-bottom: 8px;
    line-height: 1.6;
    
    .property-label {
      font-weight: bold;
      color: var(--el-color-primary);
      margin-right: 8px;
    }
    
    .property-content {
      color: var(--el-text-color-regular);
    }
  }
}

.disabled-panel {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(2px);
    z-index: 1;
  }
  
  &::after {
    content: "请先完成节点抽取";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--el-color-primary);
    color: white;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 15px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 200px;
    text-align: center;
    line-height: 1.5;
    
    /* 添加图标 */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: 20px center;
    padding-left: 50px;
  }
  
  /* 卡片内容样式 */
  .card-header, 
  .card-content {
    filter: blur(1px);
    transition: filter 0.3s ease;
  }
  
  /* 禁用所有交互元素 */
  :deep(*) {
    pointer-events: none;
  }
}
// 新增样式
.node-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 0 10px;
}

.properties-container {
  max-height: 100px;
  overflow-y: auto;
  padding: 5px;
  
  .property-item {
    margin-bottom: 5px;
    line-height: 1.5;
    
    .property-key {
      font-weight: bold;
      margin-right: 5px;
      color: var(--el-color-primary);
    }
    
    .property-value {
      color: var(--el-text-color-regular);
    }
  }
}

.node-properties {
  .property-row {
    margin-bottom: 8px;
    line-height: 1.6;
    
    .property-label {
      font-weight: bold;
      color: var(--el-color-primary);
      margin-right: 8px;
    }
    
    .property-content {
      color: var(--el-text-color-regular);
    }
  }
}

.disabled-panel {
  opacity: 0.6;
  pointer-events: none;
  position: relative;
  
  &::after {
    content: "请先完成节点抽取";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--el-color-primary);
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 10;
  }
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

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  
  .loading-content {
    width: 80%;
    max-width: 500px;
    
    .progress-container {
      width: 100%;
      
      .linear-progress {
        margin-bottom: 20px;
        
        :deep(.el-progress-bar) {
          padding-right: 0;
          margin-right: 0;
        }
        
        :deep(.el-progress-bar__outer) {
          height: 18px;
          border-radius: 9px;
          background-color: #f5f5f5;
        }
        
        :deep(.el-progress-bar__inner) {
          border-radius: 9px;
          transition: width 0.3s ease;
        }
      }
      
      .progress-text {
        text-align: center;
        
        h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: #606266;
        }
        
        p {
          margin: 0;
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
}



/* 确保关系抽取对话框的样式一致 */
.relation-result-dialog {
  :deep(.el-dialog__body) {
    padding-top: 10px;
  }
}

.relation-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 0 10px;
}

.properties-container {
  max-height: 100px;
  overflow-y: auto;
  padding: 5px;
  
  .property-item {
    margin-bottom: 5px;
    line-height: 1.5;
    
    .property-key {
      font-weight: bold;
      margin-right: 5px;
      color: var(--el-color-primary);
    }
    
    .property-value {
      color: var(--el-text-color-regular);
    }
  }
}

.no-results {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.relation-result-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

</style>