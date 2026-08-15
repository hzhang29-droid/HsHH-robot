# Web App

手机优先的宠物角色定制页面。当前版本是无依赖的静态原型，可完成：

- 拍照或上传宠物照片（仅浏览器本地预览）
- 填写品种、毛色、眼睛颜色、脸型和性格
- 模拟生成过程并预览 4 种核心表情
- 展示 Tuya 设备绑定与同步入口

机器人预览直接播放 `assets/expressions/` 中的固定表情帧，不在完整 PNG 上叠加另一套五官。未来后端应把宠物毛色、花纹和眼睛颜色合成到同尺寸、同坐标的帧内部，生成 `pet-pack/<pet-id>/expressions/...`；前端与固件只负责播放最终帧。

## 本地运行

在仓库根目录执行：

```bash
python3 -m http.server 4173
```

然后访问 `http://localhost:4173/web-app/`。页面会从同一仓库的 `assets/expressions/` 读取基础表情帧，因此本地服务器需要从仓库根目录启动。

同时在另一个终端启动后端：

```bash
cd backend
npm start
```

网页点击“生成我的宠物角色”后会把照片提交到 `http://localhost:8787/api/pets/analyze`，并展示视觉模型返回的真实毛色、花纹、眼睛和置信度。

## 后续 API 接入

前端建议请求项目后端，由后端负责 AI 生成和 Tuya OpenAPI 调用。Access ID、Access Secret、设备 AuthKey 等敏感信息只能存在后端环境变量中，不能进入浏览器代码。

建议接口：

- `POST /api/pets/generate`：上传照片与表单数据，创建生成任务
- `GET /api/pets/jobs/:id`：读取生成进度和结果
- `POST /api/tuya/devices/bind`：绑定用户设备
- `POST /api/tuya/devices/:id/assets`：向设备下发表情资源包
