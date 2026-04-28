function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateCategory(key, cat) {
  const errors = [];
  if (!isRecord(cat)) errors.push(`Category "${key}" must be an object.`);
  if (!cat.label) errors.push(`Category "${key}" missing "label".`);
  if (!cat.icon) errors.push(`Category "${key}" missing "icon".`);
  if (!cat.color) errors.push(`Category "${key}" missing "color".`);
  if (!Array.isArray(cat.flow)) errors.push(`Category "${key}" "flow" must be an array.`);
  if (!Array.isArray(cat.products)) errors.push(`Category "${key}" "products" must be an array.`);

  if (Array.isArray(cat.flow)) {
    const ids = new Set();
    for (const node of cat.flow) {
      if (!isRecord(node)) {
        errors.push(`Category "${key}" has a non-object flow node.`);
        continue;
      }
      if (!node.id) errors.push(`Category "${key}" has a flow node missing "id".`);
      if (node.id) {
        if (ids.has(node.id)) errors.push(`Category "${key}" has duplicate flow node id "${node.id}".`);
        ids.add(node.id);
      }
      if (!node.text) errors.push(`Category "${key}" flow node "${node.id || "?"}" missing "text".`);
      if (!node.type) errors.push(`Category "${key}" flow node "${node.id || "?"}" missing "type".`);
    }
    if (!ids.has("start")) errors.push(`Category "${key}" flow must include a node with id "start".`);
    for (const node of cat.flow) {
      if (node && node.parent && !ids.has(node.parent)) {
        errors.push(`Category "${key}" flow node "${node.id}" references missing parent "${node.parent}".`);
      }
    }
  }

  if (Array.isArray(cat.products)) {
    const names = new Set();
    for (const p of cat.products) {
      if (!isRecord(p)) {
        errors.push(`Category "${key}" has a non-object product.`);
        continue;
      }
      if (!p.name) errors.push(`Category "${key}" has a product missing "name".`);
      if (p.name) {
        if (names.has(p.name)) errors.push(`Category "${key}" has duplicate product name "${p.name}".`);
        names.add(p.name);
      }
      if (!p.desc) errors.push(`Category "${key}" product "${p.name || "?"}" missing "desc".`);
      if (!p.when) errors.push(`Category "${key}" product "${p.name || "?"}" missing "when".`);
      if (!Array.isArray(p.tiers)) errors.push(`Category "${key}" product "${p.name || "?"}" "tiers" must be an array.`);
    }
  }

  return errors;
}

export function validateGcpData(gcpData) {
  const errors = [];
  if (!isRecord(gcpData)) return [`GCP_DATA must be an object.`];

  for (const [key, cat] of Object.entries(gcpData)) {
    errors.push(...validateCategory(key, cat));
  }

  return errors;
}

