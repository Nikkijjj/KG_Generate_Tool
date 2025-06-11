/*jshint esversion: 9 */
import { service } from './request';
import qs from 'qs';

/** 公用接口 */
const allApi = {
    login() {
        // return service({
        //     url:"/public/captcha",
        //     method:'get',
        // });
        return Promise.resolve({
            msg: '操作成功',
            code: 200,
            token: 'eyJhbGciOiJIUzUxMiJ9.eyJsb2dpbl91c2VyX2tleSI6ImJmMmYyMWRlLTUwNzctNDUxNy1hYmRlLTA0NGE4NzNhMzE0ZSJ9.DOnUxWppbtKyJGlvSBZqdExf5hrt0EdWalanz_op7rvyc9v-itJJZXbW0xn_yS5SZfXLYn1BRMlTdxadUmRmAg',
        });
    },
    getUserInfo() {
        return Promise.resolve({
            msg: '操作成功',
            code: 200,
            data: {
                userName: 'admin',
                nickName: '管理员',
                avatar: 'https://s11.ax1x.com/2023/12/15/pihx4js.jpg',
            },
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
                name: 'upload-files',
                title: '上传数据',
                iconName: 'svg:laptop-check.svg',
            },
            {
                name: 'visual-kg-page',
                title: '可视化知识图谱',
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
};

export default allApi;
