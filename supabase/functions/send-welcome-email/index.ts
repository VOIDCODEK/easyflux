import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name: string;
  companyName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { email, name, companyName }: WelcomeEmailRequest = await req.json();

    if (!email || !name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Bem-vindo ao Easy Flux</title>
        </head>
        <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f8fafc;">
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr>
              <td align="center" style="padding:40px 0;">
                <table role="presentation" style="width:600px;max-width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                  <tr>
                    <td style="background:linear-gradient(135deg,#2563eb 0%,#4338ca 100%);padding:40px;text-align:center;">
                      <h1 style="color:#ffffff;margin:0;font-size:32px;font-weight:bold;">Easy Flux</h1>
                      <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px;text-transform:uppercase;letter-spacing:2px;">Gestão Financeira Inteligente</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px;">
                      <h2 style="color:#0f172a;margin:0 0 16px;font-size:24px;">Olá, ${name}! 👋</h2>
                      <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 24px;">
                        Seja bem-vindo(a) ao <strong>Easy Flux</strong>! Estamos animados em ter <strong>${companyName}</strong> conosco.
                      </p>
                      <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 24px;">
                        Para ativar sua conta e começar a gerenciar as finanças da sua empresa, basta confirmar seu email clicando no link enviado pela nossa plataforma.
                      </p>
                      <div style="background-color:#eff6ff;border-left:4px solid #3b82f6;padding:16px;border-radius:8px;margin:24px 0;">
                        <p style="color:#1e40af;font-size:14px;margin:0;">
                          <strong>💡 Dica:</strong> Se não encontrar o email de confirmação, verifique sua caixa de spam ou lixo eletrônico.
                        </p>
                      </div>
                      <p style="color:#475569;font-size:16px;line-height:1.6;margin:24px 0 0;">
                        Com o Easy Flux você poderá:
                      </p>
                      <ul style="color:#475569;font-size:15px;line-height:1.8;padding-left:20px;">
                        <li>Controlar entradas e saídas em tempo real</li>
                        <li>Configurar custos fixos e recorrências</li>
                        <li>Visualizar relatórios detalhados</li>
                        <li>Personalizar a identidade da sua empresa</li>
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color:#f8fafc;padding:24px;text-align:center;border-top:1px solid #e2e8f0;">
                      <p style="color:#94a3b8;font-size:12px;margin:0;text-transform:uppercase;letter-spacing:1px;">
                        © 2026 Easy Flux • Gestão Financeira Inteligente
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Easy Flux <onboarding@resend.dev>",
        to: [email],
        subject: `Bem-vindo ao Easy Flux, ${name}! 🎉`,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend error:", data);
      return new Response(JSON.stringify({ error: data }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
