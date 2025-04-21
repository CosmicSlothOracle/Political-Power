export interface Project {
    id: string;
    title: string;
    description: string;
    category: string;
    images: string[];
    technologies: string[];
    link: string;
}

export interface BlogPost {
    id: string;
    title: string;
    content: string;
    date: string;
    category: string;
    image?: string;
}