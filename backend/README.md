# Backend

后端负责：

- 图片类型与安全检查。
- 宠物特征分析与身份图生成。
- 读取透明表情帧并进行确定性合成。
- Tuya T5 输出规格：480×320、Landscape、黑色背景、四周 28 px 安全边距。
- 浏览器与中间 PNG 使用 RGB/RGBA；设备资源包在最终导出阶段编码为 RGB565。
- 输出 PNG 序列、GIF，以及后续的 EAF / RGB565 资源。
- 返回资源清单和短期下载地址。
- 按隐私规则删除用户原始照片。

MVP 建议先只实现 `idle`、`listening`、`happy`、`sleeping` 和 `angry`。

## 当前实现

- `POST /api/pets/analyze`：接收 JPEG、PNG 或 WebP，返回结构化宠物身份参数。
- `GET /api/health`：检查视觉模型和 Tuya 配置状态。
- `POST /api/pets/render`：已预留，等待参数化 SVG 设计源文件。
- `POST /api/tuya/devices/:deviceId/sync`：已预留，等待资源包和 Tuya Cloud 配置。

没有设置 `OPENAI_API_KEY` 时，分析接口运行在 mock 模式，方便前后端联调；响应中的 `mode` 会明确标记为 `mock`。

## 本地运行

```bash
cp .env.example .env
cd backend
npm install
npm run dev
```

默认地址为 `http://localhost:8787`。

测试健康检查：

```bash
curl http://localhost:8787/api/health
```

测试照片分析：

```bash
curl -X POST http://localhost:8787/api/pets/analyze \
  -F photo=@/path/to/pet.jpg \
  -F speciesHint=cat
```

API Key 只能存放在仓库根目录的 `.env` 中，不能进入 `web-app/` 或提交到 Git。
