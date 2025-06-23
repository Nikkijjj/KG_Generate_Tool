<script>
import { defineComponent, reactive } from 'vue';
import publicApi from '@/http/public.js';
import userApi from '@/http/user.js';
import { messageSuccess, messageError } from '@/action/messagePrompt';
import { useRouter } from 'vue-router';
import { throttleFn_1 as throttleFn } from '@/common/debounceAndThrottle';
import { verifiedData } from '@/common/verifiedTools';
import { Select, ArrowRightBold, SemiSelect } from '@element-plus/icons-vue';
import img_1 from '@/assets/login-imgs/img-1.gif';
import img_2 from '@/assets/login-imgs/login-bg.svg';
import img_3 from '@/assets/login-imgs/code.svg';
import img_4 from '@/assets/login-imgs/login-bg-1.svg';
import img_5 from '@/assets/login-imgs/login-bg-2.svg';
import img_6 from '@/assets/login-imgs/login-bg-3.svg';
import img_7 from '@/assets/login-imgs/login-bg-4.png';

// TODO 要输入邮箱，后端注册的时候要有创建时间
// TODO 这次表单验证尽量把错误信息展示在输入框下面，不要弹出；最后点击注册的时候如果有哪个表单没满足，再弹出“请检查信息输入”

export default defineComponent({
    name: 'RegisterView', // ✅ 修改组件名
    components: {
        Select,
        ArrowRightBold,
        SemiSelect,
    },
    setup() {
        const router = useRouter();
        const dataContainer = reactive({
            form: {
                name: '',
                password: '',
                confirmPassword: '', // ✅ 新增字段
                captchaText: '',
            },
            loading: false,
            captchaSvg: '',
            captchaId: '',
            loading_1: false,
            img: {
                img_1,
                img_2,
                img_3,
                img_4,
                img_5,
                img_6,
                img_7,
            },
        });

        /** 验证信息 */
        function validBase(data) {
            const failData = verifiedData(data, {
                name: {
                    label: '账号不能为空！',
                    validate(value) {
                        return !!value;
                    },
                },
                password: {
                    label: '密码不能为空！',
                    validate(value) {
                        return !!value;
                    },
                },
                confirmPassword: {
                    label: '确认密码不能为空！',
                    validate(value) {
                        return !!value && value === data.password;
                    },
                },
                captchaText: {
                    label: '验证码不能为空！',
                    validate(value) {
                        return !!value;
                    },
                },
            });
            return failData;
        }

        /** 获取验证码 */
        const getCaptcha = throttleFn(function () {
            if (dataContainer.loading_1) return;
            dataContainer.loading_1 = true;
            publicApi
                .getCaptcha()
                .then((res) => {
                    const data = res.data || {};
                    dataContainer.captchaId = data.id;
                    dataContainer.captchaSvg = data.svg;
                    dataContainer.form.captchaText = '';
                })
                .catch(() => {
                    messageError('验证码获取失败');
                })
                .finally(() => {
                    dataContainer.loading_1 = false;
                });
        }, 700);
        getCaptcha();

        /** 注册操作 */
        const onRegister = throttleFn(function () {
            if (dataContainer.loading) return;
            const failData = validBase(dataContainer.form);
            if (failData) {
                messageError(failData[0].label);
                return;
            }
            dataContainer.loading = true;
            const params = {
                ...dataContainer.form,
                captchaId: dataContainer.captchaId,
            };
            userApi
                .register(params) // ✅ 修改为注册接口
                .then(() => {
                    messageSuccess('注册成功，请登录');
                    router.push('/login'); // ✅ 注册完成跳转到登录页
                })
                .catch((res) => {
                    messageError('注册失败：' + res.msg);
                })
                .finally(() => {
                    dataContainer.loading = false;
                    getCaptcha();
                });
        }, 700);

        return {
            dataContainer,
            onRegister,
            getCaptcha,
        };
    },
});
</script>

