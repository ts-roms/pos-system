import React from 'react';
import styled from 'styled-components';
import { ProductT } from '../../types';
import { ProductCard } from '../ProductCard';

const ProductCardList = styled.div`
    display: flex;
    flex-flow: wrap;

    & > div {
        width: 300px;
        height: 101px;
        margin: 6px;
        cursor: pointer;
        user-select: none;

        @media screen and (max-width: 1024px) {
            width: 280px;
        }

        &.food > div {
            background-color: #296a6c;
        }

        &.drink > div {
            background-color: #aa5438;
        }

        &.pastry > div {
            background-color: #366a36;
        }
    }
`;

export interface IProductListProps {
    products: ProductT[];
    onClick: (product: ProductT) => void;
};

/**
 * Renders a list of products.
 * @param props The props.
 */
export const ProductList = (props: IProductListProps) => {
    const { products, onClick } = props;

    return (
        <ProductCardList>
            {products.map((product, i) => {
                return (
                    <div key={i} onClick={() => onClick(product)} className={product.type}>
                        <ProductCard product={product} />
                    </div>
                );
            })}
        </ProductCardList>
    );
};
