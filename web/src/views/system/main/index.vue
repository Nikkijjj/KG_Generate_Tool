<template>
    <DefinScrollbar height="100%" :showUpBt="true">
        <div class="page-container main-view">
            <div class="container">
                <h3>金融知识图谱构建平台 - 数据看板</h3>
                
                <!-- 顶部数据卡片 -->
                <div class="data-cards">
                    <div class="card">
                        <div class="card-icon" style="background-color: #f0f7ff;">
                            <SvgIcon name="user" size="24" color="#1890ff"></SvgIcon>
                        </div>
                        <div class="card-content">
                            <div class="card-title">注册用户</div>
                            <div class="card-value">2,856</div>
                            <div class="card-growth">
                                <span class="growth-rate">↑ 12.5%</span>
                                <span class="growth-text">较上月</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-icon" style="background-color: #fff7e6;">
                            <SvgIcon name="project" size="24" color="#faad14"></SvgIcon>
                        </div>
                        <div class="card-content">
                            <div class="card-title">抽取项目</div>
                            <div class="card-value">1,243</div>
                            <div class="card-growth">
                                <span class="growth-rate">↑ 8.3%</span>
                                <span class="growth-text">较上月</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-icon" style="background-color: #f6ffed;">
                            <SvgIcon name="eye" size="24" color="#52c41a"></SvgIcon>
                        </div>
                        <div class="card-content">
                            <div class="card-title">访问量</div>
                            <div class="card-value">48,752</div>
                            <div class="card-growth">
                                <span class="growth-rate">↑ 15.2%</span>
                                <span class="growth-text">较上月</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-icon" style="background-color: #fff0f6;">
                            <SvgIcon name="knowledge" size="24" color="#eb2f96"></SvgIcon>
                        </div>
                        <div class="card-content">
                            <div class="card-title">知识实体</div>
                            <div class="card-value">5.7M</div>
                            <div class="card-growth">
                                <span class="growth-rate">↑ 23.1%</span>
                                <span class="growth-text">较上月</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 图表区域 -->
                <div class="echart-container">
                    <div class="top-container">
                        <div class="left">
                            <EchartContainer ref="EchartContainerRef"></EchartContainer>
                        </div>
                        <div class="right">
                            <EchartContainer ref="EchartContainerRef_1"></EchartContainer>
                        </div>
                    </div>
                    <div class="middle-container">
                        <EchartContainer ref="EchartContainerRef_2"></EchartContainer>
                    </div>
                    <div class="bottom-container">
                        <div class="left">
                            <EchartContainer ref="EchartContainerRef_3"></EchartContainer>
                        </div>
                        <div class="right">
                            <EchartContainer ref="EchartContainerRef_4"></EchartContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </DefinScrollbar>
</template>

<script>
/**
 * 金融知识图谱构建平台数据看板
 */
import {
    defineComponent,
    ref,
    reactive,
    onMounted,
} from 'vue';
import SvgIcon from '@/components/svgIcon/index.vue';
import EchartContainer from '@/components/echartContainer.vue';
import DefinScrollbar from '@/components/definScrollbar.vue';
import * as echarts from 'echarts';
import 'echarts-wordcloud'; 

