import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest) {
  const supabase = createSupabaseClient();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  if (!type || !id) {
    return NextResponse.json({ error: 'type and id required' }, { status: 400 });
  }

  let error;

  if (type === 'team') {
    ({ error } = await supabase.from('teams').delete().eq('id', id));
  } else if (type === 'selection') {
    ({ error } = await supabase.from('tool_selections').delete().eq('id', id));
  } else if (type === 'note') {
    ({ error } = await supabase.from('sticky_notes').delete().eq('id', id));
  } else {
    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
