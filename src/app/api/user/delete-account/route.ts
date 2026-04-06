import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import Transaction from '@/lib/models/Transaction';
import Budget from '@/lib/models/Budget';
import Goal from '@/lib/models/Goal';

export async function DELETE(req: Request) {
  try {
    const userId = req.headers.get('user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Missing User ID' }, { status: 401 });
    }

    await dbConnect();

    // 1. Delete all transactions
    await Transaction.deleteMany({ userId });
    
    // 2. Delete all budgets
    await Budget.deleteMany({ userId });
    
    // 3. Delete all goals
    await Goal.deleteMany({ userId });

    // 4. Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(`Account deleted successfully for user: ${deletedUser.email}`);

    return NextResponse.json({ 
      message: 'Account and all associated data deleted successfully. Your email is now available for new registration.' 
    }, { status: 200 });

  } catch (err: any) {
    console.error('Delete account error:', err);
    return NextResponse.json({ error: 'Failed to delete account: ' + err.message }, { status: 500 });
  }
}
