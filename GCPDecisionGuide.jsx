import { useState, useEffect, useRef } from "react";
import { Github, Globe } from "lucide-react";

const GCP_DATA = {
  compute: {
    label: "Compute",
    icon: "⚡",
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
  },
  storage: {
    label: "Storage",
    icon: "💾",
    color: "#EA4335",
    flow: [
      { id: "start", text: "Object / blob?", type: "decision", tip: "Is your data unstructured files, images, backups, logs? Object storage is ideal for these. Otherwise you likely need block or file storage." },
      { id: "gcs", text: "Cloud Storage", type: "product", parent: "start", branch: "yes", tip: "S3-equivalent. Unlimited object storage with 4 classes from hot (Standard) to cold (Archive). Most versatile GCP storage." },
      { id: "attached", text: "Attached to VM?", type: "decision", parent: "start", branch: "no", tip: "Does the storage need to appear as a disk volume mounted to a VM (like an SSD/HDD)? Or shared across multiple machines?" },
      { id: "pd", text: "Persistent Disk", type: "product", parent: "attached", branch: "yes", tip: "Network-attached block storage for VMs. Survives VM deletion. Choose pd-ssd for IOPS, pd-standard for throughput." },
      { id: "shared_fs", text: "Shared filesystem?", type: "decision", parent: "attached", branch: "no", tip: "Do multiple VMs need to read/write the same filesystem simultaneously (NFS-style)? Or are you moving data between locations?" },
      { id: "filestore", text: "Filestore", type: "product", parent: "shared_fs", branch: "yes", tip: "Managed NFS. Mount across multiple VMs. Good for media rendering, EDA, shared config. Enterprise tier = multi-zone HA." },
      { id: "moving_data", text: "Large transfer?", type: "decision", parent: "shared_fs", branch: "no", tip: "Moving >20TB from on-prem or another cloud? Physical shipping might be faster and cheaper than network transfer." },
      { id: "tapp", text: "Transfer Appliance", type: "product", parent: "moving_data", branch: "yes", tip: "Google ships you a physical device. Load your data, ship it back. For massive datasets where network transfer would take weeks." },
      { id: "sts", text: "Storage Transfer Svc", type: "product", parent: "moving_data", branch: "no", tip: "Managed network transfer from S3, Azure Blob, HTTP sources, or on-prem (agent-based). Supports scheduling and filtering." },
    ],
    products: [
      {
        name: "Cloud Storage (GCS)", desc: "Object storage", when: "Unstructured data, backups, static assets, data lake",
        tiers: [
          { tier: "Standard", use: "Frequent access", vcpu: "-", mem: "Unlimited", cost: "$0.020/GB" },
          { tier: "Nearline", use: "Access < 1x/month", vcpu: "-", mem: "Unlimited", cost: "$0.010/GB" },
          { tier: "Coldline", use: "Access < 1x/quarter", vcpu: "-", mem: "Unlimited", cost: "$0.004/GB" },
          { tier: "Archive", use: "Access < 1x/year", vcpu: "-", mem: "Unlimited", cost: "$0.0012/GB" },
        ],
        tradeoffs: ["Cheaper storage = higher retrieval cost", "Min storage duration: 30/90/365 days", "Autoclass auto-manages tiers"]
      },
      {
        name: "Persistent Disk", desc: "Block storage for VMs", when: "VM boot/data disks, databases on VMs",
        tiers: [
          { tier: "pd-standard", use: "Sequential I/O, cost-sensitive", vcpu: "-", mem: "Up to 64TB", cost: "$" },
          { tier: "pd-balanced", use: "General purpose", vcpu: "-", mem: "Up to 64TB", cost: "$$" },
          { tier: "pd-ssd", use: "High IOPS random I/O", vcpu: "-", mem: "Up to 64TB", cost: "$$$" },
          { tier: "pd-extreme", use: "Highest IOPS (SAP, Oracle)", vcpu: "-", mem: "Up to 64TB", cost: "$$$$" },
        ],
        tradeoffs: ["IOPS scales with disk size", "Snapshots for backup", "Local SSD: fastest but ephemeral"]
      },
      {
        name: "Filestore", desc: "Managed NFS", when: "Shared file system across VMs, media rendering, EDA",
        tiers: [
          { tier: "Basic HDD", use: "Dev/test file shares", vcpu: "-", mem: "1-63.9TB", cost: "$" },
          { tier: "Basic SSD", use: "General workloads", vcpu: "-", mem: "2.5-63.9TB", cost: "$$" },
          { tier: "Enterprise", use: "Mission-critical, multi-zone", vcpu: "-", mem: "1-10TB", cost: "$$$" },
        ],
        tradeoffs: ["NFS protocol = easy mount", "No object semantics", "Enterprise = regional HA"]
      },
      {
        name: "Storage Transfer Service", desc: "Data migration", when: "Move data from S3, Azure, on-prem to GCS",
        tiers: [{ tier: "Single tier", use: "Managed transfer", vcpu: "-", mem: "-", cost: "Free (egress costs)" }],
        tradeoffs: ["Scheduled transfers", "Cross-cloud support", "Agent-based for on-prem"]
      },
    ]
  },
  databases: {
    label: "Databases",
    icon: "🗄️",
    color: "#FBBC04",
    flow: [
      { id: "start", text: "Relational?", type: "decision", tip: "Do you need SQL, ACID transactions, joins, foreign keys, and a fixed schema? If not, a NoSQL model may fit better." },
      { id: "global_q", text: "Global scale?", type: "decision", parent: "start", branch: "yes", tip: "Do you need strongly consistent reads/writes across multiple regions? This is rare but critical for global financial or inventory systems." },
      { id: "nosql_type", text: "Data model?", type: "decision", parent: "start", branch: "no", tip: "NoSQL comes in flavors: document (JSON-like), wide-column (sparse tables, time-series), or key-value (caching, sessions)." },
      { id: "spanner", text: "Spanner", type: "product", parent: "global_q", branch: "yes", tip: "The only globally distributed DB with external consistency. SQL interface. 99.999% SLA. Premium cost but unmatched guarantees." },
      { id: "perf_q", text: "High-perf PG?", type: "decision", parent: "global_q", branch: "no", tip: "Need better-than-standard PostgreSQL performance, especially mixed OLTP+OLAP? AlloyDB is Google's optimized PG. Otherwise Cloud SQL." },
      { id: "alloydb", text: "AlloyDB", type: "product", parent: "perf_q", branch: "yes", tip: "Google-engineered PostgreSQL. Claims 4x throughput vs standard PG. Built-in columnar engine for analytics queries alongside OLTP." },
      { id: "cloudsql", text: "Cloud SQL", type: "product", parent: "perf_q", branch: "no", tip: "Managed MySQL, PostgreSQL, or SQL Server. Drop-in replacement for existing apps. Single-region with read replicas cross-region." },
      { id: "doc_q", text: "Document / KV?", type: "decision", parent: "nosql_type", branch: "yes", tip: "Document DBs store flexible JSON-like records. Good for user profiles, catalogs, content. Key-value is simpler: key→blob lookup." },
      { id: "wide_q", text: "Wide-column?", type: "decision", parent: "nosql_type", branch: "no", tip: "Wide-column DBs (like HBase/Cassandra) excel at massive-scale time-series, IoT telemetry, and analytics with a single row-key index." },
      { id: "realtime_q", text: "Real-time sync?", type: "decision", parent: "doc_q", branch: "yes", tip: "Do you need live data sync to mobile/web clients with offline support? Firestore Native mode has real-time listeners built in." },
      { id: "firestore", text: "Firestore", type: "product", parent: "realtime_q", branch: "yes", tip: "Serverless document DB. Native mode = real-time sync + offline. Datastore mode = simpler server-side use. Auto-scales, pay-per-op." },
      { id: "firebase_rtdb", text: "Firebase RTDB", type: "product", parent: "realtime_q", branch: "no", tip: "Original Firebase real-time database. Simpler JSON tree model. Use Firestore for new projects — RTDB is for legacy Firebase apps." },
      { id: "bigtable", text: "Bigtable", type: "product", parent: "wide_q", branch: "yes", tip: "Petabyte-scale, single-digit ms latency. Powers Google Search, Maps, Gmail internally. HBase API compatible. Min 1 node (~$0.65/hr)." },
      { id: "memstore", text: "Memorystore", type: "product", parent: "wide_q", branch: "no", tip: "Managed Redis/Memcached/Valkey. Sub-millisecond reads. Use for caching, session storage, leaderboards, rate limiting." },
    ],
    products: [
      {
        name: "Cloud SQL", desc: "Managed MySQL / PostgreSQL / SQL Server", when: "Traditional relational workloads, single-region",
        tiers: [
          { tier: "db-f1-micro", use: "Dev/test", vcpu: "shared", mem: "0.6GB", cost: "$" },
          { tier: "db-custom", use: "Custom sizing", vcpu: "1-96", mem: "3.75-624GB", cost: "$$-$$$" },
          { tier: "Enterprise+", use: "HA, near-zero downtime", vcpu: "1-96", mem: "3.75-624GB", cost: "$$$" },
        ],
        tradeoffs: ["Familiar SQL engines", "Single region (read replicas cross-region)", "Max ~64TB storage", "vs Spanner: no global consistency"]
      },
      {
        name: "Cloud Spanner", desc: "Global relational DB", when: "Global consistency, horizontal scale, financial/inventory systems",
        tiers: [
          { tier: "Regional", use: "Single-region HA", vcpu: "Per node", mem: "Per node", cost: "$$$" },
          { tier: "Multi-region", use: "Global HA, 99.999% SLA", vcpu: "Per node", mem: "Per node", cost: "$$$$" },
        ],
        tradeoffs: ["Only DB with external consistency + horizontal scale", "High cost ($$$)", "SQL interface but not drop-in MySQL/PG replacement"]
      },
      {
        name: "AlloyDB", desc: "PostgreSQL-compatible, Google-optimized", when: "High-perf PostgreSQL, hybrid transactional/analytical",
        tiers: [
          { tier: "Primary", use: "Read-write instance", vcpu: "2-64", mem: "16-512GB", cost: "$$$" },
          { tier: "Read Pool", use: "Scale-out reads", vcpu: "2-64", mem: "16-512GB", cost: "$$" },
        ],
        tradeoffs: ["4x faster than standard PG (claims)", "Built-in columnar engine for analytics", "PostgreSQL wire compatible", "Higher cost than Cloud SQL"]
      },
      {
        name: "Firestore", desc: "Serverless document DB", when: "Mobile/web apps, real-time sync, flexible schema",
        tiers: [
          { tier: "Native mode", use: "Real-time, offline sync", vcpu: "Serverless", mem: "Serverless", cost: "$" },
          { tier: "Datastore mode", use: "Server-side only, simpler", vcpu: "Serverless", mem: "Serverless", cost: "$" },
        ],
        tradeoffs: ["Auto-scales, serverless pricing", "Limited query flexibility vs SQL", "1MB max doc size", "Real-time listeners (Native mode)"]
      },
      {
        name: "Firebase Realtime DB", desc: "JSON tree real-time DB", when: "Simple real-time sync, legacy Firebase apps",
        tiers: [{ tier: "Single tier", use: "Real-time JSON", vcpu: "Serverless", mem: "1-200GB", cost: "$" }],
        tradeoffs: ["Simpler than Firestore but less capable", "JSON tree model", "Prefer Firestore for new projects"]
      },
      {
        name: "Bigtable", desc: "Wide-column NoSQL", when: "IoT, time-series, analytics, >1TB data, high throughput",
        tiers: [
          { tier: "SSD", use: "Low-latency reads/writes", vcpu: "Per node", mem: "Per node", cost: "$$$" },
          { tier: "HDD", use: "Batch analytics, cost-sensitive", vcpu: "Per node", mem: "Per node", cost: "$$" },
        ],
        tradeoffs: ["Scales to petabytes", "Single-row key index only", "Min 1 node (~$0.65/hr)", "HBase API compatible"]
      },
      {
        name: "Memorystore", desc: "Managed Redis / Memcached / Valkey", when: "Caching, session store, leaderboards, pub/sub",
        tiers: [
          { tier: "Basic", use: "No replication", vcpu: "1-300GB", mem: "1-300GB", cost: "$$" },
          { tier: "Standard", use: "HA with replica", vcpu: "1-300GB", mem: "1-300GB", cost: "$$$" },
        ],
        tradeoffs: ["Sub-ms latency", "In-memory = volatile (unless Redis persistence)", "Cost scales with memory"]
      },
    ]
  },
  networking: {
    label: "Networking",
    icon: "🌐",
    color: "#34A853",
    flow: [
      { id: "start", text: "Traffic mgmt?", type: "decision", tip: "Do you need to distribute, accelerate, or cache traffic to your applications? Or is this about connectivity and core network infrastructure?" },
      { id: "edge_q", text: "Edge / CDN?", type: "decision", parent: "start", branch: "yes", tip: "Do you want to cache content at Google's edge for faster delivery? Or just balance traffic across backends?" },
      { id: "connectivity", text: "Hybrid / on-prem?", type: "decision", parent: "start", branch: "no", tip: "Do you need to connect your on-prem data center or other clouds to GCP? Or is this about core GCP networking?" },
      { id: "cdn", text: "Cloud CDN", type: "product", parent: "edge_q", branch: "yes", tip: "Edge caching at 100+ Google PoPs. Works with Global HTTP(S) LB only. Great for static assets and cacheable API responses." },
      { id: "lb", text: "Load Balancing", type: "product", parent: "edge_q", branch: "no", tip: "Global (anycast IP, HTTP/S) or Regional (TCP/UDP). Auto-scales, no pre-warming. Integrates with Cloud Armor and CDN." },
      { id: "highbw", text: "High bandwidth?", type: "decision", parent: "connectivity", branch: "yes", tip: "Need >3Gbps or very low latency to on-prem? Interconnect gives dedicated/partner fiber. Otherwise VPN over the internet is simpler." },
      { id: "core_net", text: "Core infra?", type: "decision", parent: "connectivity", branch: "no", tip: "Foundational networking: firewalls, DDoS protection, DNS resolution, or NAT for private instances to reach the internet." },
      { id: "interconnect", text: "Interconnect", type: "product", parent: "highbw", branch: "yes", tip: "Physical fiber connection. Dedicated = 10/100Gbps cross-connect. Partner = 50Mbps-50Gbps via a telco partner. Reduces egress costs too." },
      { id: "vpn", text: "Cloud VPN", type: "product", parent: "highbw", branch: "no", tip: "Encrypted IPsec tunnels over the public internet. HA VPN gives 99.99% SLA with dual tunnels. Max ~3Gbps per tunnel." },
      { id: "protect_q", text: "Protection?", type: "decision", parent: "core_net", branch: "yes", tip: "Need DDoS protection, WAF rules, geo-blocking, or bot detection? Or are you setting up basic network isolation?" },
      { id: "routing_q", text: "DNS / routing?", type: "decision", parent: "core_net", branch: "no", tip: "Need managed DNS hosting or need private VMs to reach the internet without public IPs?" },
      { id: "armor", text: "Cloud Armor", type: "product", parent: "protect_q", branch: "yes", tip: "DDoS protection + WAF for apps behind Global LB. Pre-configured OWASP rules, rate limiting, adaptive protection." },
      { id: "vpc", text: "VPC", type: "product", parent: "protect_q", branch: "no", tip: "Your private network in GCP. Global resource with regional subnets. Firewall rules, Shared VPC for org-wide, VPC Peering for cross-project." },
      { id: "dns", text: "Cloud DNS", type: "product", parent: "routing_q", branch: "yes", tip: "Managed authoritative DNS with 100% SLA. Public and private zones. DNSSEC support. Anycast for global resolution." },
      { id: "nat", text: "Cloud NAT", type: "product", parent: "routing_q", branch: "no", tip: "Lets private VMs (no external IP) make outbound internet connections. Regional, auto-scaling ports. No inbound NAT — use LB for that." },
    ],
    products: [
      {
        name: "VPC", desc: "Virtual Private Cloud", when: "Network isolation, subnets, firewall rules",
        tiers: [
          { tier: "Auto mode", use: "Quick start, 1 subnet/region", vcpu: "-", mem: "-", cost: "Free" },
          { tier: "Custom mode", use: "Full control over subnets", vcpu: "-", mem: "-", cost: "Free" },
        ],
        tradeoffs: ["Global resource (subnets are regional)", "Shared VPC for org-wide control", "VPC Peering for cross-VPC"]
      },
      {
        name: "Cloud Load Balancing", desc: "Global/regional LB", when: "Distribute traffic, SSL termination, health checks",
        tiers: [
          { tier: "External Global (HTTP/S)", use: "Web apps, CDN integration", vcpu: "-", mem: "-", cost: "$$" },
          { tier: "External Regional (TCP/UDP)", use: "Non-HTTP, gaming, streaming", vcpu: "-", mem: "-", cost: "$$" },
          { tier: "Internal (TCP/UDP/HTTP)", use: "Internal microservices", vcpu: "-", mem: "-", cost: "$" },
        ],
        tradeoffs: ["Global LB = anycast IP, single entry", "Integrated with CDN & Cloud Armor", "No pre-warming needed"]
      },
      {
        name: "Cloud CDN", desc: "Content Delivery Network", when: "Cache static/dynamic content at edge",
        tiers: [{ tier: "Single tier", use: "Edge caching", vcpu: "-", mem: "-", cost: "$" }],
        tradeoffs: ["Tied to Global HTTP(S) LB", "Cache invalidation available", "Signed URLs/cookies for access control"]
      },
      {
        name: "Cloud Interconnect", desc: "Dedicated/Partner connection to GCP", when: "High-bandwidth, low-latency to on-prem",
        tiers: [
          { tier: "Dedicated", use: "10/100 Gbps direct", vcpu: "-", mem: "-", cost: "$$$$" },
          { tier: "Partner", use: "50Mbps-50Gbps via partner", vcpu: "-", mem: "-", cost: "$$-$$$" },
        ],
        tradeoffs: ["Dedicated: highest perf, physical cross-connect", "Partner: easier setup, lower commitment", "Reduces egress costs"]
      },
      {
        name: "Cloud VPN", desc: "Encrypted tunnel to GCP", when: "Secure connection to on-prem, lower bandwidth OK",
        tiers: [
          { tier: "HA VPN", use: "99.99% SLA, dual tunnels", vcpu: "-", mem: "-", cost: "$$" },
          { tier: "Classic VPN", use: "Single tunnel (deprecated)", vcpu: "-", mem: "-", cost: "$" },
        ],
        tradeoffs: ["Cheaper than Interconnect", "Over public internet (encrypted)", "Max ~3Gbps per tunnel"]
      },
      {
        name: "Cloud DNS", desc: "Managed DNS", when: "DNS hosting, domain resolution",
        tiers: [{ tier: "Single tier", use: "Authoritative DNS", vcpu: "-", mem: "-", cost: "$" }],
        tradeoffs: ["100% SLA", "DNSSEC support", "Private zones for internal DNS"]
      },
      {
        name: "Cloud Armor", desc: "DDoS & WAF", when: "Protect apps from DDoS, OWASP top 10, geo-blocking",
        tiers: [
          { tier: "Standard", use: "Pay-per-policy/rule", vcpu: "-", mem: "-", cost: "$$" },
          { tier: "Managed Protection+", use: "Adaptive protection, DDoS", vcpu: "-", mem: "-", cost: "$$$" },
        ],
        tradeoffs: ["Works with Global LB only", "Pre-configured WAF rules", "Rate limiting, bot detection"]
      },
      {
        name: "Cloud NAT", desc: "Network Address Translation", when: "Outbound internet from private VMs",
        tiers: [{ tier: "Single tier", use: "NAT gateway", vcpu: "-", mem: "-", cost: "$" }],
        tradeoffs: ["No inbound NAT (use LB instead)", "Auto-scaling ports", "Regional resource"]
      },
    ]
  },
  data_analytics: {
    label: "Data & Analytics",
    icon: "📊",
    color: "#7B1FA2",
    flow: [
      { id: "start", text: "Query / warehouse?", type: "decision", tip: "Do you need to run SQL queries on large datasets for analytics, reporting, or dashboards? BigQuery is the go-to answer." },
      { id: "bigquery", text: "BigQuery", type: "product", parent: "start", branch: "yes", tip: "Serverless, petabyte-scale SQL warehouse. Pay per query or reserve slots. Integrates with ML (BQML), BI, and streaming ingestion." },
      { id: "processing", text: "Data processing?", type: "decision", parent: "start", branch: "no", tip: "Do you need to transform, clean, or move data between systems? This is the ETL/ELT pipeline space." },
      { id: "stream_q", text: "Streaming?", type: "decision", parent: "processing", branch: "yes", tip: "Is data arriving continuously in real-time (events, logs, clickstreams)? Or are you processing stored data in scheduled batches?" },
      { id: "orchestrate_q", text: "Orchestration?", type: "decision", parent: "processing", branch: "no", tip: "Do you need to schedule, sequence, and monitor multi-step data workflows? Or visualize and govern your data assets?" },
      { id: "msg_q", text: "Messaging only?", type: "decision", parent: "stream_q", branch: "yes", tip: "Just need async message delivery between services (pub/sub pattern)? Or do you need to transform/aggregate the stream data?" },
      { id: "batch_q", text: "Spark / Hadoop?", type: "decision", parent: "stream_q", branch: "no", tip: "Do you have existing Spark or Hadoop jobs to run? If not, consider visual ETL tools or the serverless Dataflow (Apache Beam)." },
      { id: "pubsub", text: "Pub/Sub", type: "product", parent: "msg_q", branch: "yes", tip: "Serverless messaging at any scale. Global (Standard) or zonal (Lite). Push/pull delivery. 7-day retention. The GCP event bus." },
      { id: "dataflow", text: "Dataflow", type: "product", parent: "msg_q", branch: "no", tip: "Managed Apache Beam. Unified batch + streaming. Auto-scaling workers. Best for complex transforms on real-time or batch data." },
      { id: "dataproc", text: "Dataproc", type: "product", parent: "batch_q", branch: "yes", tip: "Managed Spark/Hadoop clusters. Spin up in 90s, tear down after job. Serverless option too. For existing Spark code and ecosystems." },
      { id: "nocode_q", text: "No-code ETL?", type: "decision", parent: "batch_q", branch: "no", tip: "Want to build data pipelines visually without writing code? Data Fusion has a drag-and-drop UI. Otherwise explore BI/visualization." },
      { id: "datafusion", text: "Data Fusion", type: "product", parent: "nocode_q", branch: "yes", tip: "Visual ETL built on CDAP. Drag-and-drop pipeline builder. 150+ connectors. Good for teams without Beam/Spark expertise." },
      { id: "looker", text: "Looker / BI", type: "product", parent: "nocode_q", branch: "no", tip: "Looker Studio = free dashboards. Looker Enterprise = governed BI with LookML modeling layer. Embedded analytics capable." },
      { id: "complex_q", text: "Complex DAGs?", type: "decision", parent: "orchestrate_q", branch: "yes", tip: "Multi-step workflows with dependencies, retries, branching? Composer (Airflow) for complex DAGs, Dataplex for data governance." },
      { id: "govern_q", text: "Governance?", type: "decision", parent: "orchestrate_q", branch: "no", tip: "Need to catalog, discover, profile, and ensure quality of data across your organization's lakes and warehouses?" },
      { id: "composer", text: "Composer", type: "product", parent: "complex_q", branch: "yes", tip: "Managed Apache Airflow. DAG-based orchestration. Can trigger any GCP service. Expensive for simple workflows — use Cloud Workflows instead." },
      { id: "dataplex", text: "Dataplex", type: "product", parent: "complex_q", branch: "no", tip: "Data governance layer. Auto-discovers data in GCS/BQ. Data quality rules, lineage tracking, and data mesh organization." },
    ],
    products: [
      {
        name: "BigQuery", desc: "Serverless data warehouse", when: "SQL analytics, petabyte-scale, ML integration",
        tiers: [
          { tier: "On-demand", use: "Pay per query ($5/TB scanned)", vcpu: "Auto", mem: "Auto", cost: "$$" },
          { tier: "Capacity (Slots)", use: "Predictable cost, reserved compute", vcpu: "100-10K+ slots", mem: "Auto", cost: "$$$" },
          { tier: "Editions", use: "Standard/Enterprise/Enterprise+", vcpu: "Flex slots", mem: "Auto", cost: "$$-$$$$" },
        ],
        tradeoffs: ["On-demand: simple but can spike", "Slots: predictable but pay idle", "Partitioning/clustering reduces scan cost", "BQML for in-warehouse ML"]
      },
      {
        name: "Dataflow", desc: "Managed Apache Beam", when: "Stream & batch ETL, real-time transforms",
        tiers: [
          { tier: "Batch", use: "Bounded data processing", vcpu: "Auto-scale", mem: "Auto-scale", cost: "$$" },
          { tier: "Streaming", use: "Unbounded real-time", vcpu: "Auto-scale", mem: "Auto-scale", cost: "$$$" },
        ],
        tradeoffs: ["Unified batch+stream model", "Auto-scaling workers", "Apache Beam SDK (Java/Python)", "vs Dataproc: managed vs Hadoop/Spark"]
      },
      {
        name: "Pub/Sub", desc: "Messaging & event ingestion", when: "Decouple services, event streaming, async messaging",
        tiers: [
          { tier: "Standard", use: "At-least-once delivery", vcpu: "Serverless", mem: "Serverless", cost: "$" },
          { tier: "Lite", use: "Zonal, lower cost, Kafka-like", vcpu: "Provisioned", mem: "Provisioned", cost: "$" },
        ],
        tradeoffs: ["Global by default (Standard)", "Lite: cheaper but zonal, partitioned", "7-day retention (Standard)", "Push & Pull subscriptions"]
      },
      {
        name: "Dataproc", desc: "Managed Spark/Hadoop", when: "Existing Spark/Hadoop jobs, ML pipelines on Spark",
        tiers: [
          { tier: "On Compute Engine", use: "Managed clusters", vcpu: "Custom", mem: "Custom", cost: "$$" },
          { tier: "Serverless", use: "No cluster mgmt", vcpu: "Auto", mem: "Auto", cost: "$$$" },
        ],
        tradeoffs: ["Use existing Spark/Hadoop code", "Ephemeral clusters save cost", "Serverless: no infra but less control", "vs Dataflow: Spark vs Beam"]
      },
      {
        name: "Cloud Composer", desc: "Managed Apache Airflow", when: "Orchestrate complex multi-step data pipelines",
        tiers: [
          { tier: "Composer 1", use: "Legacy", vcpu: "Custom", mem: "Custom", cost: "$$" },
          { tier: "Composer 2", use: "Current, auto-scaling", vcpu: "Auto", mem: "Auto", cost: "$$-$$$" },
        ],
        tradeoffs: ["DAG-based orchestration", "Can orchestrate any GCP service", "Expensive for simple workflows", "vs Cloud Workflows for simpler needs"]
      },
      {
        name: "Looker / Looker Studio", desc: "BI & visualization", when: "Dashboards, reports, governed metrics layer",
        tiers: [
          { tier: "Looker Studio (free)", use: "Basic dashboards, reports", vcpu: "-", mem: "-", cost: "Free" },
          { tier: "Looker (enterprise)", use: "Governed BI, LookML modeling", vcpu: "-", mem: "-", cost: "$$$$" },
        ],
        tradeoffs: ["Studio: free but less governance", "Looker: powerful but expensive", "LookML = single source of truth", "Embedded analytics capable"]
      },
      {
        name: "Data Fusion", desc: "Visual ETL (CDAP-based)", when: "No-code/low-code data integration",
        tiers: [
          { tier: "Basic", use: "Development, testing", vcpu: "Auto", mem: "Auto", cost: "$$" },
          { tier: "Enterprise", use: "HA, RBAC, lineage", vcpu: "Auto", mem: "Auto", cost: "$$$" },
        ],
        tradeoffs: ["Visual pipeline builder", "Good for non-coders", "Higher cost than raw Dataflow", "CDAP ecosystem plugins"]
      },
      {
        name: "Dataplex", desc: "Data governance & management", when: "Data mesh, cataloging, quality, lineage",
        tiers: [{ tier: "Single tier", use: "Governance layer", vcpu: "-", mem: "-", cost: "$$" }],
        tradeoffs: ["Organizes data across lakes/warehouses", "Auto data quality checks", "Data lineage tracking"]
      },
    ]
  },
  ai_ml: {
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
  },
  security: {
    label: "Security & IAM",
    icon: "🔒",
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
  },
  devops: {
    label: "DevOps & CI/CD",
    icon: "🔧",
    color: "#00ACC1",
    flow: [
      { id: "start", text: "Build / ship?", type: "decision", tip: "Are you building, testing, and deploying code? Or monitoring and observing what's already running in production?" },
      { id: "ci_q", text: "CI (build/test)?", type: "decision", parent: "start", branch: "yes", tip: "Continuous Integration — automatically build and test code on every push. Or are you focused on the deployment/release pipeline?" },
      { id: "observe_q", text: "Observability?", type: "decision", parent: "start", branch: "no", tip: "The three pillars: logs (what happened), metrics (how much/how fast), traces (where time was spent across services)." },
      { id: "cloudbuild", text: "Cloud Build", type: "product", parent: "ci_q", branch: "yes", tip: "Serverless CI/CD. Define build steps in YAML. Triggers on GitHub/GitLab push/PR. 120 free build-min/day. Private pools for VPC access." },
      { id: "cd_q", text: "CD (deploy)?", type: "decision", parent: "ci_q", branch: "no", tip: "Continuous Delivery — automated, promotion-based rollouts? Or do you need a place to store your built artifacts (container images, packages)?" },
      { id: "deploy", text: "Cloud Deploy", type: "product", parent: "cd_q", branch: "yes", tip: "Managed CD pipeline for GKE and Cloud Run. Promotion through dev→staging→prod. Canary and blue-green strategies. Approval gates." },
      { id: "ar", text: "Artifact Registry", type: "product", parent: "cd_q", branch: "no", tip: "Universal package repository. Docker images, npm, Maven, Python, Go, Apt. Vulnerability scanning. Replaces the old Container Registry." },
      { id: "logs_q", text: "Logs?", type: "decision", parent: "observe_q", branch: "yes", tip: "Need to collect, search, and analyze application and infrastructure logs? Or are you tracking metrics, SLOs, and setting up alerts?" },
      { id: "metrics_q", text: "Metrics / alerts?", type: "decision", parent: "observe_q", branch: "no", tip: "System and custom metrics, dashboards, uptime checks, and alerting to PagerDuty/Slack. The 'monitoring' pillar of observability." },
      { id: "logging", text: "Cloud Logging", type: "product", parent: "logs_q", branch: "yes", tip: "Centralized log management. Auto-collects from all GCP services. Log Router filters/routes logs. Export to BigQuery for analysis." },
      { id: "debug_q", text: "Tracing?", type: "decision", parent: "logs_q", branch: "no", tip: "Need to trace requests across distributed microservices to find latency bottlenecks? Or just aggregate and track error rates?" },
      { id: "trace", text: "Trace / Profiler", type: "product", parent: "debug_q", branch: "yes", tip: "Distributed tracing (OpenTelemetry compatible) + continuous CPU/memory profiling in production. Find exactly where latency hides." },
      { id: "errors", text: "Error Reporting", type: "product", parent: "debug_q", branch: "no", tip: "Auto-groups exceptions across services. Stack trace analysis. Notifications on new errors. Free tier. Integrates with Logging." },
      { id: "monitoring", text: "Cloud Monitoring", type: "product", parent: "metrics_q", branch: "yes", tip: "Metrics dashboards, alerting policies, uptime checks. GCP metrics are free. Custom metrics for app-level data. Prometheus compatible." },
    ],
    products: [
      {
        name: "Cloud Build", desc: "Serverless CI/CD", when: "Build containers, run tests, deploy",
        tiers: [
          { tier: "Default pool", use: "Shared workers", vcpu: "1-32", mem: "3.75-256GB", cost: "$" },
          { tier: "Private pool", use: "VPC access, custom", vcpu: "Custom", mem: "Custom", cost: "$$" },
        ],
        tradeoffs: ["120 free build-min/day", "Integrates with GitHub/GitLab", "Triggers on push/PR/tag"]
      },
      {
        name: "Artifact Registry", desc: "Package & container registry", when: "Store Docker images, npm, Maven, Python packages",
        tiers: [{ tier: "Single tier", use: "Multi-format registry", vcpu: "-", mem: "-", cost: "$" }],
        tradeoffs: ["Replaces Container Registry", "Vulnerability scanning", "Regional or multi-region", "Supports Docker, npm, Maven, Python, Go, Apt"]
      },
      {
        name: "Cloud Deploy", desc: "Managed CD for GKE/Cloud Run", when: "Promotion-based deployments, canary, blue-green",
        tiers: [{ tier: "Single tier", use: "Delivery pipelines", vcpu: "-", mem: "-", cost: "$" }],
        tradeoffs: ["Opinionated CD pipeline", "Approval gates", "Rollback support", "Tight GKE/Run integration"]
      },
      {
        name: "Cloud Logging", desc: "Centralized log management", when: "Collect, search, analyze logs from all GCP services",
        tiers: [
          { tier: "Free tier", use: "First 50GB/project/month", vcpu: "-", mem: "-", cost: "Free" },
          { tier: "Paid", use: "Beyond free tier", vcpu: "-", mem: "-", cost: "$0.50/GB" },
        ],
        tradeoffs: ["Auto-collects GCP service logs", "Log-based metrics", "Export to BQ/GCS/Pub/Sub", "Log Router for filtering"]
      },
      {
        name: "Cloud Monitoring", desc: "Metrics, dashboards, alerting", when: "Track SLIs/SLOs, custom metrics, uptime checks",
        tiers: [
          { tier: "GCP metrics", use: "Built-in GCP service metrics", vcpu: "-", mem: "-", cost: "Free" },
          { tier: "Custom metrics", use: "App-defined metrics", vcpu: "-", mem: "-", cost: "$$" },
        ],
        tradeoffs: ["Integrates with all GCP services", "Prometheus compatible", "Managed Grafana available", "Alerting policies → PagerDuty, Slack, etc."]
      },
      {
        name: "Cloud Trace / Profiler", desc: "Distributed tracing & profiling", when: "Debug latency, find bottlenecks in distributed systems",
        tiers: [{ tier: "Single tier", use: "Tracing + profiling", vcpu: "-", mem: "-", cost: "$" }],
        tradeoffs: ["OpenTelemetry compatible", "Auto-instrumented for GCP services", "Profiler: CPU & memory profiling in prod"]
      },
      {
        name: "Error Reporting", desc: "Exception tracking", when: "Centralized error tracking across services",
        tiers: [{ tier: "Single tier", use: "Error aggregation", vcpu: "-", mem: "-", cost: "Free" }],
        tradeoffs: ["Auto-groups errors", "Stack trace analysis", "Notification on new errors"]
      },
    ]
  },
  serverless: {
    label: "Serverless & App",
    icon: "☁️",
    color: "#673AB7",
    flow: [
      { id: "start", text: "API management?", type: "decision", tip: "Do you need to manage, secure, throttle, and monitor APIs? Or are you looking to orchestrate backend logic and workflows?" },
      { id: "enterprise_api", text: "Enterprise-grade?", type: "decision", parent: "start", branch: "yes", tip: "Need API analytics, developer portal, monetization, quota management? That's Apigee territory. For simpler needs, API Gateway suffices." },
      { id: "orchestration", text: "Orchestration?", type: "decision", parent: "start", branch: "no", tip: "Do you need to coordinate multi-step processes, schedule jobs, or route events between services?" },
      { id: "apigee", text: "Apigee", type: "product", parent: "enterprise_api", branch: "yes", tip: "Full API lifecycle management. Rate limiting, caching, OAuth, analytics, developer portal, monetization. Expensive but comprehensive." },
      { id: "gateway", text: "API Gateway", type: "product", parent: "enterprise_api", branch: "no", tip: "Lightweight serverless API gateway. OpenAPI spec-based. API key and JWT auth. Routes to Cloud Functions, Cloud Run, or GCE backends." },
      { id: "workflow_q", text: "Multi-step flows?", type: "decision", parent: "orchestration", branch: "yes", tip: "Need to chain API calls with conditional logic, retries, and error handling? Or just queue individual tasks or schedule cron jobs?" },
      { id: "event_q", text: "Event-driven?", type: "decision", parent: "orchestration", branch: "no", tip: "Do you need to route events from GCP services to targets (Eventarc)? Or build a full mobile/web app with Firebase's suite of tools?" },
      { id: "workflows", text: "Workflows", type: "product", parent: "workflow_q", branch: "yes", tip: "Serverless workflow engine. YAML/JSON definitions. HTTP connectors, conditional steps, parallel execution. Cheaper than Composer for simple flows." },
      { id: "async_q", text: "Async tasks?", type: "decision", parent: "workflow_q", branch: "no", tip: "Need to queue tasks with rate limiting and delayed execution? Or do you just need a cron scheduler to trigger things periodically?" },
      { id: "tasks", text: "Cloud Tasks", type: "product", parent: "async_q", branch: "yes", tip: "Managed task queue. Rate-limited dispatch to HTTP or App Engine targets. Configurable retries with exponential backoff. For controlling execution pace." },
      { id: "scheduler", text: "Cloud Scheduler", type: "product", parent: "async_q", branch: "no", tip: "Managed cron service. Unix cron syntax. Triggers HTTP endpoints, Pub/Sub topics, or App Engine. 3 free jobs per month." },
      { id: "eventarc", text: "Eventarc", type: "product", parent: "event_q", branch: "yes", tip: "Unified event routing. Reacts to 90+ GCP event sources (audit logs, GCS, Pub/Sub). CloudEvents standard. Triggers Cloud Run or Workflows." },
      { id: "firebase", text: "Firebase", type: "product", parent: "event_q", branch: "no", tip: "Complete app platform. Auth, Hosting, Cloud Functions, Firestore, Storage, Analytics, Crashlytics, Remote Config. Best DX for mobile/web." },
    ],
    products: [
      {
        name: "Apigee", desc: "Full API management platform", when: "Enterprise API gateway, monetization, developer portal",
        tiers: [
          { tier: "Standard", use: "Basic API mgmt", vcpu: "-", mem: "-", cost: "$$$" },
          { tier: "Enterprise", use: "Full lifecycle, analytics", vcpu: "-", mem: "-", cost: "$$$$" },
        ],
        tradeoffs: ["Full API lifecycle", "Expensive but feature-rich", "API analytics & monetization", "vs API Gateway: much more powerful"]
      },
      {
        name: "API Gateway", desc: "Serverless API gateway", when: "Simple API fronting for Cloud Functions/Run/GCE",
        tiers: [{ tier: "Single tier", use: "Serverless gateway", vcpu: "-", mem: "-", cost: "$" }],
        tradeoffs: ["OpenAPI spec-based", "Simple auth (API keys, JWT)", "Less features than Apigee", "Good for serverless backends"]
      },
      {
        name: "Cloud Workflows", desc: "Serverless workflow orchestration", when: "Chain API calls, conditional logic, retries",
        tiers: [{ tier: "Single tier", use: "Workflow steps", vcpu: "Serverless", mem: "Serverless", cost: "$" }],
        tradeoffs: ["YAML/JSON workflow definitions", "Built-in error handling & retries", "vs Composer: simpler, cheaper, less powerful", "Good for API orchestration"]
      },
      {
        name: "Cloud Tasks", desc: "Async task queue", when: "Rate-limited task execution, delayed delivery",
        tiers: [{ tier: "Single tier", use: "Task queues", vcpu: "Serverless", mem: "Serverless", cost: "$" }],
        tradeoffs: ["HTTP & App Engine targets", "Rate limiting built-in", "Retry with backoff", "vs Pub/Sub: more control over execution rate"]
      },
      {
        name: "Cloud Scheduler", desc: "Managed cron", when: "Scheduled jobs, periodic triggers",
        tiers: [{ tier: "Single tier", use: "Cron jobs", vcpu: "Serverless", mem: "Serverless", cost: "$" }],
        tradeoffs: ["3 free jobs/month", "Targets: HTTP, Pub/Sub, App Engine", "Unix cron syntax"]
      },
      {
        name: "Eventarc", desc: "Event-driven architecture", when: "Route events from GCP/custom sources to targets",
        tiers: [{ tier: "Single tier", use: "Event routing", vcpu: "Serverless", mem: "Serverless", cost: "$" }],
        tradeoffs: ["CloudEvents standard", "Audit log triggers", "Pub/Sub & direct events", "Async event-driven patterns"]
      },
      {
        name: "Firebase", desc: "App development platform", when: "Mobile/web apps, auth, hosting, real-time features",
        tiers: [
          { tier: "Spark (Free)", use: "Hobby projects", vcpu: "-", mem: "-", cost: "Free" },
          { tier: "Blaze (Pay-as-go)", use: "Production apps", vcpu: "-", mem: "-", cost: "$-$$" },
        ],
        tradeoffs: ["Auth, Hosting, Functions, Firestore, Storage", "Great DX for mobile/web", "Blaze: still has free tier quotas", "Analytics + Crashlytics + Remote Config"]
      },
    ]
  },
  containers: {
    label: "Containers & Mesh",
    icon: "📦",
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
  },
  migration: {
    label: "Migration",
    icon: "🚚",
    color: "#795548",
    flow: [
      { id: "start", text: "VMs / apps?", type: "decision", tip: "Are you migrating virtual machines or applications? Or migrating databases and large datasets?" },
      { id: "vm_migrate", text: "Keep as VMs?", type: "decision", parent: "start", branch: "yes", tip: "Lift-and-shift VMs as-is to GCE? Or modernize them into containers during migration for GKE/Cloud Run?" },
      { id: "data_migrate", text: "Database?", type: "decision", parent: "start", branch: "no", tip: "Migrating a relational database (MySQL, PG, SQL Server, Oracle) to a managed GCP DB? Or moving bulk data (files, objects)?" },
      { id: "m4ce", text: "Migrate to VMs", type: "product", parent: "vm_migrate", branch: "yes", tip: "Continuous replication from VMware, AWS, or Azure. Minimal downtime cutover. Test clones before committing. Free tool (pay for compute)." },
      { id: "m4c", text: "Migrate to Containers", type: "product", parent: "vm_migrate", branch: "no", tip: "Analyzes VM workloads and auto-generates Dockerfiles. Best for stateless apps. Not everything can be containerized — validate first." },
      { id: "dms", text: "DB Migration Svc", type: "product", parent: "data_migrate", branch: "yes", tip: "Managed continuous replication to Cloud SQL or AlloyDB. Minimal downtime. Free (you pay for the destination DB instance)." },
      { id: "transfer", text: "Transfer Appliance", type: "product", parent: "data_migrate", branch: "no", tip: "Google ships a physical storage device to your data center. Load it up, ship it back. For 20TB+ where network transfer is impractical." },
    ],
    products: [
      {
        name: "Migrate to Virtual Machines", desc: "VM migration tool", when: "Lift-and-shift VMs from VMware, AWS, Azure",
        tiers: [{ tier: "Single tier", use: "VM migration", vcpu: "-", mem: "-", cost: "Free (compute costs)" }],
        tradeoffs: ["Continuous replication", "Minimal downtime cutover", "Test clones before migration"]
      },
      {
        name: "Migrate to Containers", desc: "VM → container conversion", when: "Modernize VMs into containers for GKE/Run",
        tiers: [{ tier: "Single tier", use: "Container conversion", vcpu: "-", mem: "-", cost: "Free (compute costs)" }],
        tradeoffs: ["Auto-generates Dockerfile", "Good for stateless apps", "Not all workloads are containerizable"]
      },
      {
        name: "Database Migration Service", desc: "Managed DB migration", when: "Migrate MySQL/PG/SQL Server/Oracle to Cloud SQL/AlloyDB",
        tiers: [{ tier: "Single tier", use: "Continuous replication", vcpu: "-", mem: "-", cost: "Free (destination costs)" }],
        tradeoffs: ["Minimal downtime", "Continuous replication", "Supports heterogeneous migrations (limited)"]
      },
      {
        name: "Transfer Appliance", desc: "Physical data transfer device", when: ">20TB data, slow network",
        tiers: [
          { tier: "TA100", use: "Up to 100TB", vcpu: "-", mem: "-", cost: "$$$" },
          { tier: "TA480", use: "Up to 480TB", vcpu: "-", mem: "-", cost: "$$$$" },
        ],
        tradeoffs: ["Ship data physically", "Encrypted at rest", "For massive datasets where network is impractical"]
      },
    ]
  },
  iot_edge: {
    label: "IoT & Edge",
    icon: "📡",
    color: "#607D8B",
    flow: [
      { id: "start", text: "GCP at the edge?", type: "decision", tip: "Do you need to run GCP services outside of a standard GCP region — at a telco edge, on-premises, or in an air-gapped environment?" },
      { id: "distcloud", text: "Distributed Cloud", type: "product", parent: "start", branch: "yes", tip: "Full GCP stack at the edge. Three flavors: Edge (telco PoPs), Connected (on-prem with GCP link), Air-gapped (fully isolated). Very premium." },
      { id: "legacy", text: "IoT Core (deprecated)", type: "product", parent: "start", branch: "no", tip: "IoT Core was deprecated Aug 2023. For IoT ingestion, use a 3rd-party MQTT broker (e.g. HiveMQ, EMQX) feeding into Pub/Sub." },
    ],
    products: [
      {
        name: "Distributed Cloud", desc: "GCP at the edge / on-prem", when: "Need GCP services outside a GCP region",
        tiers: [
          { tier: "Edge", use: "Telco / edge locations", vcpu: "Custom", mem: "Custom", cost: "$$$$" },
          { tier: "Connected", use: "On-prem with GCP connectivity", vcpu: "Custom", mem: "Custom", cost: "$$$$" },
          { tier: "Air-gapped", use: "No connectivity to GCP", vcpu: "Custom", mem: "Custom", cost: "$$$$$" },
        ],
        tradeoffs: ["GCP APIs at the edge", "Sovereignty & data residency", "Very high cost", "For telco, defense, regulated industries"]
      },
      {
        name: "IoT Core (Deprecated)", desc: "Was: managed MQTT broker", when: "⚠️ Deprecated Aug 2023 — use alternatives",
        tiers: [{ tier: "Deprecated", use: "Use 3rd party MQTT + Pub/Sub", vcpu: "-", mem: "-", cost: "-" }],
        tradeoffs: ["Migrate to: MQTT broker + Pub/Sub", "Or use partner solutions", "GCP gap in IoT space"]
      },
    ]
  },
};

