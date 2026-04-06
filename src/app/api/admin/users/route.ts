import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

// Guard: only Admin users can access this
async function verifyAdmin(req: Request) {
  const userId = req.headers.get('user-id');
  if (!userId) return null;
  await dbConnect();
  const user = await User.findById(userId);
  if (!user || user.role !== 'Admin') return null;
  return user;
}

// GET /api/admin/users — list all users
export async function GET(req: Request) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const users = await User.find({}, '_id username email role country currencyCode createdAt').sort({ createdAt: -1 });
    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/users?id=xxx — delete a user
export async function DELETE(req: Request) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get('id');
    if (!targetId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    if (targetId === String(admin._id)) return NextResponse.json({ error: 'Cannot delete your own account from here' }, { status: 400 });

    await User.findByIdAndDelete(targetId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/admin/users?id=xxx — update role
export async function PATCH(req: Request) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get('id');
    const { role } = await req.json();

    if (!targetId || !role) return NextResponse.json({ error: 'User ID and role required' }, { status: 400 });
    if (!['Admin', 'Viewer'].includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });

    const updated = await User.findByIdAndUpdate(targetId, { role }, { new: true, select: '_id username email role' });
    return NextResponse.json({ user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
