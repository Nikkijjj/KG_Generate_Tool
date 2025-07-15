<template>
  <div class="chat-card">
    <header class="chat-header">
      <h1>AI 问答助手</h1>
      <p class="subtitle">随时为您解答各种问题</p>
    </header>

    <div class="chat-main">
      <div class="chat-messages" ref="messagesContainer">
        <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
          <div class="message-avatar">
            <img v-if="message.role === 'user'" src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="用户">
            <img v-else src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" alt="AI">
          </div>
          <div class="message-content">
            <div class="message-text">
              <VueMarkdown :source="message.content" />
            </div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>

        <div v-if="isLoading" class="message assistant">
          <div class="message-avatar">
            <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" alt="AI">
          </div>
          <div class="message-content">
            <div class="message-text typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input-area">
        <form @submit.prevent="sendMessage">
          <div class="input-container">
            <input v-model="userInput" type="text" placeholder="向AI提问..." @keydown.enter="sendMessage" />
            <button type="submit" :disabled="isLoading">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <p class="input-hint">AI可能会犯错，请核实重要信息</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import userApi from '@/http/user.js';
import VueMarkdown from 'vue3-markdown-it';

axios.defaults.withCredentials = true;

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// 路由变量
const route = useRoute();
// 项目id
const projectId = ref(route.params.askId as string || '');

const userInput = ref('');
const isLoading = ref(false);
const messages = ref<Message[]>([]);
const messagesContainer = ref<HTMLElement | null>(null);

// loading变量
const loadingResponse = ref(false);

onMounted(() => {
  console.log("跳转后：", route.params.askId);
  projectId.value = route.params.askId as string;
  addMessage({
    role: 'assistant',
    content: '您好！我是AI问答助手，有什么可以帮您的吗？',
    timestamp: new Date()
  });
});

const addMessage = (message: Message) => {
  messages.value.push(message);
  scrollToBottom();
};

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;

  const userMessage = {
    role: 'user' as const,
    content: userInput.value,
    timestamp: new Date()
  };

  addMessage(userMessage);

  isLoading.value = true;
  userInput.value = '';

  const aiContent = await getAIResponse(userMessage.content);

  const aiResponse = {
    role: 'assistant' as const,
    content: aiContent,
    timestamp: new Date()
  };

  addMessage(aiResponse);
  isLoading.value = false;
};

const getAIResponse = async (question: string): Promise<string> => {
  if (loadingResponse.value) return '';
  loadingResponse.value = true;
  try {
    // TODO 把项目ID改成页面跳转传来的参数！
    const params = {
      id: "123",
      query: question
    };
    const response = await userApi.getAIResponse(params);
    const answer = response.answer;
    return answer || '抱歉，AI暂时还不能回答这个问题！';
  } catch (error: any) {
    const errMsg = error?.response?.data?.msg || error.message || 'AI离线了······';
    ElMessage.error(errMsg);
    return 'AI处理出错，请稍后再试！';
  } finally {
    loadingResponse.value = false;
  }
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// 确保消息生成后滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};
</script>

<style scoped lang="scss">
.chat-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1000px;
  height: 100%;
  background-color: #ffffff;
  border-radius: 5px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-header {
  padding: 4px;
  text-align: center;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e5e6;

  h1 {
    margin: 0;
    font-size: 1.25rem;
    color: #333;
    font-weight: 600;
  }

  .subtitle {
    margin: 0rem 0 0;
    font-size: 0.75rem;
    color: #666;
  }
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  scroll-behavior: smooth;
  background-color: #f7f7f8;
}

.message {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;

  &.user {
    flex-direction: row-reverse;

    .message-content {
      align-items: flex-end;
    }

    .message-text {
      background-color: #3b82f6;
      color: white;
      border-radius: 18px 18px 4px 18px;
    }
  }

  &.assistant {
    .message-text {
      background-color: #ffffff;
      color: #333;
      border: 1px solid #e5e5e6;
      border-radius: 18px 18px 18px 4px;
    }
  }
}

.message-avatar {
  img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
  }
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  max-width: calc(100% - 50px);
  font-size: 0.88rem; 
}

.message-text {
  padding: 0.5rem 0.75rem;
  line-height: 1.4;
  word-break: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-time {
  font-size: 0.75rem;
  color: #999;
}

.chat-input-area {
  padding: 1rem;
  background-color: #ffffff;
  border-top: 1px solid #e5e5e6;

  form {
    width: 100%;
  }
}

.input-container {
  display: flex;
  align-items: center;
  background-color: #f7f7f8;
  border-radius: 24px;
  padding: 0.3rem 1rem;
  border: 1px solid #e5e5e6;
  transition: all 0.2s;

  &:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }

  input {
    flex: 1;
    border: none;
    background: transparent;
    padding: 0.1rem;
    font-size: 0.875rem;
    outline: none;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    color: #3b82f6;
    transition: color 0.2s;

    &:disabled {
      color: #ccc;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      color: #2563eb;
    }
  }
}

.input-hint {
  margin: 0.35rem 0 0;
  font-size: 0.75rem;
  color: #999;
  text-align: center;
}

.typing-indicator {
  display: flex;
  align-items: center;
  height: 24px;

  span {
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: #999;
    border-radius: 50%;
    margin: 0 2px;
    animation: bounce 1.4s infinite ease-in-out;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes bounce {

  0%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-6px);
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .chat-card {
    height: calc(100vh - 2rem);
    border-radius: 12px;
  }

  .chat-header {
    padding: 1rem;
  }

  .chat-messages {
    padding: 1rem;
  }

  .chat-input-area {
    padding: 1rem;
  }
}
</style>