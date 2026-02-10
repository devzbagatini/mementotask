import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(req: NextRequest) {
  try {
    // CSRF: validate origin
    const origin = req.headers.get('origin');
    const allowedOrigins = ['https://mementotask.dev', 'https://www.mementotask.dev', 'http://localhost:3000'];
    if (!origin || !allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Auth: validate Supabase session
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resend setup
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const { email, workspaceName, invitedByEmail, role } = await req.json();

    if (!email || !workspaceName) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Sanitize all user inputs for HTML
    const safeEmail = escapeHtml(String(email));
    const safeWorkspaceName = escapeHtml(String(workspaceName));
    const safeInvitedBy = escapeHtml(String(invitedByEmail || user.email || 'Alguem'));
    const safeRole = escapeHtml(String(role || ''));

    const roleLabels: Record<string, string> = {
      admin: 'Administrador',
      editor: 'Editor',
      viewer: 'Visualizador',
    };

    const { data, error } = await resend.emails.send({
      from: 'Mementotask <noreply@mementotask.dev>',
      to: email,
      subject: `Voce foi convidado para "${safeWorkspaceName}" no Mementotask`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; color: #1a1a1a; margin: 0;">Mementotask</h1>
          </div>

          <div style="background: #f9f9f9; border-radius: 12px; padding: 32px; text-align: center;">
            <p style="font-size: 16px; color: #333; margin: 0 0 8px;">
              <strong>${safeInvitedBy}</strong> convidou voce para o workspace:
            </p>
            <h2 style="font-size: 22px; color: #8c1c13; margin: 8px 0 16px;">${safeWorkspaceName}</h2>
            <p style="font-size: 14px; color: #666; margin: 0 0 24px;">
              Funcao: <strong>${roleLabels[role] || safeRole}</strong>
            </p>

            <a href="https://mementotask.dev"
               style="display: inline-block; background: #8c1c13; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Acessar Mementotask
            </a>
          </div>

          <p style="font-size: 12px; color: #999; text-align: center; margin-top: 24px;">
            Crie uma conta com este email ou faca login para aceitar o convite.
          </p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
