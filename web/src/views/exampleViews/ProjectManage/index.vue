<template>
    <el-row :gutter="20" style="margin-right: 15px; margin-left: -5px" type="flex">
        <!-- 图谱构建项目卡片 -->
        <el-col v-for="(item, index) in graphProjectList" :key="index" :span="6">
            <el-card class="box-card" shadow="always" :body-style="{ padding: '0px' }">
                <div slot="header" class="header">
                    <svg t="1732552423815" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                        p-id="3665" width="20" height="20" class="icon">
                        <path
                            d="M951.9 323.4c-6.8-7.2-16.5-11.4-26.4-11.4h-56.6v-69.8c0-24.4-19.9-44.3-44.3-44.3H562.8l-18.7-59.5-0.6-1.4c-6.9-16.6-22.9-27.3-40.9-27.3H198.7c-24.4 0-44.3 19.9-44.3 44.3v158H100c-10 0-19.6 4.2-26.4 11.4-6.8 7.2-10.4 17.1-9.8 27.1l30.8 523.8c1.1 19.2 17.1 34.2 36.3 34.2H896c19.2 0 35.2-15.1 36.3-34.3L962 350.4c0.4-10-3.2-19.8-10.1-27zM224.4 179.6h259.3l18.7 59.5 0.6 1.4c6.9 16.6 22.9 27.3 40.9 27.3h255V312H224.4V179.6z m639.7 658.8H162.5L135.7 382h754.2l-25.8 456.4z"
                            p-id="3666"></path>
                        <path
                            d="M353.8 537.3h312.1c19.3 0 35-15.7 35-35s-15.7-35-35-35H353.8c-19.3 0-35 15.7-35 35s15.7 35 35 35z"
                            p-id="3667"></path>
                    </svg>
                    <span class="header-label">{{ item.name }}</span>
                    <el-tag
                        :type="item.status === '已完成' ? 'success' : item.status === '构建中' ? 'primary' : 'danger'"
                        style="margin-left: auto" size="large" class="progress-tag">
                        {{ item.status }}
                    </el-tag>
                </div>

                <div style="margin: 15px" class="card-body">
                    <div>
                        <div class="card-label">关联公司</div>
                        <span>{{ item.company || '无' }}</span>
                    </div>
                    <div>
                        <div class="card-label">项目类型</div>
                        <span>{{ item.type || '无' }}</span>
                    </div>
                    <div>
                        <div class="card-label">项目描述</div>
                        <span>{{ item.description || '无' }}</span>
                    </div>
                </div>

                <div class="footer">
                    <el-button type="text" style="color: rgb(34, 125, 251)" @click="editGraphProject(item.id)">编辑项目</el-button>
                    <div style="color: #cccccc">|</div>
                    <el-button type="text" style="color: #67c23a" @click="viewResult(item.id)">查看结果</el-button>
                    <div style="color: #cccccc">|</div>
                    <el-button type="text" style="color: #18c8bd" @click="askAI(item.id)">问 AI</el-button>
                    <div style="color: #cccccc">|</div>
                    <el-popconfirm confirm-button-text="确定" cancel-button-text="取消" title="确定删除此图谱构建项目？"
                        @confirm="deleteGraphProject(item.id)">
                        <template #reference>
                            <el-button type="text" style="color: #f56c6c">删除</el-button>
                        </template>
                    </el-popconfirm>
                </div>
            </el-card>
        </el-col>

        <!-- 新增图谱构建项目卡片 -->
        <el-col v-if="graphProjectList.length < currentPage * pageSize" :span="6">
            <el-card class="add-box-card">
                <div class="add-card-body">
                    <el-button class="no-change-on-hover" type="primary" text :icon="Plus"
                        style="height: 135px; font-size: 70px; padding: 0; background-color: transparent; color: #18c8bd"
                        @click="addGraphProjectDialogVisible = true" />
                </div>
                <p style="text-align: center; font-size: 15px">点击创建新的图谱构建项目</p>
            </el-card>
        </el-col>
    </el-row>

    <!-- 新增图谱项目对话框 -->
    <el-dialog v-model="addGraphProjectDialogVisible" title="新建图谱构建项目" width="580" align-center>
        <el-form :model="newGraphProjectForm" label-width="auto" style="max-width: 500px; margin-top: 20px;">
            <el-form-item label="项目名称">
                <el-input v-model="newGraphProjectForm.name" />
            </el-form-item>
            <el-form-item label="关联公司">
                <el-input v-model="newGraphProjectForm.company" />
            </el-form-item>
            <el-form-item label="项目类型">
                <el-input v-model="newGraphProjectForm.type" />
            </el-form-item>
            <el-form-item label="项目描述">
                <el-input v-model="newGraphProjectForm.description" type="textarea" :rows="4"
                    placeholder="请输入图谱构建项目描述" />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="addGraphProjectDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="addGraphProject">确认</el-button>
            </div>
        </template>
    </el-dialog>

    <!-- 分页组件 -->
    <div style="position: fixed; bottom: 20px; left: 60%; transform: translateX(-50%);">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[12, 24, 36, 48]"
            layout="total, sizes, prev, pager, next, jumper" :total="totalProjects" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
    </div>
