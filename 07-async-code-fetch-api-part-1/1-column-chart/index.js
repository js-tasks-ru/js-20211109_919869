import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
    chartHeight = 50;
    element;
    subElements = {};

    constructor({
        url = '',
        range = {from : new Date(), to : new Date()},
        value = 0,
        label = '',
        link = '',
        formatHeading = data => data
    } = {}) {
        this.url = new URL(url, BACKEND_URL);
        this.label = label;
        this.range = range;
        this.value = formatHeading(value);
        this.link = link;
        this.data = [];

        this.render();
        this.update(range.from, range.to);
    }

    update(fromDate, toDate) {
        this.range.from = fromDate;
        this.range.to = toDate;
        this.url.searchParams.set('from', this.range.from.toISOString());
        this.url.searchParams.set('to', this.range.to.toISOString());

        const result = fetchJson(this.url);

        result
            .then(data => {
                this.data = Object.values(data);
                if (this.data.length) {
                    this.subElements.body.innerHTML = this.getColumnProps(this.data);
                    this.value = this.getTotalValue(this.data);
                    this.subElements.header.innerHTML = this.value;

                    this.element.classList.remove("column-chart_loading");
                }
            })
            .catch(erorr => {alert(`Ошибка загрузки данных за период с ${this.range.from} по ${this.range.to}`)});

        return result;
    }

    render() {
        const element = document.createElement('div');
        element.innerHTML = this.getTemplate();

        this.element = element.firstElementChild;
        
        this._initSubElements();
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

    getTotalValue(data) {
        let result = 0;
        data.forEach(item => {result += item;});
        return result;
    }

    _initSubElements() {
        const dataElements = this.element.querySelectorAll("[data-element]");

        for (let element of dataElements) {
            const name = element.dataset.element;
            this.subElements[name] = element;
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
        this.subElements = {};
    }
}
