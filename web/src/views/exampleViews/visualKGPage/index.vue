<template>
  <div class="page-container">
    <!-- 侧边栏按钮 -->
    <div class="toggle-button" @click="sidebarVisible = !sidebarVisible">
      <el-icon style="color: #000; margin-right: 4px;">
        <ChatDotRound />
      </el-icon>
    </div>

    <div class="main-wrapper">
      <div class="kg-card">
        <h1 class="kg-title">可视化知识图谱</h1>

        <div class="kg-content">
          <div class="kg-visualization">
            <div class="visualization-container" ref="graphContainer"></div>
          </div>

          <div class="kg-details">
            <el-card class="details-card">
              <template #header>
                <div class="card-header">
                  <div class="header-left">
                    <el-button v-if="showBackButton" @click="handleBackClick" size="small" circle class="back-button">
                      <el-icon>
                        <ArrowLeft />
                      </el-icon>
                    </el-button>
                    <span>{{ selectedItem ? selectedItem.label : '未选择项目' }}</span>
                  </div>
                  <el-tag v-if="selectedItem" :type="getTagType(selectedItem)">
                    {{ selectedItem.group || '关系' }}
                  </el-tag>
                </div>
              </template>

              <div v-if="selectedItem">
                <el-form label-position="top" class="details-form">
                  <el-form-item v-for="(value, key) in selectedItem.properties" :key="key" :label="key">
                    <el-input v-model="selectedItem.properties[key]" readonly />
                  </el-form-item>

                  <template v-if="selectedItem.group === '公告'">
                    <el-divider />
                    <el-tabs v-model="activeRelationTab">
                      <el-tab-pane label="公告间关系" name="between">
                        <el-timeline>
                          <el-timeline-item v-for="rel in betweenAnnouncementRelations" :key="rel.id"
                            :timestamp="rel.timestamp" placement="top">
                            <el-card @click="handleRelationClick(rel)" shadow="hover" style="padding: 12px">
                              <p>
                              <div><el-tag size="small">{{ rel.label }}</el-tag></div>
                              <div>{{ rel.toLabel }}</div>
                              </p>
                              <div v-if="rel.properties">
                                <el-tag v-for="(val, propKey) in rel.properties" :key="propKey" type="info" size="small"
                                  style="margin: 0 8px 8px 0">
                                  {{ propKey }}: {{ val }}
                                </el-tag>
                              </div>
                            </el-card>
                          </el-timeline-item>
                        </el-timeline>
                      </el-tab-pane>
                      <el-tab-pane label="公告内部关系" name="internal">
                        <el-timeline>
                          <el-timeline-item v-for="rel in internalAnnouncementRelations" :key="rel.id" placement="top">
                            <el-card @click="handleRelationClick(rel)" shadow="hover" style="padding: 12px">
                              <p>
                              <div><el-tag size="small">{{ rel.label }}</el-tag></div>
                              <div>{{ rel.toLabel }}</div>
                              </p>
                              <div v-if="rel.properties">
                                <el-tag v-for="(val, propKey) in rel.properties" :key="propKey" type="info" size="small"
                                  style="margin: 0 8px 8px 0">
                                  {{ propKey }}: {{ val }}
                                </el-tag>
                              </div>
                            </el-card>
                          </el-timeline-item>
                        </el-timeline>
                      </el-tab-pane>
                    </el-tabs>
                  </template>

                  <template v-else-if="relatedRelations.length > 0">
                    <el-divider />
                    <h4 style="margin: 16px 0 8px; color: #606266">相关关系</h4>
                    <el-timeline>
                      <el-timeline-item v-for="rel in relatedRelations" :key="rel.id" :timestamp="rel.timestamp"
                        placement="top">
                        <el-card @click="handleRelationClick(rel)" shadow="hover" style="padding: 12px">
                          <p>
                          <div><el-tag size="small">{{ rel.label }}</el-tag></div>
                          <div>{{ rel.fromLabel }} → {{ rel.toLabel }}</div>
                          </p>
                          <div v-if="rel.properties">
                            <el-tag v-for="(val, propKey) in rel.properties" :key="propKey" type="info" size="small"
                              style="margin: 0 8px 8px 0">
                              {{ propKey }}: {{ val }}
                            </el-tag>
                          </div>
                        </el-card>
                      </el-timeline-item>
                    </el-timeline>
                  </template>
                </el-form>
              </div>

              <div v-else class="empty-state">
                <el-icon :size="50" color="#909399">
                  <InfoFilled />
                </el-icon>
                <p>请点击图谱中节点或关系查看详细信息</p>
              </div>
            </el-card>
          </div>
        </div>

        <div class="button-container">
          <el-button type="primary" size="large" @click="handleQuestionClick">
            <el-icon>
              <ChatDotRound />
            </el-icon>
            向AI问答助手提问
          </el-button>

          <el-button type="success" size="large" @click="showExportDialog = true">
            <el-icon>
              <Download />
            </el-icon>
            导出
          </el-button>
        </div>
      </div>

      <transition name="slide-fade">
        <div v-if="sidebarVisible" class="side-panel">
          <splitpanes horizontal>
            <pane min-size="15">
              <h3 style="margin-bottom: 10px">搜图谱</h3>
              <p>这里放置上半部分内容，例如说明文档</p>
            </pane>
            <pane min-size="50">
              <h3 style="margin-bottom: 10px">问AI助手</h3>
              <AskAi :param="projectId" />
            </pane>
          </splitpanes>
        </div>
      </transition>
    </div>

    <el-dialog v-model="showExportDialog" title="导出知识图谱" width="600px" align-center>
      <el-form label-position="top" style="text-align: center">
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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import AskAi from '@/views/exampleViews/askAi/index.vue';

