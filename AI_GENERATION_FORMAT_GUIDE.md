# AI生成问卷格式要求文档

## 1. 概述

本文档定义了AI生成问卷的标准JSON格式，确保生成的问卷能够正确导入到问卷编辑器中使用。AI助手应严格按照此格式生成问卷数据。

## 2. 基础格式结构

```json
{
  "title": "问卷标题",
  "description": "问卷描述（可选）",
  "questions": [
    // 问题列表
  ]
}
```

## 3. 问题类型及格式

### 3.1 文本题 (text)

```json
{
  "type": "text",
  "title": "请介绍一下您的背景",
  "description": "包括您的职业、教育背景等",
  "required": true,
  "placeholder": "请输入...",
  "multiline": true,
  "maxLength": 500
}
```

**字段说明**：
- `type`: 必须为 `text`
- `title`: 问题标题（必填）
- `description`: 问题描述（可选）
- `required`: 是否必填，布尔值（必填）
- `placeholder`: 输入框占位文字（可选）
- `multiline`: 是否支持多行输入，默认 true（可选）
- `maxLength`: 最大字符数限制（可选）

### 3.2 单选题 (single_choice)

```json
{
  "type": "single_choice",
  "title": "您的年龄段是？",
  "description": "请选择最符合的选项",
  "required": true,
  "options": [
    {"text": "18-25岁"},
    {"text": "26-35岁"},
    {"text": "36-45岁"},
    {"text": "46岁以上"}
  ],
  "randomizeOptions": false
}
```

**字段说明**：
- `type`: 必须为 `single_choice`
- `title`: 问题标题（必填）
- `description`: 问题描述（可选）
- `required`: 是否必填，布尔值（必填）
- `options`: 选项列表，每个选项包含 `text` 字段（必填）
- `randomizeOptions`: 是否随机排列选项，默认 false（可选）

### 3.3 多选题 (multiple_choice)

```json
{
  "type": "multiple_choice",
  "title": "您喜欢的运动类型有哪些？",
  "description": "可多选",
  "required": true,
  "options": [
    {"text": "跑步"},
    {"text": "游泳"},
    {"text": "健身"},
    {"text": "球类运动"}
  ],
  "randomizeOptions": false,
  "minSelections": 1,
  "maxSelections": 3
}
```

**字段说明**：
- `type`: 必须为 `multiple_choice`
- `title`: 问题标题（必填）
- `description`: 问题描述（可选）
- `required`: 是否必填，布尔值（必填）
- `options`: 选项列表，每个选项包含 `text` 字段（必填）
- `randomizeOptions`: 是否随机排列选项，默认 false（可选）
- `minSelections`: 最少选择数量（可选）
- `maxSelections`: 最多选择数量（可选）

### 3.4 评分题 (rating)

```json
{
  "type": "rating",
  "title": "您对我们的服务满意度如何？",
  "description": "请选择评分",
  "required": true,
  "min": 1,
  "max": 5,
  "labels": ["非常不满意", "不满意", "一般", "满意", "非常满意"]
}
```

**字段说明**：
- `type`: 必须为 `rating`
- `title`: 问题标题（必填）
- `description`: 问题描述（可选）
- `required`: 是否必填，布尔值（必填）
- `min`: 最小评分值（必填）
- `max`: 最大评分值（必填）
- `labels`: 评分标签数组，长度应与评分范围一致（可选）

### 3.5 排序题 (ranking)

```json
{
  "type": "ranking",
  "title": "请对以下因素按重要性排序",
  "description": "拖动选项进行排序",
  "required": true,
  "options": [
    {"text": "价格"},
    {"text": "质量"},
    {"text": "服务"},
    {"text": "品牌"}
  ]
}
```

**字段说明**：
- `type`: 必须为 `ranking`
- `title`: 问题标题（必填）
- `description`: 问题描述（可选）
- `required`: 是否必填，布尔值（必填）
- `options`: 选项列表，每个选项包含 `text` 字段（必填）

### 3.6 矩阵题 (matrix)

```json
{
  "type": "matrix",
  "title": "请对以下产品特性进行评价",
  "description": "选择每个特性的满意度",
  "required": true,
  "rows": [
    {"text": "产品质量"},
    {"text": "价格合理性"},
    {"text": "服务态度"}
  ],
  "columns": [
    {"text": "非常满意"},
    {"text": "满意"},
    {"text": "一般"},
    {"text": "不满意"}
  ]
}
```

