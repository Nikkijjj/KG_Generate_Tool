<template>
    <div class="main-container">
        <div class="demo-block1">当前抽取进度</div>
        <div class="demo-block2">退出该页面不会影响抽取进度</div>
        <div class="demo-progress" style="width: 60%; margin-top: 20px">
            <el-progress :text-inside="true" :stroke-width="26" :percentage="extractProcess" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, toRefs } from 'vue';
import { ElMessage } from 'element-plus';
import { throttleFn_1 as throttleFn } from '@/common/debounceAndThrottle';
import userApi from '@/http/user.js';

// TODO 目前还没有进一步实验后端抽取在页面关闭时能否在后端继续；

// const router = useRouter();

// 当前任务变量
const props = defineProps<{
    eventType: string;
    projectId: string;
}>();
const { eventType, projectId } = toRefs(props);

// 进度条变量
const extractProcess = ref(0);
const intervalId = ref<number | null>(null);

// loading变量
const loadingProcess = ref(false);

const startExtract = throttleFn(async () => {
    console.log(eventType.value);
    console.log(projectId.value);
    // loadProgress();  // 加载保存的进度
    // startFetchingProgress();  // 开始每秒钟获取进度
    performEventExtract();    // 启动事件抽取
}, 500);

defineExpose({
    startExtract
});

onBeforeUnmount(() => {
    // stopFetchingProgress();
});

const performEventExtract = async () => {
    if (loadingProcess.value) return;
    loadingProcess.value = true;

    // 模拟进度条
    let currentProgress = 0;
    const interval = setInterval(() => {
        if (currentProgress < 100) {
            currentProgress += 2; // 每次增加 2
            extractProcess.value = currentProgress;
        } else {
            clearInterval(interval); // 进度达到 100% 时停止
            ElMessage.success("事件抽取完成！");
        }
    }, 100); // 每 100ms 更新一次进度

    try {
        const params = {
            projectId: projectId.value,
            eventType: eventType.value
        };
        const res = await userApi.performEventExtract(params);
        if (res.data === 1) {
            // 如果后端抽取成功，直接设置进度条为100
            extractProcess.value = 100;
            saveProgress();  // 保存进度到 localStorage
            stopFetchingProgress(); // 停止获取进度
        } else {
            // const errMsg = error?.response?.data?.msg || error.message || '事件抽取失败';
            // ElMessage.error(errMsg);
            // console.error('Error fetching:', error);
        }
    } catch (error) {
        // const errMsg = error?.response?.data?.msg || error.message || '抽取发生错误';
        // ElMessage.error(errMsg);
        // console.error('Error fetching:', error);
    } finally {
        loadingProcess.value = false;
    }
};

const loadProgress = () => {
    const savedProgress = localStorage.getItem('extractProgress');
    if (savedProgress) {
        extractProcess.value = parseInt(savedProgress, 10);
    }
};

const saveProgress = () => {
    localStorage.setItem('extractProgress', extractProcess.value.toString());
};

// 获取后端进度
const fetchProgressFromBackend = async () => {
    try {
        const params = {
            projectId: projectId.value
        };
        const res = await userApi.getExtractProcess(params);
        if (res.data && res.data.process) {
            extractProcess.value = res.data.process; // 更新进度条
            saveProgress();  // 每次更新进度时保存到 localStorage
        }
    } catch (error) {
        const errMsg = error?.response?.data?.msg || error.message || '获取进度失败';
        ElMessage.error(errMsg);
        console.error('Error fetching process:', error);
    }
};

const startFetchingProgress = () => {
    intervalId.value = setInterval(fetchProgressFromBackend, 1000); // 每1秒钟获取一次进度
};

const stopFetchingProgress = () => {
    if (intervalId.value !== null) {
        clearInterval(intervalId.value); // 清除定时器
        intervalId.value = null; // 重置定时器ID
    }
};
</script>

<style lang="css" scoped>
.main-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 82vw;
    border-radius: 5px;
    font-size: 15px;
    background-color: #fff;
    height: 70vh;
    margin: 10px;
    margin-bottom: 0px;
}

.demo-block1 {
    font-size: 25px;
    margin-bottom: 20px;
    text-align: center;
}

.demo-block2 {
    font-size: 18px;
    margin-bottom: 20px;
    text-align: center;
}

.demo-progress {
    width: 60%;
    /* 设置固定宽度，避免进度条过宽 */
}
</style>
