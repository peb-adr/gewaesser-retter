const today = new Date();
const year = today.getFullYear();

// translates german format "12.05.2022" (may 12) into correct Date
const getDate = (input) => {
  const a = input.split('.');
  return new Date(`${a[1]}-${a[0]}-${a[2]}`);
};

const filters = [
  {
    label: "Alle",
    fn: () => true,
  },
  {
    label: "Dieses Jahr",
    fn: (i) => getDate(i.properties.datum).getFullYear() === year,
  },
  {
    label: (year - 1).toString(),
    fn: (i) => getDate(i.properties.datum).getFullYear() === year - 1,
  },
  {
    label: (year - 2).toString(),
    fn: (i) => getDate(i.properties.datum).getFullYear() === year - 2,
  },
  {
    label: (year - 3).toString(),
    fn: (i) => getDate(i.properties.datum).getFullYear() === year - 3,
  },
  {
    label: (year - 4).toString(),
    fn: (i) => getDate(i.properties.datum).getFullYear() === year - 4,
  },
  {
    label: `Ältere (vor ${(year - 4).toString()})`,
    fn: (i) => getDate(i.properties.datum).getFullYear() < year - 4,
  },
  {
    label: "Nächste zwei Wochen",
    fn: (i) =>
    getDate(i.properties.datum) < new Date().setDate(new Date() + 14) &&
    getDate(i.properties.datum) > new Date(),
  },
  {
    label: "Zukünftig",
    fn: (i) => getDate(i.properties.datum) > new Date(),
  },
];
export default filters;