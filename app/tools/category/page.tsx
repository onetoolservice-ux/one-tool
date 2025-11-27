import Link from "next/link";

interface Props { params: { category: string } }

export default function CategoryPage({ params }: Props) {
  const category = params.category;
  // sample tool list per category
  const toolsMap: Record<string, {id:string,title:string,desc:string,icon?:string}[]> = {
    finance: [
      { id: "budget-tracker", title: "Budget Tracker", desc: "Manage incomes, expenses, and reports" },
      { id: "debt-planner", title: "Debt Planner", desc: "Plan loan payoffs and EMIs" },
      { id: "monthly-budget", title: "Monthly Budget", desc: "Create monthly budgets" },
    ],
    health: [
      { id: "yoga", title: "Yoga Tracker", desc: "Track yoga sessions" },
      { id: "gym", title: "Gym Log", desc: "Log workouts and sets" },
    ],
    documents: [
      { id: "pdf-tool", title: "PDF Tool", desc: "Merge, split, compress" },
      { id: "excel-tool", title: "Excel Tool", desc: "Spreadsheet utilities" },
    ],
    converters: [
      { id: "img2pdf", title: "Image → PDF", desc: "Convert images to PDF" },
      { id: "pdf2word", title: "PDF → Word", desc: "Convert PDF to Word" },
    ]
  };

  const tools = toolsMap[category] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{category.charAt(0).toUpperCase() + category.slice(1)}</h1>
          <p className="text-sm text-[#64748B]">Tools in this category</p>
        </div>
        <div>
          <Link href="/tools" className="text-sm text-[#64748B]">← Back to categories</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {tools.map(t=>(
          <Link key={t.id} href={`/tools/${category}/${t.id}`}>
            <div className="ots-card hover:shadow-lg cursor-pointer transition">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{t.title}</h3>
                  <p className="text-sm text-[#64748B] mt-1">{t.desc}</p>
                </div>
                <div className="text-2xl text-[#85adad]">🔧</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
