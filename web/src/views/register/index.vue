<template>
  <div class="login-view" :style="{
    '--bg-img-1': `url(${img.img_1})`,
    '--bg-img-2': `url(${img.img_2})`,
  }">
    <div class="img-bg">
      <el-image class="img" :src="img.img_4" fit="contain" />
    </div>
    <div class="container">
      <div class="left">
        <el-carousel :interval="7000" arrow="never">
          <el-carousel-item v-for="i in 3" :key="i">
            <div class="item">
              <el-image class="img" :src="img[`img_${i + 4}`]" fit="contain" />
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
      <div class="right">
        <div class="container">
          <div class="title">注 册</div>

          <!-- 账号 -->
          <div class="input-container">
            <SvgIcon style="width:20px;height:20px;margin-right:10px;" name="svg:zhanghao.svg" />
            <el-input clearable placeholder="账号" v-model="form.name" />
          </div>

          <!-- 密码 -->
          <div class="input-container">
            <SvgIcon style="width:20px;height:20px;margin-right:10px;" name="svg:mima.svg" />
            <el-input type="password" clearable show-password placeholder="密码" v-model="form.password" />
          </div>
          <!-- 密码规则提示 -->
          <div style="color: #999; font-size: 12px;">
            密码长度5-16位，须包含大写字母、小写字母和数字
          </div>

          <!-- 确认密码 -->
          <div class="input-container">
            <SvgIcon style="width:20px;height:20px;margin-right:10px;" name="svg:mima.svg" />
            <el-input type="password" clearable show-password placeholder="确认密码" v-model="form.confirmPassword" />
          </div>

          <!-- 邮箱 -->
          <div class="input-container" style="display:flex; align-items:center;">
            <SvgIcon style="width:20px;height:20px;margin-right:10px;" name="svg:email.svg" />
            <el-input clearable placeholder="邮箱" v-model="form.email" style="flex: 1;" />
            <el-button size="small" type="primary" :loading="sendingCode" @click="sendEmailCode"
              style="margin-left: 10px; white-space: nowrap;">
              发送验证码
            </el-button>
          </div>

          <!-- 邮箱验证码 -->
          <div class="input-container">
            <SvgIcon style="width:20px;height:20px;margin-right:10px;" name="svg:cat-code.svg" />
            <el-input clearable placeholder="邮箱验证码" v-model="form.emailCode" />
          </div>

          <div class="bt-list">
            <el-button class="login-bt" :loading="loading" type="primary" @click="onRegister">
              注 册
            </el-button>
          </div>

          <div class="other">
            <router-link to="/login">已有账号？去登录</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import publicApi from '@/http/public.js';
import userApi from '@/http/user.js';
import { ElMessage } from 'element-plus';
import { throttleFn_1 as throttleFn } from '@/common/debounceAndThrottle';

import img_1 from '@/assets/login-imgs/img-1.gif';
import img_2 from '@/assets/login-imgs/login-bg.svg';
import img_3 from '@/assets/login-imgs/code.svg';
import img_4 from '@/assets/login-imgs/login-bg-1.svg';
import img_5 from '@/assets/login-imgs/login-bg-2.svg';
import img_6 from '@/assets/login-imgs/login-bg-3.svg';
import img_7 from '@/assets/login-imgs/login-bg-4.png';

const router = useRouter();

const form = reactive({
  name: '',
  password: '',
  confirmPassword: '',
  email: '',
  emailCode: '',
});

const loading = ref(false);
const sendingCode = ref(false);
const codeSent = ref(false);

const img = {
  img_1,
  img_2,
  img_3,
  img_4,
  img_5,
  img_6,
  img_7,
};

// 校验邮箱
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// 密码验证
function isValidPassword(pwd) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{5,16}$/.test(pwd);
}

// 表单验证
function validateForm() {
  if (!form.name) {
    ElMessage.error('账号不能为空');
    return false;
  }
  if (!form.password) {
    ElMessage.error('密码不能为空');
    return false;
  }
  if (!isValidPassword(form.password)) {
    ElMessage.error('密码不符合要求：需包含大小写字母和数字，长度5-16位');
    return false;
  }
  if (!form.confirmPassword) {
    ElMessage.error('请确认密码');
    return false;
  }
  if (form.password !== form.confirmPassword) {
    ElMessage.error('两次密码不一致');
    return false;
  }
  if (!form.email) {
    ElMessage.error('邮箱不能为空');
    return false;
  }
  if (!isValidEmail(form.email)) {
    ElMessage.error('邮箱格式不正确');
    return false;
  }
  if (!form.emailCode) {
    ElMessage.error('请输入邮箱验证码');
    return false;
  }
  return true;
}

// 发送验证码
const sendEmailCode = throttleFn(async () => {
  if (sendingCode.value) return;

  if (!form.email) {
    ElMessage.error('请输入邮箱后发送验证码');
    return;
  }
  if (!isValidEmail(form.email)) {
    ElMessage.error('邮箱格式不正确');
    return;
  }

  sendingCode.value = true;
  try {
    const res = await publicApi.sendEmailCode({ email: form.email });
    if (res.status === 200) {
      ElMessage.success('验证码已发送，请查收邮箱');
      codeSent.value = true;
    } else {
      ElMessage.error(res.msg || '验证码发送失败');
    }
  } catch (err) {
    ElMessage.error('验证码发送异常');
  } finally {
    sendingCode.value = false;
  }
}, 2000);

// 注册
const onRegister = throttleFn(async () => {
  if (loading.value) return;

  if (!validateForm()) return;

  loading.value = true;
  try {
    const params = {
      name: form.name,
      password: form.password,
      email: form.email,
      emailCode: form.emailCode,
    };
    const res = await userApi.register(params);
    ElMessage.success('注册成功，请登录');
    router.push('/login');
  } catch (err) {
    ElMessage.error('注册失败：' + (err.msg || err.message || '未知错误'));
  } finally {
    loading.value = false;
  }
}, 700);
</script>

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