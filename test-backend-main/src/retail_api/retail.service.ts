import { Injectable } from '@nestjs/common'
import { CrmType, Order, OrdersFilter, RetailPagination } from './types'
import axios, { AxiosInstance } from 'axios'
import { serialize } from '../tools'
import { plainToClass } from 'class-transformer'
import { OrdersResponse } from "../graphql"

@Injectable()
export class RetailService {
    private readonly axios: AxiosInstance
    private readonly apiUrl = `${process.env.RETAIL_URL}`
    private readonly apiKeyParam = `apiKey=${process.env.RETAIL_KEY}`

    constructor() {
        this.axios = axios.create({
            baseURL: this.apiUrl,
            timeout: 10000,
            headers: { },
        })

        this.axios.interceptors.request.use((config) => {
            // console.log(config.url)
            return config
        })
        this.axios.interceptors.response.use(
            (r) => {
                // console.log("Result:", r.data)
                return r
            },
            (r) => {
                // console.log("Error:", r.response.data)
                return r
            },
        )
    }

    async orders(filter?: OrdersFilter): Promise<[Order[], RetailPagination]> {
        const params = `${serialize(filter, '')}&${this.apiKeyParam}`
        const resp = await this.axios.get(`/orders?${params}`)

        if (!resp.data) throw new Error('Error CRM')
        const orders = plainToClass(Order, resp.data.orders as Array<any>)
        const pagination: RetailPagination = resp.data.pagination

        return [orders, pagination]
    }

    async getOrders(page:number): Promise<OrdersResponse>{
        const [orders, pagination] = await this.orders({page})

        return <OrdersResponse>{orders,pagination}
    }

    async findOrder(id: string): Promise<Order | null> {
        const [orders, _] = await this.orders({filter:{ids:[parseInt(id)]}})

        return orders[0]
    }

    async fetchDataUrl(axios: AxiosInstance, url: string, mainKey: string): Promise<CrmType[]> {
        const res = await axios.get(url)

        if (!res.data) throw new Error('Error CRM')

        const arrayEntry = Object.entries(res.data[mainKey])

        let status: CrmType[] = arrayEntry.map(entry => entry[1]) as Array<any>

        status = plainToClass(CrmType, status)

        return status
    }

    async orderStatuses(): Promise<CrmType[]> {
        const url = '/reference/statuses'

        return await this.fetchDataUrl(this.axios, url, 'statuses')
    }

    async productStatuses(): Promise<CrmType[]> {
        const url = '/reference/product-statuses'

        return await this.fetchDataUrl(this.axios, url, 'productStatuses')
    }

    async deliveryTypes(): Promise<CrmType[]> {
        const url = '/reference/delivery-types'

        return await this.fetchDataUrl(this.axios, url, 'deliveryTypes')
    }
}
