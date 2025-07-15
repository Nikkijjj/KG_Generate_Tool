<template>
  <div class="page-container">
    <div class="kg-card">
      <h1 class="kg-title">可视化知识图谱</h1>
      
      <div class="kg-content">
        <!-- 左侧可视化区域 -->
        <div class="kg-visualization">
          <div class="visualization-container" ref="graphContainer"></div>
        </div>
        
<!-- 右侧详细信息区域 -->
<div class="kg-details">
  <el-card class="details-card">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <el-button 
            v-if="showBackButton" 
            @click="handleBackClick"
            size="small"
            circle
            class="back-button"
          >
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <span>{{ selectedItem ? selectedItem.label : '未选择项目' }}</span>
        </div>
        <el-tag v-if="selectedItem" :type="getTagType(selectedItem)">
          {{ selectedItem.group || selectedItem.type || '关系' }}
        </el-tag>
      </div>
    </template>
      
    <div v-if="selectedItem">
      <!-- 基本信息展示 -->
      <div class="basic-info">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="类型">
            {{ selectedItem.type || selectedItem.group || '未知' }}
          </el-descriptions-item>
          <el-descriptions-item label="名称">
            {{ selectedItem.label || '未命名' }}
          </el-descriptions-item>
          <el-descriptions-item 
            v-for="(value, key) in selectedItem.properties" 
            :key="key" 
            :label="key">
            {{ value || '无' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 关系展示区域 -->
      <div v-if="relatedRelations.length > 0 && selectedItem.id" class="relations-section">
        <el-divider />
        <h4 class="relations-title">相关关系</h4>
        
        <div class="relations-container">
          <el-card 
            v-for="rel in relatedRelations" 
            :key="rel.id"
            class="relation-card"
            shadow="hover"
            @click="handleRelationClick(rel)"
          >
            <div class="relation-header">
              <el-tag size="small" :type="getRelationTagType(rel)">
                {{ rel.label }}
              </el-tag>
              <span class="relation-direction">
                {{ rel.fromLabel }} → {{ rel.toLabel }}
              </span>
            </div>
            
            <div v-if="rel.properties" class="relation-properties">
              <div 
                v-for="(val, propKey) in rel.properties" 
                :key="propKey"
                class="property-item"
              >
                <span class="property-key">{{ propKey }}:</span>
                <span class="property-value">{{ val }}</span>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <el-icon :size="50" color="#909399"><InfoFilled /></el-icon>
      <p>请点击图谱中节点或关系查看详细信息</p>
    </div>
  </el-card>
</div>
      </div>

      <div class="question-button-container">
        <!-- <el-button 
          type="primary" 
          size="large" 
          class="question-button"
          @click="handleQuestionClick"
        >
          <el-icon><ChatDotRound /></el-icon>
          向AI问答助手提问
        </el-button> -->

        <el-button 
          type="success" 
          size="large" 
          class="export-button"
          @click="showExportDialog = true"
        >
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 导出对话框 -->
    <el-dialog 
      v-model="showExportDialog" 
      title="导出知识图谱" 
      width="600px"
      align-center
    >
      <el-form label-position="top" class="dialog-form-center">
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportFormat">
            <el-radio label="png">PNG图片</el-radio>
            <el-radio label="csv">CSV文件</el-radio>
            <el-radio label="json">JSON文件</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="文件名">
          <el-input v-model="exportFileName" placeholder="请输入文件名(不带后缀)" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showExportDialog = false">取消</el-button>
        <el-button type="primary" @click="handleExport">确认导出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { Network } from 'vis-network'
import 'vis-network/styles/vis-network.css'
import { InfoFilled, ChatDotRound, ArrowLeft, Download } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { DataSet } from 'vis-data';
import userApi from '@/http/user.js';

const router = useRouter()
const route = useRoute()
const projectId = ref(route.query.projectId as string)

const graphContainer = ref<HTMLElement | null>(null)
const selectedItem = ref<any>(null)
const relatedRelations = ref<any[]>([])
const showBackButton = ref(false)
const previousSelectedItem = ref<any>(null)

// 导出相关状态
const showExportDialog = ref(false)
const exportFormat = ref('png')
const exportFileName = ref('knowledge_graph')
const networkInstance = ref<Network | null>(null)

const EVENT_COLORS = {
  background: '#FF6B6B',
  border: '#D63031',
  highlightBackground: '#FF8E8E',
  hoverBackground: '#FF8E8E'
};

const ENTITY_COLORS = {
  background: '#4ECDC4',
  border: '#00B894',
  highlightBackground: '#7EEDD2',
  hoverBackground: '#7EEDD2'
};


// 获取图谱数据
const fetchGraphData = async () => {
  try {
    // 获取节点数据
    const nodesResponse = await userApi.getNodesByProject({ project_id: projectId.value })
    const nodes = nodesResponse.data?.nodes || []
    
    // 获取边数据
    const edgesResponse = await userApi.getEdgesByProject({ project_id: projectId.value })
    const edges = edgesResponse.data?.edges || []
    
    return { nodes, edges }
  } catch (error) {
    console.error('获取图谱数据失败:', error)
    ElMessage.error('获取图谱数据失败')
    return { nodes: [], edges: [] }
  }
}

onMounted(async () => {
  const { nodes, edges } = await fetchGraphData()
  initKnowledgeGraph(nodes, edges)
})

// 初始化知识图谱
const initKnowledgeGraph = (nodes: any[], edges: any[]) => {
  console.group('初始化知识图谱')
  console.log('节点数据:', nodes)
  console.log('关系数据:', edges)
  
  // 使用 DataSet 处理节点数据
  const nodesDataset = new DataSet(
    nodes.map((node: any) => {
      const isEvent = node.type === '1' // 判断是否为事件类型
      console.log('节点类型:', node.type, isEvent)
      
      return {
        id: node.id,
        label: node.value || node.label || `节点 ${node.id}`,
        group: node.type === '1' ? '事件' : '实体',
        title: formatTooltip(node),
        color: {
          background: isEvent ? EVENT_COLORS.background : ENTITY_COLORS.background,
          border: isEvent ? EVENT_COLORS.border : ENTITY_COLORS.border,
          highlight: {
            background: isEvent ? EVENT_COLORS.highlightBackground : ENTITY_COLORS.highlightBackground,
            border: isEvent ? EVENT_COLORS.border : ENTITY_COLORS.border
          },
          hover: {
            background: isEvent ? EVENT_COLORS.hoverBackground : ENTITY_COLORS.hoverBackground,
            border: isEvent ? EVENT_COLORS.border : ENTITY_COLORS.border
          }
        },
        shape: 'dot',
        size: 20,
        borderWidth: 2,
        physics: true,
        fixed: false,
        properties: node.properties || {},
        type: node.type === 1 ? '事件' : '实体'
      }
    })
  )

  // 使用 DataSet 处理边数据
  const edgesDataset = new DataSet(
    edges.map((edge: any) => {
      return {
        id: edge.id,
        from: edge.from,
        to: edge.to,
        label: edge.value || edge.label || `关系 ${edge.id}`,
        title: formatTooltip(edge),
        arrows: 'to',
        smooth: true,
        width: 2,
        properties: edge.properties || {},
        color: { color: '#909399', highlight: '#409EFF' },
        physics: true,
        springLength: 150,
        length: 150
      }
    })
  )
  
  console.log('转换后的节点:', nodesDataset.get())
  console.log('转换后的关系:', edgesDataset.get())
  console.groupEnd()

  // 创建知识图谱网络实例
  const network = new Network(
    graphContainer.value,
    { nodes: nodesDataset, edges: edgesDataset },
    {
      layout: {
        improvedLayout: true
      },
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 150,
          springConstant: 0.01,
          damping: 0.09,
          avoidOverlap: 0.5
        },
        minVelocity: 0.5,
        stabilization: {
          enabled: true,
          iterations: 1000,
          fit: true
        },
        solver: 'barnesHut'
      },
      interaction: {
        dragNodes: true,
        hover: true,
        tooltipDelay: 200,
        multiselect: false,
        hideEdgesOnDrag: false,
        hideNodesOnDrag: false
      },
      nodes: {
        physics: true
      }
    }
  )

  // 点击事件处理
  network.on("click", async (params) => {
    showBackButton.value = false;

    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      // 从当前网络数据中查找节点
      const nodeData = nodesDataset.get(nodeId);
      if (nodeData) {
        previousSelectedItem.value = selectedItem.value;
        selectedItem.value = { 
          ...nodeData,
          type: nodeData.group || '节点',
          label: nodeData.label || nodeData.value || `节点 ${nodeData.id}`,
          properties: nodeData.properties || {}
        };
        updateRelatedRelations(nodeId, 'node', edgesDataset);
      }
    } else if (params.edges.length > 0) {
      const edgeId = params.edges[0];
      // 从当前网络数据中查找边
      const edgeData = edgesDataset.get(edgeId);
      if (edgeData) {
        previousSelectedItem.value = selectedItem.value;
        // 获取关联的节点信息
        const fromNode = nodesDataset.get(edgeData.from);
        const toNode = nodesDataset.get(edgeData.to);
        
        selectedItem.value = { 
          ...edgeData,
          label: edgeData.label || edgeData.value || `关系 ${edgeData.id}`,
          type: '关系',
          fromLabel: fromNode?.label || edgeData.from,
          toLabel: toNode?.label || edgeData.to,
          properties: edgeData.properties || {}
        };
        updateRelatedRelations(edgeId, 'edge', edgesDataset);
      }
    } else {
      // 点击空白处清空选择
      selectedItem.value = null;
      relatedRelations.value = [];
    }
  });

  networkInstance.value = network;
};