**字段说明**：
- `type`: 必须为 `matrix`
- `title`: 问题标题（必填）
- `description`: 问题描述（可选）
- `required`: 是否必填，布尔值（必填）
- `rows`: 行选项列表，每个选项包含 `text` 字段（必填）
- `columns`: 列选项列表，每个选项包含 `text` 字段（必填）

### 3.7 文件上传题 (file_upload)

```json
{
  "type": "file_upload",
  "title": "请上传您的简历",
  "description": "支持PDF、Word格式",
  "required": true,
  "accept": ".pdf,.doc,.docx",
  "maxSize": 5
}
```

**字段说明**：
- `type`: 必须为 `file_upload`
- `title`: 问题标题（必填）
- `description`: 问题描述（可选）
- `required`: 是否必填，布尔值（必填）
- `accept`: 接受的文件类型（可选）
- `maxSize`: 最大文件大小（MB）（可选）

### 3.8 日期题 (date)

```json
{
  "type": "date",
  "title": "请选择您的出生日期",
  "description": "",
  "required": true
}
```

**字段说明**：
- `type`: 必须为 `date`
- `title`: 问题标题（必填）
- `description`: 问题描述（可选）
- `required`: 是否必填，布尔值（必填）

### 3.9 时间题 (time)

```json
{
  "type": "time",
  "title": "请选择您的最佳联系时间",
  "description": "",
  "required": true
}
```

**字段说明**：
- `type`: 必须为 `time`
- `title`: 问题标题（必填）
- `description`: 问题描述（可选）
- `required`: 是否必填，布尔值（必填）

## 4. AI生成提示词模板

### 4.1 基础提示词

```
请帮我生成一份问卷，要求如下：

1. 问卷主题：[填写主题]
2. 问题数量：[填写数量，如5-10个]
3. 问题类型要求：
   - 必须包含文本题
   - 必须包含选择题（单选/多选）
   - 可选包含评分题、排序题、矩阵题等
4. 问卷目的：[填写目的]

请严格按照以下JSON格式返回，不要包含任何其他内容：
{
  "title": "问卷标题",
  "description": "问卷描述",
  "questions": [
    {
      "type": "问题类型",
      "title": "问题标题",
      "description": "问题描述（可选）",
      "required": true或false,
      // 根据类型添加其他字段...
    }
  ]
}

支持的type类型：
- text: 文本题
- single_choice: 单选题
- multiple_choice: 多选题
- rating: 评分题
- ranking: 排序题
- matrix: 矩阵题
- file_upload: 文件上传题
- date: 日期题
- time: 时间题
```

### 4.2 高级提示词

```
请作为专业的问卷设计助手，帮我设计一份[主题]调查问卷。

要求：
1. 共包含8-12个问题
2. 问题类型要多样化
3. 选项要合理、符合实际场景
4. 每个问题都要标注必填/选填
5. 问卷结构清晰，逻辑合理

请生成JSON格式的问卷数据，格式如下：

{
  "title": "问卷标题",
  "description": "简短描述",
  "questions": [
    // 问题数组
  ]
}

问题类型说明：
- text: 文本输入题，需要多行输入
- single_choice: 单选题，需要options数组
- multiple_choice: 多选题，需要options数组
- rating: 评分题，需要min/max/labels
- ranking: 排序题，需要options数组
- matrix: 矩阵题，需要rows和columns
- date: 日期题
- time: 时间题
- file_upload: 文件上传题

示例问题结构：
单选：{"type": "single_choice", "title": "...", "required": true, "options": [{"text": "选项1"}, {"text": "选项2"}]}
评分：{"type": "rating", "title": "...", "required": true, "min": 1, "max": 5, "labels": ["非常不满意", "不满意", "一般", "满意", "非常满意"]}

请直接返回JSON，不要加markdown代码块标记，不要包含任何其他说明文字。
```

## 5. 格式验证规则

### 5.1 必填字段检查
- `title` 必须是非空字符串
- `questions` 必须是非空数组
- 每个问题的 `type` 必须是有效的问题类型
- 每个问题的 `required` 必须是布尔值

### 5.2 选项验证
- 选择题（single_choice/multiple_choice/ranking）必须有 `options` 数组
- 选项数组不能为空
- 每个选项必须包含 `text` 字段

### 5.3 特殊类型验证
- rating题必须有 `min` 和 `max` 字段
- matrix题必须有 `rows` 和 `columns` 字段

## 6. 最佳实践