// TODO 项目ID还没设置
const projectId = ref("96050996")

const sidebarVisible = ref(false)

const router = useRouter()
const graphContainer = ref<HTMLElement | null>(null)
const selectedItem = ref<any>(null)
const relatedRelations = ref<any[]>([])
const showBackButton = ref(false)
const previousSelectedItem = ref<any>(null)

const activeRelationTab = ref('between')
const betweenAnnouncementRelations = ref<any[]>([])
const internalAnnouncementRelations = ref<any[]>([])

const showExportDialog = ref(false)
const exportFormat = ref('png')
const exportFileName = ref('knowledge_graph')
const networkInstance = ref<Network | null>(null)

const mockData = {
  nodes: [],
  edges: []
}

const initKnowledgeGraph = () => {
  if (!graphContainer.value) return

  const nodes = mockData.nodes.map(node => ({
    id: node.id,
    label: node.label,
    group: node.group,
    title: formatTooltip(node),
    color: getNodeColor(node.group),
    shape: 'dot',
    size: 20,
    borderWidth: 2,
    properties: node.properties
  }))

  const edges = mockData.edges.map(edge => ({
    id: edge.id,
    from: edge.from,
    to: edge.to,
    label: edge.label,
    title: formatTooltip(edge),
    arrows: 'to',
    smooth: true,
    width: 2,
    properties: edge.properties,
    color: { color: '#909399', highlight: '#409EFF' }
  }))

  networkInstance.value = new Network(
    graphContainer.value,
    { nodes, edges },
    {
      layout: { improvedLayout: true },
      physics: {
        barnesHut: { gravitationalConstant: -3000, centralGravity: 0, springLength: 200 },
        minVelocity: 0.75
      },
      interaction: { hover: true, tooltipDelay: 200, multiselect: false }
    }
  )

  networkInstance.value.on("click", (params) => {
    showBackButton.value = false
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0]
      const node = mockData.nodes.find(n => n.id === nodeId)
      if (node) {
        selectedItem.value = { ...node }
        updateRelatedRelations(nodeId, 'node')
      }
    } else if (params.edges.length > 0) {
      const edgeId = params.edges[0]
      const edge = mockData.edges.find(e => e.id === parseInt(edgeId))
      if (edge) {
        selectedItem.value = {
          ...edge,
          label: edge.label,
          fromLabel: mockData.nodes.find(n => n.id === edge.from)?.label || edge.from,
          toLabel: mockData.nodes.find(n => n.id === edge.to)?.label || edge.to
        }
        updateRelatedRelations(edgeId, 'edge')
      }
    }
  })
}

