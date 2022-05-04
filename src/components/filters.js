const today = new Date();
const year = today.getFullYear();

const filters = [
  {
    label: "Alle",
    fn: () => true,
  },
  {
    label: "Dieses Jahr",
    fn: (i) => new Date(i.properties.date).getFullYear() === year,
  },
  {
    label: (year - 1).toString(),
    fn: (i) => new Date(i.properties.date).getFullYear() === year - 1,
  },
  {
    label: (year - 2).toString(),
    fn: (i) => new Date(i.properties.date).getFullYear() === year - 2,
  },
  {
    label: (year - 3).toString(),
    fn: (i) => new Date(i.properties.date).getFullYear() === year - 3,
  },
  {
    label: (year - 4).toString(),
    fn: (i) => new Date(i.properties.date).getFullYear() === year - 4,
  },
  {
    label: `Ältere (vor ${(year - 4).toString()})`,
    fn: (i) => new Date(i.properties.date).getFullYear() < year - 4,
  },
  {
    label: "Nächste zwei Wochen",
    fn: (i) =>
      new Date(i.properties.date) < new Date().setDate(new Date() + 14) &&
      new Date(i.properties.date) > new Date(),
  },
  {
    label: "Zukünftig",
    fn: (i) => new Date(i.properties.date) > new Date(),
  },
];
export default filters;