// 更新相关关系函数
const updateRelatedRelations = (id: any, type: 'node' | 'edge', edgesDataset: DataSet) => {
  if (type === 'node') {
    // 查找与该节点相关的所有边
    const relatedEdges = edgesDataset.get({
      filter: (edge) => edge.from === id || edge.to === id
    });
    
    // 获取节点数据
    const nodesDataset = networkInstance.value?.body.data.nodes;
    if (!nodesDataset) {
      relatedRelations.value = [];
      return;
    }
    
    relatedRelations.value = relatedEdges.map(edge => {
      const isFrom = edge.from === id;
      const otherNodeId = isFrom ? edge.to : edge.from;
      const otherNode = nodesDataset.get(otherNodeId);
      const currentNode = nodesDataset.get(id);
      
      return {
        ...edge,
        id: edge.id.toString(),
        label: edge.label || `关系 ${edge.id}`,
        fromLabel: isFrom ? currentNode?.label || edge.from : otherNode?.label || edge.from,
        toLabel: isFrom ? otherNode?.label || edge.to : currentNode?.label || edge.to,
        direction: isFrom ? 'out' : 'in',
        properties: edge.properties || {}
      };
    });
  } else {
    // 如果是关系点击，直接显示该关系
    const edge = edgesDataset.get(id);
    if (edge) {
      // 获取节点数据
      const nodesDataset = networkInstance.value?.body.data.nodes;
      if (!nodesDataset) {
        relatedRelations.value = [];
        return;
      }
      
      const fromNode = nodesDataset.get(edge.from);
      const toNode = nodesDataset.get(edge.to);
      
      relatedRelations.value = [{
        ...edge,
        id: edge.id.toString(),
        label: edge.label || `关系 ${edge.id}`,
        fromLabel: fromNode?.label || edge.from,
        toLabel: toNode?.label || edge.to,
        properties: edge.properties || {}
      }];
    } else {
      relatedRelations.value = [];
    }
  }
};


