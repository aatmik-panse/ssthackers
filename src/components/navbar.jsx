"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  Settings, 
  Plus,
  Flame,
  Clock,
  TrendingUp,
  Menu,
  X
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Navbar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Hot', icon: Flame },
    { href: '/new', label: 'New', icon: Clock },
    { href: '/top', label: 'Top', icon: TrendingUp },
  ]

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
              S
            </div>
            <span className="font-bold text-xl">SST Hackers</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {session && (
              <Button asChild size="sm">
                <Link href="/submit">
                  <Plus size={16} className="mr-1" />
                  Submit
                </Link>
              </Button>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User Menu */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User size={16} />
                    <span className="font-medium">{session.user.username}</span>
                    <span className="aura-points">({session.user.auraPoints})</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href={`/user/${session.user.username}`}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {session.user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => signIn()}>
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-4">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              ))}
              
              {session && (
                <Link
                  href="/submit"
                  className="flex items-center space-x-2 text-primary font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Plus size={16} />
                  <span>Submit</span>
                </Link>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  <span className="ml-2">
                    {theme === 'dark' ? 'Light' : 'Dark'} Mode
                  </span>
                </Button>

                {session ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{session.user.username}</span>
                    <Button variant="ghost" size="sm" onClick={() => signOut()}>
                      <LogOut size={16} />
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" onClick={() => signIn()}>
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 