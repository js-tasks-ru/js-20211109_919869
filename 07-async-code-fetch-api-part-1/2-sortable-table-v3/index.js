import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  countLoadRows;
  step;
  loading;

  onScroll = async (event) => {
    const { top, bottom } = this.element.getBoundingClientRect();
    const { clientHeight } = document.documentElement;

    if (bottom < clientHeight && !this.isSortLocally && !this.loading) {
      await this.loadData();
      this.setTableRows();
    }
  }

  onSortClik = event => {
    const column = event.target.closest('[data-sortable=true]');
    
    const toogleOrder = order => {
      const orders = {
        asc  : 'desc',
        desc : 'asc'
      };

      return orders[order];
    }

    if (column) {
      const {id, order} = column.dataset;
      const newOrder = toogleOrder(order);

      this.sorted.id = id;
      this.sorted.order = newOrder;
      this.sort();

      column.dataset.order = newOrder;
      if (this.subElements.arrow) {
        column.append(this.subElements.arrow);
      }
    }
  }

  constructor(headerConfig, {
    url,
    isSortLocally = false,
    sorted = {id: headerConfig.find(item => {return item.sortable === true;}).id,
              order: 'asc'}
  } = {}) {
    this.headerConfig = headerConfig;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.url = new URL(url, BACKEND_URL);
    this.cells = this.headerConfig.map(({id, template}) => {return {id, template};});

    this.countLoadRows = 0;
    this.step = 30;
    this.loading = false;

    this.render();
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.initSubDataElements();
    this.initEventListeners();

    await this.loadData();
    this.setTableRows();
  }

  getTemplate() {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody()}
      </div>`;
  }

  getTableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig.map(item => {return this.getTableHeaderRowCells(item);}).join("")}
      </div>`;
  }

  getTableHeaderRowCells({id, title, sortable}) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return sortable
      ? `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getTableHeaderRowCellArrow(id)}
      </div>`
      : `<div class="sortable-table__cell" data-id="${id}">
      <span>${title}</span>
      ${this.getTableHeaderRowCellArrow(id)}
      </div>`;
  }

  getTableHeaderRowCellArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist 
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : ``;
  }

  getTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableBodyRows()}
      </div>`;
  }

  getTableBodyRows() {
    return this.data.map(item => {
      return `
        <a href="/products/${item.id}" class="sortable-table__row">
          ${this.getTableBodyRowCells(item)}
        </a>`}).join("");
  }

  getTableBodyRowCells(item) {
    return this.cells.map(({id, template}) => {
      return (template) ? template(item[id]) : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join("");
  }

  getSortTypeByColumnId(columnId) {
    let column = this.headerConfig.find(item => item.id === columnId);
    return column.sortType;
  }

  getSortFunction(fieldValue, orderValue) {
    const decisions = {
      asc: 1,
      desc: -1
    };
    const decision = decisions[orderValue];

    const sortType = this.getSortTypeByColumnId(fieldValue);

    if (sortType === 'string') {
      return (a, b) => {return decision * a[fieldValue].localeCompare(b[fieldValue], ['ru', 'en']);}
    } else {
      return (a, b) => {return decision * (a[fieldValue] - b[fieldValue]);}
    }
  }

  setTableRows() {
    this.subElements.body.innerHTML = this.getTableBodyRows();
  }

  initSubDataElements() {
    const dataElements = this.element.querySelectorAll("[data-element]");

    for (let element of dataElements) {
        const name = element.dataset.element;
        this.subElements[name] = element;
    }
  }

  initEventListeners() {
    const elements = this.subElements.header.addEventListener('pointerdown', this.onSortClik);
    window.addEventListener('scroll', this.onScroll);
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

  sort() {
    if (this.isSortLocally) {
      this.sortOnClient(this.sorted.id, this.sorted.order);
    } else {
      this.sortOnServer(this.sorted.id, this.sorted.order);
    }
  }

  sortOnClient (id, order) {
    const sortFunc = this.getSortFunction(id, order);
    this.data.sort(sortFunc);
    this.setTableRows();
  }

  async sortOnServer (id, order) {
    await this.loadData();
    this.setTableRows();
  }

  async loadData() {
    this.loading = true;

    this.url.searchParams.set('_sort', this.sorted.id);
    this.url.searchParams.set('_order', this.sorted.order);
    this.url.searchParams.set('_start', this.countLoadRows);
    this.url.searchParams.set('_end', this.countLoadRows + this.step);

    const data = await fetchJson(this.url);
    this.data = [...this.data, ...data];
    this.countLoadRows += this.step;

    this.loading = false;
  }
}
