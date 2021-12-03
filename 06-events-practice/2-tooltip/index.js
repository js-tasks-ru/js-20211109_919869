class Tooltip {
    static instance;
    element;

    constructor() {
        if (Tooltip.instance) {
            return Tooltip.instance;
        }
        
        Tooltip.instance = this;
    }

    initialize() {
        this.initEventListeners();
    }

    render(text) {
        this.element = document.createElement('div');
        this.element.className = 'tooltip'; 
        this.element.innerHTML = text;
        document.body.append(this.element);
    }

    initEventListeners() {
        document.addEventListener('pointerover', this.onPointerOver);
        document.addEventListener('pointerout', this.onPointerOut);
    }

    onPointerOver = event => {
        //const tooltip = event.target.dataset.tooltip;
        const element = event.target.closest('[data-tooltip]');

        if (element) {
            this.render(element.dataset.tooltip);
            document.addEventListener('pointermove', this.onPointerMove);
        }
    }

    onPointerOut = event => {
        this.remove();
        document.removeEventListener('pointermove', this.onPointerMove);
    }

    onPointerMove = event => {
        this.element.style.left = event.clientX + 10 +'px';
        this.element.style.top = event.clientY + 10 + 'px';
    }

    remove() {
        if (this.element) {
            this.element.remove();
        }
    }

    destroy() {
        document.removeEventListener('pointerover', this.onPointerOver);
        document.removeEventListener('pointerout', this.onPointerOut);
        document.removeEventListener('pointermove', this.onPointerMove);
        this.remove();
        this.element = null;
    }
}

export default Tooltip;