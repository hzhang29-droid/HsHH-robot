const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const API_BASE = window.HSHH_API_BASE
  || (/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname) ? "http://localhost:8787" : "");
const DEVICE_FRAME = Object.freeze({
  width: 480,
  height: 320,
  safeMargin: 28,
  sourceWidth: 332,
  sourceHeight: 252
});
const state = { species: "猫猫", personalities: ["黏人"], customPersonality: "", companionship: 64, photoUrl: null, identity: null };
const uploadCard = $("#uploadCard");
const photoInput = $("#photoInput");
const photoPreview = $("#photoPreview");
const toast = $("#toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function openPhotoPicker() { photoInput.click(); }
$("#uploadButton").addEventListener("click", openPhotoPicker);
$("#replacePhoto").addEventListener("click", openPhotoPicker);

photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) return showToast("图片请控制在 10MB 以内");
  if (state.photoUrl) URL.revokeObjectURL(state.photoUrl);
  state.photoUrl = URL.createObjectURL(file);
  photoPreview.src = state.photoUrl;
  uploadCard.classList.add("has-photo");
});

$$('.segmented button').forEach((button) => button.addEventListener("click", () => {
  $$('.segmented button').forEach((item) => item.classList.remove("selected"));
  button.classList.add("selected");
  state.species = button.dataset.species;
}));

function selectedPersonalities() {
  return [...state.personalities, state.customPersonality].filter(Boolean).slice(0, 3);
}

$$('#personalityChips button').forEach((button) => button.addEventListener("click", () => {
  if (button.dataset.customTrigger !== undefined) {
    button.classList.toggle("active");
    $("#customPersonality").classList.toggle("show", button.classList.contains("active"));
    if (button.classList.contains("active")) $("#customPersonalityInput").focus();
    if (!button.classList.contains("active")) {
      state.customPersonality = "";
      $("#customPersonalityInput").value = "";
    }
    return;
  }
  const value = button.textContent;
  if (button.classList.contains("active")) {
    button.classList.remove("active");
    state.personalities = state.personalities.filter((item) => item !== value);
    return;
  }
  if (selectedPersonalities().length === 3) return showToast("最多选 3 个性格标签");
  button.classList.add("active");
  state.personalities.push(value);
}));

$("#customPersonalityInput").addEventListener("input", (event) => {
  const value = event.target.value.trim();
  if (value && state.personalities.length >= 3) {
    event.target.value = "";
    state.customPersonality = "";
    return showToast("最多选 3 个性格标签");
  }
  state.customPersonality = value;
});

function companionshipLabel(value) {
  const amount = Number(value);
  if (amount < 34) return "安静陪伴";
  if (amount < 67) return "自然平衡";
  return "主动靠近";
}

$("#quirk").addEventListener("input", (event) => {
  state.companionship = Number(event.target.value);
  $("#faceOutput").value = companionshipLabel(state.companionship);
});

const expressions = {
  idle: ["IDLE / 待机", "idle", ""],
  happy: ["HAPPY / 开心", "happy", "is-happy"],
  sleep: ["SLEEPING / 困困", "sleeping", "is-sleeping"],
  angry: ["ANGRY / 生气", "angry", "is-angry"]
};
let expressionTimer;

function playExpression(expressionKey) {
  const [label, folder, className] = expressions[expressionKey];
  const frame = $("#expressionFrame");
  let frameNumber = 1;
  clearInterval(expressionTimer);
  $("#expressionLabel").textContent = label;
  $("#generatedPet").className = `pet-expression ${className}${state.identity ? " has-identity" : ""}`;
  if (state.identity) {
    renderRecoloredFrame(folder, frameNumber);
    expressionTimer = setInterval(() => {
      frameNumber = frameNumber % 5 + 1;
      renderRecoloredFrame(folder, frameNumber);
    }, 420);
    return;
  }
  frame.alt = `定制宠物${label.split(" / ")[1]}表情`;
  frame.src = `../assets/expressions/${folder}/${folder}_01.png`;
  expressionTimer = setInterval(() => {
    frameNumber = frameNumber % 5 + 1;
    frame.src = `../assets/expressions/${folder}/${folder}_0${frameNumber}.png`;
  }, 420);
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((index) => Number.parseInt(value.slice(index, index + 2), 16));
}

function brighten([red, green, blue], amount = .25) {
  return [red, green, blue].map((value) => Math.round(value + (255 - value) * amount));
}

function rgbString(rgb) { return `rgb(${rgb.join(", ")})`; }

