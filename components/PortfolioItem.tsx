'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Project } from '../types'

interface PortfolioItemProps {
    project: Project
    index: number
}

export default function PortfolioItem({ project, index }: PortfolioItemProps) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            viewport={{ once: true }}
            className="group relative overflow-hidden rounded-lg bg-secondary/10"
        >
            {/* Image Container */}
            <div className="relative aspect-video">
                <Image
                    src={project.images[0]}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Link href={project.link} target="_blank" className="block">
                    <h3 className="text-2xl font-bold mb-2 text-light hover:text-primary transition-colors">
                        {project.title}
                    </h3>
                </Link>
                <p className="text-light/90 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, i) => (
                        <span
                            key={i}
                            className="text-sm px-3 py-1 bg-primary/20 rounded-full text-light/90"
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            </div>
        </motion.article>
    )
}