import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';




export async function POST(req: NextRequest) {
  const supabase = createSupabaseClient();
  const { team_id, must_have_tools, nice_to_have_tools, removable_tool } = await req.json();

  if (!team_id) {
    return NextResponse.json({ error: 'team_id required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('order_summaries')
    .upsert(
      { team_id, must_have_tools, nice_to_have_tools, removable_tool, submitted_at: new Date().toISOString() },
      { onConflict: 'team_id' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ summary: data });
}

export async function GET(req: NextRequest) {
  const supabase = createSupabaseClient();
  const { searchParams } = new URL(req.url);
  const team_id = searchParams.get('team_id');

  if (!team_id) {
    const { data, error } = await supabase
      .from('order_summaries')
      .select('*, teams(team_name)');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ summaries: data });
  }

  const { data, error } = await supabase
    .from('order_summaries')
    .select('*')
    .eq('team_id', team_id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ summary: data });
}
