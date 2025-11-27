import ToolTile from "../../shared/ToolTile";

interface Props { params: { category: string } }

export default function CategoryPage({ params }: Props){
  const category = params.category;
  const map:any = {
    finance: [
      { id: "budget-tracker", title: "Budget Tracker", desc: "Incomes, expenses & reports" },
      { id: "debt-planner", title: "Debt Planner", desc: "Loan & EMI planning" },
      { id: "monthly-budget", title: "Monthly Budget", desc: "Build monthly budgets" },
    ],
    health: [
      { id: "yoga", title: "Yoga Tracker", desc: "Track yoga sessions" },
      { id: "gym", title: "Gym Log", desc: "Log workouts" },
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
  const tools = map[category] || [];
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{category.charAt(0).toUpperCase()+category.slice(1)}</h1>
          <p className="text-sm small-muted mt-1">Tools in {category}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {tools.map((t:any)=> <ToolTile key={t.id} href={`/tools/${category}/${t.id}`} title={t.title} desc={t.desc} />)}
      </div>
    </div>
  );
}
