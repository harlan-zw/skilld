---
name: @huggingface/transformers
description: Documentation for @huggingface/transformers. Use this skill when working with @huggingface/transformers or importing from "@huggingface/transformers".
version: "3.8.1"
---

# Transformers.js - Technical Reference

## Quick Start

```javascript
import { pipeline } from '@huggingface/transformers';

// Create pipeline (async)
const pipe = await pipeline('task-id', 'model-id-optional');

// Run inference
const result = await pipe(input);
```

## Core API

### `pipeline(task, model?, options?)`

Creates inference pipeline. Returns async function that processes inputs.

**Tasks (most common):**
- NLP: `text-classification`, `sentiment-analysis`, `question-answering`, `summarization`, `translation`, `text-generation`, `fill-mask`, `token-classification`, `ner`, `text2text-generation`, `feature-extraction`, `sentence-similarity`, `zero-shot-classification`
- Vision: `image-classification`, `object-detection`, `image-segmentation`, `depth-estimation`, `image-to-image`, `background-removal`
- Audio: `automatic-speech-recognition`, `audio-classification`, `text-to-speech`, `text-to-audio`, `zero-shot-audio-classification`
- Multimodal: `image-to-text`, `document-question-answering`, `zero-shot-image-classification`, `zero-shot-object-detection`

**Options:**
```javascript
{
  device: 'wasm' | 'webgpu',    // Default: 'wasm' (WASM) or 'webgpu'
  dtype: 'fp32' | 'fp16' | 'q8' | 'q4',  // Quantization, affects speed/quality
  // Most models support: fp32 (WebGPU default), q8 (WASM default), q4 (most aggressive)
}
```

### `env` Settings

```javascript
import { env } from '@huggingface/transformers';

env.localModelPath = '/path/to/models/';      // Where to load local models
env.allowRemoteModels = false;                // Block Hub downloads
env.backends.onnx.wasm.wasmPaths = '/wasm/';  // Custom WASM binary location
```

## Best Practices & Gotchas

### Device Selection
- **WASM** (default): Works everywhere, ~2-4x slower than native, uses CPU
- **WebGPU**: Experimental, ~1.5-2x faster, check browser support, file a bug if issues occur
- Test both; WebGPU still has edge cases

### Quantization Trade-offs
- `fp32`: Highest accuracy, largest model size, slower
- `q8`: Default for WASM, good accuracy/speed balance
- `q4`: Most aggressive compression, noticeable quality loss on some tasks
- Always test quantization impact on your specific task

### Model Loading
- First pipeline call downloads/converts model (can be slow)
- Reuse pipeline instances across requests
- Large models (>1GB) may fail in memory-constrained browsers
- Use quantized versions (`q4`, `q8`) to reduce bandwidth

### Common Mistakes
1. **Not awaiting** pipeline creation: `pipeline()` returns Promise
2. **Not awaiting** inference: `pipe(input)` also returns Promise
3. **Forgetting quantization** on large models in browsers
4. **Using remote models offline**: Set `env.allowRemoteModels = false` first
5. **Not converting custom models**: Python models must be ONNX-converted first

### Model Conversion (PyTorch/TF → ONNX)
```bash
python -m scripts.convert --quantize --model_id <model_name>
```
Creates `./models/<model_name>/` with config, tokenizer, and ONNX files. Use `--quantize` for q8 versions.

### Performance Optimization
- Use quantized models (`q4`/`q8`) in browser
- Batch requests if possible (not all pipelines support batching)
- Cache pipeline instances (don't recreate per request)
- Monitor WASM module size; use lightweight models for edge cases
- WebGPU is experimental—check browser compatibility first

### Output Format
Output varies by task. Common patterns:
```javascript
// text-classification, sentiment-analysis
[{ label: 'POSITIVE', score: 0.9998 }]

// object-detection
[{ box: { xmin, ymin, xmax, ymax }, label, score }, ...]

// question-answering
{ answer: 'text', score: 0.95 }

// text-generation
[{ generated_text: 'continuation...' }]
```

## Supported Architectures

**Text:** BERT, RoBERTa, DistilBERT, Albert, Electra, DeBERTa, T5, BART, GPT-2, Llama, Mistral, Qwen, Gemma, Phi, etc.

**Vision:** ViT, ConvNeXT, ResNet, YOLOS, DETR, SAM, Depth Anything, etc.

**Audio:** Wav2Vec2, Whisper, HuBERT, WavLM, etc.

**Multimodal:** CLIP, LLaVA, Qwen-VL, Florence2, etc.

See HuggingFace Hub for `transformers.js` library tag to find compatible models.