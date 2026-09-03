'use client'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sparkles, History, CreditCard, LogOut, LayoutDashboard, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function AppHeader() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { href: '/dashboard', label: 'Painel', icon: LayoutDashboard },
    { href: '/gerar', label: 'Gerar Roteiro', icon: Sparkles },
    { href: '/historico', label: 'Histórico', icon: History },
    { href: '/precos', label: 'Planos', icon: CreditCard },
  ]

  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() || '?'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1200px] flex h-14 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-1.5 font-display font-bold text-lg tracking-tight">
          <span className="text-primary">Script</span>
          <span className="text-secondary">BR</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={active ? 'default' : 'ghost'}
                  size="sm"
                  className={active ? '' : 'text-muted-foreground hover:text-foreground'}
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{session?.user?.name || 'Usuário'}</p>
                <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard"><LayoutDashboard className="h-4 w-4 mr-2" />Painel</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/precos"><CreditCard className="h-4 w-4 mr-2" />Planos</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ redirectTo: '/' })} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                <Button
                  variant={active ? 'default' : 'ghost'}
                  className={`w-full justify-start ${active ? '' : 'text-muted-foreground'}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
