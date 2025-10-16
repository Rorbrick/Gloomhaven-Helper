import { Description, Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react'
import { useState } from 'react'

export default function BasicDialogue({ button, title, description, content }) {
  let [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button className ="retireButton" onClick={() => setIsOpen(true)}>{button}</button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} as="div" className="relative z-10 focus:outline-none">
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
            >
            <DialogTitle className="font-bold">{title}</DialogTitle>
            <Description>{description}</Description>
            <p>{content}</p>
            <div className="flex gap-4">
              <button onClick={() => setIsOpen(false)}>Cancel</button>
              <button onClick={() => setIsOpen(false)}>Retire</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}