const CATEGORIES = Object.entries(GCP_DATA);

function FlowDiagram({ flow, color }) {
  if (!flow || flow.length === 0) return null;
  const [hoveredNode, setHoveredNode] = useState(null);

  const nodeW = 140, nodeH = 40, gapY = 70;
  const positions = {};
  const edges = [];

  const children = {};
  flow.forEach(n => {
    if (n.parent) {
      if (!children[n.parent]) children[n.parent] = [];
      children[n.parent].push(n);
    }
  });

  function subtreeWidth(id) {
    const kids = children[id] || [];
    if (kids.length === 0) return nodeW + 24;
    const total = kids.reduce((sum, k) => sum + subtreeWidth(k.id), 0);
    return Math.max(total, nodeW + 24);
  }

  const root = flow.find(n => n.id === "start");
  if (!root) return null;

  function layoutNode(id, x, y) {
    positions[id] = { x, y };
    const kids = children[id] || [];
    if (kids.length === 0) return;
    const totalW = kids.reduce((sum, k) => sum + subtreeWidth(k.id), 0);
    let curX = x - totalW / 2;
    kids.forEach(kid => {
      const w = subtreeWidth(kid.id);
      const childX = curX + w / 2;
      layoutNode(kid.id, childX, y + gapY);
      edges.push({ from: id, to: kid.id, label: kid.branch });
      curX += w;
    });
  }

  const rootW = subtreeWidth(root.id);
  layoutNode(root.id, rootW / 2, 30);

  const allPos = Object.values(positions);
  const minX = Math.min(...allPos.map(p => p.x)) - nodeW / 2 - 30;
  const maxX = Math.max(...allPos.map(p => p.x)) + nodeW / 2 + 30;
  const maxY = Math.max(...allPos.map(p => p.y)) + nodeH + 20;
  const svgW = maxX - minX;
  const svgH = maxY + 10;

  const hoveredFlow = hoveredNode ? flow.find(n => n.id === hoveredNode) : null;
  const hoveredPos = hoveredNode ? positions[hoveredNode] : null;

  // Tooltip positioning helper
  function getTipPos(pos, tip) {
    const maxW = 260;
    const padding = 10;
    const charsPerLine = 38;
    const lines = Math.ceil((tip || "").length / charsPerLine);
    const h = lines * 16 + padding * 2 + 4;
    let tx = pos.x - maxW / 2;
    let ty = pos.y - h - 12;
    if (tx < minX + 4) tx = minX + 4;
    if (tx + maxW > maxX - 4) tx = maxX - maxW - 4;
    if (ty < 2) ty = pos.y + nodeH + 8;
    return { tx, ty, h, maxW };
  }

  return (
    <svg width="100%" viewBox={`${minX} 0 ${svgW} ${svgH}`} style={{ maxHeight: 520, display: "block", margin: "0 auto" }}>
      <defs>
        <marker id={`arrow-${color.replace('#','')}`} viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 3.5 L 0 7 z" fill={color} opacity="0.5" />
        </marker>
      </defs>
      {edges.map((e, i) => {
        const from = positions[e.from];
        const to = positions[e.to];
        if (!from || !to) return null;
        const x1 = from.x, y1 = from.y + nodeH;
        const x2 = to.x, y2 = to.y;
        const midY = (y1 + y2) / 2;
        return (
          <g key={i}>
            <path
              d={`M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`}
              fill="none" stroke={color} strokeWidth="1.5" opacity="0.35"
              markerEnd={`url(#arrow-${color.replace('#','')})`}
            />
            <text x={(x1 + x2) / 2 + (x2 > x1 ? 8 : -8)} y={midY - 4}
              textAnchor="middle" fontSize="10" fill={color} fontWeight="700" opacity="0.7"
              fontFamily="'DM Mono', monospace"
            >
              {e.label}
            </text>
          </g>
        );
      })}
      {flow.map(n => {
        const pos = positions[n.id];
        if (!pos) return null;
        const isProduct = n.type === "product";
        const isHovered = hoveredNode === n.id;
        return (
          <g key={n.id}
            onMouseEnter={() => setHoveredNode(n.id)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{ cursor: n.tip ? "help" : "default" }}
          >
            {isProduct ? (
              <rect x={pos.x - nodeW / 2} y={pos.y} width={nodeW} height={nodeH}
                rx="8" fill={color} opacity={isHovered ? 1 : 0.9}
                stroke={isHovered ? "#fff" : "none"} strokeWidth={isHovered ? 2 : 0}
              />
            ) : (
              <rect x={pos.x - nodeW / 2} y={pos.y} width={nodeW} height={nodeH}
                rx="8" fill={isHovered ? `${color}20` : "transparent"} stroke={color}
                strokeWidth={isHovered ? 2.5 : 2} opacity={isHovered ? 0.9 : 0.5}
              />
            )}
            <text x={pos.x} y={pos.y + nodeH / 2 + 1} textAnchor="middle" dominantBaseline="middle"
              fontSize={isProduct ? "11" : "10"} fontWeight={isProduct ? "700" : "500"}
              fill={isProduct ? "#fff" : color}
              fontFamily="'DM Mono', monospace"
              style={{ pointerEvents: "none" }}
            >
              {n.text}
            </text>
            {n.tip && (
              <circle cx={pos.x + nodeW/2 - 8} cy={pos.y + 8} r={4}
                fill={isProduct ? "rgba(255,255,255,0.4)" : `${color}60`}
                style={{ pointerEvents: "none" }}
              />
            )}
          </g>
        );
      })}
      {/* Tooltip rendered last to be on top */}
      {hoveredFlow && hoveredPos && hoveredFlow.tip && (() => {
        const { tx, ty, h, maxW } = getTipPos(hoveredPos, hoveredFlow.tip);
        return (
          <foreignObject x={tx} y={ty} width={maxW} height={h + 8} style={{ pointerEvents: "none", overflow: "visible" }}>
            <div style={{
              background: "rgba(0,0,0,0.92)",
              color: "#e8eaed",
              borderRadius: 8,
              padding: "10px",
              fontSize: 11.5,
              lineHeight: "1.4",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              {hoveredFlow.tip}
            </div>
          </foreignObject>
        );
      })()}
    </svg>
  );
}

function CostDots({ cost }) {
  const count = cost ? cost.replace(/[^$]/g, '').length : 0;
  if (cost && !cost.startsWith('$')) return <span style={{ fontSize: 11, opacity: 0.6 }}>{cost}</span>;
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: i <= count ? "#4CAF50" : "var(--bg-tertiary)",
          display: "inline-block",
          opacity: i <= count ? 1 : 0.25,
        }} />
      ))}
    </span>
  );
}