export default defineComponent({
    components: {
        SvgIcon,
        EchartContainer,
        DefinScrollbar,
    },
    setup() {
        const EchartContainerRef = ref(); // 用户增长趋势图
        const EchartContainerRef_1 = ref(); // 项目类型分布
        const EchartContainerRef_2 = ref(); // 访问量趋势
        const EchartContainerRef_3 = ref(); // 知识实体类型分布
        const EchartContainerRef_4 = ref(); // 热门金融概念
        
        const dataContainer = reactive({
            loading: false,
        });
        
        onMounted(() => {
            /** 用户增长趋势图 */
            EchartContainerRef.value.initData({
                backgroundColor: '',
                title: {
                    text: '用户增长趋势',
                    x: 'left',
                    textStyle: { fontSize: '15', color: '#000' },
                },
                tooltip: { trigger: 'axis' },
                legend: { data: ['新增用户', '活跃用户'], right: 0 },
                grid: { top: 70, right: 20, bottom: 30, left: 40 },
                xAxis: [
                    {
                        type: 'category',
                        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
                        boundaryGap: true,
                        axisTick: { show: false },
                    },
                ],
                yAxis: [
                    {
                        name: '用户数',
                        nameLocation: 'middle',
                        nameTextStyle: { padding: [3, 4, 30, 6] },
                        splitLine: { show: true, lineStyle: { type: 'dashed', color: '#f5f5f5' } },
                        axisLine: { show: false },
                        axisTick: { show: false },
                        axisLabel: { color: '#000', formatter: '{value}' },
                    },
                ],
                series: [
                    {
                        name: '新增用户',
                        type: 'line',
                        smooth: true,
                        showSymbol: true,
                        symbol: 'circle',
                        symbolSize: 8,
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                                { offset: 1, color: 'rgba(24, 144, 255, 0)' },
                            ]),
                        },
                        itemStyle: { color: '#1890ff' },
                        data: [120, 132, 145, 160, 172, 190, 210],
                    },
                    {
                        name: '活跃用户',
                        type: 'line',
                        smooth: true,
                        showSymbol: true,
                        symbol: 'circle',
                        symbolSize: 8,
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
                                { offset: 1, color: 'rgba(82, 196, 26, 0)' },
                            ]),
                        },
                        itemStyle: { color: '#52c41a' },
                        data: [80, 95, 110, 125, 140, 160, 185],
                    },
                ],
            });
            
            /** 项目类型分布 */
            EchartContainerRef_1.value.initData({
                title: {
                    text: '项目类型分布',
                    x: 'left',
                    textStyle: { fontSize: '15', color: '#000' },
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    right: 10,
                    top: 'center',
                    data: ['企业关系图谱', '金融风险分析', '投资组合优化', '市场趋势预测', '其他']
                },
                series: [
                    {
                        name: '项目类型',
                        type: 'pie',
                        radius: ['50%', '70%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 10,
                            borderColor: '#fff',
                            borderWidth: 2
                        },
                        label: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: '18',
                                fontWeight: 'bold'
                            }
                        },
                        labelLine: {
                            show: false
                        },
                        data: [
                            { value: 335, name: '企业关系图谱' },
                            { value: 310, name: '金融风险分析' },
                            { value: 234, name: '投资组合优化' },
                            { value: 135, name: '市场趋势预测' },
                            { value: 154, name: '其他' }
                        ]
                    }
                ]
            });
            
            /** 访问量趋势 */
            EchartContainerRef_2.value.initData({
                backgroundColor: '',
                title: {
                    text: '平台访问量趋势',
                    x: 'left',
                    textStyle: { fontSize: '15', color: '#000' },
                },
                tooltip: { trigger: 'axis' },
                legend: { data: ['总访问量', '活跃用户'], right: 0 },
                grid: { top: 70, right: 20, bottom: 30, left: 40 },
                xAxis: [
                    {
                        type: 'category',
                        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                        boundaryGap: true,
                        axisTick: { show: false },
                    },
                ],
                yAxis: [
                    {
                        name: '访问量',
                        nameLocation: 'middle',
                        nameTextStyle: { padding: [3, 4, 30, 6] },
                        splitLine: { show: true, lineStyle: { type: 'dashed', color: '#f5f5f5' } },
                        axisLine: { show: false },
                        axisTick: { show: false },
                        axisLabel: { color: '#000', formatter: '{value}' },
                    },
                ],
                series: [
                    {
                        name: '总访问量',
                        type: 'line',
                        smooth: true,
                        showSymbol: true,
                        symbol: 'circle',
                        symbolSize: 8,
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(235, 47, 150, 0.3)' },
                                { offset: 1, color: 'rgba(235, 47, 150, 0)' },
                            ]),
                        },
                        itemStyle: { color: '#eb2f96' },
                        data: [1200, 1800, 1500, 2100, 1900, 800, 600],
                    },
                    {
                        name: '活跃用户',
                        type: 'line',
                        smooth: true,
                        showSymbol: true,
                        symbol: 'circle',
                        symbolSize: 8,
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(250, 173, 20, 0.3)' },
                                { offset: 1, color: 'rgba(250, 173, 20, 0)' },
                            ]),
                        },
                        itemStyle: { color: '#faad14' },
                        data: [800, 1200, 1000, 1400, 1300, 500, 400],
                    },
                ],
            });
            
            /** 知识实体类型分布 */
            EchartContainerRef_3.value.initData({
                title: {
                    text: '知识实体类型分布',
                    x: 'left',
                    textStyle: { fontSize: '15', color: '#000' },
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['金融实体', '关系', '事件', '属性'],
                    right: 10
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'value'
                },
                yAxis: {
                    type: 'category',
                    data: ['股票', '公司', '人物', '行业', '指数']
                },
                series: [
                    {
                        name: '金融实体',
                        type: 'bar',
                        stack: 'total',
                        label: {
                            show: true
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: [320, 302, 301, 334, 390],
                        itemStyle: {
                            color: '#1890ff'
                        }
                    },
                    {
                        name: '关系',
                        type: 'bar',
                        stack: 'total',
                        label: {
                            show: true
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: [120, 132, 101, 134, 90],
                        itemStyle: {
                            color: '#52c41a'
                        }
                    },
                    {
                        name: '事件',
                        type: 'bar',
                        stack: 'total',
                        label: {
                            show: true
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: [220, 182, 191, 234, 290],
                        itemStyle: {
                            color: '#faad14'
                        }
                    },
                    {
                        name: '属性',
                        type: 'bar',
                        stack: 'total',
                        label: {
                            show: true
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: [150, 212, 201, 154, 190],
                        itemStyle: {
                            color: '#eb2f96'
                        }
                    }
                ]
            });
            
            /** 热门金融概念 */
            EchartContainerRef_4.value.initData({
                title: {
                    text: '热门金融概念',
                    x: 'left',
                    textStyle: { fontSize: '15', color: '#000' },
                },
                tooltip: {
                    trigger: 'item'
                },
                series: [
                    {
                        name: '热门金融概念',
                        type: 'wordCloud',
                        sizeRange: [12, 60],
                        rotationRange: [-45, 45],
                        rotationStep: 15,
                        gridSize: 8,
                        shape: 'circle',
                        width: '100%',
                        height: '100%',
                        drawOutOfBound: false,
                        textStyle: {
                            fontFamily: 'sans-serif',
                            fontWeight: 'bold',
                            color: function () {
                                return 'rgb(' + [
                                    Math.round(Math.random() * 160 + 50),
                                    Math.round(Math.random() * 160 + 50),
                                    Math.round(Math.random() * 160 + 50)
                                ].join(',') + ')';
                            }
                        },
                        emphasis: {
                            textStyle: {
                                shadowBlur: 10,
                                shadowColor: '#333'
                            }
                        },
                        data: [
                            { value: 90, name: '区块链' },
                            { value: 85, name: '人工智能' },
                            { value: 80, name: '量化投资' },
                            { value: 78, name: '风险管理' },
                            { value: 75, name: '金融科技' },
                            { value: 70, name: '大数据分析' },
                            { value: 68, name: '智能投顾' },
                            { value: 65, name: '云计算' },
                            { value: 60, name: '数字货币' },
                            { value: 58, name: '机器学习' },
                            { value: 55, name: '深度学习' },
                            { value: 50, name: '自然语言处理' },
                            { value: 48, name: '知识图谱' },
                            { value: 45, name: '投资组合' },
                            { value: 40, name: '算法交易' },
                            { value: 38, name: '信用评分' },
                            { value: 35, name: '市场预测' },
                            { value: 30, name: '金融衍生品' },
                            { value: 28, name: '资产定价' },
                            { value: 25, name: '高频交易' }
                        ]
                    }
                ]
            });
        });
        
        return {
            dataContainer,
            EchartContainerRef,
            EchartContainerRef_1,
            EchartContainerRef_2,
            EchartContainerRef_3,
            EchartContainerRef_4,
        };
    },
});
</script>

