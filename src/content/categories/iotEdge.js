export const iotEdge = {
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
};