const calculateDayDifference = (date1: string, date2: string) => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = d2.getTime() - d1.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "同一天"
  if (diffDays > 0) return `${diffDays}天后`
  return `${Math.abs(diffDays)}天前`
}

const updateRelatedRelations = (id: any, type: 'node' | 'edge') => {
  if (type === 'node') {
    const node = mockData.nodes.find(n => n.id === id)
    if (node?.group === '公告') {
      const currentDate = node.properties?.发布时间
      betweenAnnouncementRelations.value = mockData.edges
        .filter(edge =>
          (edge.from === id && mockData.nodes.find(n => n.id === edge.to)?.group === '公告') ||
          (edge.to === id && mockData.nodes.find(n => n.id === edge.from)?.group === '公告')
        )
        .flatMap(edge => {
          const targetNodeId = edge.from === id ? edge.to : edge.from
          const targetNode = mockData.nodes.find(n => n.id === targetNodeId)
          const targetDate = targetNode?.properties?.发布时间
          let relationLabel = edge.label
          if (edge.label === "时间顺序" && currentDate && targetDate) {
            relationLabel = `时间顺序 (${calculateDayDifference(currentDate, targetDate)})`
          }
          return {
            ...edge,
            label: relationLabel,
            fromLabel: mockData.nodes.find(n => n.id === edge.from)?.label || edge.from,
            toLabel: mockData.nodes.find(n => n.id === edge.to)?.label || edge.to,
            timestamp: targetDate || edge.properties?.时间点 || '无日期信息',
            rawDate: targetDate || edge.properties?.时间点,
            uniqueKey: `${edge.id}_${targetNodeId}`
          }
        })
        .sort((a, b) => (a.rawDate > b.rawDate ? 1 : -1))

      internalAnnouncementRelations.value = mockData.edges
        .filter(edge => edge.from === id || edge.to === id)
        .filter(edge => !betweenAnnouncementRelations.value.some(bRel => bRel.id === edge.id))
        .map(edge => ({
          ...edge,
          fromLabel: mockData.nodes.find(n => n.id === edge.from)?.label || edge.from,
          toLabel: mockData.nodes.find(n => n.id === edge.to)?.label || edge.to
        }))
    } else {
      relatedRelations.value = mockData.edges
        .filter(edge => edge.from === id || edge.to === id)
        .map(edge => {
          const isFrom = edge.from === id
          const otherNodeId = isFrom ? edge.to : edge.from
          const otherNode = mockData.nodes.find(n => n.id === otherNodeId)
          return {
            ...edge,
            fromLabel: isFrom ? node?.label || edge.from : otherNode?.label || edge.from,
            toLabel: isFrom ? otherNode?.label || edge.to : node?.label || edge.to,
            timestamp: edge.properties?.时间 || otherNode?.properties?.发布时间 || '未知时间',
            direction: isFrom ? 'out' : 'in'
          }
        })
      betweenAnnouncementRelations.value = []
      internalAnnouncementRelations.value = []
    }
  } else {
    betweenAnnouncementRelations.value = []
    internalAnnouncementRelations.value = []
  }
}

const handleRelationClick = (rel: any) => {
  if (selectedItem.value && selectedItem.value.group) {
    previousSelectedItem.value = selectedItem.value
  }
  if (rel.label === "时间顺序") {
    const fromNode = mockData.nodes.find(n => n.id === rel.from)
    const toNode = mockData.nodes.find(n => n.id === rel.to)
    if (fromNode?.properties?.发布时间 && toNode?.properties?.发布时间) {
      rel.label = `时间顺序 (${calculateDayDifference(fromNode.properties.发布时间, toNode.properties.发布时间)})`
    }
  }
  selectedItem.value = { ...rel, label: rel.label }
  showBackButton.value = true
}

const handleExport = () => {
  switch (exportFormat.value) {
    case 'png': exportAsPNG(); break
    case 'csv': exportAsCSV(); break
    case 'json': exportAsJSON(); break
  }
  showExportDialog.value = false
}

