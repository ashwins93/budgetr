const formatter = new Intl.NumberFormat("en-IN");

export function formatNumber(num: number): string {
  num = Math.abs(num);

  return formatter.format(num);
}