// 添加类型标签样式函数
const getTagType = (item: any) => {
  const typeMap: Record<string, string> = {
    '事件': 'danger',
    '实体': 'success',
    '关系': 'info'
  };
  
  return typeMap[item.type] || '';
};

const getRelationTagType = (rel: any) => {
  if (!rel || !rel.type) return 'info'; // 默认返回 info 类型
  
  const type = String(rel.type); // 确保 type 是字符串
  
  if (type.includes('因果')) return 'danger';
  if (type.includes('时序')) return 'warning';
  return 'info';
}

const handleRelationClick = (relation: any) => {
  previousSelectedItem.value = selectedItem.value;
  selectedItem.value = {
    ...relation,
    type: '关系',
    fromLabel: relation.fromLabel,
    toLabel: relation.toLabel
  };
  showBackButton.value = true;
  
  // 更新相关关系
  const edgesDataset = networkInstance.value?.body.data.edges
  if (edgesDataset) {
    updateRelatedRelations(relation.id, 'edge', edgesDataset)
  }
};

// 导出处理函数
const handleExport = () => {
  switch (exportFormat.value) {
    case 'png':
      exportAsPNG()
      break
    case 'csv':
      exportAsCSV()
      break
    case 'json':
      exportAsJSON()
      break
  }
  showExportDialog.value = false
}

