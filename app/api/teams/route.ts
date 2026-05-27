import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const supabase = createSupabaseClient();
  const { team_name } = await req.json();
  if (!team_name?.trim()) {
    return NextResponse.json({ error: 'Team name required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('teams')
    .upsert({ team_name: team_name.trim() }, { onConflict: 'team_name', ignoreDuplicates: false })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ team: data });
}

export async function GET() {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ teams: data });
}
