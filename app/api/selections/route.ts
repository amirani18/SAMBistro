import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const supabase = createSupabaseClient();
  const { team_id, service_requirement, selected_tools, reason } = await req.json();

  if (!team_id || !service_requirement) {
    return NextResponse.json({ error: 'team_id and service_requirement required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tool_selections')
    .upsert(
      { team_id, service_requirement, selected_tools: selected_tools ?? [], reason: reason ?? '', updated_at: new Date().toISOString() },
      { onConflict: 'team_id,service_requirement' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ selection: data });
}

export async function GET(req: NextRequest) {
  const supabase = createSupabaseClient();
  const { searchParams } = new URL(req.url);
  const team_id = searchParams.get('team_id');

  if (!team_id) {
    const { data, error } = await supabase
      .from('tool_selections')
      .select('*, teams(team_name)')
      .order('updated_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ selections: data });
  }

  const { data, error } = await supabase
    .from('tool_selections')
    .select('*')
    .eq('team_id', team_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ selections: data });
}