function drawPetIdentity(context, folder, frameNumber) {
  const pet = state.identity;
  const coat = brighten(hexToRgb(pet.coat.baseColor), .2);
  const secondary = brighten(hexToRgb(pet.coat.secondaryColor), .08);
  const pattern = brighten(hexToRgb(pet.coat.patternColor), .32);
  const leftEye = brighten(hexToRgb(pet.eyes.leftColor), .08);
  const rightEye = brighten(hexToRgb(pet.eyes.rightColor), .08);
  const faceOffset = (pet.face.width - .5) * 16;
  const leftX = 108 - faceOffset;
  const rightX = 224 + faceOffset;
  const openFrames = {
    idle: [1, 5], happy: [1, 5], sleeping: [5], angry: [1, 2, 3, 4, 5]
  };

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";

  // A single, closed pair of identity ears. No extra contour lines can read as duplicate ears.
  const earApexY = 39 - pet.face.earSize * 12;
  context.fillStyle = rgbString(coat);
  context.beginPath();
  context.moveTo(43, 76); context.lineTo(58, earApexY); context.lineTo(93, 57); context.closePath();
  context.moveTo(289, 76); context.lineTo(274, earApexY); context.lineTo(239, 57); context.closePath();
  context.fill();

  context.fillStyle = rgbString(secondary);
  context.beginPath();
  context.moveTo(54, 62); context.lineTo(60, earApexY + 10); context.lineTo(79, 54); context.closePath();
  context.moveTo(278, 62); context.lineTo(272, earApexY + 10); context.lineTo(253, 54); context.closePath();
  context.fill();

  // Stable coat markings live between the ears and never cover expression strokes.
  if (pet.coat.pattern === "tabby") {
    const stripeTop = folder === "angry" ? 34 : 48;
    const stripeBottom = folder === "angry" ? 58 : 75;
    context.strokeStyle = rgbString(pattern);
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(148, stripeTop + 5); context.lineTo(156, stripeBottom);
    context.moveTo(166, stripeTop); context.lineTo(166, stripeBottom);
    context.moveTo(184, stripeTop + 5); context.lineTo(176, stripeBottom);
    context.stroke();
  }

  // Iris slots are filled only on frames whose original eye shape is open.
  if (openFrames[folder]?.includes(frameNumber)) {
    const blinkScale = [1, .84, .66, .84, 1][frameNumber - 1];
    const drawIris = (centerX, color) => {
      // Keep the original animated eye outline and only add identity color inside it.
      context.fillStyle = rgbString(color);
      context.beginPath(); context.ellipse(centerX, 122, 22, 27 * blinkScale, 0, 0, Math.PI * 2); context.fill();
      context.fillStyle = "#071010";
      context.beginPath(); context.ellipse(centerX, 124, pet.eyes.pupilShape === "vertical" ? 7 : 12, 18 * blinkScale, 0, 0, Math.PI * 2); context.fill();
      context.fillStyle = "#fff";
      if (blinkScale > .72) {
        context.beginPath(); context.arc(centerX + 7, 108 + (1 - blinkScale) * 12, 3.5, 0, Math.PI * 2); context.fill();
      }
    };
    drawIris(leftX, leftEye);
    drawIris(rightX, rightEye);
  }

  // Muzzle identity uses the secondary coat color without replacing the animated mouth.
  context.fillStyle = rgbString(secondary);
  context.beginPath();
  context.moveTo(160, 154); context.lineTo(166, 160); context.lineTo(172, 154); context.lineTo(166, 150); context.closePath();
  context.fill();
  context.restore();
}

function renderRecoloredFrame(folder, frameNumber = 1) {
  const canvas = $("#recoloredFrame");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const image = new Image();
  image.onload = () => {
    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = DEVICE_FRAME.sourceWidth;
    sourceCanvas.height = DEVICE_FRAME.sourceHeight;
    const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
    sourceContext.drawImage(image, 0, 0, sourceCanvas.width, sourceCanvas.height);
    const pixels = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const [targetR, targetG, targetB] = brighten(hexToRgb(state.identity.coat.baseColor), .28);

    for (let index = 0; index < pixels.data.length; index += 4) {
      const red = pixels.data[index];
      const green = pixels.data[index + 1];
      const blue = pixels.data[index + 2];
      const isCyanStroke = green > 105 && blue > 105 && green > red * 1.35 && blue > red * 1.35;
      if (!isCyanStroke) continue;
      const brightness = Math.min(1.35, Math.max(.55, (green + blue) / 430));
      pixels.data[index] = Math.min(255, targetR * brightness);
      pixels.data[index + 1] = Math.min(255, targetG * brightness);
      pixels.data[index + 2] = Math.min(255, targetB * brightness);
    }
    sourceContext.putImageData(pixels, 0, 0);
    drawPetIdentity(sourceContext, folder, frameNumber);

    const safeWidth = DEVICE_FRAME.width - DEVICE_FRAME.safeMargin * 2;
    const safeHeight = DEVICE_FRAME.height - DEVICE_FRAME.safeMargin * 2;
    const scale = Math.min(safeWidth / sourceCanvas.width, safeHeight / sourceCanvas.height);
    const outputWidth = Math.round(sourceCanvas.width * scale);
    const outputHeight = Math.round(sourceCanvas.height * scale);
    const outputX = Math.round((DEVICE_FRAME.width - outputWidth) / 2);
    const outputY = Math.round((DEVICE_FRAME.height - outputHeight) / 2);

    canvas.width = DEVICE_FRAME.width;
    canvas.height = DEVICE_FRAME.height;
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.drawImage(sourceCanvas, outputX, outputY, outputWidth, outputHeight);
  };
  image.src = `../assets/expressions/${folder}/${folder}_0${frameNumber}.png`;
}

