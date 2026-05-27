import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('session_state')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ session: data });
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseClient();
  const { reveal_enabled } = await req.json();

  const { data, error } = await supabase
    .from('session_state')
    .update({ reveal_enabled, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ session: data });
}
