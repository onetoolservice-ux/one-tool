export function formatMoney(n:number, cur = "₹"){
  const num = Number(n)||0;
  return cur + num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