1. **问题设计**：
   - 问题表述清晰明确
   - 避免引导性问题
   - 选项设置合理全面

2. **问卷结构**：
   - 逻辑顺序合理
   - 问题类型多样化
   - 长度适中，避免过长

3. **格式规范**：
   - 严格按照JSON格式返回
   - 确保所有必填字段完整
   - 验证数据结构的正确性

4. **用户体验**：
   - 提供清晰的问题描述
   - 合理设置必填/选填
   - 选项数量适中

## 7. 示例问卷

### 7.1 客户满意度调查

```json
{
  "title": "客户满意度调查问卷",
  "description": "感谢您使用我们的产品，您的反馈对我们非常重要",
  "questions": [
    {
      "type": "text",
      "title": "请输入您的姓名",
      "description": "",
      "required": false,
      "placeholder": "请输入您的姓名"
    },
    {
      "type": "single_choice",
      "title": "您使用我们产品的时间",
      "description": "",
      "required": true,
      "options": [
        {"text": "1个月以内"},
        {"text": "1-3个月"},
        {"text": "3-6个月"},
        {"text": "6个月以上"}
      ]
    },
    {
      "type": "multiple_choice",
      "title": "您使用过我们的哪些功能？",
      "description": "可多选",
      "required": true,
      "options": [
        {"text": "基础功能"},
        {"text": "高级功能"},
        {"text": "客服支持"},
        {"text": "在线帮助"}
      ],
      "maxSelections": 3
    },
    {
      "type": "rating",
      "title": "您对我们产品的整体满意度",
      "description": "",
      "required": true,
      "min": 1,
      "max": 5,
      "labels": ["非常不满意", "不满意", "一般", "满意", "非常满意"]
    },
    {
      "type": "text",
      "title": "您对我们产品有什么建议？",
      "description": "",
      "required": false,
      "placeholder": "请输入您的建议",
      "multiline": true,
      "maxLength": 500
    }
  ]
}
```

### 7.2 市场调研问卷

```json
{
  "title": "市场调研问卷",
  "description": "我们正在进行市场调研，您的意见对我们非常重要",
  "questions": [
    {
      "type": "single_choice",
      "title": "您的性别",
      "description": "",
      "required": true,
      "options": [
        {"text": "男"},
        {"text": "女"}
      ]
    },
    {
      "type": "single_choice",
      "title": "您的年龄段",
      "description": "",
      "required": true,
      "options": [
        {"text": "18-25岁"},
        {"text": "26-35岁"},
        {"text": "36-45岁"},
        {"text": "46岁以上"}
      ]
    },
    {
      "type": "ranking",
      "title": "请对以下因素按重要性排序",
      "description": "1表示最不重要，5表示最重要",
      "required": true,
      "options": [
        {"text": "价格"},
        {"text": "质量"},
        {"text": "品牌"},
        {"text": "服务"},
        {"text": "外观"}
      ]
    },
    {
      "type": "matrix",
      "title": "请对以下品牌进行评价",
      "description": "",
      "required": true,
      "rows": [
        {"text": "品牌A"},
        {"text": "品牌B"},
        {"text": "品牌C"}
      ],
      "columns": [
        {"text": "非常了解"},
        {"text": "了解"},
        {"text": "一般"},
        {"text": "不了解"}
      ]
    }
  ]
}
```

## 8. 常见错误及解决方案

### 8.1 格式错误
- **错误**：缺少必填字段
  **解决**：确保每个问题都包含 `type`、`title` 和 `required` 字段

- **错误**：问题类型不正确
  **解决**：使用支持的问题类型：text、single_choice、multiple_choice、rating、ranking、matrix、file_upload、date、time

- **错误**：选择题缺少选项
  **解决**：确保选择题包含非空的 `options` 数组

### 8.2 内容错误
- **错误**：问题表述不清晰
  **解决**：使用简洁明了的语言表述问题

- **错误**：选项设置不合理
  **解决**：确保选项覆盖所有可能的情况，避免重叠或遗漏

- **错误**：问卷结构混乱
  **解决**：按照逻辑顺序组织问题，从简单到复杂

## 9. 结论

AI生成问卷时，应严格按照本文档定义的格式要求生成JSON数据，确保生成的问卷能够正确导入到问卷编辑器中使用。同时，应遵循问卷设计的最佳实践，确保生成的问卷结构合理、内容清晰、用户体验良好。

通过遵循这些格式要求和最佳实践，AI助手可以生成高质量的问卷，满足用户的各种调研需求。