export const serverless = {
  label: "Serverless & App",
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
};

