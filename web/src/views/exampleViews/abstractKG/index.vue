<template>
    <div class="stepBar-container">
        <!--步骤条-->
        <el-steps class="stepBar" :active="currentStep">
            <el-step title="抽取数据选择" @click.prevent="currentStep = 0"> </el-step>
            <el-step title="抽取进度" @click.prevent="currentStep = 1"> </el-step>
        </el-steps>
    </div>
    <!--动态展示对应步骤组件-->
    <div class="step-Component">
        <div v-show="currentStep === 0">
            <UploadFiles  ref="uploadFilesRef"/>
        </div>
        <div v-show="currentStep === 1">
            <LoadBar  ref="loadBarRef"/>
        </div>
    </div>
    <div class="btn-container">
        <el-button
            v-if="currentStep == 0"
            style="margin-top: 12px"
            @click="saveAndExit"
            class="btn"
            >保存并退出</el-button
        >
        <el-button
            v-if="currentStep == 0"
            style="margin-top: 12px"
            @click="nextStep"
            class="btn"
            >下一步</el-button
        >
        <el-button
            v-if="currentStep == 1"
            style="margin-top: 12px"
            @click="startExtraction"
            class="btn"
            >查看抽取结果</el-button
        >
        <el-button
            v-if="currentStep == 1"
            style="margin-top: 12px"
            @click="exitExtraction"
            class="btn"
            >退出</el-button
        >
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import LoadBar  from './components/loadBar.vue';
import UploadFiles from './components/uploadFiles.vue';

import { Search } from '@element-plus/icons-vue';
import { useRouter, useRoute } from 'vue-router';
import userApi from '@/http/user.js';
import { ElMessage } from 'element-plus';

const route = useRoute();
const projectId = ref('');
const projectStep = ref(0);
const eventType = ref('');

const router = useRouter();
const currentStep = ref(0);
const tipDialogVisible = ref(true);
const inProcess = 'inProcess';
const skipParamWatch = ref(false); // 控制是否跳过参数watch的逻辑

// 子组件的ref
const uploadFilesRef = ref();
const loadBarRef = ref();


//步骤条下一步（不会保存项目信息）
const nextStep = () => {
    if (currentStep.value++ > 1) currentStep.value = 0;
    ElMessage.success('抽取任务已启动，请稍候...');
};

//步骤条保存并退出
async function saveAndExit() {
    // console.log("step:"+currentStep.value)
    //保存当前步骤及之前的所有数据
    // console.log(uploadFilesRef.value)
    // uploadFilesRef.value?.saveSelectedFiles();
    //跳转到项目管理页面
    // router.push({ name: 'project-manage' });
    ElMessage.success('抽取任务已保存，请退出抽取...');
}

//启动抽取 调用组件内函数
async function startExtraction() {
    ElMessage.success('抽取任务已启动，请稍候...')
    router.push({ name: 'visual-kg-page' });
    
}

//退出抽取 调用组件内函数
function exitExtraction() {
    ElMessage.success('抽取任务已退出')
    // router.push({ name: 'project-manage' });
}

// 路由参数变化
watch(
  () => [route.params.id, route.params.step, route.params.eventType],
  async ([newId, newStep, newEventType]) => {
    // 如果标志为 true，说明是特殊跳转，跳过执行
    if (skipParamWatch.value) {
      skipParamWatch.value = false; // 重置标志，下次不跳过
      return;
    }

    if (newId && newStep && newEventType !== undefined) {
      projectId.value = newId as string;
      projectStep.value = Number(newStep);
      currentStep.value = Number(newStep);
      eventType.value = newEventType as string;
      tipDialogVisible.value = true;
      await chooseSchemaRef.value?.fetchAllSchemas()
    }
  }
);

// 路由 fullPath 的变化
watch(
  () => route.fullPath,
  (newPath, oldPath) => {
    if (oldPath.includes('schema-create')) {
      console.log('从 schema-create 页面跳转过来！');
      skipParamWatch.value = true; // 设置标志，跳过参数watch
      currentStep.value = 1;
      tipDialogVisible.value = false;
    }

    if (newPath.includes('extraction-process')) {
      // 其他初始化逻辑
    }
  }
);



onMounted(() => {
    const id = route.params.id;
    const step = route.params.step;
    const type = route.params.eventType;
    if (id && step && type !== undefined) {
        projectId.value = id as string;
        projectStep.value = Number(step);
        currentStep.value = Number(step);
        eventType.value = type as string;
    }
});
</script>

<style lang="scss" scoped>
.step-Component {
    display: flex;
    justify-content: center;
    align-items: center;
}
.stepBar-container {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    margin: 10px;
    margin-bottom: 10px;
    background-color: #ffffff;
    height: 10vh;
}
.stepBar {
    width: 80%;
    margin-top: 20px;
}
.btn-container {
    display: flex;
    justify-content: center;
    align-items: center;
}
.btn {
    width: 120px;
    height: 40px;
    font-size: 15px;
    margin-right: 15px;
}
</style>
