import "./notification.css"

const Notification = ({message, msgColor}) => {
    let notifColor
    let borderColor
    console.log(message)
    if (msgColor) {
        notifColor = '#FFFFFF';
        borderColor = msgColor;
    } else {
        notifColor = '#FFFFFF';
        borderColor = '#8cfc86'
    }
    return(
        <div style={{
            color: notifColor,
            borderColor: borderColor,
            backgroundColor: 'rgba(255,255,255,0.3)',
            backdropFilter: 'blur(12px)'
        }} className="notification">{message}</div>
    )
}

export default Notification;