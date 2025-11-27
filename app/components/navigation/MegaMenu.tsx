import Link from "next/link";

const menu = [
  {
    title: "Finance",
    items: [
      ["Budget Tracker", "/tools/finance/budget-tracker"],
      ["Daily Expenses", "/tools/finance/daily-expenses"],
      ["Monthly Budget", "/tools/finance/monthly-budget"],
      ["Debt Planner", "/tools/finance/debt-planner"],
      ["Loan EMI", "/tools/finance/loan-emi"]
    ],
  },
  {
    title: "Health",
    items: [
      ["Yoga", "/tools/health/yoga"],
      ["Gym Planner", "/tools/health/gym"],
      ["Meditation", "/tools/health/meditation"],
      ["Games", "/tools/health/games"]
    ],
  },
  {
    title: "Documents",
    items: [
      ["PDF Tools", "/tools/documents/pdf"],
      ["Word Tools", "/tools/documents/word"],
      ["Excel Tools", "/tools/documents/excel"],
      ["Image Tools", "/tools/documents/image"],
      ["JSON Tools", "/tools/documents/json"]
    ],
  },
  {
    title: "Converters",
    items: [
      ["Image → PDF", "/tools/converters/image-to-pdf"],
      ["PDF → Word", "/tools/converters/pdf-to-word"],
      ["Image Resize", "/tools/converters/image-resize"],
      ["PNG → JPG", "/tools/converters/png-to-jpg"]
    ],
  },
];

export default function MegaMenu() {
  return (
    <div className="absolute top-12 left-0 bg-white shadow-lg border border-gray-200 p-6 rounded-xl grid grid-cols-4 gap-8 w-[850px]">
      {menu.map((section) => (
        <div key={section.title}>
          <h4 className="font-semibold mb-3 text-[rgb(117,163,163)]">{section.title}</h4>
          <ul className="space-y-2">
            {section.items.map(([label, url]) => (
              <li key={url}>
                <Link className="hover:text-[rgb(117,163,163)] transition" href={url}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
