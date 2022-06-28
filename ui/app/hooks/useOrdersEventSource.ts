import { useCallback, useEffect, useRef, useState } from 'react';
import { useGetOrdersList } from '../../admin/hooks';
import { ApiResponse, OrderT, RichOrderT, UserT } from '../types';

/**
 * A custom hook that handles the event stream for the orders.
 * @param user The user that's logged in right now.
 * @returns The connection status and the orders.
 */
export const useOrdersEventSource = (user: UserT | null | undefined) => {
    const [connected, setConnected] = useState(false);
    const [orders, setOrders] = useState<OrderT[]>([]);
    const [retries, setRetries] = useState(0);
    const ordersRef = useRef(orders);
    ordersRef.current = orders;

    const { loading, orders: apiOrders, fetchOrders } = useGetOrdersList(1);

    const toggleFulfilled = useCallback(async (orderId: number, productId: number, val: boolean) => {
        const endpoint = `/api/order/${orderId}/product/${productId}/${val ? 1 : 0}`;
        const req = await fetch(endpoint, {
            method: 'PUT',
        });
        const resp = await req.json() as ApiResponse<null>;

        if (resp.success) {
            const newOrders = { ...ordersRef.current };
            const idx = orders.findIndex((o) => o.id === orderId);

            if (idx < 0) {
                return;
            }

            const order = newOrders[idx];
            const pIdx = order.products.findIndex((p) => p.id === productId);

            if (pIdx < 0) {
                return;
            }

            order.products[pIdx] = {
                ...order.products[pIdx],
                fulfilled: val,
            };
            newOrders[idx] = order;

            setOrders(newOrders);
        }

        return resp;
    }, []);

    const messageHandler = (e: MessageEvent<any>) => {
        const orders = ordersRef.current;
        const newOrder = JSON.parse(e.data) as OrderT;
        const newOrders = [...orders];
        const existingIdx = orders.findIndex((o) => o.id === newOrder.id);
        const existingOrder = existingIdx >= 0 ? orders[existingIdx] : undefined;

        if (!!existingOrder && existingOrder.cancelled !== newOrder.cancelled) {
            // An order can't be added twice and it can't be different. Unless it was canceled.
            return;
        } else if (!!existingOrder) {
            newOrders[existingIdx] = newOrder;
        } else {
            newOrders.push(newOrder);
        }

        setOrders(newOrders);
    };

    const connectToEventStream = () => {
        const ordersStream = new EventSource('/api/orders/stream');

        ordersStream.addEventListener('message', messageHandler);

        ordersStream.onopen = () => setConnected(true);

        setTimeout(() => {
            setConnected(true);
        }, 5);

        return ordersStream;
    };

    useEffect(() => {
        const newOrders = [ ...ordersRef.current ];
        const newApiOrders = apiOrders.map((ro) => ro.order);

        newApiOrders.forEach((order) => {
            const idx = newOrders.findIndex((o) => o.id === order.id);

            if (idx >= 0) {
                newOrders[idx] = order;
            } else {
                newOrders.push(order);
            }
        });

        setOrders(newOrders);
    }, [apiOrders]);

    useEffect(() => {
        if (!user) {
            return;
        }

        let isClosing = false;
        const ordersStream = connectToEventStream();

        ordersStream.onerror = () => {
            if (ordersStream.readyState === ordersStream.CLOSED && !isClosing) {
                setConnected(false);

                // Wait a second before rertrying.
                setTimeout(() => {
                    setRetries(retries + 1);
                }, 1000);
            }
        };

        return () => {
            isClosing = true;
            ordersStream.close();
        };
    }, [user, retries]);

    return {
        connected,
        orders,
        fetchOrders,
        toggleFulfilled,
    };
};
