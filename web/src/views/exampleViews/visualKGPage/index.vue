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
            {{ selectedItem.group || '关系' }}
          </el-tag>
        </div>
      </template>
      
      <div v-if="selectedItem">
        <el-form label-position="top" class="details-form">
          <el-form-item v-for="(value, key) in selectedItem.properties" 
                      :key="key" 
                      :label="key">
            <el-input v-model="selectedItem.properties[key]" readonly />
          </el-form-item>
          
          <!-- 公告节点的关系展示（保持原样） -->
          <template v-if="selectedItem.group === '公告'">
            <el-divider />
            <el-tabs v-model="activeRelationTab">
              <el-tab-pane label="公告间关系" name="between">
                <el-timeline>
                  <el-timeline-item 
                    v-for="rel in betweenAnnouncementRelations" 
                    :key="rel.id"
                    :timestamp="rel.timestamp"
                    placement="top">
                    <el-card @click="handleRelationClick(rel)" shadow="hover">
                      <p>
                        <div><el-tag size="small">{{ rel.label }}</el-tag></div>
                        <div>{{ rel.toLabel }}</div>
                      </p>
                      <div v-if="rel.properties">
                        <el-tag 
                          v-for="(val, propKey) in rel.properties" 
                          :key="propKey"
                          type="info"
                          size="small"
                          class="property-tag">
                          {{ propKey }}: {{ val }}
                        </el-tag>
                      </div>
                    </el-card>
                  </el-timeline-item>
                </el-timeline>
              </el-tab-pane>
              <el-tab-pane label="公告内部关系" name="internal">
                <el-timeline>
                  <el-timeline-item 
                    v-for="rel in internalAnnouncementRelations" 
                    :key="rel.id"
                    placement="top">
                    <el-card @click="handleRelationClick(rel)" shadow="hover">
                      <p>
                        <div><el-tag size="small">{{ rel.label }}</el-tag></div>
                        <div>{{ rel.toLabel }}</div>
                      </p>
                      <div v-if="rel.properties">
                        <el-tag 
                          v-for="(val, propKey) in rel.properties" 
                          :key="propKey"
                          type="info"
                          size="small"
                          class="property-tag">
                          {{ propKey }}: {{ val }}
                        </el-tag>
                      </div>
                    </el-card>
                  </el-timeline-item>
                </el-timeline>
              </el-tab-pane>
            </el-tabs>
          </template>
          
          <!-- 非公告节点的关系展示 -->
          <template v-else-if="relatedRelations.length > 0">
            <el-divider />
            <h4>相关关系</h4>
            <el-timeline>
              <el-timeline-item 
                v-for="rel in relatedRelations" 
                :key="rel.id"
                :timestamp="rel.timestamp"
                placement="top">
                <el-card @click="handleRelationClick(rel)" shadow="hover">
                  <p>
                    <div><el-tag size="small">{{ rel.label }}</el-tag></div>
                    <div>{{ rel.fromLabel }} → {{ rel.toLabel }}</div>
                  </p>
                  <div v-if="rel.properties">
                    <el-tag 
                      v-for="(val, propKey) in rel.properties" 
                      :key="propKey"
                      type="info"
                      size="small"
                      class="property-tag">
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
        <el-icon :size="50" color="#909399"><InfoFilled /></el-icon>
        <p>请点击图谱中节点或关系查看详细信息</p>
      </div>
    </el-card>
  </div>
      </div>

      <div class="question-button-container">
        <el-button 
          type="primary" 
          size="large" 
          class="question-button"
          @click="handleQuestionClick"
        >
          <el-icon><ChatDotRound /></el-icon>
          向AI问答助手提问
        </el-button>

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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'


const router = useRouter()
const graphContainer = ref<HTMLElement | null>(null)
const selectedItem = ref<any>(null)
const relatedRelations = ref<any[]>([])
const showBackButton = ref(false)
const previousSelectedItem = ref<any>(null)

const activeRelationTab = ref('between')
const betweenAnnouncementRelations = ref<any[]>([])
const internalAnnouncementRelations = ref<any[]>([])

// 导出相关状态
const showExportDialog = ref(false)
const exportFormat = ref('png')
const exportFileName = ref('knowledge_graph')
const networkInstance = ref<Network | null>(null)

