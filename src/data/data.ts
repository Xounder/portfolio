import { AboutMeProps } from "../components/AboutMe/AboutMe";
import { ExperienceCardInfoProps } from "../components/ExperienceCardInfo/ExperienceCardInfo";
import { ProjectCardInfoProps } from "../components/ProjectCardInfo/ProjectCardInfo";
import { DefaultCardProps } from "../components/DefaultCard/DefaultCard";

import myPhoto from "../assets/images/me.webp";
import logoIfma from "../assets/images/ifma.webp";
import logoSolyd from "../assets/images/solyd.webp";
import logoVoxy from "../assets/images/voxy-logo.webp";
import logoDio from "../assets/images/dio.webp";
import logoMarathonSBC from "../assets/images/maratona-logo.webp";

import logoAPI from "../assets/images/api-logo.webp";
import buletinBlogImage from "../assets/images/buletin-blog.webp";
import angularPstoreImage from "../assets/images/angular-pstore.webp";
import bokumonImage from "../assets/images/bokumon.webp";
import buzzFeedImage from "../assets/images/buzzfeed.webp";
import shoesEcommerceImage from "../assets/images/shoes-ecommerce.webp";

// About Me
export const AboutMeContent: AboutMeProps = {
  image: {
    img: myPhoto,
    alt: "Renan Fellipe, Computer Engineering student and technology enthusiast",
  },
  title: "Renan Fellipe",
  description: [
    "I am passionate about technology and gaming. I completed my technical high school in Electronics and am currently pursuing a degree in Computer Engineering, both at the Instituto Federal do Maranhão (IFMA - Federal Institute of Maranhão)."
  ],
};

interface ExperienceCardsProps {
  cardInfo: DefaultCardProps;
  expInfo: ExperienceCardInfoProps;
}

// Experiences
export const ExperiencesCards: ExperienceCardsProps[] = [
  {
    cardInfo: {
      image: {
        img: logoIfma,
        alt: "Logo of Instituto Federal do Maranhão (IFMA - Federal Institute of Maranhão).",
      },
      title: "Criação de Mapas em Robótica Móvel",
      description:
        "The 'Criação de Mapas em Robótica Móvel' research focused on developing a mapping and localization system for autonomous mobile vehicles, using a mobile robot as a case study. The research aimed to explore the technologies and challenges involved in creating systems for mapping and localization in dynamic and hard-to-reach environments.",
      link: "https://www.google.com/search?client=opera-gx&q=criação+de+mapas+em+robotica+movel+renan+fellipe&sourceid=opera&ie=UTF-8&oe=UTF-8",
    },
    expInfo: {
      info: {
        type: "Research Project",
        yearPeriod: "2021 - 2022",
      },
    },
  },
];

//Recognitions
export const RecognitionsCards: ExperienceCardsProps[] = [
  {
    cardInfo: {
      image: {
        img: logoMarathonSBC,
        alt: "Logo of Marathon SBC",
      },
      title: "Third place - Regional phase",
      description:
        "The SBC Programming Marathon, organized by the Brazilian Computer Society (SBC), challenges students to solve algorithmic problems under time constraints. In 2022, my team secured third place in the regional phase, qualifying for the national phase.",
      link: "https://santaines.ifma.edu.br/2022/11/30/alunos-destacam-se-em-maratona-de-programacao-da-sbc/",
    },
    expInfo: {
      info: {
        type: "Award",
        yearPeriod: "2024",
      },
    },
  },
  {
    cardInfo: {
      image: {
        img: logoVoxy,
        alt: "Logo of Voxy",
      },
      title: "English Proficiency - Intermediate",
      description:
        "The Voxy Proficiency Achievement Certificate - Intermediate was awarded after completing a proficiency test in English as part of the CI&T Next Gen recruitment process. This certification represents an intermediate level of English proficiency.",
      link: "https://app.voxy.com/certificates/proficiency-test/672913240ae424dd618603c2/",
    },
    expInfo: {
      info: {
        type: "Certificate",
        yearPeriod: "2024",
      },
    },
  },
  {
    cardInfo: {
      image: {
        img: logoDio,
        alt: "Logo of Dio - Digital Innovation One",
      },
      title: "DIO Campus Expert",
      description:
        "As a member of the 10th class of the DIO Campus Expert program, I was selected to be part of a group of university ambassadors from across Brazil. The program aims to develop leadership skills and accelerate careers while still in university.",
      link: "https://www.linkedin.com/in/renan-fellipe/details/certifications/",
    },
    expInfo: {
      info: {
        type: "Certificate - 30 Hours",
        yearPeriod: "2024",
      },
    },
  },
  {
    cardInfo: {
      image: {
        img: logoDio,
        alt: "Logo of Dio - Digital Innovation One",
      },
      title: "Randstad - Backend with .NET",
      description:
        "The 'Randstad - Backend with .NET' certification (105 Hours) covered key skills in .NET Framework, C#, Entity Framework, Microsoft Azure, Git, GitHub, Microsoft SQL Server, NoSQL, APIs, REST APIs, Clean Coding, Domain-Driven Design (DDD), and Cloud Computing. Additionally, the 'Microsoft Azure Essentials' certification (38 Hours) deepened my knowledge in cloud technologies and Microsoft Azure.",
      link: "https://www.linkedin.com/in/renan-fellipe/details/certifications/",
    },
    expInfo: {
      info: {
        type: "Certificate - 143 Hours",
        yearPeriod: "2024",
      },
    },
  },
  {
    cardInfo: {
      image: {
        img: logoDio,
        alt: "Logo of Dio - Digital Innovation One",
      },
      title: "Java, Spring Boot, Angular & Cloud",
      description:
        "The 'Java, Spring Boot, Angular & Cloud' certification encompasses three key courses: 'Deal - Spring Boot and Angular' (91 Hours), 'Cognizant - Architecture with Spring Boot and Cloud' (55 Hours), and 'Claro - Java with Spring Boot' (75 Hours). These courses focused on skills in Java, Spring Boot, Spring Framework, Spring Security, Angular, Git, GitHub, SQL databases, APIs, REST APIs, Microservices, Architectural Design, Domain-Driven Design (DDD), Clean Coding, Design Patterns, Docker, and Cloud Computing.",
      link: "https://www.linkedin.com/in/renan-fellipe/details/certifications/",
    },
    expInfo: {
      info: {
        type: "Certificate - 221 Hours",
        yearPeriod: "2024",
      },
    },
  },
  {
    cardInfo: {
      image: {
        img: logoSolyd,
        alt: "Logo of Solyd Offensive Security",
      },
      title: "Python - Basic",
      description:
        "The 'Python - Basic' certification (8 Hours) covered fundamental skills in Python, JSON, REST APIs, and Application Programming Interfaces (API).",
      link: "https://www.linkedin.com/in/renan-fellipe/details/certifications/",
    },
    expInfo: {
      info: {
        type: "Certificate - 8 Hours",
        yearPeriod: "2021",
      },
    },
  },
];

