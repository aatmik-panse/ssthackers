"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/user-avatar'
import { 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  Settings, 
  Plus,
  Home,
  Menu,
  X,
  Shield
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative w-8 h-8 transition-transform group-hover:scale-110">
              <Image 
                src="/images/1.jpg"
                alt="SST Hackers Logo"
                width={32}
                height={32}
                className="rounded-lg dark:hidden block object-cover"
                priority
              />
              <Image 
                src="/images/2.jpg"
                alt="SST Hackers Logo"
                width={32}
                height={32}
                className="rounded-lg dark:block hidden object-cover"
                priority
              />
            </div>
            <span className="font-bold text-xl text-primary">
              SST Hackers
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-all duration-200"
              >
                <Icon size={16} className="transition-transform group-hover:scale-110" />
                <span className="relative">
                  {label}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-200 group-hover:w-full"></span>
                </span>
              </Link>
            ))} */}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              asChild={!!session} 
              size="sm" 
              className="bg-primary hover:bg-primary/90 transition-all duration-200"
              onClick={!session ? () => signIn(undefined, { callbackUrl: '/submit' }) : undefined}
            >
              {session ? (
                <Link href="/submit" className="flex items-center">
                  <Plus size={16} className="mr-1" />
                  Submit
                </Link>
              ) : (
                <span className="flex items-center">
                  <Plus size={16} className="mr-1" />
                  Submit
                </span>
              )}
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hover:bg-primary/10 transition-all duration-200"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User Menu */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-primary/10 transition-all duration-200">
                    <UserAvatar user={session.user} size="sm" />
                    <span className="font-medium">{session.user.username}</span>
                    <span className="aura-points text-primary">({session.user.auraPoints})</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href={`/user/${session.user.username}`} className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem> */}
                  {session.user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-red-500 focus:text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => signIn()}
                className="bg-primary hover:bg-primary/90 transition-all duration-200"
              >
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
              className="hover:bg-primary/10 transition-all duration-200"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div 
              className="flex items-center space-x-2 text-primary font-medium hover:text-primary/80 transition-all duration-200"
              onClick={() => {
                setMobileMenuOpen(false);
                session ? window.location.href = '/submit' : signIn(undefined, { callbackUrl: '/submit' });
              }}
            >
              <Plus size={16} />
              <span>Submit</span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hover:bg-primary/10 transition-all duration-200"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span className="ml-2">
                  {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </span>
              </Button>

              {session ? (
                <div className="flex items-center space-x-2">
                  <UserAvatar user={session.user} size="xs" />
                  <span className="text-sm font-medium">{session.user.username}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => signOut()}
                    className="hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
                  >
                    <LogOut size={16} />
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => signIn()}
                  className="bg-primary hover:bg-primary/90 transition-all duration-200"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 