// 导出为PNG
const exportAsPNG = () => {
  if (!networkInstance.value) {
    ElMessage.error('无法获取图谱实例')
    return
  }
  
  try {
    // 获取canvas元素
    const canvas = graphContainer.value?.querySelector('canvas')
    if (!canvas) {
      ElMessage.error('无法获取画布元素')
      return
    }
    
    // 创建临时链接
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `${exportFileName.value}.png`
    link.href = dataUrl
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('导出PNG成功')
  } catch (error) {
    ElMessage.error('导出PNG失败')
    console.error(error)
  }
}

// 导出为CSV
const exportAsCSV = async () => {
  try {
    // 获取当前图谱数据
    const { nodes, edges } = await fetchGraphData()
    
    // 添加 UTF-8 BOM 头
    const BOM = '\uFEFF';
    let csvContent = BOM + "类型,ID,标签,分组,属性\n";
    
    // 导出节点
    nodes.forEach(node => {
      const properties = node.properties ? Object.entries(node.properties).map(([k, v]) => `${k}=${v}`).join(';') : '';
      csvContent += `${node.type === 1 ? '事件' : '实体'},${node.id},${node.value},${node.type === 1 ? '事件' : '实体'},"${properties}"\n`;
    });
    
    // 导出边
    edges.forEach(edge => {
      const properties = edge.properties ? Object.entries(edge.properties).map(([k, v]) => `${k}=${v}`).join(';') : '';
      csvContent += `边,${edge.id},${edge.value},${edge.type},"${properties}",${edge.from},${edge.to}\n`;
    });
    
    // 使用 charset=utf-8 和 BOM
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${exportFileName.value}.csv`;
    link.click();
    ElMessage.success('导出CSV成功');
  } catch (error) {
    ElMessage.error('导出CSV失败');
    console.error(error);
  }
};

// 导出为JSON
const exportAsJSON = async () => {
  try {
    // 获取当前图谱数据
    const { nodes, edges } = await fetchGraphData()
    const dataToExport = { nodes, edges }
    
    const dataStr = JSON.stringify(dataToExport, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${exportFileName.value}.json`
    link.click()
    ElMessage.success('导出JSON成功')
  } catch (error) {
    ElMessage.error('导出JSON失败')
    console.error(error)
  }
}

const formatTooltip = (item: any) => {
  let tooltip = `${item.label}`
  if (item.properties) {
    for (const [key, value] of Object.entries(item.properties)) {
      tooltip += `\n${key}: ${value}`
    }
  }
  return tooltip
}

