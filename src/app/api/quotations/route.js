import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('quotations')
      .select('*, customers(name, phone)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Map to match frontend expected format
    const mapped = data.map(q => ({
      ...q,
      customer: q.customers,
      projects: q.project_ids || [],
      totalMaterialCost: q.total_material_cost,
      labourCost: q.labour_cost,
      additionalCharges: q.additional_charges,
      profitPercentage: q.profit_percentage,
      finalPrice: q.final_price,
      createdAt: q.created_at
    }));
    return NextResponse.json(mapped);
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { data, error } = await supabase.from('quotations').insert({
      user_id: user.id,
      customer_id: body.customer,
      project_ids: body.projects || [],
      total_material_cost: body.totalMaterialCost,
      labour_cost: body.labourCost || 0,
      additional_charges: body.additionalCharges || 0,
      profit_percentage: body.profitPercentage || 0,
      final_price: body.finalPrice,
      snapshot: body.snapshot || {}
    }).select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
