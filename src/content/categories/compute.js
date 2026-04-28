export const compute = {
  label: "Compute",
  color: "#4285F4",
  flow: [
    { id: "start", text: "Containers?", type: "decision", tip: "Are you packaging your app as Docker/OCI containers? This drives whether you need orchestration or a simpler runtime." },
    { id: "managed_k8s", text: "Full K8s?", type: "decision", parent: "start", branch: "yes", tip: "Do you need full Kubernetes API, custom operators, DaemonSets, StatefulSets? Or is a simpler container runtime enough?" },
    { id: "serverless_q", text: "Serverless?", type: "decision", parent: "start", branch: "no", tip: "Do you want zero infra management with pay-per-use? Or do you need persistent VMs you SSH into and control?" },
    { id: "gke", text: "GKE", type: "product", parent: "managed_k8s", branch: "yes", tip: "Managed Kubernetes — Autopilot (hands-off) or Standard (full node control). Best for microservices at scale." },
    { id: "cloudrun", text: "Cloud Run", type: "product", parent: "managed_k8s", branch: "no", tip: "Serverless containers without K8s complexity. Deploy a container, get a URL. Scales to zero when idle." },
    { id: "event_driven", text: "Event-driven?", type: "decision", parent: "serverless_q", branch: "yes", tip: "Small functions triggered by events (HTTP, Pub/Sub, GCS uploads)? Or a full web app that needs a managed platform?" },
    { id: "vm_type", text: "Special HW?", type: "decision", parent: "serverless_q", branch: "no", tip: "Do you need GPUs, TPUs, dedicated physical servers, or VMware compatibility? Or standard general-purpose VMs?" },
    { id: "functions", text: "Cloud Functions", type: "product", parent: "event_driven", branch: "yes", tip: "Write a function, attach a trigger, done. Best for glue code, webhooks, lightweight event handlers." },
    { id: "appengine", text: "App Engine", type: "product", parent: "event_driven", branch: "no", tip: "Google's original PaaS. Still works, but Cloud Run is the modern replacement for most use cases." },
    { id: "gpu_q", text: "GPU / TPU?", type: "decision", parent: "vm_type", branch: "yes", tip: "ML training/inference, rendering, or HPC workloads that need accelerators (NVIDIA GPUs or Google TPUs)?" },
    { id: "isolation_q", text: "HW isolation?", type: "decision", parent: "vm_type", branch: "no", tip: "Regulatory, licensing, or compliance reasons requiring dedicated physical hardware not shared with other tenants?" },
    { id: "gpuvm", text: "GPU VMs / TPUs", type: "product", parent: "gpu_q", branch: "yes", tip: "A2/A3 (NVIDIA A100/H100) or G2 (L4) VMs for ML. TPUs for JAX/TF training at scale." },
    { id: "vmware_q", text: "VMware?", type: "decision", parent: "gpu_q", branch: "no", tip: "Do you have existing VMware vSphere workloads you want to run on GCP without re-architecting?" },
    { id: "vmware", text: "VMware Engine", type: "product", parent: "vmware_q", branch: "yes", tip: "Full VMware SDDC (vSphere, vSAN, NSX) managed by Google. Lift-and-shift VMware workloads." },
    { id: "gce", text: "Compute Engine", type: "product", parent: "vmware_q", branch: "no", tip: "Standard IaaS VMs. Full OS control, wide machine type range. The default for traditional workloads." },
    { id: "sole", text: "Sole-Tenant Nodes", type: "product", parent: "isolation_q", branch: "yes", tip: "Dedicated physical server within GCE. Your VMs are the only ones on the hardware. For BYOL, HIPAA, PCI." },
    { id: "bare", text: "Bare Metal", type: "product", parent: "isolation_q", branch: "no", tip: "Raw physical servers — no hypervisor. For Oracle on dedicated cores, or workloads that can't run virtualized." },
  ],
  products: [
    {
      name: "Compute Engine", desc: "IaaS VMs", when: "Full OS control, legacy apps, custom configs",
      tiers: [
        { tier: "E2", use: "Dev/test, small workloads", vcpu: "2-32", mem: "1-128GB", cost: "$" },
        { tier: "N2/N2D", use: "General balanced workloads", vcpu: "2-128", mem: "1-512GB", cost: "$$" },
        { tier: "C2/C2D", use: "Compute-intensive (HPC, gaming)", vcpu: "4-112", mem: "16-896GB", cost: "$$$" },
        { tier: "M2/M3", use: "Memory-intensive (SAP, in-mem DB)", vcpu: "12-416", mem: "up to 12TB", cost: "$$$$" },
        { tier: "A2/A3/G2", use: "GPU — ML training/inference", vcpu: "12-96", mem: "170-1360GB", cost: "$$$$$" },
      ],
      tradeoffs: ["Control ↔ Ops burden", "Cost ↔ Flexibility", "Spot/Preemptible: 60-91% cheaper but can terminate"]
    },
    {
      name: "GKE", desc: "Managed Kubernetes", when: "Microservices, container orchestration, multi-cloud portability",
      tiers: [
        { tier: "Autopilot", use: "Hands-off, per-pod billing", vcpu: "Auto", mem: "Auto", cost: "$$" },
        { tier: "Standard", use: "Full node control", vcpu: "Custom", mem: "Custom", cost: "$-$$$$" },
      ],
      tradeoffs: ["Autopilot: less control, simpler ops", "Standard: full control, more ops", "K8s complexity vs orchestration power"]
    },
    {
      name: "Cloud Run", desc: "Serverless containers", when: "Stateless HTTP services, auto-scale to zero, no infra mgmt",
      tiers: [
        { tier: "Services", use: "HTTP endpoints, auto-scale", vcpu: "1-8", mem: "128MB-32GB", cost: "$" },
        { tier: "Jobs", use: "Batch/async tasks", vcpu: "1-8", mem: "128MB-32GB", cost: "$" },
      ],
      tradeoffs: ["Scale-to-zero saves cost", "Cold starts on first request", "Max 60min timeout (jobs), limited to stateless"]
    },
    {
      name: "Cloud Functions", desc: "Event-driven FaaS", when: "Small event handlers, glue logic, webhooks",
      tiers: [
        { tier: "1st Gen", use: "Simple triggers", vcpu: "0.08-2", mem: "128MB-8GB", cost: "$" },
        { tier: "2nd Gen", use: "Longer running, Cloud Run based", vcpu: "1-8", mem: "256MB-16GB", cost: "$" },
      ],
      tradeoffs: ["Simplest deploy model", "Cold starts", "15min max (gen1) / 60min (gen2)", "Not for sustained workloads"]
    },
    {
      name: "App Engine", desc: "PaaS — managed app hosting", when: "Legacy PaaS apps, simple web apps without containers",
      tiers: [
        { tier: "Standard", use: "Sandboxed, scale to zero", vcpu: "Auto", mem: "Auto", cost: "$" },
        { tier: "Flexible", use: "Custom runtimes, Docker", vcpu: "1-80", mem: "0.9-6.5GB/inst", cost: "$$" },
      ],
      tradeoffs: ["Standard: fast scale, limited runtimes", "Flexible: any runtime, slower scale", "Considered legacy — prefer Cloud Run"]
    },
    {
      name: "Bare Metal", desc: "Dedicated physical servers", when: "Specialized hardware, Oracle workloads, licensing tied to physical cores",
      tiers: [{ tier: "Single tier", use: "Dedicated bare metal", vcpu: "Custom", mem: "Custom", cost: "$$$$$" }],
      tradeoffs: ["Full hardware control", "No multi-tenancy", "Very niche use cases"]
    },
    {
      name: "VMware Engine", desc: "Managed VMware on GCP", when: "Lift-and-shift VMware workloads",
      tiers: [{ tier: "Single tier", use: "Full VMware SDDC", vcpu: "Custom", mem: "Custom", cost: "$$$$" }],
      tradeoffs: ["Familiar VMware tooling", "High cost", "Migration bridge to cloud-native"]
    },
    {
      name: "Sole-Tenant Nodes", desc: "Dedicated physical servers in GCE", when: "Compliance, licensing, isolation requirements",
      tiers: [{ tier: "Single tier", use: "Isolated hardware", vcpu: "Custom", mem: "Custom", cost: "$$$$" }],
      tradeoffs: ["Hardware isolation", "Compliance (HIPAA, PCI)", "Higher cost vs shared"]
    },
  ]
};

