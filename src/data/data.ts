import type {
  AboutMeProps,
  ExperienceCardData,
} from "./types";
import { seo } from './seo';

import myPhoto from "../assets/images/me.webp";
import logoIfma from "../assets/images/ifma.webp";
import logoSolyd from "../assets/images/solyd.webp";
import logoVoxy from "../assets/images/voxy-logo.webp";
import logoDio from "../assets/images/dio.webp";
import logoMarathonSBC from "../assets/images/maratona-logo.webp";


// About Me
export const AboutMeContent: Omit<AboutMeProps, "headingLevel"> = {
  image: {
    img: myPhoto,
    alt: "Renan Fellipe, Computer Engineering student and technology enthusiast",
    width: 400,
    height: 402,
  },
  title: seo.title,
  description: [
    seo.description
  ],
};

// Experiences
export const ExperiencesCards: ExperienceCardData[] = [
  {
    kind: "experience",
    cardInfo: {
      image: {
        img: logoIfma,
        alt: "Logo of Instituto Federal do Maranhão (IFMA - Federal Institute of Maranhão).",
        width: 242,
        height: 208,
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
export const RecognitionsCards: ExperienceCardData[] = [
  {
    kind: "experience",
    cardInfo: {
      image: {
        img: logoMarathonSBC,
        alt: "Logo of Marathon SBC",
        width: 250,
        height: 225,
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
    kind: "experience",
    cardInfo: {
      image: {
        img: logoVoxy,
        alt: "Logo of Voxy",
        width: 250,
        height: 250,
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
    kind: "experience",
    cardInfo: {
      image: {
        img: logoDio,
        alt: "Logo of Dio - Digital Innovation One",
        width: 250,
        height: 250,
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
    kind: "experience",
    cardInfo: {
      image: {
        img: logoDio,
        alt: "Logo of Dio - Digital Innovation One",
        width: 250,
        height: 250,
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
    kind: "experience",
    cardInfo: {
      image: {
        img: logoDio,
        alt: "Logo of Dio - Digital Innovation One",
        width: 250,
        height: 250,
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
    kind: "experience",
    cardInfo: {
      image: {
        img: logoSolyd,
        alt: "Logo of Solyd Offensive Security",
        width: 200,
        height: 200,
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

