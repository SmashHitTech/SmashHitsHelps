export const dataAnalytics = {
  label: "Data & Analytics",
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
};

