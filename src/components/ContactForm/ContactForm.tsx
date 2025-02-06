import { useRef } from 'react';
import './ContactForm.css';
import { Button } from '../Button/Button';

export const ContactForm = () => {
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        dialogRef.current?.showModal();
    };

    const closeDialog = () => {
        dialogRef.current?.close();
    };

    return (
        <div className='contact-form'>
            <h2>Contact <span>Me</span></h2>
            <form onSubmit={handleSubmit}>
                <input type="text" id="name" name="name" placeholder='Name*' required />
                <input type="email" id="email" name="email" placeholder='Email*' required />
                <input type="tel" id="phone" name="phone" placeholder='Contact Number*' 
                    title='Preencha este campo com: (99) 99999-9999 ou (99) 9999-9999' 
                    pattern="\(\d{2}\) \d{4,5}-\d{4}" required />
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
