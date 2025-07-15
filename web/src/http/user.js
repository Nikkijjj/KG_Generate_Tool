/*jshint esversion: 9 */
import { service } from './request';
import qs from 'qs';

/** 公用接口 */
const allApi = {
    // login() {
    // return service({
    //     url:"/public/captcha",
    //     method:'get',
    // });
    // return Promise.resolve({
    //     msg: '操作成功',
    //     code: 200,
    //     token: 'eyJhbGciOiJIUzUxMiJ9.eyJsb2dpbl91c2VyX2tleSI6ImJmMmYyMWRlLTUwNzctNDUxNy1hYmRlLTA0NGE4NzNhMzE0ZSJ9.DOnUxWppbtKyJGlvSBZqdExf5hrt0EdWalanz_op7rvyc9v-itJJZXbW0xn_yS5SZfXLYn1BRMlTdxadUmRmAg',
    // });
    // },
    login(params) {
        return service({
            url: '/public/login',
            method: 'post',
            data: params
        });
    },
    register(params) {
        return service({
            url: '/public/register',
            method: 'post',
            data: params
        });
    },
    getUserInfo() {
        return service({
            url: '/util/getUserInfo',
            method: 'get'
        });
    },
    getMenuList() {
        let menuList = [
            {
                name: 'main-index',
                title: '首页',
                content: '(有缓存，并且标签页固定)',
                isCache: true,
                fixed: true,
                iconName: 'svg:all-fill.svg',
            },
            {
                name: 'new-tag-page',
                title: '新标签页',
                isCache: true,
                hidden: true,
            },
            {
                name: 'main-401',
                title: '401页面',
                isCache: true,
                hidden: true,
            },
            {
                name: 'main-404',
                title: '404页面',
                isCache: true,
                hidden: true,
            },
            {
                name: 'main-mine-info',
                title: '个人中心',
                isCache: true,
                hidden: true,
            },
            {
                name: 'main-mine-info-update',
                title: '个人信息修改',
                isCache: true,
                hidden: true,
            },
            {
                name: 'main-mine-info-password',
                title: '修改密码',
                isCache: true,
                hidden: true,
            },
            {
                name: 'project-manage',
                title: '项目管理空间',
                iconName: 'svg:laptop-check.svg',
            },
            {
                name: 'data-library',
                title: '数据仓库',
                iconName: 'svg:laptop-check.svg',
            },
            {
                name: 'abstract_kg',
                title: '知识图谱抽取中心',
                hidden: true,
                iconName: 'svg:laptop-check.svg',
            },
            {
                name: 'upload-files',
                title: '上传数据',
                hidden: true,
                iconName: 'svg:laptop-check.svg',
            },
            {
                name: 'visual-kg-page',
                title: '可视化知识图谱',
                hidden: true,
                iconName: 'svg:laptop-check.svg',
            },
            {
                name: 'ask-ai',
                title: 'AI问答助手',
                iconName: 'svg:laptop-check.svg',
            },
            {
                name: 'mine',
                title: '个人中心',
                isCache: true,
                content: '(有缓存)',
                hidden: true,
                iconName: 'svg:Navbar-full.svg',
            }
        ];
        return Promise.resolve({
            msg: '操作成功',
            code: 200,
            data: menuList,
        });
    },
    // 文本预处理相关接口
    loadOperationData(params) {
        return service({
            url: '/textPreprocess_api',
            method: 'post',
            data: params
        });
    },

    searchAnnouncements(params) {
        return service({
            url: '/textPreprocess_api/search',
            method: 'post',
            data: params
        });
    },

    deleteAnnouncements(params) {
        return service({
            url: '/textPreprocess_api/deleteAnnouncements',
            method: 'post',
            data: params
        });
    },

    uploadAnnouncements(params) {
        return service({
            url: '/textPreprocess_api/uploadAnnouncements',
            method: 'post',
            data: params,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    addAnnouncement(params) {
        return service({
            url: '/textPreprocess_api/addAnnouncement',
            method: 'post',
            data: params
        });
    },

    updateAnnouncement(params) {
        return service({
            url: '/textPreprocess_api/updateAnnouncement',
            method: 'post',
            data: params
        });
    },

    // 知识图谱抽取相关接口
    getProjectAnnouncements(params) {
        return service({
            url: '/extractSample/getProjectAnnouncements',
            method: 'post',
            data: params
        });
    },

    saveSelectData(params) {
        return service({
            url: '/extractSample/saveSelectData',
            method: 'post',
            data: params
        });
    },

    deleteSelectedData(params) {
        return service({
            url: '/extractSample/deleteSelectedData',
            method: 'post',
            data: params
        });
    },

    startExtraction(params) {
        return service({
            url: '/extractSample/startExtraction',
            method: 'post',
            data: params
        });
    },

    getExtractionProgress(params) {
        return service({
            url: '/extractSample/getExtractionProgress',
            method: 'post',
            data: params
        });
    },

    loadExtractText(params) {
        return service({
            url: '/extractionProcess/getAllTextData',
            method: 'post',
            data: params,
        });
    },
    getAIResponse(params, config = {}) {
        return service({
            url: '/askAI',
            method: 'post',
            data: params,
            timeout: 60000, // 设置超时时间为20秒
            ...config, // 允许外部传递额外配置
        });
    },
    getProjectList(params) {
        return service({
            url: '/getProjectList',
            method: 'post',
            data: params,
        })
    },
    addProject(params) {
        return service({
            url: '/addProject',
            method: 'post',
            data: params,
        });
    },
    deleteProject(params) {
        return service({
            url: '/deleteProject',
            method: 'POST',
            data: params,
        });
    },
    editProject(params) {
        return service({
            url: '/editProject',
            method: 'post',
            data: params,
        });
    },
       // 节点相关接口
    getNodesByProject(params) {
        return service({
            url: '/get_nodes_by_project',
            method: 'get',
            params
        });
    },

    // extractNodesWithLLM(params, config) {
    //     return service({
    //         url: '/extract_nodes_with_llm',
    //         method: 'post',
    //         data: params,
    //         onDownloadProgress: config?.onDownloadProgress,
    //         responseType: 'stream'
    //     });
    // },
    extractNodesWithLLM(params, config) {
        return service({
            url: '/extract_nodes_with_llm',
            method: 'post',
            data: params,
            responseType: 'stream',  // 使用stream类型
            onDownloadProgress: config?.onDownloadProgress,
            headers: {
                'Accept': 'application/x-ndjson'
            }
        });
    },
   
    deleteNodesByProject: (data) => {
        return service({
            url: '/delete_nodes_by_project',
            method: 'post',
            data: data,  // 使用data传递JSON参数
            headers: {
            'Content-Type': 'application/json'  // 明确设置Content-Type
            }
        });
    },

    // 关系抽取相关接口
// extractRelations(params, config) {
//     return service({
//         url: '/extract_relations',
//         method: 'post',
//         data: params,
//         responseType: 'stream',  // 使用stream类型接收流式响应
//         onDownloadProgress: config?.onDownloadProgress,
//         headers: {
//             'Accept': 'application/x-ndjson'
//         }
//     });
// },
extractRelations(params) {
    return service({
        url: '/extract_relations',
        method: 'post',
        data: params,  // 使用 data 而不是 params
        headers: {
            'Content-Type': 'application/json'  // 明确设置 Content-Type
        }
    });
},

deleteEdgesByProject: (params) => {
  return service({
    url: '/delete_edges_by_project',
    method: 'post',
    data: params
  });
},

// 获取项目关系数据
getEdgesByProject(params) {
    return service({
        url: '/get_edges_by_project',
        method: 'get',
        params
    });
},

// 获取知识图谱可视化HTML文件
getKgVisualization(params) {
    return service({
        url: '/get_kg_visualization',
        method: 'get',
        params
    });
},

// 删除项目关系数据
// deleteEdgesByProject(data) {
//     return service({
//         url: '/delete_edges_by_project',
//         method: 'post',
//         data: data,
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     });
// },

// 获取完整的图谱数据（节点+边）
getFullGraphData(params) {
    return service({
        url: '/get_full_graph_data',
        method: 'get',
        params
    });
}
};

export default allApi;