function prepareResult() {
  const name = $("#petName").value.trim() || "未命名小朋友";
  $("#summaryName").textContent = name;
  const breed = $("#breed").value.trim();
  const personalitySummary = selectedPersonalities().join("、");
  $("#summaryPersonality").textContent = [breed, personalitySummary || $("#furColor").value, companionshipLabel(state.companionship)].filter(Boolean).join(" / ");
}

const patternNames = {
  solid: "纯色", tabby: "虎斑", bicolor: "双色", tricolor: "三花",
  tortoiseshell: "玳瑁", point: "重点色", spotted: "斑点",
  brindle: "虎斑纹", merle: "陨石纹", other: "其他"
};

function showIdentity(identity, mode) {
  state.identity = identity;
  const traits = identity.distinctiveFeatures?.slice(0, 2) || [];
  $("#summaryPersonality").textContent = traits.join(" / ") || `${patternNames[identity.coat.pattern] || identity.coat.pattern} / ${identity.eyes.shape}`;
  $("#traitCoat").textContent = `${identity.coat.baseColor} / ${identity.coat.secondaryColor}`;
  $("#traitPattern").textContent = patternNames[identity.coat.pattern] || identity.coat.pattern;
  $("#traitEyes").textContent = `${identity.eyes.leftColor} · ${identity.eyes.shape}`;
  $("#traitConfidence").textContent = `${Math.round(identity.confidence * 100)}%${mode === "mock" ? " · MOCK" : ""}`;
  $("#frameNote").textContent = mode === "mock" ? "MOCK 身份参数预览" : "已根据上传照片生成专属电子形象";
}

async function requestPetAnalysis() {
  const file = photoInput.files?.[0];
  if (!file) throw new Error("请先上传一张宠物照片");
  const speciesMap = { "猫猫": "cat", "狗狗": "dog", "其他": "other" };
  const form = new FormData();
  form.append("photo", file);
  form.append("speciesHint", speciesMap[state.species] || "other");
  const breed = $("#breed").value.trim();
  if (breed) form.append("breedHint", breed);

  const response = await fetch(`${API_BASE}/api/pets/analyze`, { method: "POST", body: form });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "照片分析失败");
  return data;
}

$("#generateButton").addEventListener("click", async () => {
  if (!photoInput.files?.[0]) return showToast("请先上传一张宠物照片");
  prepareResult();
  const generateButton = $("#generateButton");
  const result = $("#result");
  const loading = $("#resultLoading");
  const ready = $("#resultReady");
  const bar = $("#progressBar");
  loading.style.display = "flex";
  ready.classList.remove("show");
  result.classList.add("visible");
  result.scrollIntoView({ behavior: "smooth" });
  generateButton.disabled = true;
  bar.style.width = "18%";
  const stages = [
    [650, "正在记住 TA 的样子…", "提取耳朵、眼睛和毛色特征", "42%"],
    [1700, "正在比对花纹…", "整理成稳定的宠物身份参数", "68%"],
    [3600, "还在仔细观察…", "视觉分析通常需要几秒钟", "86%"]
  ];
  const timers = stages.map(([delay, title, status, width]) => setTimeout(() => {
    $("#loadingTitle").textContent = title; $("#loadingStatus").textContent = status; bar.style.width = width;
  }, delay));
  try {
    const analysis = await requestPetAnalysis();
    timers.forEach(clearTimeout);
    showIdentity(analysis.identity, analysis.mode);
    bar.style.width = "100%";
    loading.style.display = "none";
    ready.classList.add("show");
    playExpression("idle");
    if (analysis.mode === "mock") showToast("当前是 MOCK 模式，并未真实识别照片");
  } catch (error) {
    timers.forEach(clearTimeout);
    result.classList.remove("visible");
    showToast(error.message.includes("fetch") ? "无法连接后端，请先运行 npm start" : error.message);
    $("#maker").scrollIntoView({ behavior: "smooth" });
  } finally {
    generateButton.disabled = false;
  }
});

$$('#expressionTabs button').forEach((button) => button.addEventListener("click", () => {
  $$('#expressionTabs button').forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  playExpression(button.dataset.expression);
}));

$("#restartButton").addEventListener("click", () => $("#maker").scrollIntoView({ behavior: "smooth" }));
$("#syncButton").addEventListener("click", () => $("#deviceDialog").showModal());
$("#deviceButton").addEventListener("click", () => $("#deviceDialog").showModal());
$("#privacyButton").addEventListener("click", () => $("#privacyDialog").showModal());
$$('[data-close-dialog]').forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
$$('dialog').forEach((dialog) => dialog.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
}));