function ProductCard({ product, color, isExpanded, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      background: "var(--bg-secondary)", borderRadius: 12, padding: "14px 18px",
      cursor: "pointer", borderLeft: `4px solid ${color}`, transition: "all 0.2s ease", marginBottom: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", fontFamily: "'Space Mono', monospace" }}>{product.name}</span>
          <span style={{ marginLeft: 10, fontSize: 12, opacity: 0.5, fontFamily: "'DM Sans', sans-serif" }}>{product.desc}</span>
        </div>
        <span style={{ fontSize: 18, opacity: 0.4, transition: "transform 0.2s", transform: isExpanded ? "rotate(90deg)" : "rotate(0)" }}>›</span>
      </div>
      <div style={{ fontSize: 12, color: color, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>{product.when}</div>
      {isExpanded && (
        <div style={{ marginTop: 14, animation: "fadeIn 0.2s ease" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${color}33` }}>
                  {["Tier", "Use Case", "vCPU", "Memory", "Cost"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "6px 10px", fontWeight: 600, color: color, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {product.tiers.map((t, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--bg-tertiary)" }}>
                    <td style={{ padding: "8px 10px", fontWeight: 600, fontFamily: "'Space Mono', monospace", fontSize: 12 }}>{t.tier}</td>
                    <td style={{ padding: "8px 10px", opacity: 0.75 }}>{t.use}</td>
                    <td style={{ padding: "8px 10px", opacity: 0.6, fontFamily: "'Space Mono', monospace" }}>{t.vcpu}</td>
                    <td style={{ padding: "8px 10px", opacity: 0.6, fontFamily: "'Space Mono', monospace" }}>{t.mem}</td>
                    <td style={{ padding: "8px 10px" }}><CostDots cost={t.cost} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {product.tradeoffs && (
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {product.tradeoffs.map((t, i) => (
                <span key={i} style={{
                  background: `${color}15`, color: color, padding: "4px 10px", borderRadius: 20,
                  fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, whiteSpace: "nowrap",
                }}>{t}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GCPNavigator() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [expandedProducts, setExpandedProducts] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [showFlow, setShowFlow] = useState(true);
  const contentRef = useRef(null);

  const toggleProduct = (name) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const activeCat = activeCategory ? GCP_DATA[activeCategory] : null;

  const searchResults = searchTerm.length >= 2
    ? CATEGORIES.flatMap(([catKey, cat]) =>
        cat.products.filter(p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.when.toLowerCase().includes(searchTerm.toLowerCase())
        ).map(p => ({ ...p, catKey, catColor: cat.color, catLabel: cat.label }))
      )
    : [];

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeCategory]);

  return (
    <div style={{
      height: "100vh", width: "100%", display: "flex", flexDirection: "column",
      background: "var(--bg-primary, #0d1117)", color: "var(--text-primary, #c9d1d9)",
      fontFamily: "'DM Sans', sans-serif", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&family=DM+Mono:wght@400;500&display=swap');
        :root { --bg-primary: #0d1117; --bg-secondary: #161b22; --bg-tertiary: #21262d; --text-primary: #c9d1d9; --text-secondary: #8b949e; }
        @media (prefers-color-scheme: light) { :root { --bg-primary: #f6f8fa; --bg-secondary: #ffffff; --bg-tertiary: #e8eaed; --text-primary: #1f2328; --text-secondary: #656d76; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: var(--bg-tertiary); border-radius: 3px; }
      `}</style>

      <div style={{ padding: "16px 24px 12px", borderBottom: "1px solid var(--bg-tertiary)", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Space Mono', monospace", letterSpacing: "-0.03em", margin: 0 }}>GCP Navigator</h1>
              <span style={{ fontSize: 11, opacity: 0.4, fontFamily: "'DM Mono', monospace" }}>hover nodes for context · click products below</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, opacity: 0.55, fontFamily: "'DM Sans', sans-serif" }}>
                By Lydia Thomas for{" "}
                <a href="https://makeitasmash.com/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2 }}>
                  Smash Hit Technologies
                </a>
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <a
                  href="https://github.com/SmashHitTech/SmashHitsHelps"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Smash Hits Helps on GitHub"
                  title="GitHub — SmashHitsHelps"
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 36, height: 36, borderRadius: 10,
                    background: "var(--bg-secondary)", border: "1px solid var(--bg-tertiary)",
                    color: "var(--text-secondary)", transition: "color 0.15s ease, border-color 0.15s ease, background 0.15s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--text-secondary)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--bg-tertiary)"; }}
                >
                  <Github size={18} strokeWidth={2} aria-hidden />
                </a>
                <a
                  href="https://makeitasmash.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Smash Hit Technologies website"
                  title="makeitasmash.com"
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 36, height: 36, borderRadius: 10,
                    background: "var(--bg-secondary)", border: "1px solid var(--bg-tertiary)",
                    color: "var(--text-secondary)", transition: "color 0.15s ease, border-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--text-secondary)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--bg-tertiary)"; }}
                >
                  <Globe size={18} strokeWidth={2} aria-hidden />
                </a>
              </div>
            </div>
          </div>
          <input type="text" placeholder="Search products..." value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); if (e.target.value.length >= 2) setActiveCategory(null); }}
            style={{
              background: "var(--bg-secondary)", border: "1px solid var(--bg-tertiary)", borderRadius: 8,
              padding: "8px 14px", color: "var(--text-primary)", fontSize: 13, width: 220, outline: "none", fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          {CATEGORIES.map(([key, cat]) => (
            <button key={key} onClick={() => { setActiveCategory(key === activeCategory ? null : key); setSearchTerm(""); }}
              style={{
                padding: "7px 14px", borderRadius: 8, border: "none",
                background: activeCategory === key ? cat.color : "var(--bg-secondary)",
                color: activeCategory === key ? "#fff" : "var(--text-secondary)",
                cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
                transition: "all 0.15s ease", fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <span style={{ fontSize: 14 }}>{cat.icon}</span>{cat.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={contentRef} style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
        {searchTerm.length >= 2 && (
          <div style={{ animation: "fadeIn 0.2s ease" }}>
            <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchTerm}"
            </div>
            {searchResults.map(p => (
              <div key={p.name} style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 10, color: p.catColor, fontWeight: 600, marginBottom: 2, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>{p.catLabel}</div>
                <ProductCard product={p} color={p.catColor} isExpanded={expandedProducts.has(p.name)} onToggle={() => toggleProduct(p.name)} />
              </div>
            ))}
            {searchResults.length === 0 && <div style={{ textAlign: "center", padding: 40, opacity: 0.4 }}>No matching products</div>}
          </div>
        )}

        {!activeCategory && searchTerm.length < 2 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, animation: "fadeIn 0.2s ease" }}>
            {CATEGORIES.map(([key, cat]) => (
              <div key={key} onClick={() => setActiveCategory(key)}
                style={{ background: "var(--bg-secondary)", borderRadius: 12, padding: 20, cursor: "pointer", borderTop: `3px solid ${cat.color}`, transition: "transform 0.15s ease, box-shadow 0.15s ease" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${cat.color}22`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{cat.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 16, fontFamily: "'Space Mono', monospace", marginBottom: 6 }}>{cat.label}</div>
                <div style={{ fontSize: 12, opacity: 0.5 }}>{cat.products.length} products</div>
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {cat.products.slice(0, 4).map(p => (
                    <span key={p.name} style={{ fontSize: 10, padding: "3px 8px", background: `${cat.color}18`, color: cat.color, borderRadius: 12, fontFamily: "'DM Mono', monospace" }}>{p.name}</span>
                  ))}
                  {cat.products.length > 4 && <span style={{ fontSize: 10, padding: "3px 8px", opacity: 0.4 }}>+{cat.products.length - 4}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeCat && searchTerm.length < 2 && (
          <div style={{ animation: "fadeIn 0.2s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontFamily: "'Space Mono', monospace", color: activeCat.color }}>
                {activeCat.icon} {activeCat.label} — Decision Flow
              </h2>
              <button onClick={() => setShowFlow(!showFlow)} style={{
                background: "var(--bg-secondary)", border: "1px solid var(--bg-tertiary)", borderRadius: 6,
                padding: "5px 12px", color: "var(--text-secondary)", cursor: "pointer", fontSize: 11, fontFamily: "'DM Mono', monospace",
              }}>{showFlow ? "hide" : "show"} flow</button>
            </div>

            {showFlow && (
              <div style={{
                background: "var(--bg-secondary)", borderRadius: 12, padding: 16, marginBottom: 20,
                border: `1px solid ${activeCat.color}22`, overflowX: "auto",
              }}>
                <FlowDiagram flow={activeCat.flow} color={activeCat.color} />
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'Space Mono', monospace" }}>Products ({activeCat.products.length})</span>
              <button onClick={() => {
                const allNames = activeCat.products.map(p => p.name);
                const allExpanded = allNames.every(n => expandedProducts.has(n));
                setExpandedProducts(prev => { const next = new Set(prev); allNames.forEach(n => allExpanded ? next.delete(n) : next.add(n)); return next; });
              }} style={{ background: "none", border: "none", color: activeCat.color, cursor: "pointer", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                {activeCat.products.every(p => expandedProducts.has(p.name)) ? "collapse" : "expand"} all
              </button>
            </div>

            {activeCat.products.map(p => (
              <ProductCard key={p.name} product={p} color={activeCat.color} isExpanded={expandedProducts.has(p.name)} onToggle={() => toggleProduct(p.name)} />
            ))}
          </div>
        )}
      </div>

      <div style={{
        padding: "8px 24px", borderTop: "1px solid var(--bg-tertiary)", display: "flex", gap: 16,
        alignItems: "center", flexWrap: "wrap", fontSize: 11, opacity: 0.5, fontFamily: "'DM Mono', monospace", flexShrink: 0,
      }}>
        <span>Cost: </span>
        {["$", "$$", "$$$", "$$$$", "$$$$$"].map((c, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <CostDots cost={c} /> {["low", "mid", "high", "premium", "enterprise"][i]}
          </span>
        ))}
      </div>
    </div>
  );
}