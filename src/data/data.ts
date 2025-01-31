import { AboutMeProps } from "../components/AboutMe/AboutMe";
import { ExperienceCardInfoProps } from "../components/ExperienceCardInfo/ExperienceCardInfo";
import { ProjectCardInfoProps } from "../components/ProjectCardInfo/ProjectCardInfo";
import { DefaultCardProps } from "../components/DefaultCard/DefaultCard";

// About Me
export const AboutMeContent: AboutMeProps = {
    image: 
    {
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s',
        alt: 'FrontEnd Developer'
    },
    title: 'Renan Fellipe',
    description: 
    [
        'Eu sou apaixonado pela área de tecnologia e jogos. Concluí o ensino médio após Eletroeletrônica e atualmente curso Engenharia da Computação, ambos no Instituto Federal do Maranhão (IFMA).',
        'Possuo habilidades em Python, Java, Angular, SQL, e conhecimentos em APIs REST, microsserviços, NoSQL, C#, Docker, Kubernetes, e Cloud (AWS e Azure).',
    ],
};

// Experiences
export const ExperiencesContent: ExperienceCardInfoProps[] = [

    {
        info: 
        {
            type: 'Sasdas Developer',
            yearPeriod: '2022'
        }
    },
    {
        info: 
        {
            type: 'Sasdas Developer',
            yearPeriod: '2022'
        }
    }
];

export const ExperiencesCards: DefaultCardProps[] = [
    {
        image: 
        {
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s',
            alt: 'FrontEnd Developer'
        },
        title: 'Sasdas Developer',
        description: '',
        link: 'https://github.com/Xounder',
    }, 
    {
        image: 
        {
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s',
            alt: 'FrontEnd Developer'
        },
        title: 'Sasdas Developer',
        description: '',
        link: 'https://github.com/Xounder',
    }
];

// Projects
export const ProjectsContent: ProjectCardInfoProps[] = [
    {
        tecnologies: 
        [
            'Angular',
            'TypeScript',
            'Vite',
            'Tailwind'
        ]
    },
    {
        tecnologies: 
        [
            'Angular',
            'TypeScript',
            'Vite',
            'Tailwind'
        ]
    },
];

export const ProjectsCards: DefaultCardProps[] = [
    {
        image: 
        {
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s',
            alt: 'FrontEnd Developer'
        },
        title: 'Sasdas Developer',
        description: '',
        link: 'https://github.com/Xounder',
    },
    {
        image: 
        {
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s',
            alt: 'FrontEnd Developer'
        },
        title: 'Sasdas Developer',
        description: '',
        link: 'https://github.com/Xounder',
    }
];

//Recognitions
export const RecognitionsContent: ExperienceCardInfoProps[] = [
    {
        info: 
        {
            type: 'Sasdas Developer',
            yearPeriod: '2022'
        }
    },
    {
        info: 
        {
            type: 'Sasdas Developer',
            yearPeriod: '2022'
        }
    }
]; 

export const RecognitionsCards: DefaultCardProps[] = [
    {
        image: 
        {
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s',
            alt: 'FrontEnd Developer'
        },
        title: 'Sasdas Developer',
        description: '',
        link: 'https://github.com/Xounder',
    },
    {
        image: 
        {
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s',
            alt: 'FrontEnd Developer'
        },
        title: 'Sasdas Developer',
        description: '',
        link: 'https://github.com/Xounder',
    }
];