interface ProjectCardsProps {
  cardInfo: DefaultCardProps;
  projectInfo: ProjectCardInfoProps;
}

// Projects
export const ProjectsCards: ProjectCardsProps[] = [
  {
    cardInfo: {
      image: {
        img: logoAPI,
        alt: "Logo API",
      },
      title: "Restful Nubank API",
      description:
        "API that creates and stores the most specific data from the home page of the Nubank App in a database on Railway and returns it when requested.",
      link: "https://github.com/Xounder/api-rest-spring",
    },
    projectInfo: { technologies: ["Java", "Spring Boot"] },
  },
  {
    cardInfo: {
      image: {
        img: logoAPI,
        alt: "Logo API",
      },
      title: "Vehicle Management API",
      description:
        "A minimalist API for vehicle and administrator management using Authentication and Authorization. This project is built with .NET and uses the Minimal API architecture to provide a simple and effective interface.",
      link: "https://github.com/Xounder/minimal-api",
    },
    projectInfo: { technologies: ["C#", ".NET", "Minimal API"] },
  },
  {
    cardInfo: {
      image: {
        img: logoAPI,
        alt: "Logo API",
      },
      title: "Task Management API",
      description:
        "Task management system where you can register a list of tasks to better organize your routine.",
      link: "https://github.com/Xounder/dotNET-Api",
    },
    projectInfo: { technologies: ["C#", ".NET"] },
  },
  {
    cardInfo: {
      image: {
        img: buletinBlogImage,
        alt: "Buletin Blog - Home Page",
      },
      title: "Buletin Blog",
      description: "Buletin Blog – a blog with diverse content.",
      link: "https://github.com/Xounder/angular-blog",
    },
    projectInfo: { technologies: ["Angular", "TypeScript", "HTML", "CSS"] },
  },
  {
    cardInfo: {
      image: {
        img: buzzFeedImage,
        alt: "BuzzFeed Clone - Quizz",
      },
      title: "Buzzfeed Clone",
      description: "A BuzzFeed Clone themed around villains and superheroes",
      link: "https://github.com/Xounder/angular-buzzfeed",
    },
    projectInfo: { technologies: ["Angular", "TypeScript", "HTML", "CSS"] },
  },
  {
    cardInfo: {
      image: {
        img: angularPstoreImage,
        alt: "Angular Store - Home Page",
      },
      title: "Angular Store",
      description: "Recreating the Playstation Store layout.",
      link: "https://github.com/Xounder/angular-store",
    },
    projectInfo: { technologies: ["Angular", "TypeScript", "HTML", "CSS"] },
  },
  {
    cardInfo: {
      image: {
        img: bokumonImage,
        alt: "Bokumon Fight Scene",
      },
      title: "Bokumon",
      description: "A fanmade game of Pokémon.",
      link: "https://github.com/Xounder/Bokumon",
    },
    projectInfo: { technologies: ["Python"] },
  },
  {
    cardInfo: {
      image: {
        img: shoesEcommerceImage,
        alt: "Shoes Ecommerce - Home Page",
      },
      title: "ShoesEcommerce",
      description: "A responsive ShoesEcommerce.",
      link: "https://github.com/Xounder/ShoesEcommerce",
    },
    projectInfo: { technologies: ["JavaScript", "HTML", "CSS"] },
  },
];


