export const containers = {
  label: "Containers & Mesh",
  color: "#0097A7",
  flow: [
    { id: "start", text: "Multi-cloud / hybrid?", type: "decision", tip: "Do you need Kubernetes running consistently across GCP, on-prem, AWS, or Azure? If not, you may need service mesh or fleet management for GKE clusters." },
    { id: "multi_env", text: "Where running?", type: "decision", parent: "start", branch: "yes", tip: "Is the workload on your own hardware (VMware, bare metal) or on another cloud provider (AWS EKS, Azure AKS)?" },
    { id: "mesh_q", text: "Service mesh?", type: "decision", parent: "start", branch: "no", tip: "Need mTLS between services, traffic splitting, canary deployments, and deep observability? Or managing multiple GKE clusters centrally?" },
    { id: "anthos_onprem", text: "Anthos (on-prem)", type: "product", parent: "multi_env", branch: "yes", tip: "GKE on your hardware. VMware or bare metal. Same K8s API as cloud GKE. Config Management for policy. Connect to GCP console." },
    { id: "anthos_multi", text: "Anthos (multi-cloud)", type: "product", parent: "multi_env", branch: "no", tip: "GKE clusters on AWS or Azure. Consistent K8s experience. Centrally managed from Google Cloud. For multi-cloud K8s strategy." },
    { id: "asm", text: "Anthos Svc Mesh", type: "product", parent: "mesh_q", branch: "yes", tip: "Managed Istio. Automatic mTLS, traffic management (canary, mirroring), and observability. Sidecar proxies add some overhead." },
    { id: "fleet", text: "GKE Fleet Mgmt", type: "product", parent: "mesh_q", branch: "no", tip: "Treat multiple GKE clusters as one fleet. Centralized policy, multi-cluster services, config sync. The control plane for multi-cluster." },
  ],
  products: [
    {
      name: "Anthos", desc: "Multi-cloud & hybrid platform", when: "Consistent K8s across GCP, on-prem, AWS, Azure",
      tiers: [
        { tier: "GKE Enterprise", use: "Multi-cluster mgmt", vcpu: "Custom", mem: "Custom", cost: "$$$" },
        { tier: "On-prem (VMware/Bare metal)", use: "K8s on your hardware", vcpu: "Custom", mem: "Custom", cost: "$$$$" },
        { tier: "Multi-cloud (AWS/Azure)", use: "K8s on other clouds", vcpu: "Custom", mem: "Custom", cost: "$$$$" },
      ],
      tradeoffs: ["Consistent platform across environments", "Config management & policy", "Service mesh built-in", "Premium pricing"]
    },
    {
      name: "Anthos Service Mesh", desc: "Managed Istio-based mesh", when: "mTLS, traffic management, observability between services",
      tiers: [
        { tier: "Managed", use: "Google-managed control plane", vcpu: "-", mem: "-", cost: "$$" },
        { tier: "In-cluster", use: "Self-managed control plane", vcpu: "-", mem: "-", cost: "$$" },
      ],
      tradeoffs: ["Istio compatible", "mTLS everywhere", "Traffic splitting for canary", "Sidecar proxy overhead"]
    },
    {
      name: "GKE Fleet Management", desc: "Multi-cluster management", when: "Manage multiple GKE clusters as one",
      tiers: [{ tier: "Single tier", use: "Fleet-level features", vcpu: "-", mem: "-", cost: "$$" }],
      tradeoffs: ["Centralized policy", "Multi-cluster services", "Config sync across clusters"]
    },
  ]
};

