export default class SortableTable {
  element;
  subElements = {};

  constructor(headerConfig, {
    data = [],
    sorted = { id: headerConfig.finc(item => {item.sortable}).id,
              order: 'asc'}
  } = {}) {
    this.headerConfig = headerConfig;
    this.sorted = sorted;
    this.data = data;
    this.cells = this.headerConfig.map(({id, template}) => {return {id, template};});
    this.isSortLocally = true;

    this.render();
    this.sort(sorted.id, sorted.order);
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.initSubDataElements();
    this.initEventListeners();
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

  initSubDataElements() {
    const dataElements = this.element.querySelectorAll("[data-element]");

    for (let element of dataElements) {
        const name = element.dataset.element;
        this.subElements[name] = element;
    }
  }

  initEventListeners() {
    const elements = this.subElements.header.addEventListener('pointerdown', this.onSortClik);
  }

  sort(fieldId, orderValue) {
    const sortFunc = this.getSortFunction(fieldId, orderValue);
    this.data.sort(sortFunc);

    this.subElements.body.innerHTML = this.getTableBodyRows();
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
      this.sort(id, newOrder);

      column.dataset.order = newOrder;
      if (this.subElements.arrow) {
        column.append(this.subElements.arrow);
      }
    }
  }

  sortOnClient() {
    // const sortFunc = this.getSortFunction(this.sorted.id, this.sorted.order);
    // this.data.sort(sortFunc);
    // this.subElements.body.innerHTML = this.getTableBodyRows();
  }

  sortOnServer() {

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
