import React from 'react';
import Head from 'next/head';
import Root from '../components/common/Root';
import ExploreBanner from '../components/productAssets/ExploreBanner';
import Collections from '../components/collections/Collections';
import SocialMedia from '../components/common/SocialMedia';
import Footer from '../components/common/Footer';
import ProductsBanner from '../components/homepage/ProductsBanner';

const Home = () => (
  <Root>
    <Head>
      <title>Collection</title>
    </Head>
    <ProductsBanner />
    <Footer />
  </Root>
);

export default Home;
