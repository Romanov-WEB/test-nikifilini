import React, { useEffect } from "react";
import OrdersShowStore from "./store";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import styles from "./styles.m.styl";
import Item from "./components/Item";
import DeliveryType from './../../../components/DeliveryType/index';

type ShowParams = {
    id: string;
};

const OrdersShow = observer(
    (): JSX.Element => {
        const [state] = React.useState(new OrdersShowStore());
        const params: ShowParams = useParams();

        useEffect(() => {
            state.setId(params.id)
            state.loadOrder()
        },[]);

        return (
            <div className={styles.screenWrapper}>
                <div className={styles.screen}>
                    {
                        state.order ? <div >
                            <div className={styles.order} >order: {state.order?.number}</div>
                            {state.order && <DeliveryType code={state.order.delivery.code} />}

                            <div className={styles.items}>
                                {state.order?.items.map((item, index) => <Item key={index} item={item} />)}
                            </div>
                        </div> : null
                    }
                </div>
            </div>
        );
    }
);

export default OrdersShow;
