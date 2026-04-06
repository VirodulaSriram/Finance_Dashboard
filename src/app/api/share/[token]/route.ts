import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import Transaction from "@/lib/models/Transaction";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    await dbConnect();
    const user = await User.findOne({ shareToken: token, isSharing: true });

    if (!user) {
      return NextResponse.json({ error: "Shared dashboard not found or disabled" }, { status: 404 });
    }

    const transactions = await Transaction.find({ userId: user._id }).sort({ date: -1 });

    // Aggregate data for the dashboard
    const summary = transactions.reduce(
      (acc, curr) => {
        if (curr.type === 'Income') {
          acc.totalIncome += curr.amount;
          acc.balance += curr.amount;
        } else {
          acc.totalExpense += curr.amount;
          acc.balance -= curr.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, balance: 0 }
    );

    const categoryDataMap: Record<string, number> = {};
    const expenses = transactions.filter(t => t.type === 'Expense');
    expenses.forEach(t => {
      categoryDataMap[t.category] = (categoryDataMap[t.category] || 0) + t.amount;
    });
    const categoryData = Object.entries(categoryDataMap).map(([name, value]) => ({ name, value }));

    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentBalance = 0;
    const trendData = sortedTransactions.map(t => {
      currentBalance += t.type === 'Income' ? t.amount : -t.amount;
      return {
        date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        balance: currentBalance
      };
    });

    return NextResponse.json({
      user: {
        username: user.username,
        currencyCode: user.currencyCode,
        avatar: user.avatar
      },
      summary,
      categoryData,
      trendData
    });
  } catch (error: any) {
    console.error("Fetch Shared Data Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
