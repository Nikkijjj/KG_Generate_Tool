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
    getAIResponse(params) {
        return service({
            url: '/askAI',
            method: 'post',
            data: params,
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
};

export default allApi;