// 模拟数据
const mockData = {
  nodes: [
    // 公告1 - AI技术应用规范
    { 
      id: 1, 
      label: "关于规范AI技术应用的公告", 
      group: "公告", 
      properties: { 
        文号: "工信部发〔2023〕1号",
        发布时间: "2023-01-15",
        发布单位: "工业和信息化部",
        生效日期: "2023-03-01",
        主要内容: "明确生成式AI服务提供者需进行安全评估和备案，要求提供者承担内容主体责任",
        适用范围: "境内提供生成式AI服务的企业",
        附件: "《生成式AI服务安全基本要求》"
      } 
    },
    // 公告1内部实体
    { 
      id: 11, 
      label: "《生成式AI服务安全基本要求》", 
      group: "法规", 
      properties: { 
        类型: "部门规范性文件",
        发布日期: "2023-01-15",
        发布部门: "工业和信息化部",
        主要内容: "数据标注要求、内容过滤机制、用户实名认证等",
        适用范围: "文本、图像、视频生成服务",
        章节数: "8章56条"
      } 
    },
    { 
      id: 12, 
      label: "AI服务备案平台", 
      group: "系统", 
      properties: { 
        网址: "https://ai-beian.miit.gov.cn",
        上线时间: "2023-02-01",
        主管部门: "工业和信息化部",
        备案类型: "算法备案、服务备案",
        日均访问量: "1200次"
      } 
    },
    { 
      id: 13, 
      label: "生成式AI服务提供商", 
      group: "企业类型", 
      properties: { 
        定义: "提供文本、图像、音频、视频等内容生成服务的企业",
        数量估计: "国内约200家",
        典型企业: "XX科技、YY智能、ZZ数据"
      } 
    },
    { 
      id: 14, 
      label: "内容安全审核要求", 
      group: "标准", 
      properties: { 
        审核方式: "人工+AI双重审核",
        审核比例: "不低于10%",
        违规内容处理: "立即下架并保存记录",
        记录保存期: "不少于6个月"
      } 
    },
    
    // 公告2 - AI安全专项检查
    { 
      id: 2, 
      label: "关于开展AI安全专项检查的通知", 
      group: "公告", 
      properties: { 
        文号: "网信办发〔2023〕5号",
        发布时间: "2023-03-10",
        发布单位: "国家互联网信息办公室",
        检查时间: "2023-04-01至2023-06-30",
        检查对象: "已备案的AI服务提供者",
        检查内容: "算法安全、数据安全、内容安全",
        联系人: "张处长 010-12345678"
      } 
    },
    // 公告2内部实体
    { 
      id: 21, 
      label: "算法安全评估标准", 
      group: "标准", 
      properties: { 
        标准号: "T/ISC 001-2023",
        发布机构: "中国互联网协会",
        评估内容: "偏见歧视、诱导沉迷、生成违禁内容等风险",
        实施日期: "2023-03-01",
        评估等级: "A(优秀)、B(合格)、C(不合格)"
      } 
    },
    { 
      id: 22, 
      label: "数据安全检查清单", 
      group: "文档", 
      properties: { 
        包含项目: "数据来源合法性、用户授权情况、数据存储安全",
        检查项数: "32项",
        关键项: "数据跨境传输评估"
      } 
    },
    { 
      id: 23, 
      label: "内容安全抽查样本", 
      group: "方法", 
      properties: { 
        样本量: "不少于1000条",
        时间范围: "最近3个月",
        违规判定标准: "《互联网信息服务算法推荐管理规定》"
      } 
    },
    
    // 公告3 - 违规处罚决定
    { 
      id: 3, 
      label: "关于XX公司违规处理个人数据的处罚决定", 
      group: "公告", 
      properties: { 
        文号: "网信罚决〔2023〕8号",
        发布时间: "2023-05-20",
        发布单位: "国家互联网信息办公室",
        违规事实: "未按要求进行数据出境安全评估",
        处罚依据: "《数据安全法》第45条",
        处罚内容: "责令改正，罚款80万元",
        整改期限: "2023-06-30前"
      } 
    },
    // 公告3内部实体
    { 
      id: 31, 
      label: "XX科技公司", 
      group: "企业", 
      properties: { 
        统一信用代码: "91310101MA1FPX1234",
        成立时间: "2020-05-15",
        注册资本: "5000万元",
        主营业务: "AI内容生成",
        违规记录: "2023年数据出境违规"
      } 
    },
    { 
      id: 32, 
      label: "数据出境安全评估", 
      group: "流程", 
      properties: { 
        法律依据: "《数据出境安全评估办法》",
        适用情形: "处理100万人以上个人信息的数据处理者",
        评估机构: "国家网信部门",
        评估周期: "45个工作日"
      } 
    },
    { 
      id: 33, 
      label: "用户画像数据", 
      group: "数据类型", 
      properties: { 
        数据类型: "用户行为数据、偏好数据",
        数据量: "约350万条",
        数据用途: "个性化推荐算法训练",
        数据来源: "用户授权收集"
      } 
    },
    
    // 公告4 - AI伦理审查指南
    { 
      id: 4, 
      label: "关于发布《AI伦理审查指南》的公告", 
      group: "公告", 
      properties: { 
        文号: "科技部发〔2023〕12号",
        发布时间: "2023-07-15",
        发布单位: "科学技术部",
        指南内容: "明确AI研发应用的伦理边界和审查流程",
        适用范围: "科研机构、企业研发部门",
        实施日期: "2023-09-01",
        附件: "《AI伦理审查申请表》模板"
      } 
    },
    // 公告4内部实体
    { 
      id: 41, 
      label: "AI伦理委员会", 
      group: "机构", 
      properties: { 
        成立依据: "《科技伦理审查办法》",
        组成: "技术专家、法律专家、伦理学者",
        职责: "审查高风险AI研究项目",
        工作流程: "初审→听证→终审"
      } 
    },
    { 
      id: 42, 
      label: "高风险AI研究项目", 
      group: "项目类型", 
      properties: { 
        定义: "涉及人类遗传资源、生物安全、算法歧视等领域的AI研究",
        示例: "基因编辑AI辅助系统、面部识别情绪分析",
        审查级别: "国家级伦理委员会审查"
      } 
    },
    { 
      id: 43, 
      label: "伦理审查申请表", 
      group: "文档", 
      properties: { 
        包含内容: "研究目的、方法、潜在风险、应对措施",
        审批时限: "30个工作日内",
        有效期: "3年"
      } 
    },
    { 
      id: 44, 
      label: "AI伦理原则", 
      group: "原则", 
      properties: { 
        原则1: "以人为本",
        原则2: "安全可控",
        原则3: "公平公正",
        原则4: "透明可解释",
        原则5: "责任明确"
      } 
    },
    
    // 跨公告的共享实体
    { 
      id: 51, 
      label: "《数据安全法》", 
      group: "法律", 
      properties: { 
        颁布日期: "2021-09-01",
        实施日期: "2021-09-01",
        主要内容: "数据分类分级、数据安全保护、数据跨境流动管理",
        相关条款: "第21条(数据分类分级)、第31条(数据出境安全评估)"
      } 
    },
    { 
      id: 52, 
      label: "国家互联网信息办公室", 
      group: "机构", 
      properties: { 
        简称: "国家网信办",
        职责: "负责全国互联网信息内容管理工作",
        下设机构: "网络安全协调局、网络管理数据局、网络执法与监督局"
      } 
    }
  ],
  edges: [
    // 公告间关系（时间顺序关系）
    { 
      id: 101, 
      from: 1, 
      to: 2, 
      label: "时间顺序", 
      properties: { 
        时间间隔: "55天",
        关联说明: "备案制度建立后开展专项检查",
        因果关系: "公告1建立了备案制度，公告2基于此开展检查",
        政策连续性: "高",
        相关文件: "《关于加强互联网信息服务算法综合治理的指导意见》"
      } 
    },
    { 
      id: 102, 
      from: 2, 
      to: 3, 
      label: "时间顺序", 
      properties: { 
        时间间隔: "71天",
        关联说明: "检查中发现违规案例",
        因果关系: "公告2的检查发现了公告3的违规行为",
        检查结果: "发现3家企业存在数据出境违规",
        处罚依据: "《数据安全法》第45条"
      } 
    },
    { 
      id: 103, 
      from: 3, 
      to: 4, 
      label: "时间顺序", 
      properties: { 
        时间间隔: "56天",
        关联说明: "违规案例推动伦理规范出台",
        因果关系: "公告3的处罚促使公告4加强伦理审查",
        政策响应速度: "快速响应",
        相关会议: "全国AI伦理治理研讨会"
      } 
    },
    { 
      id: 104, 
      from: 1, 
      to: 4, 
      label: "补充关系", 
      properties: { 
        关系类型: "政策互补",
        说明: "公告1侧重技术安全，公告4侧重伦理治理",
        协同效应: "形成技术+伦理双重监管体系",
        联合发文单位: "科技部、工信部"
      } 
    },
    
    // 公告1内部关系
    { 
      id: 111, 
      from: 1, 
      to: 11, 
      label: "附件", 
      properties: { 
        关联条款: "第七条",
        说明: "公告1的配套技术文件",
        引用频率: "高频",
        更新周期: "每年修订一次"
      } 
    },
    { 
      id: 112, 
      from: 1, 
      to: 12, 
      label: "创建", 
      properties: { 
        依据: "公告1第三条",
        功能: "在线提交备案材料",
        开发周期: "45天",
        运维单位: "工信部信息中心"
      } 
    },
    { 
      id: 113, 
      from: 11, 
      to: 14, 
      label: "引用", 
      properties: { 
        引用章节: "第四章 内容安全管理",
        引用内容: "审核机制和比例要求",
        标准一致性: "完全一致",
        实施指南: "《内容审核操作手册》"
      } 
    },
    { 
      id: 114, 
      from: 13, 
      to: 14, 
      label: "适用", 
      properties: { 
        适用条件: "所有生成式AI服务提供商",
        豁免情形: "非公开内部使用系统",
        过渡期: "3个月",
        处罚措施: "限期整改或暂停服务"
      } 
    },
    { 
      id: 115, 
      from: 12, 
      to: 13, 
      label: "服务对象", 
      properties: { 
        注册比例: "约85%",
        典型用户: "XX科技、YY智能",
        注册流程: "在线提交→形式审查→公示",
        审查时限: "15个工作日"
      } 
    },
    
    // 公告2内部关系
    { 
      id: 121, 
      from: 2, 
      to: 21, 
      label: "引用标准", 
      properties: { 
        引用条款: "检查标准第二部分",
        说明: "作为算法安全评估依据",
        评估一致性: "完全符合",
        补充要求: "增加数据安全专项指标"
      } 
    },
    { 
      id: 122, 
      from: 2, 
      to: 22, 
      label: "包含", 
      properties: { 
        附件编号: "附件2",
        使用说明: "企业自查使用",
        填写要求: "逐项说明并提供证明材料",
        提交期限: "检查开始前10个工作日"
      } 
    },
    { 
      id: 123, 
      from: 21, 
      to: 23, 
      label: "指导", 
      properties: { 
        方法依据: "标准第5.2条",
        抽样原则: "随机分层抽样",
        误差范围: "±3%",
        质量控制: "双人独立审核"
      } 
    },
    { 
      id: 124, 
      from: 22, 
      to: 23, 
      label: "互补", 
      properties: { 
        检查维度: "数据安全+内容安全",
        覆盖范围: "全业务流程",
        交叉验证: "数据使用记录与生成内容匹配",
        异常检测: "数据与内容不一致率<1%"
      } 
    },
    
    // 公告3内部关系
    { 
      id: 131, 
      from: 3, 
      to: 31, 
      label: "处罚对象", 
      properties: { 
        违法事实: "未经评估向境外传输训练数据",
        处罚依据: "《数据安全法》第四十五条",
        减轻情节: "主动停止传输行为",
        加重情节: "涉及敏感个人信息"
      } 
    },
    { 
      id: 132, 
      from: 31, 
      to: 33, 
      label: "处理数据", 
      properties: { 
        数据类型: "用户画像数据",
        数据量: "约350万条",
        传输目的: "境外算法优化",
        传输方式: "加密API接口"
      } 
    },
    { 
      id: 133, 
      from: 32, 
      to: 33, 
      label: "评估对象", 
      properties: { 
        评估重点: "数据敏感性、传输必要性",
        风险评估: "高(涉及个人隐私)",
        保护措施: "匿名化处理不足",
        替代方案: "境内数据处理"
      } 
    },
    { 
      id: 134, 
      from: 31, 
      to: 32, 
      label: "应履行", 
      properties: { 
        法律义务: "数据出境安全评估",
        未履行原因: "认为数据已匿名化",
        评估结果: "实际未达到匿名化要求",
        整改措施: "建立数据出境合规流程"
      } 
    },
    { 
      id: 135, 
      from: 33, 
      to: 51, 
      label: "受约束", 
      properties: { 
        相关条款: "第21条(数据分类分级)",
        合规要求: "个人信息应分类保护",
        处罚条款: "第45条(违法处理数据)",
        司法解释: "最高人民法院关于审理个人信息纠纷案件适用法律若干问题的规定"
      } 
    },
    
    // 公告4内部关系
    { 
      id: 141, 
      from: 4, 
      to: 41, 
      label: "设立", 
      properties: { 
        职责: "负责伦理审查",
        组成要求: "多学科背景专家",
        任期: "3年",
        回避制度: "与审查项目有利益关系需回避"
      } 
    },
    { 
      id: 142, 
      from: 41, 
      to: 42, 
      label: "审查", 
      properties: { 
        审查标准: "《AI伦理审查指南》附录A",
        审查重点: "风险受益比、知情同意机制",
        审查结论: "通过/修改后通过/不通过",
        上诉机制: "可向科技部申诉"
      } 
    },
    { 
      id: 143, 
      from: 42, 
      to: 43, 
      label: "需提交", 
      properties: { 
        提交材料: "研究方案、知情同意书、风险评估报告",
        材料要求: "中英文各一份",
        保密条款: "5年保密期",
        公开范围: "摘要公开"
      } 
    },
    { 
      id: 144, 
      from: 43, 
      to: 44, 
      label: "依据", 
      properties: { 
        原则映射: "每项研究措施对应伦理原则",
        风险控制: "针对每项原则的具体措施",
        监督机制: "年度伦理审查报告",
        违规处理: "暂停或终止研究"
      } 
    },
    { 
      id: 145, 
      from: 44, 
      to: 51, 
      label: "补充", 
      properties: { 
        法律衔接: "《数据安全法》第8条(数据伦理)",
        协同效应: "技术合规+伦理合规",
        冲突解决: "法律优先于伦理原则",
        发展趋势: "将部分伦理要求上升为法律"
      } 
    },
    
    // 跨公告的共享关系
    { 
      id: 151, 
      from: 11, 
      to: 21, 
      label: "参考", 
      properties: { 
        参考内容: "安全评估框架",
        差异点: "公告1侧重技术指标，公告2侧重管理流程",
        互补性: "技术标准+管理标准",
        联合应用: "企业需同时满足两者要求"
      } 
    },
    { 
      id: 152, 
      from: 31, 
      to: 41, 
      label: "需通过", 
      properties: { 
        新要求: "违规企业后续研发项目需伦理审查",
        审查强度: "加强审查(每半年一次)",
        特别条件: "需提交整改完成证明",
        豁免条件: "3年内无新违规可恢复常规审查"
      } 
    },
    { 
      id: 153, 
      from: 21, 
      to: 44, 
      label: "体现", 
      properties: { 
        体现原则: "公平公正、安全可控",
        具体条款: "算法偏见检测、安全应急机制",
        评估指标: "伦理原则符合度",
        认证体系: "AI伦理认证(筹划中)"
      } 
    },
    { 
      id: 154, 
      from: 51, 
      to: 52, 
      label: "授权", 
      properties: { 
        授权内容: "数据安全监管职责",
        执法依据: "《数据安全法》第6条",
        协作机制: "联合工信部、公安部",
        典型案例: "公告3的处罚案例"
      } 
    }
  ]
}

