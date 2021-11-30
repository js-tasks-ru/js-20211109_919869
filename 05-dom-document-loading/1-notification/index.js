export default class NotificationMessage {
    static activeNotification;

    element;
    timerId;

    constructor(message = '', {duration = 20, type = 'success'} = {}) {
        this.message = message;
        this.durationInSeconds = (duration / 1000);
        this.duration = duration;
        this.type = type;
        this.render();
    }

    show(parent = document.body) {
        if (NotificationMessage.activeNotification) {
            NotificationMessage.activeNotification.remove();
        }

        parent.append(this.element);
        this.timerId = setTimeout(() => {this.remove()}, this.duration);

        NotificationMessage.activeNotification = this;
    }

    render() {
        const element = document.createElement('div');
        element.innerHTML = this.getTemplate();
        this.element = element.firstElementChild;
    }

    getTemplate() {
        return `
            <div class="notification ${this.type}" style="--value:${this.durationInSeconds}s">
            <div class="timer"></div>
            <div class="inner-wrapper">
            <div class="notification-header">${this.type}</div>
            <div class="notification-body">
                ${this.message}
            </div>
            </div>
        </div>
        `;
    }

    destroy() {
        this.remove();
        this.element = null;
        NotificationMessage.activeNotification = null;
    }

    remove() {
        clearTimeout(this.timerId);
        if (this.element) {
            this.element.remove();
        }
    }
}
