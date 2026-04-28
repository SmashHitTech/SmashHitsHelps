export const databases = {
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
};