const exportAsPNG = () => {
  if (!networkInstance.value) {
    ElMessage.error('无法获取图谱实例')
    return
  }
  try {
    const canvas = graphContainer.value?.querySelector('canvas')
    if (!canvas) {
      ElMessage.error('无法获取画布元素')
      return
    }
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `${exportFileName.value}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success('导出PNG成功')
  } catch (error) {
    ElMessage.error('导出PNG失败')
    console.error(error)
  }
}

const exportAsCSV = () => {
  try {
    let csvContent = "类型,ID,标签,分组,属性\n"
    mockData.nodes.forEach(node => {
      const properties = node.properties ? Object.entries(node.properties).map(([k, v]) => `${k}=${v}`).join(';') : ''
      csvContent += `节点,${node.id},${node.label},${node.group || ''},"${properties}"\n`
    })
    mockData.edges.forEach(edge => {
      const properties = edge.properties ? Object.entries(edge.properties).map(([k, v]) => `${k}=${v}`).join(';') : ''
      csvContent += `边,${edge.id},${edge.label},,"${properties}",${edge.from},${edge.to}\n`
    })
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${exportFileName.value}.csv`
    link.click()
    ElMessage.success('导出CSV成功')
  } catch (error) {
    ElMessage.error('导出CSV失败')
    console.error(error)
  }
}

const exportAsJSON = () => {
  try {
    const dataStr = JSON.stringify(mockData, null, 2)
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

const getNodeColor = (type: string) => {
  const colors: Record<string, string> = {
    '公告': '#FF6B6B',
    '政策': '#4ECDC4',
    '企业': '#45B7D1',
    '人物': '#FFA07A',
    '项目': '#98D8C8',
    '机构': '#A4B0BE',
    '法规': '#C5A3FF',
    'default': '#A4B0BE'
  }
  return colors[type] || colors.default
}

const getTagType = (item: any) => {
  if (item.group) {
    const types: Record<string, string> = {
      '公告': 'danger',
      '政策': 'success',
      '企业': 'primary',
      '人物': 'warning',
      '项目': 'info',
      '法规': 'success'
    }
    return types[item.group] || ''
  }
  return 'danger'
}

const handleQuestionClick = () => {
  router.push({ name: 'ask-ai' })
}

const handleBackClick = () => {
  selectedItem.value = previousSelectedItem.value
  showBackButton.value = false
}

onMounted(() => {
  initKnowledgeGraph()
})
</script>

<style scoped lang="scss">
.page-container {
  display: flex;
  justify-content: center;
  padding: 10px;
  background-color: #f0f2f5;
  align-items: center;
}

.toggle-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: white;
  border: 1px solid #dcdfe6;
  border-radius: 16px;
  padding: 6px 12px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.toggle-button:hover {
  background-color: #d9e2f0;
}

.main-wrapper {
  display: flex;
  align-items: stretch;
  transition: all 0.3s;
}

/* 侧边栏 */
.side-panel {
  width: 450px;
  height: 653px;
  background-color: #ffffff;
  border-radius: 5px;
  margin-left: 10px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.splitpanes__divider {
  background-color: #000 !important;
  height: 10px;
  cursor: row-resize;
}

/* 动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.kg-card {
  width: 100%;
  max-width: 900px;
  height: 630px;
  background-color: #fff;
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
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
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
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      border: none;

      :deep(.el-card__body) {
        flex: 1;
        overflow-y: auto;
        padding: 1.25rem;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;

        .header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
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
        margin-bottom: 1rem;
      }

      p {
        margin: 0;
        font-size: 1rem;
      }
    }
  }
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 20px;

  .el-button {
    width: 220px;
    height: 48px;
    font-size: 1rem;

    .el-icon {
      margin-right: 8px;
    }
  }
}

@media (max-width: 1200px) {
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
  .kg-card {
    padding: 1rem;
  }

  .kg-title {
    font-size: 1.5rem;
  }

  .kg-content .kg-visualization {
    height: 400px;
  }

  .button-container {
    flex-direction: column;
    align-items: center;

    .el-button {
      width: 100%;
      margin-bottom: 10px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>