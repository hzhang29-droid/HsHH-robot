# Architecture

```text
Mobile Web App
    |-- choose Basic mode
    `-- take/upload photo for Pet mode
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

## Display modes

```text
device/agent state
        |
        v
expression mapping (idle / listening / happy / ...)
        |
        v
mode selector
   |                 |
   v                 v
Basic assets      Pet asset pack
(built in)        (downloaded)
   |                 |
   `-------> LCD <---'
```

- `basic`：固件随附的默认表情资源，始终可用。
- `pet`：用户生成并下载到设备的定制资源包。
- 模式只决定使用哪套视觉资源，不改变语音智能体的状态逻辑。
- `pet` 资源包必须包含 manifest、全部必需表情和正确帧数；校验失败时回退到 `basic`。
