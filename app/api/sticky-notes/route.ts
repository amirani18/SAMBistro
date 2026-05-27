import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';




export async function POST(req: NextRequest) {
  const supabase = createSupabaseClient();
  const { team_id, team_name, prompt, content } = await req.json();

  if (!team_id || !prompt || !content?.trim()) {
    return NextResponse.json({ error: 'team_id, prompt, and content required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('sticky_notes')
    .insert({ team_id, team_name, prompt, content: content.trim() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ note: data });
}

export async function GET() {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('sticky_notes')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notes: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = createSupabaseClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { error } = await supabase.from('sticky_notes').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