</template>


<script lang="ts" setup>
import { Plus } from '@element-plus/icons-vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { reactive, ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { throttleFn_1 as throttleFn } from '@/common/debounceAndThrottle';
import userApi from '@/http/user.js';

axios.defaults.withCredentials = true;

interface GraphProject {
    id: string;
    name: string;
    description: string;
    type: string;
    company: string;
    status: string;
    step: number;
}
const graphProjectList = ref<GraphProject[]>([
    {
      id: '1',
      name: '企业知识图谱',
      description: '构建包含企业主体、关系和事件的图谱',
      type: '公司上市',
      company: '公司A',
      status: '已完成',
      step: 2
    },
    {
      id: '2',
      name: '医疗图谱项目',
      description: '面向医疗领域的疾病、药物、治疗构建',
      type: '公司上市',
      company: '公司B',
      status: '构建中',
      step: 2
    },
    {
      id: '3',
      name: '新闻知识图谱',
      description: '从新闻文本中抽取实体与关系',
      type: '公司上市',
      company: '公司C',
      status: '已完成',
      step: 1
    }
]);
const newGraphProjectForm = ref<GraphProject>([]);

const addGraphProjectDialogVisible = ref(false)

const totalProjects = ref(3);
const currentPage = ref(1);
const pageSize = ref(12);


const editGraphProject = (id: string) => {
    console.log('编辑项目', id)
}

const deleteGraphProject = (id: string) => {
    console.log('删除项目', id)
}

const askAI = (id: string) => {
    // console.log('问 AI', id)
    router.push({
        name: 'ask-ai',
        params: { askId: id }
    });
}

const viewResult = (id: string) => {
    // console.log('查看结果', id)
    router.push({
        name: 'result-display',
        params: { resultId: id }
    });
}

const addGraphProject = () => {
    console.log('新增项目', newGraphProjectForm.value)
    addGraphProjectDialogVisible.value = false
}

const handleSizeChange = (val) => {
    pageSize.value = val
}

const handleCurrentChange = (val) => {
    currentPage.value = val
}
</script>

<style scoped lang="scss">
.no-change-on-hover:hover,
.no-change-on-hover:active {
    background-color: transparent !important; /* 禁止背景色变更 */
    border-color: transparent !important; /* 禁止边框色变更 */
    color: inherit !important; /* 保持文本颜色不变 */
}
.add-box-card {
    transition: background-color 0.3s ease; /* 平滑过渡 */
}
.add-box-card:hover {
    background-color: rgba(0, 0, 0, 0.073); /* 光标悬停时背景变灰 */
}
.add-card-body {
    display: flex;
    align-items: center;
    justify-content: center;
}
.card-body {
    font-size: 14px;
}
.el-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    max-height: 730px; /* 限制最大高度 */
    overflow-y: auto; /* 启用滚动 */
}
.el-row .el-card {
    margin-top: 25px;
    min-width: 100%;
    height: 100%;
    // height: 135px;
    margin-right: 20px;
    margin-left: 10px;
    transition: all 0.5s;
     border-radius: 5px;
}
.el-form-item {
    margin-bottom: 20px;
    margin-left: 35px;
}

.box-card {
    .header {
        display: flex; /* 使用 flexbox 布局 */
        align-items: center; /* 垂直居中对齐 */
        position: relative;
        padding-bottom: 5px; /* 增加底部间距，使得分割线不与内容直接接触 */
        border-bottom: 1px solid #d6d8dd; /* 添加分割线 */
        .icon {
            margin-top: 10px;
            padding: 0 15px;
        }
        .header-label {
            font-size: 16px;
            font-weight: 600;
            margin-top: 10px;
        }
        .progress-tag {
            width: 68px;
            height: 30px;
            margin-top: 10px;
            margin-right: 10px;
        }
    }
    .footer {
        font-size: 20px !important;
        background-color: rgb(245, 247, 251);
        display: flex;
        height: 35px;
        justify-content: space-evenly;
    }
    .card-label {
        color: rgb(197, 197, 197);
        margin-right: 8px;
        width: 100px;
        display: inline-block;
        margin-bottom: 5px;
    }
}
</style>