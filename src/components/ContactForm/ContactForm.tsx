import { useRef } from 'react';
import './ContactForm.css';
import { Button } from '../Button/Button';
import type { HeadingLevel } from '../../types/heading';

type ContactFormProps = {
    headingLevel: HeadingLevel;
};

export const ContactForm = ({ headingLevel }: ContactFormProps) => {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const HeadingTag = headingLevel;

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        dialogRef.current?.showModal();
    };

    const closeDialog = () => {
        dialogRef.current?.close();
    };

    return (
        <div className='contact-form'>
            <HeadingTag>Contact <span>Me</span></HeadingTag>
            <form onSubmit={handleSubmit}>
                <input type="text" id="name" name="name" placeholder='Name*' required />
                <input type="email" id="email" name="email" placeholder='Email*' required />
                <input type="tel" id="phone" name="phone" placeholder='Contact Number*' 
                    title='Preencha com um telefone brasileiro válido (ex.: (11) 98765-4321, 11 98765-4321, +55 11 98765-4321)' 
                    pattern="^(\+?55\s?)?(\(\d{2}\)|\d{2})\s?\d{4,5}-?\d{4}$" 
                    inputMode="tel" required />
                <textarea id="message" name="message" placeholder='Message*' required></textarea>
                <Button text="Submit" type="submit" onClick={() => {}}/>
            </form>

            <dialog ref={dialogRef} className="modal">
                <p>Sua mensagem foi enviada!</p>
                <Button text="Fechar" type="button" onClick={closeDialog} />
            </dialog>
        </div>
    );
};