<style lang="scss" scoped>
.main-view {
    display: flex;
    flex-direction: column;
    width: 100%;
    .container {
        background-color: white;
        width: 100%;
        min-height: 800px;
        border-radius: 5px;
        padding: 15px;
        box-sizing: border-box;
        
        h3 {
            margin-bottom: 20px;
            color: #333;
            font-size: 22px;
        }
        
        .data-cards {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 30px;
            
            .card {
                flex: 1;
                min-width: 200px;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
                padding: 20px;
                display: flex;
                align-items: center;
                
                .card-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 16px;
                }
                
                .card-content {
                    flex: 1;
                    
                    .card-title {
                        font-size: 14px;
                        color: #666;
                        margin-bottom: 4px;
                    }
                    
                    .card-value {
                        font-size: 24px;
                        font-weight: bold;
                        color: #333;
                        margin-bottom: 4px;
                    }
                    
                    .card-growth {
                        font-size: 12px;
                        
                        .growth-rate {
                            color: #52c41a;
                            font-weight: bold;
                            margin-right: 4px;
                        }
                        
                        .growth-text {
                            color: #999;
                        }
                    }
                }
            }
        }
        
        > .echart-container {
            width: 100%;
            
            > .top-container {
                display: flex;
                flex-direction: row;
                height: 300px;
                margin-bottom: 30px;
                
                > .left,
                > .right {
                    width: 0;
                    flex: 1 1 0;
                }
                
                > .left {
                    margin-right: 20px;
                }
            }
            
            > .middle-container {
                width: 100%;
                height: 350px;
                margin-bottom: 30px;
            }
            
            > .bottom-container {
                display: flex;
                flex-direction: row;
                height: 300px;
                
                > .left,
                > .right {
                    width: 0;
                    flex: 1 1 0;
                }
                
                > .left {
                    margin-right: 20px;
                }
            }
        }
    }
}
</style>