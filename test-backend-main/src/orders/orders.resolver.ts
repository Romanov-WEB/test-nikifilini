import { Args, Query, Resolver } from '@nestjs/graphql'
import { RetailService } from '../retail_api/retail.service'

@Resolver('Orders')
export class OrdersResolver {
    constructor(private retailService: RetailService) {}

    @Query()
    async getOrders(@Args('page') page: number) {
        return this.retailService.getOrders(page)
    }
    @Query()
    async order(@Args('number') id: string) {
        return this.retailService.findOrder(id)
    }
}
