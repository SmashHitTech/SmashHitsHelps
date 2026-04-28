export const migration = {
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
};

