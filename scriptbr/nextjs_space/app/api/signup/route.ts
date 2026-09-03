export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = body ?? {}

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios.' },
        { status: 400 }
      )
    }

    const normalizedEmail = (email as string).toLowerCase().trim()

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado.' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password as string, 12)

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name || null,
        password: hashedPassword,
        plan: 'free',
        subscriptionStatus: 'inactive',
      },
    })

    // Send welcome email (non-blocking)
    try {
      const appUrl = process.env.NEXTAUTH_URL || ''
      const appName = 'ScriptBR'
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f1a14; color: #f0f0f0; padding: 30px; border-radius: 12px;">
          <h1 style="color: #22c55e; margin-bottom: 10px;">Bem-vindo ao ScriptBR! 🇧🇷</h1>
          <p style="font-size: 16px; line-height: 1.6;">Olá ${name || 'Criador'},</p>
          <p style="font-size: 16px; line-height: 1.6;">Sua conta foi criada com sucesso! Agora você pode gerar roteiros incríveis para seus vídeos.</p>
          <p style="font-size: 14px; color: #aaa;">Você está no plano Grátis com 3 roteiros por mês. Faça upgrade para criar mais!</p>
          <a href="${appUrl}/dashboard" style="display: inline-block; background: #22c55e; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; font-weight: bold;">Começar a criar →</a>
        </div>
      `
      await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: process.env.WEB_APP_ID,
          notification_id: process.env.NOTIF_ID_BEMVINDO_AO_SCRIPTBR,
          subject: 'Bem-vindo ao ScriptBR! 🇧🇷',
          body: htmlBody,
          is_html: true,
          recipient_email: normalizedEmail,
          sender_email: appUrl ? `noreply@${new URL(appUrl).hostname}` : undefined,
          sender_alias: appName,
        }),
      }).catch(() => {})
    } catch {
      // Non-blocking: email failure should not block signup
    }

    return NextResponse.json(
      { message: 'Conta criada com sucesso!', userId: user.id },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Erro interno. Tente novamente.' },
      { status: 500 }
    )
  }
}
