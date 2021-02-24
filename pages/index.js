import React from 'react';
import Head from 'next/head';
import Root from '../components/common/Root';
import Footer from '../components/common/Footer';
import HeroSection from '../components/homepage/HeroSection';
import ProductsBanner from '../components/homepage/ProductsBanner';

const Home = () => (
  <Root transparentHeader={true}>
    <Head>
      <title>jmk nářadí</title>
    </Head>
    <HeroSection />
    <ProductsBanner />
    <Footer />
  </Root>
);

export default Home;
