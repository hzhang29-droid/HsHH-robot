# Backend

后端负责：

- 图片类型与安全检查。
- 宠物特征分析与身份图生成。
- 读取透明表情帧并进行确定性合成。
- 输出 PNG 序列、GIF，以及后续的 EAF / RGB565 资源。
- 返回资源清单和短期下载地址。
- 按隐私规则删除用户原始照片。

MVP 建议先只实现 `idle`、`listening`、`happy`、`sleeping` 和 `angry`。

