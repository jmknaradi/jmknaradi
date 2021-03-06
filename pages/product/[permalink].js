import React, { Component } from "react";
import commerce from "../../lib/commerce";
import { connect } from "react-redux";
import Head from "next/head";
import Root from "../../components/common/Root";
import CarouselImages from "../../components/productAssets/CarouselImages";
import ProductDetail from "../../components/productAssets/ProductDetail";
import Footer from "../../components/common/Footer";
import reduceProductImages from "../../lib/reduceProductImages";
import Link from "next/link";

const detailView = `<p>
  Slightly textured fabric with tonal geometric design and a bit of shine
</p>`;

class Product extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showShipping: false,
      showDetails: false,
    };

    this.toggleShipping = this.toggleShipping.bind(this);
    this.toggleDetails = this.toggleDetails.bind(this);
  }

  toggleShipping() {
    const { showShipping } = this.state;
    this.setState({ showShipping: !showShipping });
  }

  toggleDetails() {
    const { showDetails } = this.state;
    this.setState({ showDetails: !showDetails });
  }

  render() {
    const { showShipping, showDetails } = this.state;
    const { product } = this.props;

    const images = reduceProductImages(product);

    return (
      <Root>
        <Head>
          <title>{product.name} | JMKnářadí.cz</title>
        </Head>

        <div className="py-5 my-5">
          <div className="header-main-product-content">
            <div className="d-flex pb-4 ml-3 breadcrumb-container">
              <Link href="/">
                <div className="font-size-caption text-decoration-underline cursor-pointer">
                  Katalog
                </div>
              </Link>
              <img src="/icon/arrow-right.svg" className="w-16 mx-1" alt="Arrow icon" />
              <div className="font-size-caption font-weight-bold cursor-pointer">{product.name}</div>
            </div>
          </div>
          <div className="main-product-content">
            {/* Sidebar */}
            <div className="product-sidebar">
              <CarouselImages images={images} />
            </div>

            <div className="product-images">
              <div className="flex-grow-1">
                {Array.isArray(images)
                  ? images.map((image, i) => (
                      <img key={i} src={image} className="w-100 mb-3 carousel-main-images" />
                    ))
                  : ""}
              </div>
            </div>

            {/* Right Section - Product Details */}
            <div className="product-detail">
              <ProductDetail product={product} />
            </div>
          </div>
        </div>
        <Footer />
      </Root>
    );
  }
}

/**
 * Use getStaticPaths() to pre-render PDP (product display page) according to page path
 */
export async function getStaticPaths() {
  const { data: products } = await commerce.products.list();

  // Get the paths we want to pre-render based on product
  const paths = products.map((product) => ({
    params: {
      permalink: product.permalink,
    },
  }));

  // We'll pre-render only these paths at build time.
  return {
    paths,
    // { fallback: false } means other routes should 404.
    fallback: false,
  };
}

// This also gets called at build time, and fetches the product to view
export async function getStaticProps({ params: { permalink } }) {
  // params contains the product `permalink`.
  // If the route is like /product/shampoo-conditioner, then params.permalink is shampoo-conditioner
  const product = await commerce.products.retrieve(permalink, { type: "permalink " });

  // Pass product data to the page via props
  return {
    props: {
      product,
    },
  };
}

export default connect((state) => state)(Product);
