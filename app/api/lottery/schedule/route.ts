import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

/**
 * GET /api/lottery/schedule
 * Public endpoint — returns the active lottery's scheduled draw info (for countdown)
 * Only returns info if status is 'pending' or 'reminder_sent' AND show_countdown = true
 */
export async function GET(_request: NextRequest) {
  try {
    // Find the active lottery
    const { data: activeLottery, error: lError } = await supabaseAdmin
      .from('lotteries')
      .select('id, title')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lError) throw lError;
    if (!activeLottery) {
      return NextResponse.json({ scheduled: null });
    }

    // Check if there is a pending/reminder_sent scheduled draw with show_countdown = true
    const { data: scheduledDraw, error: sError } = await supabaseAdmin
      .from('scheduled_draws')
      .select('id, scheduled_at, show_countdown, include_countdown_in_email, status')
      .eq('lottery_id', activeLottery.id)
      .in('status', ['pending', 'reminder_sent'])
      .eq('show_countdown', true)
      .maybeSingle();

    if (sError) throw sError;

    if (!scheduledDraw) {
      return NextResponse.json({ scheduled: null });
    }

    return NextResponse.json({
      scheduled: {
        id: scheduledDraw.id,
        scheduled_at: scheduledDraw.scheduled_at,
        status: scheduledDraw.status,
        lottery_title: activeLottery.title,
      },
    });
  } catch (err: any) {
    console.error('[Public schedule API] Error:', err);
    return NextResponse.json({ scheduled: null });
  }
}
