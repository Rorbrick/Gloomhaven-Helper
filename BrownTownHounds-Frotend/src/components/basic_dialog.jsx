import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";
import { useState } from "react";
import "../styles/basic_dialog.css";

export default function BasicDialog({
  button,
  title,
  content,
  onConfirm,
  onCancel,
}) {
  let [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm?.(); // Optional chaining: safely calls onConfirm if it exists, otherwise does nothing
    setIsOpen(false);
  };

  const handleCancel = () => {
    onCancel?.(); // Optional chaining: safely calls onCancel if it exists, otherwise does nothing
    setIsOpen(false);
  };

  return (
    <>
      <button className="retireButton" onClick={() => setIsOpen(true)}>
        {button}
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="dialogWrapper"
      >
        <DialogBackdrop className="dialogBackdrop" />
        <div className="dialogDiv">
          <DialogPanel transition className="dialogPanelDiv">
            <DialogTitle className="font-bold">{title}</DialogTitle>
            <Description>{content}</Description>
            <div className="dialogButtonContainer">
              <button onClick={handleCancel}>Cancel</button>
              <button onClick={handleConfirm}>Retire</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
