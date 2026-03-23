export type PresetRange = {
  label: string;
  getRange: () => { from: Date; to?: Date };
};

const today = () => new Date();

const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

export const PRESET_RANGES: PresetRange[] = [
  {
    label: "0 - 30 days",
    getRange: () => ({
      from: daysAgo(30),
      to: today(),
    }),
  },
  {
    label: "30 - 60 days",
    getRange: () => ({
      from: daysAgo(60),
      to: daysAgo(30),
    }),
  },
  {
    label: "60 - 90 days",
    getRange: () => ({
      from: daysAgo(90),
      to: daysAgo(60),
    }),
  },
  {
    label: "90+ days",
    getRange: () => ({
      from: daysAgo(3000),
      to: daysAgo(90),
    }),
  },
];
