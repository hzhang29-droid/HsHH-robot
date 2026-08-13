# Architecture

```text
Mobile Web App
    |
    | upload photo / preview result
    v
Backend API
    |-- image safety and pet analysis
    |-- AI-generated pet identity artwork
    |-- deterministic expression compositor
    `-- asset manifest and storage
             |
             v
        Tuya Cloud / HTTPS
             |
             v
TuyaOpen device (T5 or ESP32)
    |-- local expression player
    |-- microphone / speaker
    |-- emotion and state mapping
    `-- wheels / servos / sensors
```

## Design principle

AI 只生成一次宠物身份层；已有矢量表情骨架负责所有动态帧。这样可以避免同一只宠物在不同帧之间产生毛色、花纹和脸型跳变。

