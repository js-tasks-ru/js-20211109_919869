export default class ColumnChart {
    chartHeight = 50;
    element;
    _subDataElements = {};

    constructor({
        data = [], 
        label = '', 
        value = 0, 
        link = '',
        formatHeading = data => data
    } = {}) {
        this.data = data;
        this.label = label;
        this.value = formatHeading(value);
        this.link = link;

        this.render();
    }

    update(data) {
        this._subDataElements.body.innerHTML = this.getColumnProps(data);
    }

    render() {
        const element = document.createElement('div');
        element.innerHTML = this.getTemplate();

        this.element = element.firstElementChild;
        
        this._initSubElements();

        if (this.data.length) {
            this.element.classList.remove("column-chart_loading");
        }
    }

    getTemplate() {
        return `
            <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
                <div class="column-chart__title">
                    Total ${this.label}
                    ${this.getLink()}
                </div>
                <div class="column-chart__container">
                    <div data-element="header" class="column-chart__header">
                        ${this.value}
                    </div>
                    <div data-element="body" class="column-chart__chart">
                        ${this.getColumnProps(this.data)}
                    </div>
                </div>
            </div>
        `;
    }

    getLink() {
        return (this.link) ? `<a href=${this.link} class="column-chart__link">View all</a>` : ''; 
    }

    getColumnProps(data) {
        const maxValue = Math.max(...data);
        const scale = 50 / maxValue;
        
        return data.map(item => {
            const percent = (item / maxValue * 100).toFixed(0);
            const value = String(Math.floor(item * scale));
            
            return `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`;
        }).join("");
    }

    _initSubElements() {
        const dataElements = this.element.querySelectorAll("[data-element]");

        for (let element of dataElements) {
            const name = element.dataset.element;
            this._subDataElements[name] = element;
        }
    }

    remove() {
        if (this.element) {
            this.element.remove();
        }
    }

    destroy() {
        this.remove();
        this.element = null;
        this._subDataElements = {};
    }
}