<template>
    <div class="login-view" :style="{
        '--bg-img-1': `url(${dataContainer.img.img_1})`,
        '--bg-img-2': `url(${dataContainer.img.img_2})`,
    }">
        <div class="img-bg">
            <el-image class="img" :src="dataContainer.img.img_4" fit="contain" />
        </div>
        <div class="container">
            <div class="left">
                <el-carousel :interval="7000" arrow="never">
                    <el-carousel-item v-for="i in 3" :key="i">
                        <div class="item">
                            <el-image class="img" :src="dataContainer.img[`img_${i + 4}`]" fit="contain" />
                        </div>
                    </el-carousel-item>
                </el-carousel>
            </div>
            <div class="right">
                <div class="container">
                    <div class="title">注 册</div> <!-- ✅ 修改标题 -->
                    <div class="input-container">
                        <SvgIcon style="width:20px;height:20px;margin-right:10px;" name="svg:zhanghao.svg"></SvgIcon>
                        <el-input clearable placeholder="账号" v-model="dataContainer.form.name" />
                    </div>
                    <div class="input-container">
                        <SvgIcon style="width:20px;height:20px;margin-right:10px;" name="svg:mima.svg"></SvgIcon>
                        <el-input type="password" clearable show-password placeholder="密码"
                            v-model="dataContainer.form.password" />
                    </div>
                    <div class="input-container">
                        <SvgIcon style="width:20px;height:20px;margin-right:10px;" name="svg:mima.svg"></SvgIcon>
                        <el-input type="password" clearable show-password placeholder="确认密码"
                            v-model="dataContainer.form.confirmPassword" />
                    </div>
                    <div class="input-container code">
                        <SvgIcon style="width:20px;height:20px;margin-right:10px;" name="svg:cat-code.svg"></SvgIcon>
                        <el-input v-model="dataContainer.form.captchaText" placeholder="验证码" clearable />
                        <el-image class="img" :src="dataContainer.captchaSvg" fit="cover" @click="getCaptcha"
                            style="cursor: pointer" />
                    </div>
                    <div class="bt-list">
                        <el-button class="login-bt" :loading="dataContainer.loading" @click="onRegister">
                            注 册 <!-- ✅ 修改按钮 -->
                        </el-button>
                    </div>
                    <div class="other">
                        <router-link to="/login"> 已有账号？去登录 </router-link> <!-- ✅ 跳转链接 -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.login-view {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: var(--bg-img-2);
    // background-size: cover;
    // backdrop-filter: blur(12px);
    background-size: contain;
    background-position: center bottom;
    background-repeat: no-repeat;
    // background: #007FFF;
    // background: linear-gradient(to right,rgba(0, 128, 255, 0.421),rgba(0, 89, 178, 0.421));
    padding: 15px;
    box-sizing: border-box;
    color: rgb(32, 32, 32);
    position: relative;

    >.img-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        pointer-events: none;
        display: flex;
        justify-content: center;
        align-items: center;

        >.img {
            width: 90%;
            height: 90%;
        }
    }

    >.container {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: row;
        width: 100%;
        max-width: 900px;
        background-color: rgb(255, 255, 255);
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 4px 4px 5px 0 rgba(0, 0, 0, 0.449);

        >.left {
            flex: 1 1 0;
            width: 0;
            // background-image: var(--bg-img-1);
            // background-size: cover;
            // box-shadow: inset 1px 0px 4px #0000006b;
            background-color: #e9e9e9;
            background-repeat: no-repeat;

            :deep(.el-carousel) {
                width: 100%;
                height: 100%;

                .el-carousel__container {
                    width: 100%;
                    height: 100%;

                    .item {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        position: relative;

                        >.img {
                            width: 100%;
                            max-width: 200px;
                            height: 100%;
                            max-height: 200px;
                            transform: scale(1.5) translateY(-40px);

                            &.img-1 {
                                transform: scale(1.7) translateY(-15px) translateX(-10px);
                            }

                            &.img-2 {
                                transform: scale(1.5) translateY(-30px);
                            }
                        }

                        >.title {
                            font-size: 20px;
                            color: #000000;
                            margin: 10px 0 0 0;
                            font-weight: bold;
                            position: absolute;
                            bottom: 80px;
                        }

                        >.content {
                            font-size: 15px;
                            color: #000000;
                            opacity: 0.7;
                            margin-top: 15px;
                            position: absolute;
                            bottom: 50px;
                        }
                    }
                }

                .el-carousel__indicators {
                    bottom: 10px;
                    --el-carousel-indicator-width: 40px;
                    --el-carousel-indicator-height: 7px;

                    .is-active {
                        .el-carousel__button {
                            width: 60px;
                            opacity: 1;
                        }
                    }

                    .el-carousel__button {
                        border-radius: 3px;
                        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.204);
                        background-color: #0059b2;
                        background: linear-gradient(to right, #007fff, #0059b2);
                        opacity: 0.3;
                    }
                }
            }
        }

        >.right {
            flex: 1 1 0;
            width: 0;

            >.container {
                width: 100%;
                height: 100%;
                padding: 20px 30px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                align-items: center;

                >.title {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    font-size: 22px;
                    font-weight: bold;
                }

                >.other-login-bt {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    justify-content: center;
                    margin: 15px 0;

                    >.item {
                        border: 1px solid #ddd;
                        border-radius: 50%;
                        display: inline-flex;
                        justify-content: center;
                        align-items: center;
                        margin: 0 10px;
                        height: 35px;
                        width: 35px;
                        cursor: pointer;
                        box-shadow: inset 0 1px 4px #0000001f;
                    }
                }

                >.content-1 {
                    font-size: 13px;
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    opacity: 0.8;
                }

                >.input-container {
                    width: 100%;
                    max-width: 300px;
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    background: #eee;
                    border: none;
                    padding: 0 15px;
                    margin: 20px 0 0 0;
                    border-radius: 5px;
                    height: 45px;
                    box-sizing: border-box;
                    transition: all 0.2s;
                    box-shadow: inset 0 1px 4px #0000001f;

                    &:focus-within {
                        box-shadow: inset 0 1px 4px #0000001f, 0 0 0 2px #007fff !important;
                    }

                    :deep(.el-input) {
                        flex: 1 1 0;
                        width: 0;
                        border: none;
                        box-shadow: none;
                        outline: none;
                        background-color: transparent;

                        .el-input__wrapper {
                            border: none;
                            box-shadow: none;
                            outline: none;
                            background-color: transparent;
                            padding: 0;

                            input {
                                font-size: 17px;
                            }
                        }

                        .el-input__suffix {
                            .el-icon {
                                font-size: 20px !important;
                                color: #3c3c3c !important;
                            }
                        }
                    }

                    &.code {
                        padding: 0 5px 0 15px;
                    }

                    >.img {
                        width: 100px;
                        height: calc(100% - 10px);
                        margin-left: 15px;
                        cursor: pointer;
                        border-radius: 5px;
                        border: 1px solid rgba(0, 0, 0, 0.156);
                    }
                }

                >.bt-list {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    margin: 20px 0;

                    :deep(.login-bt) {
                        border-radius: 999px;
                        border: none;
                        background: #007fff;
                        color: #fff;
                        font-size: 14px;
                        font-weight: bold;
                        padding: 12px 60px;
                        letter-spacing: 1px;
                        height: 45px;
                        background: linear-gradient(to right, #007fff, #0059b2);
                        box-shadow: 0 3px 3px -2px #0003, 0 3px 4px #00000024, 0 1px 8px #0000001f;
                    }
                }

                >.other {
                    font-size: 14px;
                    opacity: 0.5;
                    margin-top: 0;
                }
            }
        }
    }

    >.bottom {
        position: fixed;
        bottom: 15px;
        width: 100%;
        height: fit-content;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 13px;
        color: white;

        >* {
            margin: 0 15px;
        }
    }
}
</style>