// const handleQuestionClick = () => { 
//   router.push({
//     name: 'ask-ai',
//     query: { projectId: projectId.value }
//   })
// }

const handleBackClick = () => {
  selectedItem.value = previousSelectedItem.value
  showBackButton.value = false
}
</script>

<style scoped lang="scss">
.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background-color: #f0f2f5;
}

.kg-card {
  width: 100%;
  max-width: 1000px;
  background-color: #ffffff;
  border-radius: 5px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.kg-title {
  color: #303133;
  text-align: center;
  margin: 0;
  font-size: 1.75rem;
  font-weight: bold;
}

.kg-content {
  display: flex;
  height: 500px;
  gap: 1.5rem;

  .kg-visualization {
    flex: 3;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    overflow: hidden;
    border: 1px solid #ebeef5;
    
    .visualization-container {
      width: 100%;
      height: 100%;
    }
  }

  .kg-details {
    flex: 2;
    min-width: 350px;
    
    .details-card {
      height: 100%;
      
      :deep(.el-card__body) {
        padding: 16px;
        height: calc(100% - 60px);
        overflow-y: auto;
      }
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .back-button {
            margin-right: 8px;
          }
        }
      }
    }
    
    .basic-info {
      margin-bottom: 16px;
      
      :deep(.el-descriptions) {
        width: 100%;
        
        .el-descriptions-item__label {
          width: 120px;
          font-weight: bold;
          background-color: #f5f7fa;
        }
        
        .el-descriptions-item__content {
          padding: 12px;
        }
      }
    }
    
    .relations-section {
      margin-top: 16px;
      
      .relations-title {
        margin: 0 0 16px 0;
        color: #606266;
        font-size: 16px;
      }
      
      .relations-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .relation-card {
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        :deep(.el-card__body) {
          padding: 12px;
        }
        
        .relation-header {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          gap: 8px;
          
          .relation-direction {
            font-size: 14px;
            color: #606266;
          }
        }
        
        .relation-properties {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 8px;
          
          .property-item {
            display: flex;
            font-size: 13px;
            
            .property-key {
              color: #909399;
              margin-right: 4px;
              font-weight: bold;
            }
            
            .property-value {
              color: #606266;
              word-break: break-word;
            }
          }
        }
      }
    }
    
    .empty-state {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: #909399;
      
      .el-icon {
        margin-bottom: 16px;
      }
      
      p {
        margin: 0;
        font-size: 14px;
      }
    }
  }
}

.form-section {
  margin-top: 16px;
  
  .form-title {
    margin: 0 0 16px 0;
    color: #606266;
    font-size: 16px;
  }
  
  .property-form {
    .el-form-item {
      margin-bottom: 16px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-start;
      gap: 10px;
    }
  }
}

.question-button-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 20px;
  
  .question-button, .export-button {
    width: 220px;
    font-size: 1rem;
    height: 48px;
    
    .el-icon {
      margin-right: 8px;
    }
  }
}

.dialog-form-center {
  text-align: center;
}
.dialog-form-center .el-form-item {
  display: inline-block;
  margin-right: 10px;
}
.dialog-form-center .el-radio-group,
.dialog-form-center .el-input {
  text-align: left; /* 保持内部元素左对齐 */
}

@media (max-width: 768px) {
  .question-button-container {
    flex-direction: column;
    align-items: center;
    
    .question-button, .export-button {
      width: 100%;
      margin-bottom: 10px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
@media (max-width: 1200px) {
  .kg-card {
    padding: 1.5rem;
  }
  
  .kg-content {
    flex-direction: column;
    height: auto;
    
    .kg-visualization {
      height: 500px;
    }
    
    .kg-details {
      min-width: 100%;
    }
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }
  
  .kg-card {
    padding: 1rem;
    border-radius: 12px;
  }
  
  .kg-title {
    font-size: 1.5rem;
  }
  
  .kg-content .kg-visualization {
    height: 400px;
  }
}
</style>