import { DefaultCard } from "../../components/DefaultCard/DefaultCard";
import { ExperienceCardInfo } from "../../components/ExperienceCardInfo/ExperienceCardInfo";

export const RecognitionsPage = () => {
    return (
      <>
        <DefaultCard 
          image= {{
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s',
            alt: 'FrontEnd Developer' 
          }}
          title= 'Sasdas Developer'
          description=""
          link="https://github.com/Xounder"
          component={<ExperienceCardInfo info={{ type: 'C.H.:20', yearPeriod: '2022' }}/>}
        />
        <DefaultCard 
          image= {{
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s',
            alt: 'FrontEnd Developer' 
          }}
          title= 'Sasdas Developer'
          description=""
          link="https://github.com/Xounder"
          component={<ExperienceCardInfo info={{ type: 'C.H.:20', yearPeriod: '2022' }}/>}
        />
      </>
    );
}