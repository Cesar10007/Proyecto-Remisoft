function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null

    return (
        <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
            <div className="modal">
            <div className="modal-header">
                <button className="modal-close" onClick={onClose}>✕</button>
            </div>
            {children}
            </div>
        </div>
    )
}

export default Modal