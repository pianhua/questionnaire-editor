# 问卷编辑器 (Questionnaire Editor)

一个现代化的在线问卷创建和管理系统，使用 React + TypeScript + Material-UI 构建。

## ✨ 功能特点

- 📝 **问题类型丰富**：支持文本题、单选题、多选题、评分题、排序题、矩阵题、日期题、时间题、文件上传
- 🤖 **AI智能生成**：通过描述需求，AI自动生成问卷内容
- 🎨 **主题定制**：支持自定义问卷主题和编辑器主题
- 📱 **响应式设计**：完美适配桌面端和移动端
- 🔄 **实时预览**：所见即所得的预览体验
- 📊 **数据分析**：收集和分析问卷 responses
- 💾 **本地存储**：数据自动保存在浏览器本地
- 📤 **导入导出**：支持 JSON 格式的导入导出

## 🛠️ 技术栈

- **前端框架**: React 18
- **语言**: TypeScript
- **UI 组件库**: Material-UI 5
- **状态管理**: Redux Toolkit
- **拖拽功能**: React DnD
- **构建工具**: Vite
- **AI 集成**: OpenAI / MiniMax API

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录

### 运行测试

```bash
npm test
```

## 🌐 云端部署

### Vercel 部署（推荐）

1. **方式一：使用 Vercel CLI**
   ```bash
   # 安装 Vercel CLI
   npm install -g vercel

   # 登录
   vercel login

   # 部署
   vercel

   # 生产环境部署
   vercel --prod
   ```

2. **方式二：使用 GitHub 自动部署**
   - 将代码推送到 GitHub 仓库
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 选择 GitHub 仓库
   - 点击 "Deploy"

### Docker 部署

```bash
# 构建镜像
docker build -t questionnaire-editor .

# 运行容器
docker run -p 8080:80 questionnaire-editor
```

## 📖 使用指南

### 创建问卷

1. 点击 "新建问卷" 按钮
2. 输入问卷标题和描述
3. 点击 "添加问题" 选择问题类型
4. 编辑问题内容
5. 设置问题选项（如适用）
6. 配置必填/选填

### AI 生成问卷

1. 点击工具栏中的 "AI 生成" 按钮
2. 在输入框中描述您的问卷需求
3. AI 将自动生成问卷内容
4. 选择想要保留的问题
5. 点击 "添加选中问题"

### 预览和填写

1. 点击 "预览" 按钮查看问卷效果
2. 点击 "填写" 按钮进入填写模式
3. 填写完成后点击 "提交"

### 主题定制

1. 点击 "设置" 按钮
2. 选择 "问卷主题" 自定义问卷外观
3. 或选择 "编辑器主题" 自定义编辑界面

## 📁 项目结构

```
src/
├── components/          # React 组件
│   ├── editors/         # 问题编辑器
│   └── ...
├── redux/              # Redux 状态管理
├── services/           # 服务层（API、存储等）
├── types/              # TypeScript 类型定义
├── utils/              # 工具函数
└── __tests__/          # 单元测试
```

## 🔧 环境变量

创建 `.env.local` 文件：

```env
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_MINIMAX_API_KEY=your_minimax_api_key
```

## 📝 License

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请通过 GitHub Issues 联系。