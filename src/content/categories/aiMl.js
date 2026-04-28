export const aiMl = {
  label: "AI / ML",
  icon: "🧠",
  color: "#E91E63",
  flow: [
    { id: "start", text: "Pre-trained API?", type: "decision", tip: "Can you use an existing model via API call (Vision, NLP, Speech, Gemini)? Or do you need to train/fine-tune your own model?" },
    { id: "api_type", text: "Generative?", type: "decision", parent: "start", branch: "yes", tip: "Do you need generative AI (text generation, code, multimodal)? Or task-specific ML (OCR, sentiment, speech-to-text)?" },
    { id: "custom_q", text: "Custom model?", type: "decision", parent: "start", branch: "no", tip: "Do you want Google to auto-train a model on your data (AutoML)? Or bring your own TF/PyTorch code and manage training?" },
    { id: "gemini", text: "Gemini / Model Garden", type: "product", parent: "api_type", branch: "yes", tip: "Google's frontier LLMs. Flash (cheap/fast), Pro (balanced), Ultra (most capable). Model Garden has 100+ open models too." },
    { id: "task_api", text: "Task-specific?", type: "decision", parent: "api_type", branch: "no", tip: "Standard ML APIs for common tasks. Or Document AI for specialized document extraction (invoices, forms, receipts)?" },
    { id: "pretrained", text: "Pre-trained APIs", type: "product", parent: "task_api", branch: "yes", tip: "Vision AI, Natural Language, Speech-to-Text, Text-to-Speech, Translation. Pay per request, no training needed. Fastest integration." },
    { id: "docai", text: "Document AI", type: "product", parent: "task_api", branch: "no", tip: "Specialized document extraction. Pre-trained for invoices, receipts, W-2s, contracts. Custom processors for your own doc types." },
    { id: "automl_q", text: "No-code?", type: "decision", parent: "custom_q", branch: "yes", tip: "AutoML lets you upload labeled data and Google trains a model — no ML code needed. Good for image classification, tabular data, NLP." },
    { id: "hw_q", text: "Own code?", type: "decision", parent: "custom_q", branch: "no", tip: "Bring your own training code (TensorFlow, PyTorch, JAX). Need to choose between Google TPUs or NVIDIA GPUs for the hardware." },
    { id: "vertex_automl", text: "Vertex AutoML", type: "product", parent: "automl_q", branch: "yes", tip: "Upload data → get a trained model. Supports image, tabular, text, video. No ML expertise needed. Deploy to endpoints automatically." },
    { id: "vertex_train", text: "Vertex Training", type: "product", parent: "automl_q", branch: "no", tip: "Custom training jobs on Vertex AI. Bring any framework. Distributed training, hyperparameter tuning, experiment tracking." },
    { id: "accel_q", text: "Google silicon?", type: "decision", parent: "hw_q", branch: "yes", tip: "TPUs are Google's custom ML accelerators — faster and cheaper per FLOP for large models. GPUs (NVIDIA) are more flexible and widely supported." },
    { id: "tpu", text: "TPU", type: "product", parent: "accel_q", branch: "yes", tip: "Tensor Processing Units. v5p for largest LLMs. v5e for cost efficiency. TPU Pods for distributed training. Best with JAX/TensorFlow." },
    { id: "gpuvm2", text: "GPU VMs (Compute)", type: "product", parent: "accel_q", branch: "no", tip: "NVIDIA A100 (A2), H100 (A3), or L4 (G2) VMs. More framework flexibility than TPUs. PyTorch native. See Compute section." },
  ],
  products: [
    {
      name: "Vertex AI Platform", desc: "Unified ML platform", when: "End-to-end ML: data prep, training, deploy, monitoring",
      tiers: [
        { tier: "AutoML", use: "No-code model training", vcpu: "Auto", mem: "Auto", cost: "$$" },
        { tier: "Custom Training", use: "Bring your own code/framework", vcpu: "Custom GPU/TPU", mem: "Custom", cost: "$$$" },
        { tier: "Prediction", use: "Online & batch inference", vcpu: "Auto-scale", mem: "Auto-scale", cost: "$$" },
      ],
      tradeoffs: ["AutoML: easy but less control", "Custom: full control, more ops", "Feature Store for feature management", "Pipelines for ML workflow orchestration"]
    },
    {
      name: "Gemini / Model Garden", desc: "Foundation models", when: "GenAI: text, code, vision, multimodal",
      tiers: [
        { tier: "Gemini Flash", use: "Fast, cost-effective", vcpu: "API", mem: "API", cost: "$" },
        { tier: "Gemini Pro", use: "Balanced capability", vcpu: "API", mem: "API", cost: "$$" },
        { tier: "Gemini Ultra", use: "Most capable", vcpu: "API", mem: "API", cost: "$$$" },
        { tier: "Open Models (Llama, etc)", use: "Self-hosted OSS models", vcpu: "Custom GPU", mem: "Custom", cost: "$$-$$$" },
      ],
      tradeoffs: ["Flash: cheapest, fastest", "Pro: best general balance", "Model Garden: 100+ models", "Fine-tuning and grounding available"]
    },
    {
      name: "Pre-trained APIs", desc: "Vision, NLP, Speech, Translation", when: "Common AI tasks without training",
      tiers: [
        { tier: "Vision AI", use: "Image analysis, OCR", vcpu: "API", mem: "API", cost: "$" },
        { tier: "Natural Language AI", use: "Entity, sentiment, syntax", vcpu: "API", mem: "API", cost: "$" },
        { tier: "Speech-to-Text / TTS", use: "Audio transcription & synthesis", vcpu: "API", mem: "API", cost: "$" },
        { tier: "Translation AI", use: "130+ languages", vcpu: "API", mem: "API", cost: "$" },
      ],
      tradeoffs: ["Fastest to integrate", "No training required", "Less customization than custom models", "Pay-per-request pricing"]
    },
    {
      name: "TPU", desc: "Tensor Processing Units", when: "Large-scale ML training, LLM fine-tuning",
      tiers: [
        { tier: "v4", use: "Training & inference", vcpu: "-", mem: "32GB HBM/chip", cost: "$$$" },
        { tier: "v5e", use: "Cost-efficient training/inference", vcpu: "-", mem: "16GB HBM/chip", cost: "$$" },
        { tier: "v5p", use: "Largest models, highest perf", vcpu: "-", mem: "95GB HBM/chip", cost: "$$$$" },
      ],
      tradeoffs: ["Faster than GPU for large models", "TPU Pods for distributed training", "JAX/TF native, PyTorch via XLA", "Quota/availability can be limited"]
    },
    {
      name: "Document AI", desc: "Document processing", when: "Extract structured data from documents, forms, invoices",
      tiers: [{ tier: "Single tier", use: "Document parsing/extraction", vcpu: "API", mem: "API", cost: "$$" }],
      tradeoffs: ["Pre-trained for common doc types", "Custom processors available", "Integrates with GCS"]
    },
  ]
};