// 初始化知识图谱
const initKnowledgeGraph = () => {
  if (!graphContainer.value) return

  //处理节点数据，将数据格式转换为vis-network要求的格式
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

  //处理边数据，将数据格式转换为vis-network要求的格式
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

  //创建知识图谱网络实例
  const network = new Network(
    graphContainer.value,
    { nodes, edges },
    {
      layout: {
        improvedLayout: true
      },
      physics: {
        barnesHut: {
          gravitationalConstant: -3000, // 引力常数(负值表示排斥)
          centralGravity: 0, // 中心引力强度
          springLength: 200 // 弹簧长度
        },
        minVelocity: 0.75 // 最小速度阈值
      },
      interaction: {
        hover: true, //启用悬停效果
        tooltipDelay: 200,
        multiselect: false // 禁用多选
      }
    }
  )

  networkInstance.value = network

  //添加点击事件监听
  network.on("click", (params) => {
    showBackButton.value = false

    // 如果点击的是节点，则更新当前选中节点和相关关系
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0]
      const node = mockData.nodes.find(n => n.id === nodeId)
      if (node) {
        // 更新当前选中节点的数据
        selectedItem.value = { ...node }
        // 更新相关关系
        updateRelatedRelations(nodeId, 'node')
      }
    } 
    // 如果点击的是边，则更新当前选中边和相关关系
    else if (params.edges.length > 0) {
      const edgeId = params.edges[0]
      const edge = mockData.edges.find(e => e.id === parseInt(edgeId))
      if (edge) {
        // 更新当前选中边的数据
        selectedItem.value = { 
          ...edge,
          label: edge.label,
          //获取边的fromLabel和toLabel
          fromLabel: mockData.nodes.find(n => n.id === edge.from)?.label || edge.from,
          toLabel: mockData.nodes.find(n => n.id === edge.to)?.label || edge.to
        }
        // 更新相关关系
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
          
          // 修改关系标签
          let relationLabel = edge.label
          if (edge.label === "时间顺序" && currentDate && targetDate) {
            const dayDiff = calculateDayDifference(currentDate, targetDate)
            relationLabel = `时间顺序 (${dayDiff})`
          }
          
          return {
            ...edge,
            label: relationLabel, // 使用修改后的标签
            fromLabel: mockData.nodes.find(n => n.id === edge.from)?.label || edge.from,
            toLabel: mockData.nodes.find(n => n.id === edge.to)?.label || edge.to,
            timestamp: targetDate || edge.properties?.时间点 || '无日期信息',
            rawDate: targetDate || edge.properties?.时间点,
            uniqueKey: `${edge.id}_${targetNodeId}`
          }
        })
        .sort((a, b) => (a.rawDate > b.rawDate ? 1 : -1))
      
      // 公告内部关系保持不变
      internalAnnouncementRelations.value = mockData.edges
        .filter(edge => 
          edge.from === id || edge.to === id
        )
        .filter(edge => 
          !betweenAnnouncementRelations.value.some(bRel => bRel.id === edge.id)
        )
        .map(edge => ({
          ...edge,
          fromLabel: mockData.nodes.find(n => n.id === edge.from)?.label || edge.from,
          toLabel: mockData.nodes.find(n => n.id === edge.to)?.label || edge.to
        }))
    } else {
      // 非公告节点的处理
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
      
      // 清空公告相关关系
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
  
  // 如果是时间关系，计算具体天数差
  if (rel.label === "时间顺序") {
    const fromNode = mockData.nodes.find(n => n.id === rel.from)
    const toNode = mockData.nodes.find(n => n.id === rel.to)
    
    if (fromNode?.properties?.发布时间 && toNode?.properties?.发布时间) {
      const dayDiff = calculateDayDifference(
        fromNode.properties.发布时间, 
        toNode.properties.发布时间
      )
      rel.label = `时间顺序 (${dayDiff})`
    }
  }
  
  selectedItem.value = { 
    ...rel,
    label: rel.label
  }
  showBackButton.value = true
}

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
const exportAsCSV = () => {
  try {
    // 导出节点
    let csvContent = "类型,ID,标签,分组,属性\n"
    mockData.nodes.forEach(node => {
      const properties = node.properties ? Object.entries(node.properties).map(([k, v]) => `${k}=${v}`).join(';') : ''
      csvContent += `节点,${node.id},${node.label},${node.group || ''},"${properties}"\n`
    })
    
    // 导出边
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

// 导出为JSON
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
    '公告': '#FF6B6B',  // 公告用红色突出显示
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
      '公告': 'danger',    // 公告用红色标签
      '政策': 'success',
      '企业': 'primary',
      '人物': 'warning',
      '项目': 'info',
      '机构': '',
      '法规': 'success'
    }
    return types[item.group] || ''
  }
  return 'danger'
}

const handleQuestionClick = () => { 
  router.push({
    name: 'ask-ai',
  })
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
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
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

      .back-button {
        margin-right: 8px;
        font-size: 14px;
      }
      
      .details-form {
        .el-form-item {
          margin-bottom: 1rem;
        }
        
        h4 {
          margin: 1rem 0 0.5rem;
          color: #606266;
        }
        
        .property-tag {
          margin-right: 0.5rem;
          margin-bottom: 0.5rem;
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

/* 标签页样式 */
.el-tabs {
  margin-top: 10px;
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