export const networking = {
  label: "Networking",
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
};

