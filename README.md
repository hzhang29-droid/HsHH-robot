# HsHH Pet Robot

一个带屏幕表情、语音智能体和宠物头像定制能力的桌面陪伴机器人原型。

## MVP 范围

- 在 LCD 上播放 `idle`、`noticed`、`listening`、`thinking`、`happy`、`confused`、`sad`、`sleeping`、`angry` 和 `smile` 表情。
- 使用 TuyaOpen / ESP32 驱动屏幕、麦克风、扬声器及简单执行器。
- 将设备状态或智能体情绪映射到本地动画。
- 提供一个简单网页，上传宠物照片并预览定制头像。
- 后端负责 AI 调用、图片合成和动画资源打包。

## 仓库结构

```text
.
├── firmware/              # TuyaOpen / ESP32 固件
├── web-app/               # 宠物照片上传 MVP
├── backend/               # AI 与图片合成接口
├── assets/expressions/    # 表情 PNG 帧与预览资源
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
cd HsHH_Hackson
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

设备状态映射见 [docs/expression-map.json](docs/expression-map.json)。

