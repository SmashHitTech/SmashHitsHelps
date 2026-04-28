export const storage = {
  label: "Storage",
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
};

