// ============================================
// PANEL CALCULATION ENGINE
// File: src/lib/calculations/panelCalculator.ts
// ============================================

export type Component = {
  id: string;
  item: string;
  category?: string;
  amperage?: string | number;
  price: number;
};

export type Device = {
  component_id: string;
  amperage?: string | number;
  poles?: number;
  quantity: number;
  price: number;
};

export type PanelInput = {
  enclosure_height: number;
  enclosure_width: number;
  busbar_amperage?: string;
  incomers: Device[];
  outgoings: Device[];
  components: Component[];
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse amperage from string or number
 * "400A" -> 400, "630A" -> 630, 800 -> 800
 */
const parseAmperage = (amp?: string | number): number => {
  if (!amp) return 0;
  if (typeof amp === 'number') return amp;
  return parseInt(amp.replace(/[^0-9]/g, ''), 10) || 0;
};

const findBusbarComponent = (components: Component[], amperage?: string | number) => {
  const amp = parseAmperage(amperage);

  return components.find(c =>
    c.category?.toLowerCase() === 'busbar' &&
    parseAmperage(c.amperage) === amp
  ) || null;
};

const findCableComponent = (components: Component[], amperage?: string | number) => {
  const amp = parseAmperage(amperage);

  return components.find(c =>
    c.category?.toLowerCase() === 'cable' &&
    parseAmperage(c.amperage) === amp
  ) || null;
};



// ============================================
// MAIN CALCULATOR
// ============================================

export const calculatePanel = (input: PanelInput) => {
  const {
    enclosure_height,
    enclosure_width,
    busbar_amperage,
    incomers,
    outgoings,
    components,
  } = input;

  // ============================================
  // MAIN BUSBAR CALCULATION
  // ============================================

  // Calculate width in meters
  // If height < 1600mm, use 0.5m, otherwise use actual width
  const busbarComponent = findBusbarComponent(components, busbar_amperage);

  const meters =
    enclosure_height < 1600
      ? 0.5 * 4
      : (enclosure_width / 1000) * 4;

  const main_busbar = busbarComponent
    ? {
      size: busbarComponent.item, // e.g. "30by10 per meter"
      meters,
      quantity_meters: meters,
      price_per_meter: busbarComponent.price,
      total: meters * busbarComponent.price,
    }
    : null;

  // ============================================
  // LINK BUSBAR CALCULATION (GROUPED BY SIZE)
  // ============================================

  type LinkBusbar = {
  size: string;
  meters: number;
  price_per_meter: number;
};

  // Group link busbars by size (multiple sizes possible)
  const linkMap: Record<string, LinkBusbar> = {};

  const process = (item: Device) => {
    const amperage = parseAmperage(item.amperage);

    if (amperage >= 400 && item.poles) {
      const busbarComponent = findBusbarComponent(components, item.amperage);
      if (!busbarComponent) return;

      const key = busbarComponent.item;
      const meters = 1.5 * item.poles * item.quantity;

      if (!linkMap[key]) {
        linkMap[key] = {
          size: busbarComponent.item,
          meters: 0,
          price_per_meter: busbarComponent.price,
        };
      }

      linkMap[key].meters += meters;
    }
  };

  incomers.forEach(process);
  outgoings.forEach(process);

  const link_busbars = Object.values(linkMap).map(b => ({
    ...b,
    quantity_meters: b.meters,
    total: b.meters * b.price_per_meter,
  }));

  // ============================================
  // CABLE CALCULATION (GROUPED BY SIZE)
  // ============================================
  type CableItem = {
  size: string;
  meters: number;
  price_per_meter: number;
};


  const cableMap = new Map<string, CableItem>();

  const addCable = (size: string, meters: number, price: number) => {
  const existing = cableMap.get(size);

  if (!existing) {
    cableMap.set(size, { size, meters, price_per_meter: price });
    return;
  }

  existing.meters += meters;
};

  const processCable = (item: Device) => {
    const amperage = parseAmperage(item.amperage);

    if (amperage <= 250 && item.poles) {
      const comp = findCableComponent(components, item.amperage);
      if (!comp) return;

      const meters = 1.5 * item.poles * item.quantity;

      addCable(comp.item, meters, comp.price);
    }
  };

  incomers.forEach(processCable);
  outgoings.forEach(processCable);

  const cables = Array.from(cableMap.values()).map(c => ({
    ...c,
    quantity_meters: c.meters,
    total: c.meters * c.price_per_meter,
  }));
  // ============================================
  // RETURN RESULTS
  // ============================================

  return {
    main_busbar,
    link_busbars,
    cables,
  };
};

// ============================================
// UTILITY EXPORTS
// ============================================

export { parseAmperage};