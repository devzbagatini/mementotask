import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, workspaceName, invitedByEmail, role } = await req.json();

    if (!email || !workspaceName) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const roleLabels: Record<string, string> = {
      admin: 'Administrador',
      editor: 'Editor',
      viewer: 'Visualizador',
    };

    const { data, error } = await resend.emails.send({
      from: 'Mementotask <noreply@mementotask.dev>',
      to: email,
      subject: `Você foi convidado para "${workspaceName}" no Mementotask`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; color: #1a1a1a; margin: 0;">Mementotask</h1>
          </div>

          <div style="background: #f9f9f9; border-radius: 12px; padding: 32px; text-align: center;">
            <p style="font-size: 16px; color: #333; margin: 0 0 8px;">
              <strong>${invitedByEmail || 'Alguém'}</strong> convidou você para o workspace:
            </p>
            <h2 style="font-size: 22px; color: #8c1c13; margin: 8px 0 16px;">${workspaceName}</h2>
            <p style="font-size: 14px; color: #666; margin: 0 0 24px;">
              Função: <strong>${roleLabels[role] || role}</strong>
            </p>

            <a href="https://mementotask.dev"
               style="display: inline-block; background: #8c1c13; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Acessar Mementotask
            </a>
          </div>

          <p style="font-size: 12px; color: #999; text-align: center; margin-top: 24px;">
            Crie uma conta com este email ou faça login para aceitar o convite.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error('API invite error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
