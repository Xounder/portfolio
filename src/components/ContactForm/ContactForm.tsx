import './ContactForm.css';

import { Button } from '../Button/Button';

export const ContactForm = () => {
    return (
        <div className='contact-form'>
            <h2>Contact <span>Me</span></h2>
            <form action="" method="post">
                <input type="text" id="name" name="name" placeholder='Name*' required />
                <input type="email" id="email" name="email" placeholder='Email*' required />
                <input type="tel" id="phone" name="phone" placeholder='Contact Number*' pattern="\(\d{2}\) \d{4,5}-\d{4}" required />
                <textarea id="message" name="message" placeholder='Message*' required></textarea>
                <Button text="Submit" size={[0.6, 6]} fontSize={0.9} type="submit"onClick={() => {}}></Button>
            </form>
        </div>
    );
};