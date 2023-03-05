import { makeAutoObservable } from "mobx";
import client from "~/api/gql";
import { SingleOrder } from "~/screens/Orders/Show/types";
import { ORDER_QUERY } from "./queries";

export default class OrdersShowStore {
    order: SingleOrder | null = null;
    id: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    setOrder(order: SingleOrder) {
        this.order = order;
    }

    setId(id:string) {
        this.id = id;
    }

    async loadOrder() {
        const resp = await client.query(ORDER_QUERY, {number: this.id}).toPromise();
        this.setOrder(resp.data.order);
    }
}
