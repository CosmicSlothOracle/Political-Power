'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed w-full z-50 transition-all duration-300 ${ isScrolled ? 'bg-dark/80 backdrop-blur-md py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold hover:text-primary transition-colors">
                    Portfolio
                </Link>

                <div className="flex gap-8">
                    <Link href="#work" className="hover:text-primary transition-colors">Work</Link>
                    <Link href="#services" className="hover:text-primary transition-colors">Services</Link>
                    <Link href="#blog" className="hover:text-primary transition-colors">Blog</Link>
                    <Link href="#contact" className="hover:text-primary transition-colors">Contact</Link>
                </div>
            </div>
        </motion.nav>
    )
}