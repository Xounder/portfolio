import { AboutMe } from "../../components/AboutMe/AboutMe";

export const AboutMePage = () => {
    return (
        <AboutMe 
            image={
                {
                img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s',
                alt: 'FrontEnd Developer'
                }
            }
            title='Renan Fellipe'
            description={[
                "Eu sou apaixonado pela área de tecnologia e jogos. Concluí o ensino médio técnico em Eletroeletrônica e atualmente curso Engenharia da Computação, ambos no Instituto Federal do Maranhão (IFMA).",
                "Possuo habilidades em Python, Java, Angular, SQL, e conhecimentos em APIs REST, microsserviços, NoSQL, C#, Docker, Kubernetes, e Cloud (AWS e Azure).",
            ]}
        />
    );
};