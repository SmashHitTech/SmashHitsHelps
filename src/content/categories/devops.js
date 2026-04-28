export const devops = {
  label: "DevOps & CI/CD",
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
};

