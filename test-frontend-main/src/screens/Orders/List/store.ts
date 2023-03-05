import { makeAutoObservable } from "mobx";
import { OrdersListItem } from "./types";
import { createBrowserHistory, History } from "history";
import client from "api/gql";
import { GET_ORDERS_QUERY } from "~/screens/Orders/List/queries";

export default class OrdersListState {
    initialized = false;
    loading = false;
    page = 1;
    totalPages = 1;
    orders: OrdersListItem[] = [];
    history: History;

    setInitialized(val: boolean) {
        this.initialized = val;
    }

    constructor() {
        makeAutoObservable(this);
        this.history = createBrowserHistory();
    }

    setOrders(orders: OrdersListItem[]): void {
        this.orders = orders;
    }

    startLoading(): void {
        this.loading = true;
    }

    stopLoading(): void {
        this.loading = false;
    }

    changeHistory() {
        const url = new URL(window.location.href);
        if (url.searchParams.get("page") !== this.page.toString()) {
            url.searchParams.set("page", "" + this.page);
            this.history.replace(url.pathname + url.search, {});
        }
    }

    setPage(page: number): void {
        this.page = page;

        this.changeHistory();

        this.loadOrders();
    }

    nextPage(): void {
        if (this.page >= this.totalPages) return;
        this.setPage(this.page + 1);
    }

    prevPage(): void {
        if (this.page <= 1) return;
        this.setPage(this.page - 1);
    }

    setTotalPages(totalPages: number): void {
        this.totalPages = totalPages;
    }

    get canNext(): boolean {
        return this.page < this.totalPages;
    }

    get canPrev(): boolean {
        return this.page > 1;
    }

    async loadOrders() {
        this.startLoading();

        const resp = await client.query(GET_ORDERS_QUERY, {page: this.page}).toPromise();
        const {orders, pagination} = resp.data.getOrders;

        this.setOrders(orders);
        this.setTotalPages(pagination.totalPageCount);

        this.stopLoading();
    }

    initialize() {
        if (this.initialized) return;
        const url = new URL(window.location.href);
        const pageFromHistory = url.searchParams.get("page");
        if (pageFromHistory && (pageFromHistory !== this.page.toString())) {
            this.setPage(parseInt(pageFromHistory));
        } else {
            this.loadOrders();
        }
        this.initialized = true;
    }
}
