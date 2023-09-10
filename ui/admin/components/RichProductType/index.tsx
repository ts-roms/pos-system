import React from 'react';
import { Td, Tr } from '@chakra-ui/react';
import { ProductTypeT } from '../../../app/types';

const fontColorFromBackgroundColor = (color: string) => {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    const luma = ((0.299 * r) + (0.587 * g) + (0.114 * b)) / 255;

    return luma > 0.5 ? '#000' : '#fff';
};

type PropsT = {
    productType: ProductTypeT;
};

export const RichProductType = (props: PropsT) => {
    const { productType } = props;
    const fontColor = !!productType.color
        ? fontColorFromBackgroundColor(productType.color)
        : '#000';

    return (
        <Tr>
            <Td>{productType.id}</Td>
            <Td>{productType.name}</Td>
            <Td>{productType.title}</Td>
            <Td
                backgroundColor={productType.color}
                color={fontColor}
            >
                {productType.color}
            </Td>
            <Td></Td>
        </Tr>
    );
};
