import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import Goal from "@/lib/models/Goal";
import Budget from "@/lib/models/Budget";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const userId = req.headers.get("user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!query || query.length < 2) {
      return NextResponse.json({ transactions: [], goals: [], budgets: [] });
    }

    const regex = new RegExp(query, "i");

    const [transactions, goals, budgets] = await Promise.all([
      Transaction.find({
        userId,
        $or: [{ title: regex }, { category: regex }],
      }).limit(5).sort({ date: -1 }),
      
      Goal.find({
        userId,
        title: regex,
      }).limit(5),
      
      Budget.find({
        userId,
        category: regex,
      }).limit(5),
    ]);

    return NextResponse.json({
      transactions: transactions.map(t => ({
        id: t._id,
        title: t.title,
        category: t.category,
        amount: t.amount,
        type: t.type,
        date: t.date,
        url: '/transactions'
      })),
      goals: goals.map(g => ({
        id: g._id,
        title: g.title,
        target: g.target,
        current: g.current,
        url: '/goals'
      })),
      budgets: budgets.map(b => ({
        id: b._id,
        category: b.category,
        total: b.total,
        spent: b.spent,
        url: '/'
      })),
    });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
