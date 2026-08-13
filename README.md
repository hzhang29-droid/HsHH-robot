# HsHH Pet Robot

一个带屏幕表情、语音智能体和宠物头像定制能力的桌面陪伴机器人原型。

## MVP 范围

- 在 LCD 上播放 `idle`、`noticed`、`listening`、`thinking`、`happy`、`confused`、`sad`、`sleeping`、`angry` 和 `smile` 表情。
- 使用 TuyaOpen / ESP32 驱动屏幕、麦克风、扬声器及简单执行器。
- 将设备状态或智能体情绪映射到本地动画。
- 提供一个简单网页，上传宠物照片并预览定制头像。
- 后端负责 AI 调用、图片合成和动画资源打包。

## 两种显示模式

### 1. 基础表情模式（Basic）

- 直接使用设备内置的 robot/cat 表情资源，不需要用户上传照片。
- 支持全部 10 种表情和自然眨眼动画，开机即可使用，离线也能播放。
- 适合作为比赛期间稳定、可随时演示的默认模式。

### 2. 宠物定制模式（Pet）

- 用户通过网页拍照或上传猫狗照片，生成该宠物的统一身份形象。
- 保留宠物的毛色、花纹、耳形等身份特征，同时复用基础模式的眼睛、嘴巴、胡须和动画节奏。
- 生成结果仍包含相同的 10 种表情，每种表情 5 帧；设备下载资源包后可在本地播放。
- AI 只负责生成稳定的宠物身份层，程序负责套用表情骨架，避免每一帧的宠物长相发生变化。

两种模式共用同一套设备状态映射。设备默认使用 `basic`；宠物资源生成并校验成功后切换为 `pet`，资源缺失或损坏时自动退回 `basic`。

## 仓库结构

```text
.
├── firmware/              # TuyaOpen / ESP32 固件
├── web-app/               # 宠物照片上传 MVP
├── backend/               # AI 与图片合成接口
├── assets/expressions/    # 基础表情 PNG 帧与预览资源
├── assets/pets/           # 宠物资源包示例（不提交用户原始照片）
├── hardware/              # 接线、物料和原型照片
├── docs/                  # 架构、演示和协作文档
└── README.md
```

TuyaOpen SDK 不放入本仓库。每位固件开发者在本机单独安装 SDK，并使用团队约定的同一版本。

## 推荐分工

- `firmware/`：屏幕、动画、语音状态、传感器和执行器。
- `web-app/`：照片上传、生成进度、预览与设备绑定。
- `backend/`：图片理解、宠物身份图、表情合成与资源下载。
- `assets/`：设计导出的源帧、透明表情层和 GIF 预览。
- `hardware/`：接线图、BOM、外壳和机械结构记录。
- `docs/`：技术方案、每日进度、路演脚本和测试结果。

## 本地开始

```bash
git clone <repository-url>
cd HsHH-robot
git switch -c <your-branch-name>
```

固件开发者还需单独安装 TuyaOpen SDK：

```bash
git clone https://github.com/tuya/TuyaOpen.git ~/Developer/TuyaOpen
cd ~/Developer/TuyaOpen
. ./export.sh
tos.py version
tos.py check
```

## Git 协作约定

- `main` 始终保持可运行、可演示。
- 每项工作使用独立分支，如 `firmware/display`、`app/pet-upload`。
- 提交前先拉取最新 `main`，通过 Pull Request 合并。
- 禁止提交 API Key、Tuya UUID/AuthKey、Wi-Fi 密码或用户宠物原始照片。
- TuyaOpen IDE 统一使用 `0.1.5`；SDK commit 在确认开发板后记录到 `docs/development-setup.md`。

## 资源命名

```text
assets/expressions/idle/idle_01.png
assets/expressions/idle/idle_02.png
...
assets/expressions/angry/angry_05.png
```

宠物定制资源包沿用同样的表情和帧命名：

```text
pet-pack/<pet-id>/manifest.json
pet-pack/<pet-id>/expressions/idle/idle_01.png
...
pet-pack/<pet-id>/expressions/angry/angry_05.png
```

设备状态映射见 [docs/expression-map.json](docs/expression-map.json)。
