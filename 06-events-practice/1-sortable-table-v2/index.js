export default class SortableTable {
  element;
  subElements = {};

  constructor(headerConfig, {
    data = [],
    sorted = {}
  } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.cells = this.headerConfig.map(({id, template}) => {return {id, template};});
    this.isSortLocally = true;

    this.render();
    this.initSubDataElements();
    this.initEventListeners();
    this.sort();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
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

  getTableHeaderRowCells(item) {
    return `
      <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
        <span>${item.title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>`;
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

  initEventListeners () {
    const elements = this.subElements.header.querySelectorAll('.sortable-table__cell[data-sortable="true"]');

    for (let element of elements) {
      element.firstElementChild.addEventListener('pointerdown', this, true);
    }
  }

  handleEvent(event) {
    switch (event.type) {
      case 'pointerdown':
        this.onPointerdown(event.target.parentElement);
        break;
    }
  }

  onPointerdown(element) {
    this.sorted.id = element.dataset.id;
    this.sorted.order = (element.dataset.order === 'asc') ? 'desc' : 'asc';
 
    this.sort();
  }

  sort() {
    if (this.isSortLocally) {
      this.sortOnClient();
    } else {
      this.sortOnServer();
    }

    const elements = this.subElements.header.querySelectorAll('.sortable-table__cell[data-sortable="true"]');
    for (let element of elements) {
      if (element.dataset.id === this.sorted.id) {
        element.dataset.order = this.sorted.order;
      } else {
        element.dataset.order = '';
      }
    }
  }

  sortOnClient() {
    const sortFunc = this.getSortFunction(this.sorted.id, this.sorted.order);
    this.data.sort(sortFunc);
    this.subElements.body.innerHTML = this.getTableBodyRows();
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
