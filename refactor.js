const fs = require('fs');
const path = require('path');

fs.rmSync('src/lib/db', { recursive: true, force: true });
fs.rmSync('src/lib/middleware/auth.js', { force: true });
fs.rmSync('src/app/api/auth', { recursive: true, force: true });

const replaceInFile = (filePath, regex, replacement) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(filePath, content);
  }
};

replaceInFile('src/app/calculator/page.jsx', /_id/g, 'id');
replaceInFile('src/app/projects/page.jsx', /_id/g, 'id');
replaceInFile('src/app/reports/page.jsx', /_id/g, 'id');

const t = (strings) => strings.join('');
const authCheck = t`
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
`;

const routeTemplate = (methods) => t`import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
${methods}
`;

const customerId = routeTemplate(t`
export async function PUT(request, { params }) {
  try { ${authCheck}
    const { id } = await params;
    const body = await request.json();
    const { data, error } = await supabase.from('customers').update(body).eq('id', id).eq('user_id', user.id).select().single();
    if (error) throw error; return NextResponse.json(data);
  } catch (err) { return NextResponse.json({ message: err.message }, { status: 400 }); }
}
export async function DELETE(request, { params }) {
  try { ${authCheck}
    const { id } = await params;
    const { error } = await supabase.from('customers').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error; return NextResponse.json({ message: 'Deleted' });
  } catch (err) { return NextResponse.json({ message: err.message }, { status: 500 }); }
}
`);
fs.writeFileSync('src/app/api/customers/[id]/route.js', customerId);

const projects = routeTemplate(t`
export async function GET(request) {
  try { ${authCheck}
    const { data, error } = await supabase.from('projects').select('*, customer:customers(*)').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) throw error; return NextResponse.json(data);
  } catch (err) { return NextResponse.json({ message: err.message }, { status: 500 }); }
}
export async function POST(request) {
  try { ${authCheck}
    const body = await request.json();
    const { data, error } = await supabase.from('projects').insert({ ...body, user_id: user.id }).select().single();
    if (error) throw error; return NextResponse.json(data, { status: 201 });
  } catch (err) { return NextResponse.json({ message: err.message }, { status: 400 }); }
}
`);
fs.writeFileSync('src/app/api/projects/route.js', projects);

const projectsId = routeTemplate(t`
export async function PUT(request, { params }) {
  try { ${authCheck}
    const { id } = await params;
    const body = await request.json();
    const { data, error } = await supabase.from('projects').update(body).eq('id', id).eq('user_id', user.id).select().single();
    if (error) throw error; return NextResponse.json(data);
  } catch (err) { return NextResponse.json({ message: err.message }, { status: 400 }); }
}
export async function DELETE(request, { params }) {
  try { ${authCheck}
    const { id } = await params;
    const { error } = await supabase.from('projects').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error; return NextResponse.json({ message: 'Deleted' });
  } catch (err) { return NextResponse.json({ message: err.message }, { status: 500 }); }
}
`);
fs.writeFileSync('src/app/api/projects/[id]/route.js', projectsId);

const projectsCust = routeTemplate(t`
export async function GET(request, { params }) {
  try { ${authCheck}
    const { customerId } = await params;
    const { data, error } = await supabase.from('projects').select('*').eq('customer_id', customerId).eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) throw error; return NextResponse.json(data);
  } catch (err) { return NextResponse.json({ message: err.message }, { status: 500 }); }
}
`);
fs.writeFileSync('src/app/api/projects/customer/[customerId]/route.js', projectsCust);

const quotations = routeTemplate(t`
export async function GET(request) {
  try { ${authCheck}
    const { data, error } = await supabase.from('quotations').select('*, customer:customers(*)').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) throw error; return NextResponse.json(data);
  } catch (err) { return NextResponse.json({ message: err.message }, { status: 500 }); }
}
export async function POST(request) {
  try { ${authCheck}
    const body = await request.json();
    const { data, error } = await supabase.from('quotations').insert({ ...body, user_id: user.id }).select().single();
    if (error) throw error; return NextResponse.json(data, { status: 201 });
  } catch (err) { return NextResponse.json({ message: err.message }, { status: 400 }); }
}
`);
fs.writeFileSync('src/app/api/quotations/route.js', quotations);

const quotationsId = routeTemplate(t`
export async function DELETE(request, { params }) {
  try { ${authCheck}
    const { id } = await params;
    const { error } = await supabase.from('quotations').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error; return NextResponse.json({ message: 'Deleted' });
  } catch (err) { return NextResponse.json({ message: err.message }, { status: 500 }); }
}
`);
fs.writeFileSync('src/app/api/quotations/[id]/route.js', quotationsId);

const quotationsCust = routeTemplate(t`
export async function GET(request, { params }) {
  try { ${authCheck}
    const { customerId } = await params;
    const { data, error } = await supabase.from('quotations').select('*').eq('customer_id', customerId).eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) throw error; return NextResponse.json(data);
  } catch (err) { return NextResponse.json({ message: err.message }, { status: 500 }); }
}
`);
fs.writeFileSync('src/app/api/quotations/customer/[customerId]/route.js', quotationsCust);

const settings = routeTemplate(t`
export async function GET(request) {
  try { ${authCheck}
    const { data, error } = await supabase.from('settings').select('*').eq('user_id', user.id).single();
    if (error) throw error; return NextResponse.json(data);
  } catch (err) { return NextResponse.json({ message: err.message }, { status: 500 }); }
}
export async function PUT(request) {
  try { ${authCheck}
    const body = await request.json();
    const { data, error } = await supabase.from('settings').update(body).eq('user_id', user.id).select().single();
    if (error) throw error; return NextResponse.json(data);
  } catch (err) { return NextResponse.json({ message: err.message }, { status: 400 }); }
}
`);
fs.writeFileSync('src/app/api/settings/route.js', settings);

