import React from 'react';
import Link from 'next/link';

export default function ProductCard({ permalink, image, name, description, price}) {
  return (
    <Link href="/product/[permalink]" as={`/product/${permalink}`}>
      <a className="mb-5 d-block font-color-black cursor-pointer">
        <div
          className="mb-3"
          style={{
            paddingBottom: '130%',
            paddingTop: '10%',
            background: `url("${image}") center center/cover`
          }}
        />
        <p className="font-size-subheader mb-2 font-weight-medium">
          {name}
        </p>
      </a>
    </Link>
  );
}
