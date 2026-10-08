/** Sample files so the wizard can be demoed without real statements. */
const VENDORS = [
  ["NEFT DR-HDFC0000123-ACME TRADERS-INV2041", -184500],
  ["UPI/412345678901/SWIGGY/swiggy@ybl", -1240.5],
  ["NACH-DR-ZOHO CORP-4471029381", -14160],
  ["RTGS CR-UTIB0000789-FLIPKART INTERNET-88120934", 512000],
  ["NEFT CR-KKBK0000958-RAZORPAY SOFTWARE-SETTL", 84213.75],
  ["NACH-DR-BHARTI AIRTEL-9928310021", -7080],
  ["IMPS/P2A/612345098712/OFFICEMART", -6240],
] as const;

function icici(): string {
  const rows = ["Txn Date,Value Date,Description,Ref No,Debit,Credit,Balance"];
  let bal = 1240880;
  for (let i = 0; i < 48; i++) {
    const [d, a] = VENDORS[i % VENDORS.length];
    bal += a;
    const day = String(1 + Math.floor(i / 1.7)).padStart(2, "0");
    rows.push(`${day}/09/2026,${day}/09/2026,${d},${4100000 + i * 37},${a < 0 ? (-a).toFixed(2) : ""},${a > 0 ? a.toFixed(2) : ""},${bal.toFixed(2)}`);
  }
  return rows.join("\n");
}

function tally(): string {
  const rows = ["Voucher Date,Particulars,Vch Type,Vch No.,Debit,Credit,Narration"];
  const names = ["ACME Traders Pvt Ltd", "Swiggy", "Zoho Corporation", "Flipkart Internet Pvt Ltd", "Razorpay Software", "Bharti Airtel Ltd", "Office Mart Supplies"];
  for (let i = 0; i < 60; i++) {
    const a = VENDORS[i % VENDORS.length][1];
    const day = String(1 + Math.floor(i / 2.1)).padStart(2, "0");
    rows.push(`${day}-Sep-2026,${names[i % names.length]},${a < 0 ? "Payment" : "Receipt"},PV-09-${String(300 + i).padStart(4, "0")},${a > 0 ? a.toFixed(2) : ""},${a < 0 ? (-a).toFixed(2) : ""},Being amount ${a < 0 ? "paid" : "received"}`);
  }
  return rows.join("\n");
}

export function sampleFiles() {
  return {
    bank: [
      new File(["%PDF-1.4\n% sample HDFC statement placeholder\n"], "HDFC_Statement_Sep2026.pdf", { type: "application/pdf" }),
      new File([icici()], "ICICI_Statement_Sep2026.csv", { type: "text/csv" }),
    ],
    ledger: [new File([tally()], "Tally_DayBook_Sep2026.csv", { type: "text/csv" })],
  };
}
