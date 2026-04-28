export const security = {
  label: "Security & IAM",
  color: "#FF6D00",
  flow: [
    { id: "start", text: "Identity / access?", type: "decision", tip: "Is this about controlling who/what can access your resources? Or about protecting data itself (encryption, secrets, threat detection)?" },
    { id: "who_access", text: "Zero-trust?", type: "decision", parent: "start", branch: "yes", tip: "Do you want context-aware access (device, location, identity) without a VPN? Or traditional role-based access control (RBAC)?" },
    { id: "data_protect", text: "Data protection?", type: "decision", parent: "start", branch: "no", tip: "Protecting data at rest/in transit (encryption, key management), managing secrets, or monitoring your security posture?" },
    { id: "iap", text: "IAP / BeyondCorp", type: "product", parent: "who_access", branch: "yes", tip: "Identity-Aware Proxy. Every request verified by identity + context (device trust, IP). No VPN needed. Google's own internal model." },
    { id: "iam", text: "IAM", type: "product", parent: "who_access", branch: "no", tip: "Who (identity) can do What (permission) on Which (resource). Use predefined or custom roles. Always prefer least privilege over basic roles." },
    { id: "encrypt_q", text: "Encryption / keys?", type: "decision", parent: "data_protect", branch: "yes", tip: "Need to manage your own encryption keys (CMEK), use hardware security modules (HSM), or store secrets like API keys and passwords?" },
    { id: "posture_q", text: "Posture / threat?", type: "decision", parent: "data_protect", branch: "no", tip: "Security scanning, vulnerability detection, compliance monitoring? Or preventing data from leaving your GCP perimeter?" },
    { id: "kms", text: "Cloud KMS", type: "product", parent: "encrypt_q", branch: "yes", tip: "Key Management Service. Software keys, HSM-backed keys (FIPS 140-2 L3), or External Key Manager (keys you control outside Google)." },
    { id: "secret_q", text: "Secrets / certs?", type: "decision", parent: "encrypt_q", branch: "no", tip: "Storing API keys, DB passwords, tokens? Use Secret Manager. Need to issue/manage TLS certificates internally? Certificate Authority Service." },
    { id: "secretmgr", text: "Secret Manager", type: "product", parent: "secret_q", branch: "yes", tip: "Versioned secret storage with IAM-based access. Auto-rotation support. Regional or global replication. No more secrets in env vars." },
    { id: "certs", text: "Certificate Auth Svc", type: "product", parent: "secret_q", branch: "no", tip: "Managed private PKI. Issue internal TLS certs at scale. DevOps tier for short-lived certs, Enterprise for compliance (HSM-backed root)." },
    { id: "scc", text: "Security Cmd Center", type: "product", parent: "posture_q", branch: "yes", tip: "Central security dashboard. Asset inventory, vulnerability scanning, threat detection. Premium tier for compliance (CIS, PCI, NIST)." },
    { id: "vpc_sc", text: "VPC Service Controls", type: "product", parent: "posture_q", branch: "no", tip: "Creates security perimeters around GCP services to prevent data exfiltration. Even compromised credentials can't copy data outside the perimeter." },
  ],
  products: [
    {
      name: "IAM", desc: "Identity & Access Management", when: "Control who can do what on which resource",
      tiers: [
        { tier: "Basic roles", use: "Owner/Editor/Viewer (broad)", vcpu: "-", mem: "-", cost: "Free" },
        { tier: "Predefined roles", use: "Service-specific permissions", vcpu: "-", mem: "-", cost: "Free" },
        { tier: "Custom roles", use: "Exact permission sets", vcpu: "-", mem: "-", cost: "Free" },
      ],
      tradeoffs: ["Principle of least privilege", "Basic roles are too broad for prod", "Service accounts for workloads", "Org policies for guardrails"]
    },
    {
      name: "Cloud KMS", desc: "Key Management Service", when: "Encrypt data, manage keys, HSM",
      tiers: [
        { tier: "Software keys", use: "Default encryption", vcpu: "-", mem: "-", cost: "$" },
        { tier: "HSM keys", use: "FIPS 140-2 Level 3", vcpu: "-", mem: "-", cost: "$$" },
        { tier: "External keys (EKM)", use: "Keys outside Google", vcpu: "-", mem: "-", cost: "$$$" },
      ],
      tradeoffs: ["CMEK for customer-managed keys", "HSM for compliance", "EKM: full control but latency", "Envelope encryption pattern"]
    },
    {
      name: "Secret Manager", desc: "Store & manage secrets", when: "API keys, passwords, certificates",
      tiers: [{ tier: "Single tier", use: "Secret storage + versioning", vcpu: "-", mem: "-", cost: "$" }],
      tradeoffs: ["Versioned secrets", "IAM-based access", "Auto-rotation support", "Regional or global replication"]
    },
    {
      name: "Security Command Center", desc: "Security posture management", when: "Vulnerability scanning, threat detection, compliance",
      tiers: [
        { tier: "Standard", use: "Asset inventory, basic scan", vcpu: "-", mem: "-", cost: "Free" },
        { tier: "Premium", use: "Threat detection, compliance", vcpu: "-", mem: "-", cost: "$$$$" },
      ],
      tradeoffs: ["Premium: Container Threat Detection, Event Threat Detection", "Compliance: CIS, PCI DSS, NIST", "Integrates with Chronicle SIEM"]
    },
    {
      name: "Identity-Aware Proxy (IAP)", desc: "Zero-trust access", when: "Secure app access without VPN, BeyondCorp model",
      tiers: [{ tier: "Single tier", use: "Context-aware access", vcpu: "-", mem: "-", cost: "$" }],
      tradeoffs: ["Zero-trust = no VPN needed", "Per-request auth check", "Works with GCE, GKE, App Engine", "BeyondCorp Enterprise for advanced"]
    },
    {
      name: "Certificate Authority Service", desc: "Private CA", when: "Issue & manage private certificates at scale",
      tiers: [
        { tier: "DevOps", use: "High-volume, short-lived certs", vcpu: "-", mem: "-", cost: "$$" },
        { tier: "Enterprise", use: "Compliance, HSM-backed", vcpu: "-", mem: "-", cost: "$$$" },
      ],
      tradeoffs: ["Managed private PKI", "Integrates with GKE mesh", "vs self-managed CA: less ops"]
    },
    {
      name: "VPC Service Controls", desc: "Data exfiltration prevention", when: "Prevent data leaving a perimeter, compliance",
      tiers: [{ tier: "Single tier", use: "Service perimeters", vcpu: "-", mem: "-", cost: "Free" }],
      tradeoffs: ["Defense-in-depth for data", "Can be complex to configure", "Bridges for cross-perimeter access"]
    },
  ]
};

