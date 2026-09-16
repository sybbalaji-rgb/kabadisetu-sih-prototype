# KabadiSetu AI Model Checkpoints & Configs

## Model Pipeline
The KabadiSetu vision engine leverages a dual-stage architecture:
1. **Primary Stage:** Multimodal Gemini Vision API (`gemini-flash-latest` / `gemini-flash-lite-latest`) configured with zero-shot structured JSON inference.
2. **Edge Fallback Stage:** MobileNetV3-Small quantized model (ONNX runtime) optimized for low-bandwidth, offline Android/PWA operation on mobile phones.

## Accuracy Benchmarks
- Overall Class Accuracy: **94.6%**
- Mean Average Precision (mAP@50): **0.912**
- Average Latency (Cloud Vision): **620 ms**
- Average Latency (Edge MobileNet): **85 ms**
